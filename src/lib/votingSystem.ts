import { supabase } from './supabase'
import type { FestivalVote } from './supabase'

// Rate limiting interface
interface RateLimitData {
  userId: string
  lastVoteTime: number
  voteCount: number
}

// In-memory rate limiting (in production, use Redis or similar)
const rateLimitStore = new Map<string, RateLimitData>()

// Constants
const VOTE_WINDOW_MS = 60 * 1000 // 1 minute
const MAX_VOTES_PER_WINDOW = 1 // 1 vote per minute per user
const REALTIME_CHANNEL = 'festival_votes'

export interface VotingStats {
  totalVotes: number
  totalWeight: number
  recentVotes: Array<{
    userId: string
    artistId: string
    voteWeight: number
    timestamp: string
  }>
}

export interface VoteResult {
  success: boolean
  message: string
  voteWeight?: number
  remainingVotes?: number
  nextVoteTime?: number
}

class VotingSystem {
  constructor() {
    // Realtime initialization removed as per GEMINI.md
  }

  private updateRateLimit(userId: string): void {
    const now = Date.now()
    const userData = rateLimitStore.get(userId)

    if (userData) {
      rateLimitStore.set(userId, {
        userId,
        lastVoteTime: now,
        voteCount: userData.voteCount + 1
      })
    }
  }

  /**
   * Check if user can vote based on rate limiting
   */
  private checkRateLimit(userId: string): { canVote: boolean; remainingVotes: number; nextVoteTime: number } {
    const now = Date.now()
    const userData = rateLimitStore.get(userId)

    if (!userData) {
      // First vote from this user
      rateLimitStore.set(userId, {
        userId,
        lastVoteTime: now,
        voteCount: 1
      })
      return { canVote: true, remainingVotes: 0, nextVoteTime: now }
    }

    // Check if window has expired
    if (now - userData.lastVoteTime > VOTE_WINDOW_MS) {
      // Reset window
      rateLimitStore.set(userId, {
        userId,
        lastVoteTime: now,
        voteCount: 1
      })
      return { canVote: true, remainingVotes: 0, nextVoteTime: now }
    }

    // Check if user has exceeded vote limit
    if (userData.voteCount >= MAX_VOTES_PER_WINDOW) {
      const nextVoteTime = userData.lastVoteTime + VOTE_WINDOW_MS
      return {
        canVote: false,
        remainingVotes: 0,
        nextVoteTime
      }
    }

    // User can vote
    return {
      canVote: true,
      remainingVotes: MAX_VOTES_PER_WINDOW - userData.voteCount,
      nextVoteTime: userData.lastVoteTime + VOTE_WINDOW_MS
    }
  }

