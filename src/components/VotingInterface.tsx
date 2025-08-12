import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ThumbsUp, ThumbsDown, Clock, Award, TrendingUp, 
  Users, Zap, AlertCircle, CheckCircle, Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { useVoting } from '@/contexts/VotingContext'
import { toast } from 'sonner'

interface Artist {
  id: string
  name: string
  genre: string
  avatar?: string
  description?: string
}

interface VotingInterfaceProps {
  artist: Artist
  className?: string
}

const VotingInterface: React.FC<VotingInterfaceProps> = ({ 
  artist, 
  className = '' 
}) => {
  const {
    hasVoted,
    canVote,
    remainingVotes,
    minutesUntilNextVote,
    votingStats,
    isSubmittingVote,
    submitVote,
    removeVote,
    refreshVotingStats
  } = useVoting()

  const [selectedWeight, setSelectedWeight] = useState(1)
  const [showSuccess, setShowSuccess] = useState(false)
  const [showError, setShowError] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    refreshVotingStats(artist.id)
  }, [artist.id, refreshVotingStats])

  const handleVote = async () => {
    if (!canVote) {
      toast.error(`You can vote again in ${minutesUntilNextVote} minute(s)`)
      return
    }

    try {
      const result = await submitVote(artist.id, selectedWeight)
      
      if (result.success) {
        setShowSuccess(true)
        toast.success(result.message || 'Vote submitted successfully!')
        
        // Hide success message after 3 seconds
        setTimeout(() => setShowSuccess(false), 3000)
      } else {
        setError(result.message)
        setShowError(true)
        toast.error(result.message)
        
        // Hide error message after 5 seconds
        setTimeout(() => setShowError(false), 5000)
      }
    } catch (error) {
      console.error('Error submitting vote:', error)
      setError('An unexpected error occurred')
      setShowError(true)
      toast.error('Failed to submit vote')
    }
  }

  const handleRemoveVote = async () => {
    try {
      const success = await removeVote(artist.id)
      
      if (success) {
        toast.success('Vote removed successfully')
      } else {
        toast.error('Failed to remove vote')
      }
    } catch (error) {
      console.error('Error removing vote:', error)
      toast.error('Failed to remove vote')
    }
  }

  const formatTime = (minutes: number): string => {
    if (minutes < 1) return 'less than a minute'
    if (minutes === 1) return '1 minute'
    return `${minutes} minutes`
  }

  return (
    <Card className={`w-full max-w-md ${className}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {artist.avatar ? (
              <img
                src={artist.avatar}
                alt={artist.name}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                {artist.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <CardTitle className="text-lg">{artist.name}</CardTitle>
              <p className="text-sm text-gray-400">{artist.genre}</p>
            </div>
          </div>
          
          <Badge variant="outline" className="text-xs">
            {votingStats?.totalVotes || 0} votes
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Voting Stats */}
        <AnimatePresence>
          {votingStats && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-3 gap-2 text-center"
            >
              <div className="bg-gray-800 rounded-lg p-2">
                <div className="text-xs text-gray-400">Total Votes</div>
                <div className="text-lg font-bold text-purple-400">
                  {votingStats.totalVotes}
                </div>
              </div>
              <div className="bg-gray-800 rounded-lg p-2">
                <div className="text-xs text-gray-400">Total Weight</div>
                <div className="text-lg font-bold text-pink-400">
                  {votingStats.totalWeight}
                </div>
              </div>
              <div className="bg-gray-800 rounded-lg p-2">
                <div className="text-xs text-gray-400">Recent</div>
                <div className="text-lg font-bold text-blue-400">
                  {votingStats.recentVotes.length}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Vote Weight Selector */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">
            Vote Weight: {selectedWeight}
          </label>
          <Slider
            value={[selectedWeight]}
            onValueChange={(value) => setSelectedWeight(value[0])}
            max={10}
            min={1}
            step={1}
            className="w-full"
            disabled={!canVote || hasVoted}
          />
          <div className="flex justify-between text-xs text-gray-400">
            <span>Light</span>
            <span>Strong</span>
          </div>
        </div>

        {/* Vote Button */}
        <div className="space-y-2">
          <Button
            onClick={handleVote}
            disabled={!canVote || hasVoted || isSubmittingVote}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            {isSubmittingVote ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : hasVoted ? (
              <CheckCircle className="w-4 h-4 mr-2" />
            ) : (
              <ThumbsUp className="w-4 h-4 mr-2" />
            )}
            {isSubmittingVote ? 'Submitting...' : 
             hasVoted ? 'Voted' : 'Vote for Artist'}
          </Button>

          {/* Remove Vote Button */}
          {hasVoted && (
            <Button
              variant="outline"
              onClick={handleRemoveVote}
              disabled={isSubmittingVote}
              className="w-full border-red-600 text-red-400 hover:bg-red-900/20"
            >
              <ThumbsDown className="w-4 h-4 mr-2" />
              Remove Vote
            </Button>
          )}
        </div>

        {/* Rate Limit Info */}
        {!canVote && !hasVoted && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center space-x-2 p-3 bg-yellow-900/30 border border-yellow-700 rounded-lg"
          >
            <Clock className="w-4 h-4 text-yellow-400" />
            <span className="text-sm text-yellow-300">
              Rate limit: You can vote again in {formatTime(minutesUntilNextVote)}
            </span>
          </motion.div>
        )}

        {/* Success Message */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex items-center space-x-2 p-3 bg-green-900/30 border border-green-700 rounded-lg"
            >
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-sm text-green-300">
                Vote submitted successfully with weight {selectedWeight}!
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Message */}
        <AnimatePresence>
          {showError && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex items-center space-x-2 p-3 bg-red-900/30 border border-red-700 rounded-lg"
            >
              <AlertCircle className="w-4 h-4 text-red-400" />
              <span className="text-sm text-red-300">
                {error}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Voting Info */}
        <div className="text-xs text-gray-400 space-y-1">
          <div className="flex items-center space-x-2">
            <Award className="w-3 h-3" />
            <span>Your vote helps determine the festival headliner!</span>
          </div>
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-3 h-3" />
            <span>Higher weight votes have more impact</span>
          </div>
          <div className="flex items-center space-x-2">
            <Users className="w-3 h-3" />
            <span>Rate limit: 1 vote per minute per user</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default VotingInterface