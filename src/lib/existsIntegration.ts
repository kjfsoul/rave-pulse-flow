import { supabase } from './supabase'

interface ExistsEvent {
  userId: string
  event: string
  properties: Record<string, any>
  timestamp: string
  source: string
}

interface ExistsAnalyticsConfig {
  apiKey?: string
  endpoint?: string
  batchSize: number
  flushInterval: number
  enabled: boolean
}

export class ExistsAnalytics {
  private config: ExistsAnalyticsConfig
  private eventQueue: ExistsEvent[] = []
  private flushTimer: NodeJS.Timeout | null = null

  constructor(config: Partial<ExistsAnalyticsConfig> = {}) {
    this.config = {
      apiKey: process.env.VITE_EXISTS_API_KEY,
      endpoint: process.env.VITE_EXISTS_ENDPOINT || 'https://api.exists.io/1/',
      batchSize: 10,
      flushInterval: 30000, // 30 seconds
      enabled: !!process.env.VITE_EXISTS_API_KEY,
      ...config
    }

    if (this.config.enabled) {
      this.startFlushTimer()
    }
  }

  // Core tracking methods
  async track(userId: string, event: string, properties: Record<string, any> = {}): Promise<void> {
    const existsEvent: ExistsEvent = {
      userId,
      event,
      properties: {
        ...properties,
        timestamp: new Date().toISOString(),
        source: 'edm_shuffle_app'
      },
      timestamp: new Date().toISOString(),
      source: 'edm_shuffle_challenges'
    }

    // Store in local queue
    this.eventQueue.push(existsEvent)

    // Store in Supabase for backup/analysis
    await this.storeEventLocal(existsEvent)

    // Flush if queue is full
    if (this.eventQueue.length >= this.config.batchSize) {
      await this.flush()
    }
  }

  // DJ-specific tracking methods
  async trackDJSession(userId: string, sessionData: {
    duration: number
    tracksPlayed: number
    bpmRange: [number, number]
    keyChanges: number
    crossfaderUse: number
    equalizerChanges: number
    archetype?: string
  }): Promise<void> {
    await this.track(userId, 'dj_session_completed', {
      ...sessionData,
      performance_score: this.calculatePerformanceScore(sessionData),
      skill_level: this.determineSkillLevel(sessionData)
    })
  }

  async trackQuestCompletion(userId: string, questData: {
    questId: string
    questType: string
    difficulty: string
    xpAwarded: number
    streak: number
    timeToComplete: number
  }): Promise<void> {
    await this.track(userId, 'quest_completed', {
      ...questData,
      efficiency_score: this.calculateEfficiencyScore(questData.timeToComplete, questData.difficulty)
    })
  }

  async trackMixingTechnique(userId: string, techniqueData: {
    technique: string // 'crossfade', 'eq_sweep', 'filter_cut', 'bass_drop'
    precision: number // 0-100
    timing: number // milliseconds
    context: string // 'practice', 'quest', 'performance'
    bpm?: number
    key?: string
  }): Promise<void> {
    await this.track(userId, 'mixing_technique_used', {
      ...techniqueData,
      mastery_level: this.calculateMasteryLevel(techniqueData.precision, techniqueData.timing)
    })
  }

  async trackCreativeFlow(userId: string, flowData: {
    sessionDuration: number
    uniqueActions: number
    experimentCount: number
    soundPacksUsed: number
    archetypeAlignment: number // 0-100
  }): Promise<void> {
    await this.track(userId, 'creative_flow_session', {
      ...flowData,
      creativity_score: this.calculateCreativityScore(flowData),
      flow_state: this.determineFlowState(flowData)
    })
  }

  async trackSocialEngagement(userId: string, socialData: {
    action: string // 'share_mix', 'rate_track', 'join_session', 'challenge_friend'
    target?: string
    engagement_quality: number // 0-100
    community_impact: number // 0-100
  }): Promise<void> {
    await this.track(userId, 'social_engagement', socialData)
  }

  // Advanced analytics for Exists.ai
  async trackBehaviorPattern(userId: string, patternData: {
    pattern_type: string // 'practice_routine', 'genre_preference', 'time_of_day'
    pattern_strength: number // 0-100
    pattern_duration: number // days
    behavior_change: number // -100 to 100
  }): Promise<void> {
    await this.track(userId, 'behavior_pattern_detected', patternData)
  }

  async trackSkillProgression(userId: string, progressionData: {
    skill_category: string // 'mixing', 'production', 'creativity', 'performance'
    previous_level: number
    current_level: number
    improvement_rate: number
    practice_hours: number
    milestone_reached?: string
  }): Promise<void> {
    await this.track(userId, 'skill_progression', progressionData)
  }

  async trackPersonalizedRecommendation(userId: string, recommendationData: {
    recommendation_type: string // 'quest', 'technique', 'sound_pack', 'practice_routine'
    recommendation_id: string
    user_response: string // 'accepted', 'rejected', 'deferred'
    relevance_score: number // 0-100
    personalization_factors: string[]
  }): Promise<void> {
    await this.track(userId, 'personalized_recommendation', recommendationData)
  }

