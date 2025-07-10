import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session, AuthChangeEvent } from '@supabase/supabase-js'
import { supabase, Profile } from '@/lib/supabase'

interface AuthContextType {
  user: User | null
  profile: Profile | null
  session: Session | null
  loading: boolean
  signUp: (email: string, password: string, username?: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<Profile>) => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Timeout fallback to prevent infinite loading
    const loadingTimeout = setTimeout(() => {
      console.warn('Auth initialization timed out, setting loading to false')
      setLoading(false)
    }, 5000) // 5 second timeout
    
    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      clearTimeout(loadingTimeout) // Clear timeout on success
      setSession(session)
      setUser(session?.user ?? null)
      
      if (session?.user) {
        try {
          await fetchProfile(session.user.id)
        } catch (error) {
          console.error('Error fetching profile during initialization:', error)
          // Continue anyway, don't block loading
        }
      }
      
      setLoading(false)
    }).catch((error) => {
      clearTimeout(loadingTimeout) // Clear timeout on error
      console.error('Error getting initial session:', error)
      setLoading(false) // Always set loading to false, even on error
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
      setSession(session)
      setUser(session?.user ?? null)
      
      if (session?.user) {
        try {
          await fetchProfile(session.user.id)
        } catch (error) {
          console.error('Error fetching profile during auth change:', error)
          // Continue anyway, don't block loading
        }
      } else {
        setProfile(null)
      }
      
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // Profile doesn't exist, create one
          const { data: userData } = await supabase.auth.getUser()
          if (userData.user) {
            await createProfile(userData.user)
          }
        } else {
          throw error
        }
      } else {
        setProfile(data)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  }

  const createProfile = async (user: User) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert([
          {
            id: user.id,
            email: user.email!,
            username: user.user_metadata?.username || null,
            plur_points: 0,
            level: 1,
            streak: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select()
        .single()

      if (error) throw error
      setProfile(data)
    } catch (error) {
      console.error('Error creating profile:', error)
    }
  }

  const signUp = async (email: string, password: string, username?: string) => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
          },
        },
      })
      if (error) {
        // Convert Supabase errors to user-friendly messages
        let userMessage = error.message
        
        if (error.message.includes('email')) {
          userMessage = 'Please enter a valid email address'
        } else if (error.message.includes('password') || error.message.includes('Password')) {
          userMessage = 'Password must be at least 6 characters long'
        } else if (error.message.includes('rate limit') || error.message.includes('too many')) {
          userMessage = 'Too many attempts. Please wait a few minutes before trying again'
        } else if (error.message.includes('already registered') || error.message.includes('already exists')) {
          userMessage = 'An account with this email already exists. Try signing in instead'
        }
        
        const friendlyError = new Error(userMessage)
        friendlyError.name = 'AuthError'
        throw friendlyError
      }
    } catch (error: any) {
      console.error('Error signing up:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) {
        // Convert Supabase errors to user-friendly messages
        let userMessage = error.message
        
        if (error.message.includes('Invalid login credentials') || error.message.includes('invalid_grant')) {
          userMessage = 'Incorrect email or password. Please check your credentials and try again'
        } else if (error.message.includes('email not confirmed') || error.message.includes('not verified')) {
          userMessage = 'Please check your email and click the confirmation link before signing in'
        } else if (error.message.includes('too many attempts') || error.message.includes('rate limit')) {
          userMessage = 'Too many failed attempts. Please wait a few minutes before trying again'
        } else if (error.message.includes('network') || error.message.includes('connection')) {
          userMessage = 'Connection error. Please check your internet connection and try again'
        } else if (error.message.includes('email')) {
          userMessage = 'Please enter a valid email address'
        }
        
        const friendlyError = new Error(userMessage)
        friendlyError.name = 'AuthError'
        throw friendlyError
      }
    } catch (error: any) {
      console.error('Error signing in:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (error) {
      console.error('Error signing out:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) throw new Error('No user logged in')
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)
        .select()
        .single()

      if (error) throw error
      setProfile(data)
    } catch (error) {
      console.error('Error updating profile:', error)
      throw error
    }
  }

  const refreshProfile = async () => {
    if (!user) return
    await fetchProfile(user.id)
  }

  const value: AuthContextType = {
    user,
    profile,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    refreshProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}