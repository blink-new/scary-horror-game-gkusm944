import { useState } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { GameMap, MapCell, Player } from './components/GameMap'
import { InventoryBar } from './components/InventoryBar'
import { Button } from '@/components/ui/button'
import { Skull, Zap } from 'lucide-react'

// 7x7 grid map for demo
const initialMap: MapCell[][] = [
  [
    { type: 'wall' }, { type: 'wall' }, { type: 'wall' }, { type: 'wall' }, { type: 'wall' }, { type: 'wall' }, { type: 'wall' },
  ],
  [
    { type: 'wall' }, { type: 'empty' }, { type: 'item', item: 'key' }, { type: 'empty' }, { type: 'item', item: 'book' }, { type: 'empty' }, { type: 'wall' },
  ],
  [
    { type: 'wall' }, { type: 'empty' }, { type: 'wall' }, { type: 'empty' }, { type: 'wall' }, { type: 'empty' }, { type: 'wall' },
  ],
  [
    { type: 'wall' }, { type: 'empty' }, { type: 'empty' }, { type: 'empty' }, { type: 'empty' }, { type: 'item', item: 'flashlight' }, { type: 'wall' },
  ],
  [
    { type: 'wall' }, { type: 'wall' }, { type: 'wall' }, { type: 'scare', scare: true }, { type: 'wall' }, { type: 'empty' }, { type: 'wall' },
  ],
  [
    { type: 'wall' }, { type: 'empty' }, { type: 'empty' }, { type: 'empty' }, { type: 'empty' }, { type: 'exit' }, { type: 'wall' },
  ],
  [
    { type: 'wall' }, { type: 'wall' }, { type: 'wall' }, { type: 'wall' }, { type: 'wall' }, { type: 'wall' }, { type: 'wall' },
  ],
]

const startPos: Player = { x: 1, y: 1 }

function App() {
  const [scene, setScene] = useState<'menu' | 'game' | 'death' | 'win'>('menu')
  const [player, setPlayer] = useState<Player>(startPos)
  const [map, setMap] = useState<MapCell[][]>(initialMap)
  const [inventory, setInventory] = useState<string[]>([])
  const [jumpScare, setJumpScare] = useState(false)

  // Reset game
  const startGame = () => {
    setScene('game')
    setPlayer(startPos)
    setMap(initialMap.map(row => row.map(cell => ({ ...cell }))))
    setInventory([])
    setJumpScare(false)
  }

  // Movement logic
  const movePlayer = (dx: number, dy: number) => {
    if (scene !== 'game') return
    const nx = player.x + dx
    const ny = player.y + dy
    if (ny < 0 || ny >= map.length || nx < 0 || nx >= map[0].length) return
    const cell = map[ny][nx]
    if (cell.type === 'wall') return
    setPlayer({ x: nx, y: ny })
    // Jump scare cell
    if (cell.type === 'scare' && !jumpScare) {
      setJumpScare(true)
      setTimeout(() => setJumpScare(false), 1200)
    }
    // Exit cell
    if (cell.type === 'exit') {
      if (inventory.includes('key')) {
        setScene('win')
      } else {
        toast.error('You need a key to escape!')
      }
    }
  }

  // Grab logic
  const grabItem = () => {
    if (scene !== 'game') return
    const cell = map[player.y][player.x]
    if (cell.type === 'item' && cell.item && !inventory.includes(cell.item)) {
      setInventory([...inventory, cell.item])
      toast.success(`You picked up: ${cell.item}`)
      // Remove item from map
      setMap(prev => prev.map((row, y) => row.map((c, x) => (x === player.x && y === player.y ? { ...c, type: 'empty', item: undefined } : c))))
    } else {
      toast('Nothing to grab here.')
    }
  }

  // Death (demo: if you step on scare cell twice)
  // (For demo, not a real health system)

  // UI
  if (scene === 'menu') {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 via-black to-purple-900/20" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,black_70%)]" />
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5 }}
          className="text-center space-y-8 z-10"
        >
          <motion.h1
            className="text-6xl md:text-8xl font-bold text-red-500 drop-shadow-2xl"
            style={{ fontFamily: 'serif' }}
            animate={{
              textShadow: [
                '0 0 20px #ff0000',
                '0 0 40px #ff0000',
                '0 0 20px #ff0000'
              ]
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            NIGHTMARE
          </motion.h1>
          <motion.p
            className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            Explore the haunted mansion. Move, grab items, and escape... if you can.
          </motion.p>
          <Button
            onClick={startGame}
            className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 text-lg font-semibold border-2 border-red-400 shadow-lg hover:shadow-red-500/50 transition-all duration-300"
          >
            <Skull className="mr-2 h-5 w-5" />
            Enter the Nightmare
          </Button>
        </motion.div>
      </div>
    )
  }

  if (scene === 'game') {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-bold mb-2 tracking-widest text-red-400">Haunted Mansion</h2>
        <GameMap
          map={map}
          player={player}
          inventory={inventory}
          onMove={movePlayer}
          onGrab={grabItem}
          jumpScare={jumpScare}
        />
        <InventoryBar items={inventory} />
        <Button onClick={() => setScene('menu')} variant="outline" className="mt-6 border-gray-600 text-gray-400 hover:text-white">Exit Game</Button>
      </div>
    )
  }

  if (scene === 'win') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900/20 via-black to-blue-900/20 text-white flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-8"
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-green-400 text-6xl mx-auto"
          >
            <Zap />
          </motion.div>
          <h2 className="text-5xl font-bold text-green-400">YOU ESCAPED</h2>
          <p className="text-xl text-gray-300 max-w-md mx-auto">
            You found the key and escaped the nightmare. But the mansion will haunt your dreams forever.
          </p>
          <Button onClick={startGame} className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 text-lg">Play Again</Button>
          <Button onClick={() => setScene('menu')} variant="outline" className="block mx-auto text-gray-400 border-gray-600 hover:text-white">Return to Menu</Button>
        </motion.div>
      </div>
    )
  }

  if (scene === 'death') {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-8"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="text-red-500 text-8xl mx-auto"
          >
            <Skull />
          </motion.div>
          <h2 className="text-5xl font-bold text-red-500">YOU DIED</h2>
          <p className="text-xl text-gray-300 max-w-md mx-auto">
            The darkness has claimed you. Try again if you dare.
          </p>
          <Button onClick={startGame} className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 text-lg">Try Again</Button>
          <Button onClick={() => setScene('menu')} variant="outline" className="block mx-auto text-gray-400 border-gray-600 hover:text-white">Return to Menu</Button>
        </motion.div>
      </div>
    )
  }

  return null
}

export default App
