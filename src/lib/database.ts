import { supabase } from './supabase'
import type { Profile, FestivalVote, Challenge, DjSettings, MarketplacePurchase } from './supabase'

// Profile operations
export const profileOperations = {
  async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (error) {
      console.error('Error fetching profile:', error)
      return null
    }
    
    return data
  },

  async updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating profile:', error)
      return null
    }
    
    return data
  },

  async updateArchetype(userId: string, archetype: string): Promise<boolean> {
    const { error } = await supabase
      .from('profiles')
      .update({ archetype })
      .eq('id', userId)
    
    if (error) {
      console.error('Error updating archetype:', error)
      return false
    }
    
    return true
  },

  async updatePLURPoints(userId: string, points: number): Promise<boolean> {
    const { error } = await supabase
      .from('profiles')
      .update({ plur_points: points })
      .eq('id', userId)
    
    if (error) {
      console.error('Error updating PLUR points:', error)
      return false
    }
    
    return true
  },

  async incrementStreak(userId: string): Promise<boolean> {
    const { error } = await supabase.rpc('increment_streak', {
      user_id: userId
    })
    
    if (error) {
      console.error('Error incrementing streak:', error)
      return false
    }
    
    return true
  }
}

// Festival voting operations
export const festivalOperations = {
  async getUserVotes(userId: string): Promise<FestivalVote[]> {
    const { data, error } = await supabase
      .from('festival_votes')
      .select('*')
      .eq('user_id', userId)
    
    if (error) {
      console.error('Error fetching user votes:', error)
      return []
    }
    
    return data || []
  },

  async submitVote(userId: string, artistId: string, weight: number = 1): Promise<boolean> {
    const { error } = await supabase
      .from('festival_votes')
      .upsert({
        user_id: userId,
        artist_id: artistId,
        vote_weight: weight
      })
    
    if (error) {
      console.error('Error submitting vote:', error)
      return false
    }
    
    return true
  },

  async removeVote(userId: string, artistId: string): Promise<boolean> {
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
  },

  async getVotingStats(artistId: string): Promise<{ totalVotes: number, totalWeight: number }> {
    const { data, error } = await supabase
      .from('festival_votes')
      .select('vote_weight')
      .eq('artist_id', artistId)
    
    if (error) {
      console.error('Error fetching voting stats:', error)
      return { totalVotes: 0, totalWeight: 0 }
    }
    
    const totalVotes = data?.length || 0
    const totalWeight = data?.reduce((sum, vote) => sum + vote.vote_weight, 0) || 0
    
    return { totalVotes, totalWeight }
  }
}

// Challenge operations
export const challengeOperations = {
  async getUserChallenges(userId: string): Promise<Challenge[]> {
    const { data, error } = await supabase
      .from('challenges')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching challenges:', error)
      return []
    }
    
    return data || []
  },

  async createChallenge(userId: string, challengeType: string): Promise<Challenge | null> {
    const { data, error } = await supabase
      .from('challenges')
      .insert({
        user_id: userId,
        challenge_type: challengeType,
        status: 'pending'
      })
      .select()
      .single()
    
    if (error) {
      console.error('Error creating challenge:', error)
      return null
    }
    
    return data
  },

  async completeChallenge(challengeId: string, pointsEarned: number): Promise<boolean> {
    const { error } = await supabase
      .from('challenges')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        points_earned: pointsEarned
      })
      .eq('id', challengeId)
    
    if (error) {
      console.error('Error completing challenge:', error)
      return false
    }
    
    return true
  }
}

// DJ settings operations
export const djOperations = {
  async getDJSettings(userId: string): Promise<DjSettings | null> {
    const { data, error } = await supabase
      .from('dj_settings')
      .select('*')
      .eq('user_id', userId)
      .single()
    
    if (error) {
      console.error('Error fetching DJ settings:', error)
      return null
    }
    
    return data
  },

  async saveDJSettings(userId: string, settings: any): Promise<boolean> {
    const { error } = await supabase
      .from('dj_settings')
      .upsert({
        user_id: userId,
        settings: settings
      })
    
    if (error) {
      console.error('Error saving DJ settings:', error)
      return false
    }
    
    return true
  }
}

// Marketplace operations
export const marketplaceOperations = {
  async getUserPurchases(userId: string): Promise<MarketplacePurchase[]> {
    const { data, error } = await supabase
      .from('marketplace_purchases')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching purchases:', error)
      return []
    }
    
    return data || []
  },

  async recordPurchase(
    userId: string,
    itemId: string,
    itemType: string,
    amountPaid: number,
    downloadUrl?: string
  ): Promise<MarketplacePurchase | null> {
    const { data, error } = await supabase
      .from('marketplace_purchases')
      .insert({
        user_id: userId,
        item_id: itemId,
        item_type: itemType,
        amount_paid: amountPaid,
        download_url: downloadUrl
      })
      .select()
      .single()
    
    if (error) {
      console.error('Error recording purchase:', error)
      return null
    }
    
    return data
  }
}

// Activity tracking
export const activityOperations = {
  async logActivity(userId: string, activityType: string, activityData: any): Promise<boolean> {
    const { error } = await supabase
      .from('user_activities')
      .insert({
        user_id: userId,
        activity_type: activityType,
        activity_data: activityData
      })
    
    if (error) {
      console.error('Error logging activity:', error)
      return false
    }
    
    return true
  },

  async getUserActivities(userId: string, limit: number = 50): Promise<any[]> {
    const { data, error } = await supabase
      .from('user_activities')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)
    
    if (error) {
      console.error('Error fetching activities:', error)
      return []
    }
    
    return data || []
  }
}

// PLUR crew operations
export const plurCrewOperations = {
  async getUserCrew(userId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('plur_crew')
      .select(`
        *,
        crew_member:profiles(id, username, avatar_url, archetype)
      `)
      .eq('user_id', userId)
    
    if (error) {
      console.error('Error fetching crew:', error)
      return []
    }
    
    return data || []
  },

  async addCrewMember(userId: string, crewMemberId: string): Promise<boolean> {
    const { error } = await supabase
      .from('plur_crew')
      .insert({
        user_id: userId,
        crew_member_id: crewMemberId
      })
    
    if (error) {
      console.error('Error adding crew member:', error)
      return false
    }
    
    return true
  },

  async removeCrewMember(userId: string, crewMemberId: string): Promise<boolean> {
    const { error } = await supabase
      .from('plur_crew')
      .delete()
      .eq('user_id', userId)
      .eq('crew_member_id', crewMemberId)
    
    if (error) {
      console.error('Error removing crew member:', error)
      return false
    }
    
    return true
  }
}