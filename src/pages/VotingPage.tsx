import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Vote, TrendingUp, Users, Clock, Zap, Crown, 
  Music, Star, Sparkles, RefreshCw
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import VotingInterface from '@/components/VotingInterface'
import LiveLeaderboard from '@/components/LiveLeaderboard'
import HeadlinerAnnouncement from '@/components/HeadlinerAnnouncement'
import { useVoting } from '@/contexts/VotingContext'
import { toast } from 'sonner'

interface Artist {
  id: string
  name: string
  genre: string
  avatar?: string
  description?: string
}

const VotingPage: React.FC = () => {
  const {
    hasVoted,
    canVote,
    remainingVotes,
    minutesUntilNextVote,
    leaderboard,
    isLoadingLeaderboard,
    refreshLeaderboard
  } = useVoting()

  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Mock artists data (in real app, this would come from database)
  const artists: Artist[] = [
    {
      id: 'artist1',
      name: 'Neon Dreams',
      genre: 'Progressive House',
      description: 'Melodic progressive house with euphoric drops'
    },
    {
      id: 'artist2',
      name: 'Cyber Pulse',
      genre: 'Techno',
      description: 'Dark, driving techno for peak hours'
    },
    {
      id: 'artist3',
      name: 'Luna Wave',
      genre: 'Trance',
      description: 'Uplifting trance with beautiful melodies'
    },
    {
      id: 'artist4',
      name: 'Bass Kingdom',
      genre: 'Dubstep',
      description: 'Heavy dubstep with massive wobbles'
    },
    {
      id: 'artist5',
      name: 'Sunset Vibes',
      genre: 'Deep House',
      description: 'Groovy deep house for sunset sets'
    }
  ]

  useEffect(() => {
    // Select first artist by default
    if (!selectedArtist && artists.length > 0) {
      setSelectedArtist(artists[0])
    }
  }, [artists, selectedArtist])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await refreshLeaderboard()
      toast.success('Leaderboard refreshed!')
    } catch (error) {
      toast.error('Failed to refresh leaderboard')
    } finally {
      setIsRefreshing(false)
    }
  }

  const formatTime = (minutes: number): string => {
    if (minutes < 1) return 'less than a minute'
    if (minutes === 1) return '1 minute'
    return `${minutes} minutes`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white">
      {/* Headliner Announcement */}
      <HeadlinerAnnouncement 
        threshold={500}
        celebrationDuration={8000}
      />

      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20" />
        <div className="relative container mx-auto px-4 py-8">
          <div className="text-center space-y-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 rounded-full">
                <Crown className="w-5 h-5" />
                <span className="font-semibold">Festival Voting</span>
              </div>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent"
            >
              Choose Your Headliner
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl text-gray-300 max-w-2xl mx-auto"
            >
              Vote for your favorite artists to help determine who becomes the festival headliner! 
              Your votes matter and will be reflected in real-time on the leaderboard.
            </motion.p>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Voting Interface */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-6"
          >
            {/* Voting Stats */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Vote className="w-5 h-5 text-purple-400" />
                  <span>Your Voting Status</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-gray-700/30 rounded-lg">
                    <div className={`text-2xl font-bold ${hasVoted ? 'text-green-400' : 'text-gray-400'}`}>
                      {hasVoted ? '✓' : '○'}
                    </div>
                    <div className="text-sm text-gray-400 mt-1">Voted Today</div>
                  </div>
                  <div className="text-center p-4 bg-gray-700/30 rounded-lg">
                    <div className={`text-2xl font-bold ${canVote ? 'text-purple-400' : 'text-orange-400'}`}>
                      {canVote ? remainingVotes : '0'}
                    </div>
                    <div className="text-sm text-gray-400 mt-1">Remaining Votes</div>
                  </div>
                </div>
                
                {!canVote && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-3 bg-orange-900/30 border border-orange-700 rounded-lg flex items-center space-x-2"
                  >
                    <Clock className="w-4 h-4 text-orange-400" />
                    <span className="text-sm text-orange-300">
                      You can vote again in {formatTime(minutesUntilNextVote)}
                    </span>
                  </motion.div>
                )}
              </CardContent>
            </Card>

            {/* Artist Selection */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Music className="w-5 h-5 text-purple-400" />
                  <span>Select Artist</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {artists.map((artist) => (
                    <motion.button
                      key={artist.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedArtist(artist)}
                      className={`p-3 rounded-lg border transition-all ${
                        selectedArtist?.id === artist.id
                          ? 'border-purple-500 bg-purple-900/20'
                          : 'border-gray-600 hover:border-gray-500'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                          {artist.name.charAt(0)}
                        </div>
                        <div className="text-left">
                          <div className="font-medium">{artist.name}</div>
                          <div className="text-xs text-gray-400">{artist.genre}</div>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Voting Interface */}
            {selectedArtist && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <VotingInterface artist={selectedArtist} />
              </motion.div>
            )}
          </motion.div>

          {/* Right Column - Leaderboard */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
            className="space-y-6"
          >
            {/* Voting Info */}
            <Card className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border-purple-700/50">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Zap className="w-6 h-6 text-purple-400" />
                  <h3 className="text-lg font-semibold">How Voting Works</h3>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0" />
                    <span>Each user gets 1 vote per minute with a maximum weight of 10</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0" />
                    <span>Higher weight votes have more impact on the leaderboard</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0" />
                    <span>The artist with the highest total weight becomes the headliner</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0" />
                    <span>Leaderboard updates in real-time as votes are cast</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Live Leaderboard */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-purple-400" />
                  <span>Live Leaderboard</span>
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="border-purple-600 text-purple-400 hover:bg-purple-900/20"
                >
                  {isRefreshing ? (
                    <RefreshCw className="w-3 h-3 animate-spin" />
                  ) : (
                    <RefreshCw className="w-3 h-3" />
                  )}
                  Refresh
                </Button>
              </div>
              
              <LiveLeaderboard 
                limit={10}
                showControls={false}
              />
            </div>

            {/* Voting Tips */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Star className="w-5 h-5 text-purple-400" />
                  <span>Voting Tips</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm">Vote strategically - save your high-weight votes for your top choices</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-blue-400" />
                    <span className="text-sm">Encourage friends to vote for artists you want to see</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-green-400" />
                    <span className="text-sm">Vote regularly to maximize your impact</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="mt-16 py-8 border-t border-gray-800"
      >
        <div className="container mx-auto px-4 text-center text-gray-400">
          <p>Every vote shapes the festival experience. Vote responsibly and make your voice heard!</p>
          <p className="mt-2 text-sm">The artist with the highest total weight at the end of voting becomes the festival headliner</p>
        </div>
      </motion.footer>
    </div>
  )
}

export default VotingPage
