import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Crown, Star, Sparkles, Trophy, Mic, 
  Users, TrendingUp, Zap, AlertCircle, Gift
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useVoting } from '@/contexts/VotingContext'

interface HeadlinerAnnouncementProps {
  className?: string
  threshold?: number
  celebrationDuration?: number
}

const HeadlinerAnnouncement: React.FC<HeadlinerAnnouncementProps> = ({
  className = '',
  threshold = 500,
  celebrationDuration = 10000 // 10 seconds
}) => {
  const {
    leaderboard,
    refreshLeaderboard
  } = useVoting()

  const [announcement, setAnnouncement] = useState<{
    visible: boolean
    artistId?: string
    artistName?: string
    totalWeight: number
    rank: number
    isNewHeadliner: boolean
  }>({
    visible: false,
    artistId: undefined,
    artistName: undefined,
    totalWeight: 0,
    rank: 0,
    isNewHeadliner: false
  })

  const [confetti, setConfetti] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)

  // Check for headliner announcements
  useEffect(() => {
    if (!leaderboard.length) return

    const topArtist = leaderboard[0]
    
    // Check if top artist has reached threshold
    if (topArtist.totalWeight >= threshold) {
      const isNew = !announcement.visible || topArtist.artistId !== announcement.artistId
      
      setAnnouncement({
        visible: true,
        artistId: topArtist.artistId,
        artistName: `Artist ${topArtist.artistId}`,
        totalWeight: topArtist.totalWeight,
        rank: topArtist.rank,
        isNewHeadliner: isNew
      })

      // Trigger celebration effects
      if (isNew) {
        setConfetti(true)
        setShowCelebration(true)
        
        // Hide celebration after duration
        setTimeout(() => {
          setShowCelebration(false)
          setConfetti(false)
        }, celebrationDuration)
      }
    } else if (announcement.visible && topArtist.totalWeight < threshold) {
      // Hide if threshold is no longer met
      setAnnouncement(prev => ({ ...prev, visible: false }))
    }
  }, [leaderboard, threshold, announcement.visible, announcement.artistId, celebrationDuration])

  const handleDismiss = () => {
    setAnnouncement(prev => ({ ...prev, visible: false }))
  }

  const formatNumber = (num: number): string => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k'
    }
    return num.toString()
  }

  if (!announcement.visible) return null

  return (
    <>
      {/* Confetti Effect */}
      <AnimatePresence>
        {confetti && (
          <div className="fixed inset-0 pointer-events-none z-50">
            {[...Array(50)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  backgroundColor: ['#fbbf24', '#f59e0b', '#d946ef', '#8b5cf6', '#06b6d4'][Math.floor(Math.random() * 5)]
                }}
                initial={{ 
                  y: -100, 
                  rotate: 0,
                  opacity: 1
                }}
                animate={{ 
                  y: window.innerHeight + 100,
                  rotate: 360,
                  opacity: 0
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  ease: 'easeOut',
                  delay: Math.random() * 2
                }}
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Celebration Overlay */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center"
            onClick={handleDismiss}
          >
            <motion.div
              initial={{ scale: 0.5, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0.5, rotate: 10 }}
              className="text-center"
            >
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 0.6,
                  repeat: 2
                }}
              >
                <Crown className="w-20 h-20 mx-auto mb-4 text-yellow-400" />
              </motion.div>
              <h2 className="text-4xl font-bold text-white mb-2">
                🎉 HEADLINER ANNOUNCED! 🎉
              </h2>
              <p className="text-xl text-gray-200">
                The community has spoken!
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Announcement Card */}
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.9 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className={`fixed bottom-4 right-4 z-30 max-w-sm ${className}`}
      >
        <Card className="relative overflow-hidden border-2 border-yellow-400 bg-gradient-to-br from-yellow-900/20 to-orange-900/20">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M20 20c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10zm10 0c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10z'/%3E%3C/g%3E%3C/svg%3E")`,
              backgroundSize: '40px 40px'
            }} />
          </div>

          <CardHeader className="pb-2 relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <motion.div
                  animate={{ 
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 3
                  }}
                >
                  <Crown className="w-6 h-6 text-yellow-400" />
                </motion.div>
                <CardTitle className="text-lg text-yellow-400">
                  Festival Headliner!
                </CardTitle>
              </div>
              <Badge className="bg-gradient-to-r from-yellow-600 to-orange-600">
                <Trophy className="w-3 h-3 mr-1" />
                #{announcement.rank}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-3 relative">
            {/* Artist Info */}
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center text-white font-bold text-lg">
                {announcement.artistName?.charAt(0).toUpperCase() || 'A'}
              </div>
              <div>
                <h3 className="font-bold text-white text-lg">
                  {announcement.artistName}
                </h3>
                <p className="text-sm text-gray-300">
                  Community Choice Headliner
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-black/30 rounded-lg p-2 text-center">
                <div className="text-2xl font-bold text-yellow-400">
                  {formatNumber(announcement.totalWeight)}
                </div>
                <div className="text-xs text-gray-400">Total Weight</div>
              </div>
              <div className="bg-black/30 rounded-lg p-2 text-center">
                <div className="text-2xl font-bold text-orange-400">
                  {threshold.toLocaleString()}
                </div>
                <div className="text-xs text-gray-400">Threshold</div>
              </div>
            </div>

            {/* Achievement Message */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-yellow-900/40 to-orange-900/40 rounded-lg p-3 border border-yellow-700/50"
            >
              <div className="flex items-center space-x-2">
                <Star className="w-4 h-4 text-yellow-400" />
                <span className="text-sm text-yellow-300">
                  {announcement.isNewHeadliner 
                    ? "🎊 Congratulations! The community has selected this artist as the festival headliner! 🎊"
                    : "🎵 This artist maintains their position as the festival headliner! 🎵"
                  }
                </span>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={refreshLeaderboard}
                className="flex-1 border-yellow-600 text-yellow-400 hover:bg-yellow-900/20"
              >
                <TrendingUp className="w-3 h-3 mr-1" />
                View Stats
              </Button>
              <Button 
                size="sm" 
                onClick={handleDismiss}
                className="flex-1 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700"
              >
                Dismiss
              </Button>
            </div>

            {/* Special Effects */}
            <motion.div
              animate={{ 
                boxShadow: [
                  '0 0 20px rgba(251, 191, 36, 0.3)',
                  '0 0 40px rgba(251, 191, 36, 0.5)',
                  '0 0 20px rgba(251, 191, 36, 0.3)'
                ]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: 'reverse'
              }}
              className="absolute inset-0 rounded-lg pointer-events-none"
            />
          </CardContent>
        </Card>
      </motion.div>
    </>
  )
}

export default HeadlinerAnnouncement
