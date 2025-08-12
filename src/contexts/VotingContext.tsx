import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { votingSystem, type VotingStats, type VoteResult } from '@/lib/votingSystem'
import { useAuth } from './AuthContext'

interface VotingContextType {
  // User voting state
  hasVoted: boolean
  canVote: boolean
  remainingVotes: number
  nextVoteTime: number
  minutesUntilNextVote: number
  
  // Artist voting state
  votingStats: VotingStats | null
  isSubmittingVote: boolean
  
  // Actions
  submitVote: (artistId: string, weight: number) => Promise<VoteResult>
  removeVote: (artistId: string) => Promise<boolean>
  refreshVotingState: () => Promise<void>
  refreshVotingStats: (artistId: string) => Promise<void>
  
  // Leaderboard
  leaderboard: Array<{
    artistId: string
    totalVotes: number
    totalWeight: number
    averageWeight: number
    rank: number
  }>
  isLoadingLeaderboard: boolean
  refreshLeaderboard: () => Promise<void>
}

const VotingContext = createContext<VotingContextType | undefined>(undefined)

export const useVoting = () => {
  const context = useContext(VotingContext)
  if (context === undefined) {
    throw new Error('useVoting must be used within a VotingProvider')
  }
  return context
}

interface VotingProviderProps {
  children: React.ReactNode
}

export const VotingProvider: React.FC<VotingProviderProps> = ({ children }) => {
  const { user } = useAuth()
  const [hasVoted, setHasVoted] = useState(false)
  const [canVote, setCanVote] = useState(false)
  const [remainingVotes, setRemainingVotes] = useState(0)
  const [nextVoteTime, setNextVoteTime] = useState(0)
  const [minutesUntilNextVote, setMinutesUntilNextVote] = useState(0)
  
  const [votingStats, setVotingStats] = useState<VotingStats | null>(null)
  const [isSubmittingVote, setIsSubmittingVote] = useState(false)
  
  const [leaderboard, setLeaderboard] = useState<any[]>([])
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(false)

  // Refresh user's voting rate limit info
  const refreshVotingState = useCallback(async () => {
    if (!user) {
      setHasVoted(false)
      setCanVote(false)
      setRemainingVotes(0)
      setNextVoteTime(0)
      setMinutesUntilNextVote(0)
      return
    }

    try {
      const rateLimitInfo = votingSystem.getUserRateLimitInfo(user.id)
      setCanVote(rateLimitInfo.canVote)
      setRemainingVotes(rateLimitInfo.remainingVotes)
      setNextVoteTime(rateLimitInfo.nextVoteTime)
      setMinutesUntilNextVote(rateLimitInfo.minutesUntilNextVote)

      // Check if user has voted for any artists
      const userVotes = await votingSystem.getUserVotes(user.id)
      setHasVoted(userVotes.length > 0)
    } catch (error) {
      console.error('Error refreshing voting state:', error)
    }
  }, [user])

  // Refresh voting stats for a specific artist
  const refreshVotingStats = useCallback(async (artistId: string) => {
    try {
      const stats = await votingSystem.getVotingStats(artistId)
      setVotingStats(stats)
    } catch (error) {
      console.error('Error refreshing voting stats:', error)
    }
  }, [])

  // Refresh leaderboard
  const refreshLeaderboard = useCallback(async () => {
    if (!user) return

    setIsLoadingLeaderboard(true)
    try {
      const leaderboardData = await votingSystem.getLeaderboard(10)
      setLeaderboard(leaderboardData)
    } catch (error) {
      console.error('Error refreshing leaderboard:', error)
    } finally {
      setIsLoadingLeaderboard(false)
    }
  }, [user])

  // Submit a vote
  const submitVote = useCallback(async (artistId: string, weight: number = 1): Promise<VoteResult> => {
    if (!user) {
      return {
        success: false,
        message: 'You must be logged in to vote'
      }
    }

    setIsSubmittingVote(true)
    try {
      const result = await votingSystem.submitVote(user.id, artistId, weight)
      
      if (result.success) {
        // Update local state
        await refreshVotingState()
        await refreshVotingStats(artistId)
        await refreshLeaderboard()
      }

      return result
    } catch (error) {
      console.error('Error submitting vote:', error)
      return {
        success: false,
        message: 'An unexpected error occurred'
      }
    } finally {
      setIsSubmittingVote(false)
    }
  }, [user, refreshVotingState, refreshVotingStats, refreshLeaderboard])

  // Remove a vote
  const removeVote = useCallback(async (artistId: string): Promise<boolean> => {
    if (!user) return false

    try {
      const success = await votingSystem.removeVote(user.id, artistId)
      
      if (success) {
        // Update local state
        await refreshVotingState()
        await refreshVotingStats(artistId)
        await refreshLeaderboard()
      }

      return success
    } catch (error) {
      console.error('Error removing vote:', error)
      return false
    }
  }, [user, refreshVotingState, refreshVotingStats, refreshLeaderboard])

  // Initialize and set up real-time updates
  useEffect(() => {
    if (!user) return

    // Initial refresh
    refreshVotingState()
    refreshLeaderboard()

    // Set up real-time vote updates
    const handleVoteUpdate = (event: CustomEvent) => {
      const payload = event.detail
      console.log('Real-time vote update received:', payload)
      
      // Refresh relevant data based on the update
      if (payload.new?.artist_id) {
        refreshVotingStats(payload.new.artist_id)
      }
      refreshLeaderboard()
    }

    window.addEventListener('festival-vote-update', handleVoteUpdate as EventListener)

    // Clean up
    return () => {
      window.removeEventListener('festival-vote-update', handleVoteUpdate as EventListener)
    }
  }, [user, refreshVotingState, refreshVotingStats, refreshLeaderboard])

  // Periodic cleanup of rate limit store
  useEffect(() => {
    const interval = setInterval(() => {
      votingSystem.cleanup()
    }, 5 * 60 * 1000) // Every 5 minutes

    return () => clearInterval(interval)
  }, [])

  const value: VotingContextType = {
    // User voting state
    hasVoted,
    canVote,
    remainingVotes,
    nextVoteTime,
    minutesUntilNextVote,
    
    // Artist voting state
    votingStats,
    isSubmittingVote,
    
    // Actions
    submitVote,
    removeVote,
    refreshVotingState,
    refreshVotingStats,
    
    // Leaderboard
    leaderboard,
    isLoadingLeaderboard,
    refreshLeaderboard
  }

  return (
    <VotingContext.Provider value={value}>
      {children}
    </VotingContext.Provider>
  )
}

export default VotingProvider