  // Calculation methods for enhanced analytics
  private calculatePerformanceScore(sessionData: any): number {
    const factors = [
      sessionData.duration / 300, // 5-minute sessions = 1.0
      sessionData.tracksPlayed / 5, // 5 tracks = 1.0
      sessionData.crossfaderUse / 10, // 10 uses = 1.0
      sessionData.equalizerChanges / 20 // 20 changes = 1.0
    ]
    
    return Math.min(100, factors.reduce((sum, factor) => sum + factor, 0) * 25)
  }

  private determineSkillLevel(sessionData: any): string {
    const score = this.calculatePerformanceScore(sessionData)
    if (score >= 80) return 'advanced'
    if (score >= 60) return 'intermediate'
    return 'beginner'
  }

  private calculateEfficiencyScore(timeToComplete: number, difficulty: string): number {
    const expectedTimes = {
      beginner: 300, // 5 minutes
      intermediate: 600, // 10 minutes
      advanced: 900 // 15 minutes
    }
    
    const expected = expectedTimes[difficulty as keyof typeof expectedTimes] || 600
    return Math.max(0, Math.min(100, (expected / timeToComplete) * 100))
  }

  private calculateMasteryLevel(precision: number, timing: number): string {
    const score = (precision * 0.7) + ((1000 - Math.min(timing, 1000)) / 1000 * 30)
    if (score >= 85) return 'master'
    if (score >= 70) return 'proficient'
    if (score >= 50) return 'competent'
    return 'novice'
  }

  private calculateCreativityScore(flowData: any): number {
    return Math.min(100, 
      (flowData.uniqueActions * 2) +
      (flowData.experimentCount * 5) +
      (flowData.soundPacksUsed * 10) +
      (flowData.archetypeAlignment * 0.5)
    )
  }

  private determineFlowState(flowData: any): string {
    const score = this.calculateCreativityScore(flowData)
    if (score >= 80) return 'deep_flow'
    if (score >= 60) return 'moderate_flow'
    if (score >= 40) return 'light_flow'
    return 'exploration'
  }

  // Queue management
  private async flush(): Promise<void> {
    if (this.eventQueue.length === 0) return

    const events = [...this.eventQueue]
    this.eventQueue = []

    if (this.config.enabled && this.config.apiKey) {
      try {
        await this.sendToExists(events)
      } catch (error) {
        console.error('Failed to send events to Exists.ai:', error)
        // Re-queue events for retry
        this.eventQueue.unshift(...events)
      }
    } else {
      console.log('📊 Exists.ai Analytics (Local Queue):', events.length, 'events')
    }
  }

  private async sendToExists(events: ExistsEvent[]): Promise<void> {
    if (!this.config.apiKey || !this.config.endpoint) {
      throw new Error('Exists.ai API configuration missing')
    }

    const response = await fetch(`${this.config.endpoint}events/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        events: events.map(event => ({
          user_id: event.userId,
          event_type: event.event,
          properties: event.properties,
          timestamp: event.timestamp
        }))
      })
    })

    if (!response.ok) {
      throw new Error(`Exists.ai API error: ${response.status} ${response.statusText}`)
    }

    console.log('📊 Sent', events.length, 'events to Exists.ai')
  }

  private async storeEventLocal(event: ExistsEvent): Promise<void> {
    try {
      await supabase
        .from('analytics_events')
        .insert({
          userId: event.userId,
          event: event.event,
          properties: event.properties
        })
    } catch (error) {
      console.error('Failed to store event locally:', error)
    }
  }

  private startFlushTimer(): void {
    this.flushTimer = setInterval(() => {
      this.flush()
    }, this.config.flushInterval)
  }

  public stopFlushTimer(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer)
      this.flushTimer = null
    }
  }

  // Cleanup
  public async destroy(): Promise<void> {
    this.stopFlushTimer()
    await this.flush() // Final flush
  }
}

// Export singleton instance
export const existsAnalytics = new ExistsAnalytics()

// React hook for easy integration
export const useExistsAnalytics = () => {
  return {
    track: existsAnalytics.track.bind(existsAnalytics),
    trackDJSession: existsAnalytics.trackDJSession.bind(existsAnalytics),
    trackQuestCompletion: existsAnalytics.trackQuestCompletion.bind(existsAnalytics),
    trackMixingTechnique: existsAnalytics.trackMixingTechnique.bind(existsAnalytics),
    trackCreativeFlow: existsAnalytics.trackCreativeFlow.bind(existsAnalytics),
    trackSocialEngagement: existsAnalytics.trackSocialEngagement.bind(existsAnalytics),
    trackBehaviorPattern: existsAnalytics.trackBehaviorPattern.bind(existsAnalytics),
    trackSkillProgression: existsAnalytics.trackSkillProgression.bind(existsAnalytics),
    trackPersonalizedRecommendation: existsAnalytics.trackPersonalizedRecommendation.bind(existsAnalytics)
  }
}

// Automated triggers for common events
export const setupAutomatedTracking = (userId: string) => {
  // Track page views
  const trackPageView = (page: string) => {
    existsAnalytics.track(userId, 'page_view', { page })
  }

  // Track time spent
  let sessionStart = Date.now()
  const trackSessionDuration = () => {
    const duration = Date.now() - sessionStart
    existsAnalytics.track(userId, 'session_duration', { duration })
  }

  // Track errors
  const trackError = (error: Error, context: string) => {
    existsAnalytics.track(userId, 'error_occurred', {
      error_message: error.message,
      error_stack: error.stack,
      context
    })
  }

  return {
    trackPageView,
    trackSessionDuration,
    trackError
  }
}