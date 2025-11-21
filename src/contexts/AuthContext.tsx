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
  signInWithGoogle: () => Promise<void>
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
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
          },
        },
      })

      if (error) {
        // Log the full error object for debugging
        console.error('[AuthContext] Raw Supabase error:', error)
        console.error('[AuthContext] Error message:', error.message)
        console.error('[AuthContext] Error status:', error.status)
        console.error('[AuthContext] Error name:', error.name)
        if ((error as any).code) console.error('[AuthContext] Error code:', (error as any).code)

        // Try to log the full error structure
        try {
          console.error('[AuthContext] Full error JSON:', JSON.stringify(error, null, 2))
        } catch (e) {
          console.error('[AuthContext] Error object keys:', Object.keys(error))
          console.error('[AuthContext] Error object:', error)
        }

        // Convert Supabase errors to user-friendly messages
        let userMessage = error.message
        const errorLower = error.message.toLowerCase()
        const errorMsg = error.message

        // Check for specific password errors by code first (most reliable)
        const errorCode = (error as any).code
        
        if (errorCode === 'weak_password') {
          // Supabase password strength requirement
          userMessage = 'Password must contain at least one lowercase letter, one uppercase letter, and one number'
        } else if (errorCode === 'password_too_short' || errorMsg === 'Password should be at least 6 characters') {
          // Password length error
          userMessage = 'Password must be at least 6 characters long'
        } else if (errorLower.includes('password') && (
          (errorLower.includes('at least') && errorLower.includes('6')) || 
          (errorLower.includes('minimum') && errorLower.includes('6')) || 
          (errorLower.includes('too short')) ||
          (errorLower.includes('6 characters'))
        )) {
          // Fallback for length errors without code
          userMessage = 'Password must be at least 6 characters long'
        } else if (errorLower.includes('email') && (errorLower.includes('invalid') || errorLower.includes('format'))) {
          userMessage = 'Please enter a valid email address'
        } else if (errorLower.includes('rate limit') || errorLower.includes('too many')) {
          userMessage = 'Too many attempts. Please wait a few minutes before trying again'
        } else if (errorLower.includes('already registered') || errorLower.includes('already exists') || errorLower.includes('user already')) {
          userMessage = 'An account with this email already exists. Try signing in instead'
        } else if (errorLower.includes('email not confirmed') || errorLower.includes('not verified')) {
          userMessage = 'Please check your email and click the confirmation link before signing in'
        } else if (errorLower.includes('network') || errorLower.includes('connection')) {
          userMessage = 'Connection error. Please check your internet connection and try again'
        }
        // If none of the above, use the original error message

        console.log('[AuthContext] Translated error:', userMessage)
        const friendlyError = new Error(userMessage)
        friendlyError.name = 'AuthError'
        throw friendlyError
      }

      // If signup successful and user is immediately signed in (no email confirmation required)
      if (data.user && data.session) {
        setSession(data.session)
        setUser(data.user)
        // Profile will be created automatically via auth state change listener
      }

    } catch (error: unknown) {
      console.error('Error signing up:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
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

      // Successfully signed in
      if (data.user && data.session) {
        setSession(data.session)
        setUser(data.user)
        // Profile will be fetched via auth state change listener
        console.log('Successfully signed in:', data.user.email)
      }

    } catch (error: unknown) {
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

  const signInWithGoogle = async () => {
    setLoading(true)
    try {
      // CRITICAL: Use current origin to ensure redirect goes to localhost in dev
      // If Supabase dashboard has a hardcoded redirect URL, that will override this
      // You must add localhost URLs (including port 8084, 8081, 5173, etc.) to Supabase Dashboard > Authentication > URL Configuration
      const redirectUrl = window.location.href; // Use full current URL including path and search

      // Log for debugging
      console.log('[Auth] Google OAuth redirect URL:', redirectUrl)
      console.log('[Auth] Current origin:', window.location.origin)
      console.log('[Auth] Current pathname:', window.location.pathname)
      console.log('[Auth] Full URL:', window.location.href)
      console.log('[Auth] Supabase URL:', import.meta.env.VITE_SUPABASE_URL)
      console.log('[Auth] Is development:', import.meta.env.DEV)

      // Warn if redirect might go wrong
      if (window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1')) {
        console.warn('[Auth] NOTE: If redirect goes to production (edmshuffle.com), you must add these URLs to Supabase Dashboard > Authentication > URL Configuration:')
        console.warn('[Auth]   -', window.location.origin)
        console.warn('[Auth]   -', window.location.origin + '/')
        console.warn('[Auth]   -', window.location.origin + '/#')
      }

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })

      if (error) {
        let userMessage = 'Failed to sign in with Google'

        if (error.message.includes('rate limit')) {
          userMessage = 'Too many attempts. Please wait a moment and try again'
        } else if (error.message.includes('network')) {
          userMessage = 'Connection error. Please check your internet and try again'
        }

        const friendlyError = new Error(userMessage)
        friendlyError.name = 'AuthError'
        throw friendlyError
      }

      // Google OAuth will redirect, so we don't need to handle the response here
    } catch (error: unknown) {
      console.error('Error signing in with Google:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const value: AuthContextType = {
    user,
    profile,
    session,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    updateProfile,
    refreshProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
