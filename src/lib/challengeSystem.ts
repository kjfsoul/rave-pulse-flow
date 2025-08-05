import { supabase } from './supabase'

export interface Quest {
  id: string
  title: string
  description: string
  category: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  xpReward: number
  streakBonus: number
  requirements: Record<string, any>
  existsMetrics: {
    event: string
    properties: Record<string, any>
  }
  completed?: boolean
  progress?: number
  maxProgress?: number
}

export interface QuestProgress {
  questId: string
  userId: string
  progress: number
  completed: boolean
  completedAt?: string
  streak: number
}

export interface UserChallengeStats {
  userId: string
  totalXP: number
  currentStreak: number
  longestStreak: number
  questsCompleted: number
  level: number
  festivalStage: number
  lastActiveDate: string
  weeklyXP: number
  monthlyXP: number
}

export interface FestivalStage {
  id: number
  name: string
  description: string
  xpRequired: number
  rewards: string[]
  unlocked: boolean
}

export class ChallengeSystem {
  private quests: Quest[] = []
  private questCategories: Record<string, any> = {}
  
  async initialize() {
    try {
      const response = await fetch('/challenges/daily-quests.json')
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      this.quests = data.dailyQuests
      this.questCategories = data.questCategories
      
      console.log('✅ Challenge system initialized with', this.quests.length, 'quests')
      return true
    } catch (error) {
      console.error('Failed to load quest data:', error)
      
      // Fallback to hardcoded quests to prevent blocking
      this.loadFallbackQuests()
      console.log('🔄 Using fallback quest data')
      return true
    }
  }
  
  private loadFallbackQuests() {
    this.quests = [
      {
        id: "bpm_drop_128",
        title: "BPM Master",
        description: "Drop a perfect 128 BPM track",
        category: "mixing",
        difficulty: "beginner" as const,
        xpReward: 100,
        streakBonus: 25,
        requirements: {
          bpm: 128,
          action: "drop",
          duration: 30
        },
        existsMetrics: {
          event: "bpm_mastery",
          properties: {"target_bpm": 128}
        }
      },
      {
        id: "crossfade_master",
        title: "Transition Ninja",
        description: "Execute 5 smooth crossfader transitions",
        category: "mixing",
        difficulty: "beginner" as const,
        xpReward: 150,
        streakBonus: 30,
        requirements: {
          crossfades: 5,
          smoothness: 80,
          action: "transition"
        },
        existsMetrics: {
          event: "crossfade_mastery",
          properties: {"transitions": 5, "skill_level": "beginner"}
        }
      },
      {
        id: "eq_sculpting",
        title: "EQ Sculptor",
        description: "Use 8+ EQ bands to shape your mix",
        category: "production",
        difficulty: "intermediate" as const,
        xpReward: 200,
        streakBonus: 40,
        requirements: {
          eqBands: 8,
          action: "sculpt",
          changes: 10
        },
        existsMetrics: {
          event: "eq_mastery",
          properties: {"bands_used": 8, "complexity": "intermediate"}
        }
      }
    ]
    
    this.questCategories = {
      "mixing": {
        "name": "Mixing Mastery",
        "icon": "🎛️",
        "color": "from-purple-500 to-pink-500"
      },
      "production": {
        "name": "Production Pro",
        "icon": "🎵",
        "color": "from-cyan-500 to-blue-500"
      },
      "performance": {
        "name": "Performance Power",
        "icon": "🎪",
        "color": "from-green-500 to-emerald-500"
      },
      "creativity": {
        "name": "Creative Flow",
        "icon": "✨",
        "color": "from-yellow-500 to-orange-500"
      }
    }
  }

  // XP and Level System
  calculateLevel(totalXP: number): number {
    // Exponential level curve: Level = sqrt(XP/100)
    return Math.floor(Math.sqrt(totalXP / 100)) + 1
  }

  getXPForNextLevel(currentLevel: number): number {
    return Math.pow(currentLevel, 2) * 100
  }

  calculateStreakBonus(streak: number): number {
    // Streak multiplier: 1x + (streak * 0.1) up to 3x max
    return Math.min(1 + (streak * 0.1), 3.0)
  }

