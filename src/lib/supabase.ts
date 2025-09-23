import { createClient } from '@supabase/supabase-js'

// Handle both Vite and Next.js environment variables
const supabaseUrl = (typeof window !== 'undefined' 
  ? import.meta.env?.VITE_SUPABASE_URL 
  : process.env.NEXT_PUBLIC_SUPABASE_URL) as string

const supabaseAnonKey = (typeof window !== 'undefined' 
  ? import.meta.env?.VITE_SUPABASE_ANON_KEY 
  : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) as string

// Use mock values if environment variables are not available
const mockSupabaseUrl = 'https://mock.supabase.co'
const mockSupabaseKey = 'mock-anon-key'

const finalUrl = supabaseUrl || mockSupabaseUrl;
const finalKey = supabaseAnonKey || mockSupabaseKey;

export const supabase = createClient(finalUrl, finalKey);

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
      live_feed: {
        Row: {
          id: string
          title: string
          description: string
          link: string
          source: string
          category: 'music' | 'festival' | 'news'
          pub_date: string
          guid: string
          image_url?: string | null
          author?: string | null
          tags?: string[] | null
          read_time?: number | null
          sentiment?: 'positive' | 'negative' | 'neutral' | null
          priority?: number | null
          trending?: boolean | null
          featured?: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          link: string
          source: string
          category?: string
          pub_date: string
          guid: string
          image_url?: string | null
          author?: string | null
          tags?: string[] | null
          read_time?: number | null
          sentiment?: string | null
          priority?: number | null
          trending?: boolean | null
          featured?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          link?: string
          source?: string
          category?: string
          pub_date?: string
          guid?: string
          image_url?: string | null
          author?: string | null
          tags?: string[] | null
          read_time?: number | null
          sentiment?: string | null
          priority?: number | null
          trending?: boolean | null
          featured?: boolean | null
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
export type LiveFeedItem = Database['public']['Tables']['live_feed']['Row']
