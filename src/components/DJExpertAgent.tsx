import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Award, BookOpen, Zap, Volume2, RotateCcw, CheckCircle, Target } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/AuthContext'

interface DJTutorialLevel {
  id: string
  name: string
  description: string
  skills: string[]
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  color: string
  xpReward: number
}

interface GuidanceBubble {
  id: string
  message: string
  type: 'tip' | 'instruction' | 'feedback' | 'achievement'
  position: { x: number; y: number }
  duration: number
  isVisible: boolean
}

interface DJExpertAgentProps {
  isActive: boolean
  djStationState: {
    deckAPlaying: boolean
    deckBPlaying: boolean
    crossfadePosition: number
    equalizerActive: boolean
    assignedStems: { A: any | null; B: any | null }
  }
  onLevelSelect: (level: DJTutorialLevel) => void
  onClose: () => void
}

const DJ_TUTORIAL_LEVELS: DJTutorialLevel[] = [
  {
    id: 'beginner',
    name: 'Beginner',
    description: 'Simple beatmatching, basic deck controls',
    skills: ['Play/Pause Controls', 'Volume Adjustment', 'Basic Crossfading', 'Understanding BPM'],
    difficulty: 'Beginner',
    color: 'from-green-500 to-emerald-500',
    xpReward: 100
  },
  {
    id: 'intermediate', 
    name: 'Intermediate',
    description: 'Looping, hot cues, transitions, pitch blend',
    skills: ['Beat Matching', 'Smooth Transitions', 'EQ Blending', 'Tempo Control', 'Track Selection'],
    difficulty: 'Intermediate',
    color: 'from-yellow-500 to-orange-500',
    xpReward: 250
  },
  {
    id: 'advanced',
    name: 'Advanced',
    description: 'Layering, FX chains, harmonic mixing, live EQ',
    skills: ['Harmonic Mixing', 'Advanced EQ Techniques', 'Live Layering', 'FX Chains', 'Performance Skills'],
    difficulty: 'Advanced',
    color: 'from-red-500 to-purple-500',
    xpReward: 500
  }
]