  calculateWeeklyBonus(weeklyXP: number): number {
    // Weekly activity bonus for staying engaged
    if (weeklyXP >= 1000) return 1.5
    if (weeklyXP >= 500) return 1.25
    if (weeklyXP >= 250) return 1.1
    return 1.0
  }

  // Festival Map Progression
  getFestivalStages(): FestivalStage[] {
    return [
      {
        id: 1,
        name: "Underground Club",
        description: "Start your journey in intimate venues",
        xpRequired: 0,
        rewards: ["Basic DJ Tools", "Starter Sound Pack"],
        unlocked: true
      },
      {
        id: 2,
        name: "Local Festival",
        description: "Graduate to outdoor stages",
        xpRequired: 500,
        rewards: ["Advanced EQ Presets", "Regional Sound Pack"],
        unlocked: false
      },
      {
        id: 3,
        name: "City Arena",
        description: "Command massive indoor crowds",
        xpRequired: 1500,
        rewards: ["Professional FX Pack", "City Exclusive Stems"],
        unlocked: false
      },
      {
        id: 4,
        name: "National Festival",
        description: "Headline major festival stages",
        xpRequired: 3500,
        rewards: ["Signature Sound Pack", "Festival VIP Access"],
        unlocked: false
      },
      {
        id: 5,
        name: "International Superstar",
        description: "Global recognition and prestige",
        xpRequired: 7500,
        rewards: ["Legend Status", "Exclusive Artist Collabs"],
        unlocked: false
      },
      {
        id: 6,
        name: "EDM Hall of Fame",
        description: "Immortal status in EDM history",
        xpRequired: 15000,
        rewards: ["Hall of Fame Induction", "Lifetime Achievement Badge"],
        unlocked: false
      }
    ]
  }

  getCurrentFestivalStage(totalXP: number): FestivalStage {
    const stages = this.getFestivalStages()
    let currentStage = stages[0]
    
    for (const stage of stages) {
      if (totalXP >= stage.xpRequired) {
        currentStage = stage
        stage.unlocked = true
      }
    }
    
    return currentStage
  }

  // Quest Management
  getDailyQuests(difficulty?: string, category?: string): Quest[] {
    let filtered = [...this.quests]
    
    if (difficulty) {
      filtered = filtered.filter(q => q.difficulty === difficulty)
    }
    
    if (category) {
      filtered = filtered.filter(q => q.category === category)
    }
    
    // Rotate quests daily based on date
    const today = new Date().toDateString()
    const seed = this.hashCode(today)
    const shuffled = this.shuffleArray(filtered, seed)
    
    // Return 3-5 quests per day
    return shuffled.slice(0, Math.min(5, shuffled.length))
  }

  // Supabase Integration
  async getUserChallengeStats(userId: string): Promise<UserChallengeStats | null> {
    try {
      const { data, error } = await supabase
        .from('user_challenge_stats')
        .select('*')
        .eq('userId', userId)
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      if (!data) {
        // Create initial stats for new user
        const initialStats: UserChallengeStats = {
          userId,
          totalXP: 0,
          currentStreak: 0,
          longestStreak: 0,
          questsCompleted: 0,
          level: 1,
          festivalStage: 1,
          lastActiveDate: new Date().toISOString(),
          weeklyXP: 0,
          monthlyXP: 0
        }

        await this.saveUserChallengeStats(initialStats)
        return initialStats
      }

      return data as UserChallengeStats
    } catch (error) {
      console.error('Failed to get user challenge stats:', error)
      return null
    }
  }

  async saveUserChallengeStats(stats: UserChallengeStats): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_challenge_stats')
        .upsert(stats, { onConflict: 'userId' })

