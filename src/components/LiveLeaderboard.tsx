import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Trophy, Crown, Medal, Award, TrendingUp, Users, 
  Zap, Star, Sparkles, Clock, RefreshCw
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useVoting } from '@/contexts/VotingContext'

interface LeaderboardEntry {
  artistId: string
  totalVotes: number
  totalWeight: number
  averageWeight: number
  rank: number
  artistName?: string
  artistGenre?: string
  avatar?: string
}

interface LiveLeaderboardProps {
  className?: string
  limit?: number
  showControls?: boolean
}

const LiveLeaderboard: React.FC<LiveLeaderboardProps> = ({ 
  className = '',
  limit = 10,
  showControls = true
}) => {
  const {
    leaderboard,
    isLoadingLeaderboard,
    refreshLeaderboard
  } = useVoting()

  const [sortBy, setSortBy] = useState<'weight' | 'votes' | 'average'>('weight')
  const [sortByRank, setSortByRank] = useState<'asc' | 'desc'>('desc')
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  // Auto-refresh leaderboard every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refreshLeaderboard()
      setLastUpdated(new Date())
    }, 30000)

    return () => clearInterval(interval)
  }, [refreshLeaderboard])

  // Sort leaderboard based on current settings
  const sortedLeaderboard = React.useMemo(() => {
    if (!leaderboard.length) return []

    return [...leaderboard]
      .sort((a, b) => {
        if (sortBy === 'weight') {
          return sortByRank === 'desc' ? b.totalWeight - a.totalWeight : a.totalWeight - b.totalWeight
        } else if (sortBy === 'votes') {
          return sortByRank === 'desc' ? b.totalVotes - a.totalVotes : a.totalVotes - a.totalVotes
        } else if (sortBy === 'average') {
          return sortByRank === 'desc' ? 
            b.averageWeight - a.averageWeight : 
            a.averageWeight - b.averageWeight
        }
        return 0
      })
      .slice(0, limit)
  }, [leaderboard, sortBy, sortByRank, limit])

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-400" />
      case 2:
        return <Medal className="w-5 h-5 text-gray-300" />
      case 3:
        return <Crown className="w-5 h-5 text-orange-600" />
      default:
        return <span className="w-6 h-6 text-xs font-bold text-gray-400">{rank}</span>
    }
  }

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return <Badge className="bg-gradient-to-r from-yellow-600 to-yellow-800">🏆 Winner</Badge>
      case 2:
        return <Badge variant="outline" className="border-gray-400">🥈 Runner Up</Badge>
      case 3:
        return <Badge variant="outline" className="border-orange-600">🥉 Third Place</Badge>
      default:
        return null
    }
  }

  const formatNumber = (num: number): string => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k'
    }
    return num.toString()
  }

  const getTimeSinceUpdate = (): string => {
    const diff = Date.now() - lastUpdated.getTime()
    const seconds = Math.floor(diff / 1000)
    
    if (seconds < 60) return `${seconds}s ago`
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    return `${Math.floor(seconds / 3600)}h ago`
  }

  return (
    <Card className={`w-full max-w-2xl ${className}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Trophy className="w-6 h-6 text-yellow-400" />
              <CardTitle className="text-xl">Live Festival Leaderboard</CardTitle>
            </div>
            <Badge variant="outline" className="text-xs">
              <Users className="w-3 h-3 mr-1" />
              {sortedLeaderboard.length} artists
            </Badge>
          </div>
          
          {showControls && (
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={refreshLeaderboard}
                disabled={isLoadingLeaderboard}
                className="text-xs"
              >
                {isLoadingLeaderboard ? (
                  <RefreshCw className="w-3 h-3 animate-spin" />
                ) : (
                  <RefreshCw className="w-3 h-3" />
                )}
                Refresh
              </Button>
              <div className="text-xs text-gray-400">
                Updated {getTimeSinceUpdate()}
              </div>
            </div>
          )}
        </div>

        {/* Sort Controls */}
        <div className="flex items-center space-x-2 pt-2">
          <span className="text-xs text-gray-400">Sort by:</span>
          <div className="flex space-x-1">
            {(['weight', 'votes', 'average'] as const).map((type) => (
              <Button
                key={type}
                variant={sortBy === type ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSortBy(type)}
                className="text-xs h-7"
              >
                {type === 'weight' && 'Weight'}
                {type === 'votes' && 'Votes'}
                {type === 'average' && 'Avg'}
              </Button>
            ))}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSortByRank(sortByRank === 'desc' ? 'asc' : 'desc')}
            className="text-xs h-7"
          >
            {sortByRank === 'desc' ? '⬇️' : '⬆️'}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-2">
        {isLoadingLeaderboard ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-purple-400" />
              <p className="text-sm text-gray-400">Loading leaderboard...</p>
            </div>
          </div>
        ) : sortedLeaderboard.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <Trophy className="w-6 h-6 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-400">No votes yet. Be the first to vote!</p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {sortedLeaderboard.map((entry, index) => (
                <motion.div
                  key={`${entry.artistId}-${entry.rank}-${sortBy}-${sortByRank}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="relative"
                >
                  {/* Top 3 special styling */}
                  {entry.rank <= 3 && (
                    <div className={`absolute inset-0 rounded-lg bg-gradient-to-r ${
                      entry.rank === 1 ? 'from-yellow-900/20 to-yellow-700/20' :
                      entry.rank === 2 ? 'from-gray-700/20 to-gray-600/20' :
                      'from-orange-900/20 to-orange-700/20'
                    }`} />
                  )}
                  
                  <div className={`relative flex items-center space-x-3 p-3 rounded-lg ${
                    entry.rank <= 3 ? 'bg-gray-800/50' : 'bg-gray-800/30'
                  } hover:bg-gray-700/50 transition-colors`}>
                    {/* Rank */}
                    <div className="flex items-center justify-center w-8 h-8">
                      {getRankIcon(entry.rank)}
                    </div>

                    {/* Artist Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-white truncate">
                          Artist {entry.artistId}
                        </h3>
                        {getRankBadge(entry.rank)}
                      </div>
                      <div className="flex items-center space-x-4 text-xs text-gray-400 mt-1">
                        <span className="flex items-center space-x-1">
                          <TrendingUp className="w-3 h-3" />
                          <span>{formatNumber(entry.totalWeight)} weight</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Users className="w-3 h-3" />
                          <span>{formatNumber(entry.totalVotes)} votes</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Star className="w-3 h-3" />
                          <span>{entry.averageWeight.toFixed(1)} avg</span>
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="flex-1 max-w-xs">
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <motion.div
                          className={`h-2 rounded-full ${
                            entry.rank === 1 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' :
                            entry.rank === 2 ? 'bg-gradient-to-r from-gray-400 to-gray-500' :
                            entry.rank === 3 ? 'bg-gradient-to-r from-orange-500 to-orange-600' :
                            'bg-gradient-to-r from-purple-500 to-pink-500'
                          }`}
                          initial={{ width: 0 }}
                          animate={{ 
                            width: `${Math.min(100, (entry.totalWeight / Math.max(...sortedLeaderboard.map(e => e.totalWeight))) * 100)}%` 
                          }}
                          transition={{ duration: 0.8, delay: index * 0.1 + 0.2 }}
                        />
                      </div>
                    </div>

                    {/* Sparkles animation for top 3 */}
                    {entry.rank <= 3 && (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                        className="absolute -top-1 -right-1"
                      >
                        <Sparkles className="w-4 h-4 text-yellow-400" />
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Headline Announcement */}
        {sortedLeaderboard.length > 0 && sortedLeaderboard[0].totalWeight > 100 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-700/50 rounded-lg"
          >
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-purple-300">
                🎉 Leading artist is trending towards festival headliner status!
              </span>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  )
}

export default LiveLeaderboard