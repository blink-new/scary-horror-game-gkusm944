import React, { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Ghost, Key, Book, Flashlight, DoorOpen, Skull } from 'lucide-react'

export type CellType = 'empty' | 'wall' | 'item' | 'exit' | 'scare'

export interface MapCell {
  type: CellType
  item?: string
  scare?: boolean
}

export interface Player {
  x: number
  y: number
}

interface GameMapProps {
  map: MapCell[][]
  player: Player
  inventory: string[]
  onMove: (dx: number, dy: number) => void
  onGrab: () => void
  jumpScare: boolean
}

const cellIcons: Record<string, React.ReactNode> = {
  'key': <Key className="text-yellow-300" />, 'book': <Book className="text-purple-400" />, 'flashlight': <Flashlight className="text-blue-300" />
}

export const GameMap: React.FC<GameMapProps> = ({ map, player, inventory, onMove, onGrab, jumpScare }) => {
  const gridRef = useRef<HTMLDivElement>(null)

  // Keyboard controls
  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if (["ArrowUp", "w", "W"].includes(e.key)) onMove(0, -1)
      else if (["ArrowDown", "s", "S"].includes(e.key)) onMove(0, 1)
      else if (["ArrowLeft", "a", "A"].includes(e.key)) onMove(-1, 0)
      else if (["ArrowRight", "d", "D"].includes(e.key)) onMove(1, 0)
      else if (e.key === ' ' || e.key === 'Enter') onGrab()
    }
    window.addEventListener('keydown', handle)
    return () => window.removeEventListener('keydown', handle)
  }, [onMove, onGrab])

  return (
    <div className="relative w-full max-w-md mx-auto aspect-square select-none">
      {/* Jump scare overlay */}
      <AnimatePresence>
        {jumpScare && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/90"
          >
            <motion.div
              initial={{ scale: 0.5, rotate: 0 }}
              animate={{ scale: 1.2, rotate: 360 }}
              className="text-red-500 text-9xl"
            >
              <Skull />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <div ref={gridRef} className="grid grid-cols-7 grid-rows-7 gap-1 w-full h-full bg-black/80 rounded-lg border-2 border-red-900 shadow-2xl overflow-hidden">
        {map.map((row, y) => row.map((cell, x) => {
          const isPlayer = player.x === x && player.y === y
          let content: React.ReactNode = null
          if (isPlayer) content = <motion.div layoutId="player" className="w-full h-full flex items-center justify-center"><Ghost className="text-white drop-shadow-lg" size={32} /></motion.div>
          else if (cell.type === 'item' && cell.item && !inventory.includes(cell.item)) content = <span>{cellIcons[cell.item] || <Book />}</span>
          else if (cell.type === 'exit') content = <DoorOpen className="text-green-400" />
          else if (cell.type === 'wall') content = <div className="w-full h-full bg-gray-900 border border-gray-700 rounded" />
          else if (cell.type === 'scare') content = <span />
          return (
            <div key={x + '-' + y} className={`relative w-full h-full flex items-center justify-center transition-all duration-200 ${isPlayer ? 'bg-red-900/60' : 'bg-black/60'} ${cell.type === 'wall' ? 'shadow-inner' : ''}`}
              style={{ borderRadius: 6, border: cell.type === 'exit' ? '2px solid #22c55e' : undefined }}>
              {content}
            </div>
          )
        }))}
      </div>
      <div className="flex justify-center mt-4 gap-2">
        <button aria-label="up" className="p-2 bg-gray-800 rounded hover:bg-red-700" onClick={() => onMove(0, -1)}>&uarr;</button>
      </div>
      <div className="flex justify-center gap-2">
        <button aria-label="left" className="p-2 bg-gray-800 rounded hover:bg-red-700" onClick={() => onMove(-1, 0)}>&larr;</button>
        <button aria-label="grab" className="p-2 bg-gray-800 rounded hover:bg-green-700" onClick={onGrab}>Grab</button>
        <button aria-label="right" className="p-2 bg-gray-800 rounded hover:bg-red-700" onClick={() => onMove(1, 0)}>&rarr;</button>
      </div>
      <div className="flex justify-center mt-2 gap-2">
        <button aria-label="down" className="p-2 bg-gray-800 rounded hover:bg-red-700" onClick={() => onMove(0, 1)}>&darr;</button>
      </div>
    </div>
  )
}
