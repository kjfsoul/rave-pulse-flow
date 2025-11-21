import { createClient } from '@supabase/supabase-js'

// Supabase configuration - prioritize environment variables
// Remote project ID: uzudveyglwouuofiaapq
// Remote URL format: https://uzudveyglwouuofiaapq.supabase.co

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local'
  )
}

// Verify we're using the correct remote instance
const expectedProjectId = 'uzudveyglwouuofiaapq'
const isRemoteInstance = supabaseUrl.includes(expectedProjectId) || supabaseUrl.includes('supabase.co')

if (!isRemoteInstance && import.meta.env.DEV) {
  console.warn(
    `[Supabase] Warning: VITE_SUPABASE_URL (${supabaseUrl}) does not match expected remote project ID (${expectedProjectId})`
  )
  console.warn('[Supabase] Expected format: https://uzudveyglwouuofiaapq.supabase.co')
}

// Log Supabase configuration
console.log('[Supabase] Connected to:', supabaseUrl)
console.log('[Supabase] Project ID:', isRemoteInstance ? expectedProjectId : 'unknown/local')

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Enable session detection from URL (for OAuth callbacks)
    detectSessionInUrl: true,
    // Auto-refresh session
    autoRefreshToken: true,
    // Persist session in localStorage
    persistSession: true,
  },
  // Removed custom fetch wrapper - it was causing abort errors
  // Supabase client handles timeouts internally
})

// Database types
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          email: string
          username: string | null
          avatar_url: string | null
          archetype: string | null
          preferences: any | null
          plur_points: number
          level: number
          streak: number
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          email: string
          username?: string | null
          avatar_url?: string | null
          archetype?: string | null
          preferences?: any | null
          plur_points?: number
          level?: number
          streak?: number
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          email?: string
          username?: string | null
          avatar_url?: string | null
          archetype?: string | null
          preferences?: any | null
          plur_points?: number
          level?: number
          streak?: number
        }
      }
      festival_votes: {
        Row: {
          id: string
          user_id: string
          dj_id: string
          created_at: string
          vote_weight: number
        }
        Insert: {
          id?: string
          user_id: string
          dj_id: string
          created_at?: string
          vote_weight?: number
        }
        Update: {
          id?: string
          user_id?: string
          dj_id?: string
          created_at?: string
          vote_weight?: number
        }
      }
      challenges: {
        Row: {
          id: string
          user_id: string
          challenge_type: string
          status: string
          created_at: string
          completed_at: string | null
          points_earned: number
        }
        Insert: {
          id?: string
          user_id: string
          challenge_type: string
          status?: string
          created_at?: string
          completed_at?: string | null
          points_earned?: number
        }
        Update: {
          id?: string
          user_id?: string
          challenge_type?: string
          status?: string
          created_at?: string
          completed_at?: string | null
          points_earned?: number
        }
      }
      dj_settings: {
        Row: {
          id: string
          user_id: string
          settings: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          settings: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          settings?: any
          created_at?: string
          updated_at?: string
        }
      }
      marketplace_purchases: {
        Row: {
          id: string
          user_id: string
          item_id: string
          item_type: string
          amount_paid: number
          created_at: string
          download_url: string | null
        }
        Insert: {
          id?: string
          user_id: string
          item_id: string
          item_type: string
          amount_paid: number
          created_at?: string
          download_url?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          item_id?: string
          item_type?: string
          amount_paid?: number
          created_at?: string
          download_url?: string | null
        }
      }
      tracks: {
        Row: {
          id: string
          user_id: string
          name: string
          url: string
          file_key: string
          mime_type: string | null
          file_size: number | null
          duration: number | null
          bpm_detected: number | null
          bpm_accurate: number | null
          musical_key: string | null
          source: 'upload' | 'freesound' | 'loudly'
          broadcast_rights_confirmed: boolean
          attribution_credits: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          url: string
          file_key: string
          mime_type?: string | null
          file_size?: number | null
          duration?: number | null
          bpm_detected?: number | null
          bpm_accurate?: number | null
          musical_key?: string | null
          source: 'upload' | 'freesound' | 'loudly'
          broadcast_rights_confirmed?: boolean
          attribution_credits?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          url?: string
          file_key?: string
          mime_type?: string | null
          file_size?: number | null
          duration?: number | null
          bpm_detected?: number | null
          bpm_accurate?: number | null
          musical_key?: string | null
          source?: 'upload' | 'freesound' | 'loudly'
          broadcast_rights_confirmed?: boolean
          attribution_credits?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      festival_submissions: {
        Row: {
          id: string
          user_id: string
          title: string
          artist_name: string
          file_key: string
          url: string
          attribution_credits: string | null
          festival_scene: string | null
          status: 'pending' | 'approved' | 'rejected'
          votes: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          artist_name: string
          file_key: string
          url: string
          attribution_credits?: string | null
          festival_scene?: string | null
          status?: 'pending' | 'approved' | 'rejected'
          votes?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          artist_name?: string
          file_key?: string
          url?: string
          attribution_credits?: string | null
          festival_scene?: string | null
          status?: 'pending' | 'approved' | 'rejected'
          votes?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

export type Profile = Database['public']['Tables']['profiles']['Row']
export type FestivalVote = Database['public']['Tables']['festival_votes']['Row']
export type Challenge = Database['public']['Tables']['challenges']['Row']
export type DjSettings = Database['public']['Tables']['dj_settings']['Row']
export type MarketplacePurchase = Database['public']['Tables']['marketplace_purchases']['Row']
export type Track = Database['public']['Tables']['tracks']['Row']
export type FestivalSubmission = Database['public']['Tables']['festival_submissions']['Row']