      if (error) throw error
      return true
    } catch (error) {
      console.error('Failed to save user challenge stats:', error)
      return false
    }
  }

  async getQuestProgress(userId: string, questId: string): Promise<QuestProgress | null> {
    try {
      const { data, error } = await supabase
        .from('quest_progress')
        .select('*')
        .eq('userId', userId)
        .eq('questId', questId)
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      return data as QuestProgress || null
    } catch (error) {
      console.error('Failed to get quest progress:', error)
      return null
    }
  }

  async updateQuestProgress(
    userId: string, 
    questId: string, 
    progress: number, 
    completed: boolean = false
  ): Promise<boolean> {
    try {
      const progressData: Partial<QuestProgress> = {
        userId,
        questId,
        progress,
        completed,
        completedAt: completed ? new Date().toISOString() : undefined
      }

      const { error } = await supabase
        .from('quest_progress')
        .upsert(progressData, { onConflict: 'userId,questId' })

      if (error) throw error

      // If quest completed, award XP and update stats
      if (completed) {
        await this.awardQuestCompletion(userId, questId)
      }

      return true
    } catch (error) {
      console.error('Failed to update quest progress:', error)
      return false
    }
  }

  async awardQuestCompletion(userId: string, questId: string): Promise<boolean> {
    try {
      const quest = this.quests.find(q => q.id === questId)
      if (!quest) return false

      const stats = await this.getUserChallengeStats(userId)
      if (!stats) return false

      // Calculate XP with bonuses
      const baseXP = quest.xpReward
      const streakBonus = quest.streakBonus * stats.currentStreak
      const weeklyMultiplier = this.calculateWeeklyBonus(stats.weeklyXP)
      const totalXP = Math.floor((baseXP + streakBonus) * weeklyMultiplier)

      // Update stats
      const newStats: UserChallengeStats = {
        ...stats,
        totalXP: stats.totalXP + totalXP,
        questsCompleted: stats.questsCompleted + 1,
        currentStreak: stats.currentStreak + 1,
        longestStreak: Math.max(stats.longestStreak, stats.currentStreak + 1),
        level: this.calculateLevel(stats.totalXP + totalXP),
        festivalStage: this.getCurrentFestivalStage(stats.totalXP + totalXP).id,
        lastActiveDate: new Date().toISOString(),
        weeklyXP: stats.weeklyXP + totalXP,
        monthlyXP: stats.monthlyXP + totalXP
      }

      await this.saveUserChallengeStats(newStats)

      // Trigger Exists.ai analytics
      if (quest.existsMetrics) {
        await this.triggerExistsAnalytics(userId, quest.existsMetrics.event, {
          ...quest.existsMetrics.properties,
          xp_awarded: totalXP,
          streak: newStats.currentStreak,
          level: newStats.level
        })
      }

      return true
    } catch (error) {
      console.error('Failed to award quest completion:', error)
      return false
    }
  }

  // Exists.ai Integration
  async triggerExistsAnalytics(
    userId: string, 
    event: string, 
    properties: Record<string, any>
  ): Promise<void> {
    try {
      // This would integrate with Exists.ai API
      // For now, we'll log the analytics data
      const analyticsData = {
        userId,
        event,
        properties: {
          ...properties,
          timestamp: new Date().toISOString(),
          source: 'edm_shuffle_challenges'
        }
      }

      console.log('🎯 Exists.ai Analytics:', analyticsData)

      // Store analytics for later processing
      await supabase
        .from('analytics_events')
        .insert(analyticsData)

    } catch (error) {
      console.error('Failed to trigger analytics:', error)
    }
  }

  // Utility Functions
  private hashCode(str: string): number {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash)
  }

  private shuffleArray<T>(array: T[], seed: number): T[] {
    const shuffled = [...array]
    let currentIndex = shuffled.length
    let temporaryValue: T
    let randomIndex: number

    // Use seeded random for consistent daily rotation
    const random = () => {
      seed = (seed * 9301 + 49297) % 233280
      return seed / 233280
    }

    while (0 !== currentIndex) {
      randomIndex = Math.floor(random() * currentIndex)
      currentIndex -= 1

      temporaryValue = shuffled[currentIndex]
      shuffled[currentIndex] = shuffled[randomIndex]
      shuffled[randomIndex] = temporaryValue
    }

    return shuffled
  }
}

// Export singleton instance
export const challengeSystem = new ChallengeSystem()