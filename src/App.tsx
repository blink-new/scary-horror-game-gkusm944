import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, Heart, Skull, Zap, Volume2, VolumeX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { toast } from 'react-hot-toast'

interface GameState {
  scene: 'menu' | 'game' | 'inventory' | 'death' | 'win'
  health: number
  sanity: number
  inventory: string[]
  currentStory: number
  choices: number[]
  soundEnabled: boolean
  jumpScareTriggered: boolean
}

interface StoryNode {
  id: number
  text: string
  image?: string
  choices: { text: string; nextId: number; requirement?: string; effect?: { health?: number; sanity?: number; item?: string } }[]
  isDeadEnd?: boolean
  isWin?: boolean
  jumpScare?: boolean
  ambientSound?: string
}

const storyNodes: StoryNode[] = [
  {
    id: 0,
    text: "You wake up in a decrepit mansion, rain pounding against broken windows. The air smells of decay and something... else. Your phone is dead. You must find a way out.",
    choices: [
      { text: "Explore the dark hallway", nextId: 1 },
      { text: "Check the broken phone", nextId: 2 },
      { text: "Search for a light switch", nextId: 3 }
    ]
  },
  {
    id: 1,
    text: "The hallway stretches endlessly. Portrait paintings seem to follow you with their eyes. A door creaks open by itself at the end of the hall.",
    choices: [
      { text: "Investigate the portraits", nextId: 4, effect: { sanity: -10 } },
      { text: "Rush to the open door", nextId: 5 },
      { text: "Turn back immediately", nextId: 6 }
    ]
  },
  {
    id: 2,
    text: "You find a strange message on your phone screen: 'THEY KNOW YOU'RE HERE.' The screen flickers and goes black. You hear footsteps above.",
    choices: [
      { text: "Go upstairs", nextId: 7 },
      { text: "Hide under the stairs", nextId: 8 },
      { text: "Look for another exit", nextId: 9 }
    ],
    jumpScare: true
  },
  {
    id: 3,
    text: "Your hand finds a switch. The lights flicker on revealing blood stains on the walls and 'HELP ME' scratched into the wood.",
    choices: [
      { text: "Follow the blood trail", nextId: 10 },
      { text: "Turn off the lights", nextId: 11 },
      { text: "Call out for help", nextId: 12, effect: { sanity: -5 } }
    ]
  },
  {
    id: 4,
    text: "The portraits depict the same family through different eras. In each painting, one more family member has black eyes. In the last painting, they all stare directly at you.",
    choices: [
      { text: "Touch the last painting", nextId: 13 },
      { text: "Run away screaming", nextId: 14, effect: { sanity: -15 } },
      { text: "Look for a hidden passage", nextId: 15 }
    ]
  },
  {
    id: 5,
    text: "You enter a grand library. Books float off shelves, pages turning by themselves. A leather-bound journal lies open on a desk, still wet with fresh ink.",
    choices: [
      { text: "Read the journal", nextId: 16 },
      { text: "Grab a book as a weapon", nextId: 17, effect: { item: "Heavy Book" } },
      { text: "Leave immediately", nextId: 18 }
    ]
  },
  {
    id: 16,
    text: "The journal reads: 'Day 847 - The shadows grow stronger. They whisper my name. I can't escape. Don't trust the mirrors.' You hear your name being whispered.",
    choices: [
      { text: "Keep reading", nextId: 19 },
      { text: "Close the journal", nextId: 20 },
      { text: "Look around for mirrors", nextId: 21 }
    ],
    jumpScare: true
  },
  {
    id: 19,
    text: "You found the basement key! The journal's final entry: 'The only way out is through the basement. But beware - something lives down there.'",
    choices: [
      { text: "Find the basement door", nextId: 22, effect: { item: "Basement Key" } },
      { text: "Look for another way", nextId: 23 },
      { text: "Try to leave through a window", nextId: 24 }
    ]
  },
  {
    id: 22,
    text: "You unlock the basement door. A putrid smell rises from below. You see a faint light and hear something breathing heavily.",
    choices: [
      { text: "Descend into the basement", nextId: 25, requirement: "Basement Key" },
      { text: "Slam the door shut", nextId: 26 },
      { text: "Call down to whatever is there", nextId: 27, effect: { sanity: -10 } }
    ]
  },
  {
    id: 25,
    text: "In the basement, you find a hidden tunnel. But a grotesque creature blocks your path. It hasn't noticed you yet.",
    choices: [
      { text: "Sneak past the creature", nextId: 28 },
      { text: "Throw something to distract it", nextId: 29, requirement: "Heavy Book" },
      { text: "Try to fight it", nextId: 30 }
    ]
  },
  {
    id: 28,
    text: "You successfully sneak past! The tunnel leads to freedom. You emerge into the forest as dawn breaks. You're free, but forever changed.",
    choices: [],
    isWin: true
  },
  {
    id: 29,
    text: "You throw the book. The creature chases after it, allowing you to escape through the tunnel. You're free!",
    choices: [],
    isWin: true
  },
  {
    id: 30,
    text: "The creature overpowers you. Your screams echo through the basement as everything goes dark...",
    choices: [],
    isDeadEnd: true
  }
]