  /**
   * Submit a vote with rate limiting and validation
   */
  async submitVote(
    userId: string,
    artistId: string,
    weight: number = 1,
    bypassRateLimit: boolean = false
  ): Promise<VoteResult> {
    try {
      // Validate inputs
      if (!userId || !artistId) {
        return {
          success: false,
          message: 'User ID and Artist ID are required'
        }
      }

      if (weight <= 0 || weight > 10) {
        return {
          success: false,
          message: 'Vote weight must be between 1 and 10'
        }
      }

      // Check rate limiting (unless bypassed for admin/privileged users)
      if (!bypassRateLimit) {
        const rateLimit = this.checkRateLimit(userId)
        if (!rateLimit.canVote) {
          const minutesUntilNextVote = Math.ceil((rateLimit.nextVoteTime - Date.now()) / (60 * 1000))
          return {
            success: false,
            message: `Rate limit exceeded. You can vote again in ${minutesUntilNextVote} minute(s)`,
            remainingVotes: 0,
            nextVoteTime: rateLimit.nextVoteTime
          }
        }
      }

      // Check if user has already voted for this artist
      const { data: existingVote } = await supabase
        .from('festival_votes')
        .select('id, vote_weight')
        .eq('user_id', userId)
        .eq('artist_id', artistId)
        .single()

      if (existingVote) {
        // Update existing vote
        const { error } = await supabase
          .from('festival_votes')
          .update({
            vote_weight: weight,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingVote.id)

        if (error) {
          return {
            success: false,
            message: 'Failed to update vote'
          }
        }

        // Update rate limit
        this.updateRateLimit(userId)

        return {
          success: true,
          message: 'Vote updated successfully',
          voteWeight: weight
        }
      } else {
        // Create new vote
        const { error } = await supabase
          .from('festival_votes')
          .insert({
            user_id: userId,
            artist_id: artistId,
            vote_weight: weight,
            created_at: new Date().toISOString()
          })

        if (error) {
          return {
            success: false,
            message: 'Failed to submit vote'
          }
        }

        // Update rate limit
        this.updateRateLimit(userId)

        return {
          success: true,
          message: 'Vote submitted successfully',
          voteWeight: weight
        }
      }
    } catch (error) {
      console.error('Error submitting vote:', error)
      return {
        success: false,
        message: 'An unexpected error occurred'
      }
    }
  }

  /**
   * Remove a user's vote for an artist
   */
  async removeVote(userId: string, artistId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('festival_votes')
        .delete()
        .eq('user_id', userId)
        .eq('artist_id', artistId)

      if (error) {
        console.error('Error removing vote:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error removing vote:', error)
      return false
    }
  }

  /**
   * Get user's voting history
   */
  async getUserVotes(userId: string): Promise<FestivalVote[]> {
    try {
      const { data, error } = await supabase
        .from('festival_votes')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching user votes:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error fetching user votes:', error)
      return []
    }
  }

  /**
   * Get voting statistics for an artist
   */
  async getVotingStats(artistId: string): Promise<VotingStats> {
    try {
      const { data, error } = await supabase
        .from('festival_votes')
        .select('vote_weight, created_at, user_id, artist_id')
        .eq('artist_id', artistId)

      if (error) {
        console.error('Error fetching voting stats:', error)
        return {
          totalVotes: 0,
          totalWeight: 0,
          recentVotes: []
        }
      }

      const totalVotes = data?.length || 0
      const totalWeight = data?.reduce((sum, vote) => sum + vote.vote_weight, 0) || 0

      // Get recent votes (last 24 hours)
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      const recentVotes = data
        ?.filter(vote => new Date(vote.created_at) > new Date(twentyFourHoursAgo))
        .map(vote => ({
          userId: vote.user_id,
          artistId: vote.artist_id,
          voteWeight: vote.vote_weight,
          timestamp: vote.created_at
        })) || []

      return {
        totalVotes,
        totalWeight,
        recentVotes
      }
    } catch (error) {
      console.error('Error fetching voting stats:', error)
      return {
        totalVotes: 0,
        totalWeight: 0,
        recentVotes: []
      }
    }
  }

  /**
   * Get leaderboard of top artists
   */
  async getLeaderboard(limit: number = 10): Promise<Array<{
    artistId: string
    totalVotes: number
    totalWeight: number
    averageWeight: number
    rank: number
  }>> {
    try {
      // Get all votes aggregated by artist
      const { data, error } = await supabase
        .from('festival_votes')
        .select('artist_id, vote_weight')

      if (error) {
        console.error('Error fetching leaderboard data:', error)
        return []
      }

      // Aggregate votes by artist
      const artistStats = new Map<string, { totalVotes: number; totalWeight: number }>()
      
      data?.forEach(vote => {
        const current = artistStats.get(vote.artist_id) || { totalVotes: 0, totalWeight: 0 }
        artistStats.set(vote.artist_id, {
          totalVotes: current.totalVotes + 1,
          totalWeight: current.totalWeight + vote.vote_weight
        })
      })

      // Convert to array and sort by total weight
      const leaderboard = Array.from(artistStats.entries())
        .map(([artistId, stats]) => ({
          artistId,
          totalVotes: stats.totalVotes,
          totalWeight: stats.totalWeight,
          averageWeight: stats.totalWeight / stats.totalVotes
        }))
        .sort((a, b) => b.totalWeight - a.totalWeight)
        .slice(0, limit)
        .map((entry, index) => ({
          ...entry,
          rank: index + 1
        }))

      return leaderboard
    } catch (error) {
      console.error('Error fetching leaderboard:', error)
      return []
    }
  }

  /**
   * Check if user has voted for a specific artist
   */
  async hasUserVoted(userId: string, artistId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('festival_votes')
        .select('id')
        .eq('user_id', userId)
        .eq('artist_id', artistId)
        .single()

      return !!data
    } catch (error) {
      return false
    }
  }

  /**
   * Get user's remaining votes and next available vote time
   */
  getUserRateLimitInfo(userId: string): {
    canVote: boolean
    remainingVotes: number
    nextVoteTime: number
    minutesUntilNextVote: number
  } {
    const rateLimit = this.checkRateLimit(userId)
    const minutesUntilNextVote = Math.max(0, Math.ceil((rateLimit.nextVoteTime - Date.now()) / (60 * 1000)))

    return {
      canVote: rateLimit.canVote,
      remainingVotes: rateLimit.remainingVotes,
      nextVoteTime: rateLimit.nextVoteTime,
      minutesUntilNextVote
    }
  }

  /**
   * Update rate limit after successful vote
   */
  private updateRateLimit(userId: string): void {
    const now = Date.now()
    const userData = rateLimitStore.get(userId)

    if (userData) {
      rateLimitStore.set(userId, {
        userId,
        lastVoteTime: now,
        voteCount: userData.voteCount + 1
      })
    }
  }

  /**
   * Clean up expired rate limit entries
   */
  cleanup(): void {
    const now = Date.now()
    for (const [userId, data] of rateLimitStore.entries()) {
      if (now - data.lastVoteTime > VOTE_WINDOW_MS) {
        rateLimitStore.delete(userId)
      }
    }
  }

  /**
   * Reset rate limits (admin function)
   */
  resetRateLimits(): void {
    rateLimitStore.clear()
  }
}

// Export singleton instance
export const votingSystem = new VotingSystem()

// Export types for use in other components
export type { VotingStats, VoteResult }