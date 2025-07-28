import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Trophy, Star, Zap, Calendar, Target, Award, Map, 
  TrendingUp, Flame, Crown, Sparkles, CheckCircle2,
  Clock, Gift, Users, Music, Volume2, Sliders
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/AuthContext'
import { challengeSystem, Quest, UserChallengeStats, FestivalStage } from '@/lib/challengeSystem'

interface ShuffleChallengeProps {
  onClose: () => void
  djStationState?: {
    deckAPlaying: boolean
    deckBPlaying: boolean
    crossfadePosition: number
    equalizerActive: boolean
    currentBPM?: number
    currentKey?: string
  }
}

const ShuffleChallenge: React.FC<ShuffleChallengeProps> = ({ 
  onClose, 
  djStationState 
}) => {
  const { user } = useAuth()
  const [dailyQuests, setDailyQuests] = useState<Quest[]>([])
  const [userStats, setUserStats] = useState<UserChallengeStats | null>(null)
  const [festivalStages, setFestivalStages] = useState<FestivalStage[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null)
  const [activeTab, setActiveTab] = useState('challenges')

  // Initialize challenge system
  useEffect(() => {
    const initChallenges = async () => {
      setLoading(true)
      
      const initialized = await challengeSystem.initialize()
      if (!initialized) {
        toast.error('Failed to load challenges')
        return
      }

      if (user?.id) {
        const stats = await challengeSystem.getUserChallengeStats(user.id)
        setUserStats(stats)
        
        const quests = challengeSystem.getDailyQuests()
        
        // Load quest progress for each quest
        const questsWithProgress = await Promise.all(
          quests.map(async (quest) => {
            const progress = await challengeSystem.getQuestProgress(user.id!, quest.id)
            return {
              ...quest,
              completed: progress?.completed || false,
              progress: progress?.progress || 0,
              maxProgress: quest.requirements.duration || quest.requirements.crossfades || quest.requirements.eqBands || 1
            }
          })
        )
        
        setDailyQuests(questsWithProgress)
        setFestivalStages(challengeSystem.getFestivalStages())
      }
      
      setLoading(false)
    }

    initChallenges()
  }, [user?.id])

  // Monitor DJ station state for quest progress
  useEffect(() => {
    if (!djStationState || !user?.id || dailyQuests.length === 0) return

    const checkQuestProgress = async () => {
      for (const quest of dailyQuests) {
        if (quest.completed) continue

        let progressMade = false
        let newProgress = quest.progress || 0

        // Check different quest types
        switch (quest.requirements.action) {
          case 'drop':
            if (djStationState.deckAPlaying || djStationState.deckBPlaying) {
              if (quest.requirements.bpm && djStationState.currentBPM === quest.requirements.bpm) {
                newProgress = Math.min(newProgress + 1, quest.maxProgress || 1)
                progressMade = true
              }
            }
            break

          case 'transition':
            if (djStationState.crossfadePosition !== 50) {
              newProgress = Math.min(newProgress + 1, quest.requirements.crossfades || 5)
              progressMade = true
            }
            break

          case 'sculpt':
            if (djStationState.equalizerActive) {
              newProgress = Math.min(newProgress + 1, quest.requirements.eqBands || 8)
              progressMade = true
            }
            break

          case 'remix':
            if (djStationState.currentKey === quest.requirements.key) {
              newProgress = quest.maxProgress || 1
              progressMade = true
            }
            break
        }

        if (progressMade) {
          const completed = newProgress >= (quest.maxProgress || 1)
          
          await challengeSystem.updateQuestProgress(
            user.id,
            quest.id,
            newProgress,
            completed
          )

          if (completed) {
            toast.success(`🎉 Quest completed: ${quest.title}!`)
            
            // Refresh user stats
            const updatedStats = await challengeSystem.getUserChallengeStats(user.id)
            setUserStats(updatedStats)
          }

          // Update local state
          setDailyQuests(prev => prev.map(q => 
            q.id === quest.id 
              ? { ...q, progress: newProgress, completed }
              : q
          ))
        }
      }
    }

    checkQuestProgress()
  }, [djStationState, user?.id, dailyQuests])

  const getQuestCategoryIcon = (category: string) => {
    switch (category) {
      case 'mixing': return <Sliders className="w-5 h-5" />
      case 'production': return <Music className="w-5 h-5" />
      case 'performance': return <Users className="w-5 h-5" />
      case 'creativity': return <Sparkles className="w-5 h-5" />
      default: return <Target className="w-5 h-5" />
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'from-green-500 to-emerald-500'
      case 'intermediate': return 'from-yellow-500 to-orange-500'
      case 'advanced': return 'from-red-500 to-purple-500'
      default: return 'from-gray-500 to-gray-600'
    }
  }

  const QuestCard: React.FC<{ quest: Quest }> = ({ quest }) => (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className="cursor-pointer"
      onClick={() => setSelectedQuest(quest)}
    >
      <Card className={`bg-gradient-to-br ${getDifficultyColor(quest.difficulty)} p-1 ${quest.completed ? 'opacity-75' : ''}`}>
        <div className="bg-black/80 rounded-lg p-4 h-full">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              {getQuestCategoryIcon(quest.category)}
              <Badge className="bg-white/20 text-white text-xs">
                {quest.difficulty}
              </Badge>
            </div>
            {quest.completed && (
              <CheckCircle2 className="w-6 h-6 text-green-400" />
            )}
          </div>
          
          <h3 className="font-bold text-white mb-2">{quest.title}</h3>
          <p className="text-gray-300 text-sm mb-3">{quest.description}</p>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Progress</span>
              <span className="text-white">{quest.progress || 0} / {quest.maxProgress || 1}</span>
            </div>
            <Progress 
              value={((quest.progress || 0) / (quest.maxProgress || 1)) * 100} 
              className="h-2"
            />
          </div>
          
          <div className="flex justify-between items-center mt-3">
            <div className="flex items-center space-x-1 text-yellow-400">
              <Star className="w-4 h-4" />
              <span className="text-sm font-bold">{quest.xpReward} XP</span>
            </div>
            {quest.streakBonus > 0 && (
              <div className="flex items-center space-x-1 text-orange-400">
                <Flame className="w-4 h-4" />
                <span className="text-xs">+{quest.streakBonus} streak</span>
              </div>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  )

  const FestivalMap: React.FC = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">
          Festival Journey
        </h2>
        <p className="text-gray-400">
          Progress through iconic venues on your path to EDM stardom
        </p>
      </div>

      <div className="relative">
        {/* Festival Map Path */}
        <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500 via-cyan-500 to-green-500 transform -translate-x-1/2 z-0" />
        
        <div className="space-y-8 relative z-10">
          {festivalStages.map((stage, index) => {
            const isUnlocked = userStats ? userStats.totalXP >= stage.xpRequired : false
            const isCurrent = userStats ? userStats.festivalStage === stage.id : false
            
            return (
              <motion.div
                key={stage.id}
                className={`flex items-center ${index % 2 === 0 ? 'justify-start pl-8' : 'justify-end pr-8'}`}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={`max-w-md ${isUnlocked ? 'bg-gradient-to-br from-purple-600/20 to-cyan-600/20' : 'bg-gray-800/50'} border-2 ${isCurrent ? 'border-yellow-400 shadow-lg shadow-yellow-400/25' : isUnlocked ? 'border-cyan-500/50' : 'border-gray-600'}`}>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isUnlocked ? 'bg-gradient-to-br from-purple-500 to-cyan-500' : 'bg-gray-600'}`}>
                        {isCurrent ? (
                          <Crown className="w-6 h-6 text-yellow-400" />
                        ) : isUnlocked ? (
                          <Trophy className="w-6 h-6 text-white" />
                        ) : (
                          <Map className="w-6 h-6 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <h3 className={`font-bold ${isUnlocked ? 'text-white' : 'text-gray-400'}`}>
                          {stage.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {stage.xpRequired} XP Required
                        </p>
                      </div>
                    </div>
                    
                    <p className={`text-sm mb-3 ${isUnlocked ? 'text-gray-300' : 'text-gray-500'}`}>
                      {stage.description}
                    </p>
                    
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-gray-400">REWARDS:</p>
                      <div className="flex flex-wrap gap-1">
                        {stage.rewards.map((reward, i) => (
                          <Badge 
                            key={i} 
                            variant="outline" 
                            className={`text-xs ${isUnlocked ? 'border-cyan-500 text-cyan-400' : 'border-gray-600 text-gray-500'}`}
                          >
                            {reward}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-gray-900 rounded-lg p-8 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-white">Loading challenges...</p>
        </div>
      </div>
    )
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="max-w-6xl w-full max-h-[90vh] overflow-y-auto"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
        >
          <Card className="bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 border-cyan-500/30 shadow-2xl">
            <CardHeader className="border-b border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full flex items-center justify-center">
                    <Trophy className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold text-white">
                      Shuffle Challenges
                    </CardTitle>
                    <p className="text-cyan-400">Level up your DJ skills and climb the festival ranks</p>
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

            <CardContent className="p-6">
              {/* User Stats Header */}
              {userStats && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                  <Card className="bg-black/50 border-cyan-500/30">
                    <CardContent className="p-4 text-center">
                      <div className="flex items-center justify-center mb-2">
                        <Star className="w-5 h-5 text-yellow-400 mr-1" />
                        <span className="text-2xl font-bold text-white">{userStats.totalXP}</span>
                      </div>
                      <p className="text-sm text-gray-400">Total XP</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-black/50 border-orange-500/30">
                    <CardContent className="p-4 text-center">
                      <div className="flex items-center justify-center mb-2">
                        <Flame className="w-5 h-5 text-orange-400 mr-1" />
                        <span className="text-2xl font-bold text-white">{userStats.currentStreak}</span>
                      </div>
                      <p className="text-sm text-gray-400">Current Streak</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-black/50 border-purple-500/30">
                    <CardContent className="p-4 text-center">
                      <div className="flex items-center justify-center mb-2">
                        <TrendingUp className="w-5 h-5 text-purple-400 mr-1" />
                        <span className="text-2xl font-bold text-white">{userStats.level}</span>
                      </div>
                      <p className="text-sm text-gray-400">Level</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-black/50 border-green-500/30">
                    <CardContent className="p-4 text-center">
                      <div className="flex items-center justify-center mb-2">
                        <Trophy className="w-5 h-5 text-green-400 mr-1" />
                        <span className="text-2xl font-bold text-white">{userStats.questsCompleted}</span>
                      </div>
                      <p className="text-sm text-gray-400">Quests Done</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-black/50 border-cyan-500/30">
                    <CardContent className="p-4 text-center">
                      <div className="flex items-center justify-center mb-2">
                        <Map className="w-5 h-5 text-cyan-400 mr-1" />
                        <span className="text-2xl font-bold text-white">{userStats.festivalStage}</span>
                      </div>
                      <p className="text-sm text-gray-400">Festival Stage</p>
                    </CardContent>
                  </Card>
                </div>
              )}

              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-black/50">
                  <TabsTrigger value="challenges" className="data-[state=active]:bg-purple-600">
                    <Target className="w-4 h-4 mr-2" />
                    Daily Challenges
                  </TabsTrigger>
                  <TabsTrigger value="map" className="data-[state=active]:bg-cyan-600">
                    <Map className="w-4 h-4 mr-2" />
                    Festival Map
                  </TabsTrigger>
                  <TabsTrigger value="rewards" className="data-[state=active]:bg-yellow-600">
                    <Gift className="w-4 h-4 mr-2" />
                    Rewards
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="challenges" className="mt-6">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-bold text-white">Today's Challenges</h2>
                      <div className="flex items-center space-x-2 text-gray-400">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">Resets daily at midnight</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {dailyQuests.map((quest) => (
                        <QuestCard key={quest.id} quest={quest} />
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="map" className="mt-6">
                  <FestivalMap />
                </TabsContent>

                <TabsContent value="rewards" className="mt-6">
                  <div className="text-center text-gray-400">
                    <Award className="w-16 h-16 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">Rewards System</h3>
                    <p>Complete challenges to unlock exclusive sound packs, DJ tools, and festival progression!</p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quest Detail Modal */}
        <AnimatePresence>
          {selectedQuest && (
            <motion.div
              className="absolute inset-0 bg-black/75 flex items-center justify-center p-4 z-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedQuest(null)}
            >
              <motion.div
                className="max-w-md w-full"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                <Card className={`bg-gradient-to-br ${getDifficultyColor(selectedQuest.difficulty)} p-1`}>
                  <div className="bg-black/90 rounded-lg p-6">
                    <div className="text-center mb-6">
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        {getQuestCategoryIcon(selectedQuest.category)}
                      </div>
                      <h2 className="text-2xl font-bold text-white mb-2">{selectedQuest.title}</h2>
                      <p className="text-gray-300">{selectedQuest.description}</p>
                    </div>

                    <div className="space-y-4">
                      <div className="bg-gray-800/50 rounded-lg p-4">
                        <h3 className="font-semibold text-white mb-2">Requirements:</h3>
                        <div className="space-y-1 text-sm text-gray-300">
                          {Object.entries(selectedQuest.requirements).map(([key, value]) => (
                            <div key={key} className="flex justify-between">
                              <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                              <span className="text-white">{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-gray-800/50 rounded-lg p-4">
                        <h3 className="font-semibold text-white mb-2">Rewards:</h3>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-2 text-yellow-400">
                            <Star className="w-5 h-5" />
                            <span>{selectedQuest.xpReward} XP</span>
                          </div>
                          {selectedQuest.streakBonus > 0 && (
                            <div className="flex items-center space-x-2 text-orange-400">
                              <Flame className="w-5 h-5" />
                              <span>+{selectedQuest.streakBonus} per streak</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={() => setSelectedQuest(null)}
                      className="w-full mt-6 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700"
                    >
                      Got it!
                    </Button>
                  </div>
                </Card>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  )
}

export default ShuffleChallenge