const DJExpertAgent: React.FC<DJExpertAgentProps> = ({
  isActive,
  djStationState,
  onLevelSelect,
  onClose
}) => {
  const { user, profile } = useAuth()
  const [selectedLevel, setSelectedLevel] = useState<DJTutorialLevel | null>(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [guidanceBubbles, setGuidanceBubbles] = useState<GuidanceBubble[]>([])
  const [sessionXP, setSessionXP] = useState(0)
  const [achievements, setAchievements] = useState<string[]>([])
  const [isCoaching, setIsCoaching] = useState(false)

  // Tutorial steps for each level
  const getTutorialSteps = (level: DJTutorialLevel) => {
    switch (level.id) {
      case 'beginner':
        return [
          { instruction: 'Load a sound from the Sound Pack Loader to Deck A', check: () => djStationState.assignedStems.A !== null },
          { instruction: 'Load a different sound to Deck B', check: () => djStationState.assignedStems.B !== null },
          { instruction: 'Press Play on Deck A to start the track', check: () => djStationState.deckAPlaying },
          { instruction: 'Use the crossfader to blend between decks', check: () => djStationState.crossfadePosition !== 50 },
          { instruction: 'Try the equalizer to shape your sound', check: () => djStationState.equalizerActive }
        ]
      case 'intermediate':
        return [
          { instruction: 'Load tracks with matching BPMs for smooth mixing', check: () => djStationState.assignedStems.A && djStationState.assignedStems.B },
          { instruction: 'Start playing both decks simultaneously', check: () => djStationState.deckAPlaying && djStationState.deckBPlaying },
          { instruction: 'Practice smooth crossfader transitions', check: () => djStationState.crossfadePosition !== 50 },
          { instruction: 'Use EQ to create space for each track', check: () => djStationState.equalizerActive },
          { instruction: 'Complete a full transition from A to B', check: () => djStationState.crossfadePosition > 75 }
        ]
      case 'advanced':
        return [
          { instruction: 'Load harmonically compatible tracks', check: () => djStationState.assignedStems.A && djStationState.assignedStems.B },
          { instruction: 'Layer both tracks with strategic EQ cuts', check: () => djStationState.deckAPlaying && djStationState.deckBPlaying && djStationState.equalizerActive },
          { instruction: 'Create dynamic EQ movements during the mix', check: () => djStationState.equalizerActive },
          { instruction: 'Master the art of long, musical transitions', check: () => djStationState.crossfadePosition !== 50 },
          { instruction: 'Demonstrate advanced mixing techniques', check: () => completedSteps.length >= 3 }
        ]
      default:
        return []
    }
  }

  // Check step completion
  const checkStepCompletion = useCallback(() => {
    if (!selectedLevel || !isCoaching) return

    const steps = getTutorialSteps(selectedLevel)
    const currentStepData = steps[currentStep]

    if (currentStepData && currentStepData.check() && !completedSteps.includes(currentStep)) {
      setCompletedSteps(prev => [...prev, currentStep])
      addGuidanceBubble(
        '✅ Great job! Step completed.',
        'achievement',
        { x: 50, y: 30 },
        3000
      )
      
      // Award XP for step completion
      const stepXP = Math.floor(selectedLevel.xpReward / steps.length)
      setSessionXP(prev => prev + stepXP)
      
      // Move to next step after delay
      setTimeout(() => {
        if (currentStep < steps.length - 1) {
          setCurrentStep(currentStep + 1)
          addGuidanceBubble(
            steps[currentStep + 1].instruction,
            'instruction',
            { x: 50, y: 20 },
            8000
          )
        } else {
          // Tutorial completed
          completeLevel()
        }
      }, 2000)
    }
  }, [selectedLevel, currentStep, completedSteps, djStationState, isCoaching])

  // Add guidance bubble
  const addGuidanceBubble = useCallback((message: string, type: GuidanceBubble['type'], position: { x: number; y: number }, duration: number) => {
    const bubble: GuidanceBubble = {
      id: Date.now().toString(),
      message,
      type,
      position,
      duration,
      isVisible: true
    }

    setGuidanceBubbles(prev => [...prev, bubble])

    // Auto-remove bubble after duration
    setTimeout(() => {
      setGuidanceBubbles(prev => prev.filter(b => b.id !== bubble.id))
    }, duration)
  }, [])

  // Complete level
  const completeLevel = () => {
    if (!selectedLevel) return

    setAchievements(prev => [...prev, `${selectedLevel.name} DJ Certification`])
    setSessionXP(prev => prev + selectedLevel.xpReward)
    
    toast.success(`🎉 ${selectedLevel.name} level completed! +${selectedLevel.xpReward} XP`)
    
    addGuidanceBubble(
      `🏆 ${selectedLevel.name} Certification Earned! You're now certified on the Pioneer FLX-10!`,
      'achievement',
      { x: 50, y: 50 },
      5000
    )

    setIsCoaching(false)
    setCurrentStep(0)
    setCompletedSteps([])
  }

  // Start tutorial level
  const startLevel = (level: DJTutorialLevel) => {
    setSelectedLevel(level)
    setCurrentStep(0)
    setCompletedSteps([])
    setIsCoaching(true)
    onLevelSelect(level)

    const steps = getTutorialSteps(level)
    if (steps.length > 0) {
      addGuidanceBubble(
        `🎛️ Starting ${level.name} Tutorial: ${steps[0].instruction}`,
        'instruction',
        { x: 50, y: 20 },
        8000
      )
    }
  }

  // Check for step completion
  useEffect(() => {
    checkStepCompletion()
  }, [checkStepCompletion])

  // Provide contextual tips based on DJ station state
  useEffect(() => {
    if (!isCoaching) return

    // Smart tips based on current state
    if (djStationState.deckAPlaying && djStationState.deckBPlaying && !djStationState.equalizerActive) {
      addGuidanceBubble(
        '💡 Try using the equalizer to blend your tracks better!',
        'tip',
        { x: 80, y: 60 },
        4000
      )
    }

    if (djStationState.crossfadePosition === 50 && djStationState.deckAPlaying && djStationState.deckBPlaying) {
      addGuidanceBubble(
        '🎚️ Move the crossfader to transition between tracks!',
        'tip',
        { x: 20, y: 80 },
        4000
      )
    }
  }, [djStationState, isCoaching, addGuidanceBubble])

  if (!isActive) return null

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Guidance Bubbles */}
        <AnimatePresence>
          {guidanceBubbles.map(bubble => (
            <motion.div
              key={bubble.id}
              className={`fixed max-w-sm p-4 rounded-lg shadow-lg z-60 ${
                bubble.type === 'achievement' ? 'bg-green-600' :
                bubble.type === 'instruction' ? 'bg-blue-600' :
                bubble.type === 'tip' ? 'bg-yellow-600' :
                'bg-purple-600'
              } text-white`}
              style={{
                left: `${bubble.position.x}%`,
                top: `${bubble.position.y}%`,
                transform: 'translate(-50%, -50%)'
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', duration: 0.5 }}
            >
              <p className="text-sm font-medium">{bubble.message}</p>
              {bubble.type === 'achievement' && (
                <Award className="w-5 h-5 inline-block ml-2" />
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Main Agent Panel */}
        <motion.div
          className="max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
        >
          <Card className="bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 border-cyan-500/30 shadow-2xl">
            <CardHeader className="border-b border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold text-white">
                      DJ Coach (FLX-10 Certified)
                    </CardTitle>
                    <p className="text-cyan-400">Virtual DJ Mentor & Performance Coach</p>
                  </div>
                </div>
                <Button
                  onClick={onClose}
                  variant="outline"
                  size="sm"
                  className="text-gray-400 border-gray-600 hover:bg-gray-700"
                >
                  ✕
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
              {/* Session Stats */}
              {(sessionXP > 0 || achievements.length > 0) && (
                <div className="bg-black/50 rounded-lg p-4">
                  <h3 className="text-white font-bold mb-3 flex items-center">
                    <Award className="w-5 h-5 mr-2 text-yellow-500" />
                    Session Progress
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-cyan-400 text-sm">XP Earned</p>
                      <p className="text-white text-xl font-bold">{sessionXP}</p>
                    </div>
                    <div>
                      <p className="text-cyan-400 text-sm">Achievements</p>
                      <p className="text-white text-xl font-bold">{achievements.length}</p>
                    </div>
                  </div>
                  {achievements.length > 0 && (
                    <div className="mt-3">
                      {achievements.map((achievement, index) => (
                        <Badge key={index} className="mr-2 mb-2 bg-yellow-600 text-white">
                          🏆 {achievement}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Current Tutorial Progress */}
              {isCoaching && selectedLevel && (
                <div className="bg-black/50 rounded-lg p-4">
                  <h3 className="text-white font-bold mb-3 flex items-center">
                    <Target className="w-5 h-5 mr-2 text-green-500" />
                    {selectedLevel.name} Tutorial Progress
                  </h3>
                  <Progress 
                    value={(completedSteps.length / getTutorialSteps(selectedLevel).length) * 100} 
                    className="mb-3"
                  />
                  <p className="text-gray-300 text-sm">
                    Step {currentStep + 1} of {getTutorialSteps(selectedLevel).length}
                  </p>
                  <p className="text-white">
                    {getTutorialSteps(selectedLevel)[currentStep]?.instruction || 'Tutorial Complete!'}
                  </p>
                </div>
              )}

              {/* Level Selection */}
              {!isCoaching && (
                <>
                  <div className="text-center mb-6">
                    <h2 className="text-3xl font-bold text-white mb-2">
                      Welcome to DJ Academy
                    </h2>
                    <p className="text-gray-300">
                      I'm your certified FLX-10 instructor. Choose your skill level to begin personalized coaching.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {DJ_TUTORIAL_LEVELS.map(level => (
                      <motion.div
                        key={level.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Card className={`bg-gradient-to-br ${level.color} p-1 cursor-pointer hover:shadow-xl transition-all duration-300`}>
                          <div className="bg-black/80 rounded-lg p-4 h-full">
                            <div className="text-center mb-4">
                              <h3 className="text-xl font-bold text-white mb-2">
                                {level.name}
                              </h3>
                              <Badge className="bg-white/20 text-white mb-2">
                                {level.difficulty}
                              </Badge>
                              <p className="text-gray-300 text-sm">
                                {level.description}
                              </p>
                            </div>

                            <div className="space-y-2 mb-4">
                              <p className="text-white font-semibold text-sm">Skills Covered:</p>
                              {level.skills.map((skill, index) => (
                                <div key={index} className="flex items-center text-gray-300 text-xs">
                                  <CheckCircle className="w-3 h-3 mr-2 text-green-400" />
                                  {skill}
                                </div>
                              ))}
                            </div>

                            <div className="text-center">
                              <p className="text-yellow-400 text-sm mb-3">
                                🏆 {level.xpReward} XP Reward
                              </p>
                              <Button
                                onClick={() => startLevel(level)}
                                className="w-full bg-white/20 hover:bg-white/30 text-white"
                              >
                                <BookOpen className="w-4 h-4 mr-2" />
                                Start Tutorial
                              </Button>
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </>
              )}

              {/* Coaching Controls */}
              {isCoaching && (
                <div className="flex gap-3 justify-center">
                  <Button
                    onClick={() => {
                      setIsCoaching(false)
                      setSelectedLevel(null)
                      setCurrentStep(0)
                      setCompletedSteps([])
                    }}
                    variant="outline"
                    className="border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset Tutorial
                  </Button>
                </div>
              )}

              {/* DJ Tips */}
              <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 rounded-lg p-4">
                <h3 className="text-white font-bold mb-3 flex items-center">
                  <Zap className="w-5 h-5 mr-2 text-yellow-500" />
                  Pro Tips from Your Coach
                </h3>
                <div className="space-y-2 text-gray-300 text-sm">
                  <p>• Always listen with your ears, not just your eyes - trust the mix</p>
                  <p>• Practice beatmatching without sync to develop your ear</p>
                  <p>• Use EQ to create space for each element in your mix</p>
                  <p>• The crossfader is your paintbrush - smooth transitions tell a story</p>
                  <p>• Master the basics before moving to advanced techniques</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default DJExpertAgent