function App() {
  const [gameState, setGameState] = useState<GameState>({
    scene: 'menu',
    health: 100,
    sanity: 100,
    inventory: [],
    currentStory: 0,
    choices: [],
    soundEnabled: true,
    jumpScareTriggered: false
  })

  const [isTyping, setIsTyping] = useState(false)
  const [displayedText, setDisplayedText] = useState('')
  const [jumpScareActive, setJumpScareActive] = useState(false)

  const currentNode = storyNodes.find(node => node.id === gameState.currentStory)

  // Typewriter effect
  useEffect(() => {
    if (gameState.scene === 'game' && currentNode) {
      setIsTyping(true)
      setDisplayedText('')
      
      const text = currentNode.text
      let index = 0
      
      const timer = setInterval(() => {
        if (index < text.length) {
          setDisplayedText(text.slice(0, index + 1))
          index++
        } else {
          setIsTyping(false)
          clearInterval(timer)
          
          // Trigger jump scare after text is fully displayed
          if (currentNode.jumpScare && !gameState.jumpScareTriggered) {
            setTimeout(() => {
              setJumpScareActive(true)
              setTimeout(() => setJumpScareActive(false), 1000)
            }, 1000)
          }
        }
      }, 50)
      
      return () => clearInterval(timer)
    }
  }, [gameState.currentStory, gameState.scene, currentNode, gameState.jumpScareTriggered])

  const startGame = () => {
    setGameState({
      scene: 'game',
      health: 100,
      sanity: 100,
      inventory: [],
      currentStory: 0,
      choices: [],
      soundEnabled: true,
      jumpScareTriggered: false
    })
  }

  const makeChoice = (choice: { text: string; nextId: number; requirement?: string; effect?: { health?: number; sanity?: number; item?: string } }) => {
    // Check requirements
    if (choice.requirement && !gameState.inventory.includes(choice.requirement)) {
      toast.error(`You need: ${choice.requirement}`)
      return
    }

    // Apply effects
    let newHealth = gameState.health
    let newSanity = gameState.sanity
    const newInventory = [...gameState.inventory]

    if (choice.effect) {
      if (choice.effect.health) {
        newHealth = Math.max(0, Math.min(100, gameState.health + choice.effect.health))
      }
      if (choice.effect.sanity) {
        newSanity = Math.max(0, Math.min(100, gameState.sanity + choice.effect.sanity))
      }
      if (choice.effect.item) {
        newInventory.push(choice.effect.item)
        toast.success(`Found: ${choice.effect.item}`)
      }
    }

    // Check for death conditions
    if (newHealth <= 0) {
      setGameState(prev => ({ ...prev, scene: 'death' }))
      return
    }

    const nextNode = storyNodes.find(node => node.id === choice.nextId)
    if (nextNode?.isDeadEnd) {
      setGameState(prev => ({ ...prev, scene: 'death' }))
      return
    }

    if (nextNode?.isWin) {
      setGameState(prev => ({ ...prev, scene: 'win' }))
      return
    }

    setGameState(prev => ({
      ...prev,
      currentStory: choice.nextId,
      choices: [...prev.choices, choice.nextId],
      health: newHealth,
      sanity: newSanity,
      inventory: newInventory
    }))
  }

  const resetGame = () => {
    setGameState({
      scene: 'menu',
      health: 100,
      sanity: 100,
      inventory: [],
      currentStory: 0,
      choices: [],
      soundEnabled: true,
      jumpScareTriggered: false
    })
  }

  const toggleSound = () => {
    setGameState(prev => ({ ...prev, soundEnabled: !prev.soundEnabled }))
  }

  if (gameState.scene === 'menu') {
    return (
      <div className="min-h-screen bg-black text-white relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 via-black to-purple-900/20" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,black_70%)]" />
        
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5 }}
            className="text-center space-y-8"
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
              A horror experience that will test your courage and sanity. 
              Do you dare to enter the mansion?
            </motion.p>
            
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
            >
              <Button
                onClick={startGame}
                className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 text-lg font-semibold border-2 border-red-400 shadow-lg hover:shadow-red-500/50 transition-all duration-300"
              >
                <Skull className="mr-2 h-5 w-5" />
                Enter the Nightmare
              </Button>
              
              <div className="flex items-center justify-center space-x-4 text-gray-400">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleSound}
                  className="text-gray-400 hover:text-white"
                >
                  {gameState.soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                </Button>
                <span className="text-sm">Sound: {gameState.soundEnabled ? 'On' : 'Off'}</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    )
  }

  if (gameState.scene === 'game') {
    return (
      <div className="min-h-screen bg-black text-white relative">
        {/* Jump scare overlay */}
        <AnimatePresence>
          {jumpScareActive && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black"
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

        {/* Game UI */}
        <div className="absolute top-4 left-4 right-4 z-20">
          <div className="flex justify-between items-center">
            <div className="flex space-x-4">
              <Card className="bg-black/80 border-red-500/50">
                <CardContent className="p-3">
                  <div className="flex items-center space-x-2">
                    <Heart className="h-4 w-4 text-red-500" />
                    <div className="w-24">
                      <Progress value={gameState.health} className="h-2" />
                    </div>
                    <span className="text-sm text-red-500">{gameState.health}%</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-black/80 border-purple-500/50">
                <CardContent className="p-3">
                  <div className="flex items-center space-x-2">
                    <Eye className="h-4 w-4 text-purple-500" />
                    <div className="w-24">
                      <Progress value={gameState.sanity} className="h-2" />
                    </div>
                    <span className="text-sm text-purple-500">{gameState.sanity}%</span>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="flex items-center space-x-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="bg-black/80 border-gray-600">
                    Inventory ({gameState.inventory.length})
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-black border-gray-600">
                  <DialogHeader>
                    <DialogTitle className="text-white">Inventory</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-2">
                    {gameState.inventory.length === 0 ? (
                      <p className="text-gray-400">Empty</p>
                    ) : (
                      gameState.inventory.map((item, index) => (
                        <Badge key={index} variant="secondary">{item}</Badge>
                      ))
                    )}
                  </div>
                </DialogContent>
              </Dialog>
              
              <Button
                variant="outline"
                size="sm"
                onClick={resetGame}
                className="bg-black/80 border-gray-600"
              >
                Exit Game
              </Button>
            </div>
          </div>
        </div>

        {/* Story content */}
        <div className="pt-20 px-8 pb-8">
          <div className="max-w-4xl mx-auto">
            <Card className="bg-black/80 border-red-500/30 backdrop-blur-sm">
              <CardContent className="p-8">
                <div className="min-h-[200px] mb-8">
                  <p className="text-lg leading-relaxed text-gray-200">
                    {displayedText}
                    {isTyping && (
                      <motion.span
                        animate={{ opacity: [0, 1, 0] }}
                        transition={{ duration: 0.5, repeat: Infinity }}
                        className="text-red-500"
                      >
                        |
                      </motion.span>
                    )}
                  </p>
                </div>
                
                {!isTyping && currentNode && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="space-y-4"
                  >
                    {currentNode.choices.map((choice, index) => (
                      <Button
                        key={index}
                        onClick={() => makeChoice(choice)}
                        className="w-full text-left justify-start h-auto p-4 bg-gray-800 hover:bg-gray-700 border border-gray-600 hover:border-red-500 transition-all duration-300"
                        disabled={choice.requirement && !gameState.inventory.includes(choice.requirement)}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span>{choice.text}</span>
                          {choice.requirement && (
                            <Badge variant="outline" className="ml-2">
                              Requires: {choice.requirement}
                            </Badge>
                          )}
                        </div>
                      </Button>
                    ))}
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  if (gameState.scene === 'death') {
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
            The darkness has claimed you. Your sanity shattered, your body broken.
          </p>
          
          <div className="space-y-4">
            <Button
              onClick={resetGame}
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 text-lg"
            >
              Try Again
            </Button>
            <Button
              onClick={resetGame}
              variant="outline"
              className="block mx-auto text-gray-400 border-gray-600 hover:text-white"
            >
              Return to Menu
            </Button>
          </div>
        </motion.div>
      </div>
    )
  }

  if (gameState.scene === 'win') {
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
          
          <h2 className="text-5xl font-bold text-green-400">YOU SURVIVED</h2>
          <p className="text-xl text-gray-300 max-w-md mx-auto">
            Against all odds, you escaped the nightmare. But the memories will haunt you forever.
          </p>
          
          <div className="space-y-4">
            <Button
              onClick={resetGame}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 text-lg"
            >
              Play Again
            </Button>
            <Button
              onClick={resetGame}
              variant="outline"
              className="block mx-auto text-gray-400 border-gray-600 hover:text-white"
            >
              Return to Menu
            </Button>
          </div>
        </motion.div>
      </div>
    )
  }

  return null
}

export default App