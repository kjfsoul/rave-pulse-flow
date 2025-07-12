import React, { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Mail, Lock, User, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface AuthFormProps {
  onSuccess?: () => void
}

export const AuthForm: React.FC<AuthFormProps> = ({ onSuccess }) => {
  const { signIn, signUp, loading } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin')

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
    setError(null)
    setSuccess(null)
  }

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setError('Please fill in all required fields')
      return false
    }
    
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long')
      return false
    }
    
    if (!formData.email.includes('@')) {
      setError('Please enter a valid email address')
      return false
    }
    
    return true
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return
    
    try {
      await signIn(formData.email, formData.password)
      setSuccess('Successfully signed in! Redirecting...')
      setError(null)
      // Immediate navigation after successful sign in
      if (onSuccess) {
        onSuccess()
      } else {
        navigate('/')
      }
    } catch (error: any) {
      console.error('Sign in error:', error)
      setError(error.message || 'Failed to sign in')
      setSuccess(null)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return
    
    try {
      await signUp(formData.email, formData.password, formData.username)
      setSuccess('Account created successfully! Welcome to EDM Shuffle!')
      setError(null)
      // Navigate immediately after successful signup
      if (onSuccess) {
        onSuccess()
      } else {
        navigate('/')
      }
    } catch (error: any) {
      console.error('Sign up error:', error)
      setError(error.message || 'Failed to sign up')
      setSuccess(null)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Escape Banner */}
      <div className="mb-4 p-3 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-lg">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/')}
          className="w-full text-gray-300 hover:text-white hover:bg-purple-600/20 transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Continue to EDM Shuffle without signing in
        </Button>
      </div>

      <Card className="bg-black/80 border-purple-500/30 backdrop-blur-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Welcome to EDM Shuffle
          </CardTitle>
          <CardDescription className="text-gray-300">
            Join the digital rave experience
          </CardDescription>
        </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'signin' | 'signup')}>
          <TabsList className="grid w-full grid-cols-2 bg-gray-800/50">
            <TabsTrigger value="signin" className="data-[state=active]:bg-purple-600">
              Sign In
            </TabsTrigger>
            <TabsTrigger value="signup" className="data-[state=active]:bg-purple-600">
              Sign Up
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="signin" className="space-y-4">
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-200">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="pl-10 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400"
                    placeholder="Enter your email"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-200">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className="pl-10 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400"
                    placeholder="Enter your password"
                  />
                </div>
              </div>
              
              {error && (
                <Alert className="bg-red-900/50 border-red-500 text-red-200">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              {success && (
                <Alert className="bg-green-900/50 border-green-500 text-green-200">
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}
              
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>
          </TabsContent>
          
          <TabsContent value="signup" className="space-y-4">
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-gray-200">
                  Username (optional)
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="pl-10 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400"
                    placeholder="Choose a username"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="signup-email" className="text-gray-200">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="signup-email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="pl-10 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400"
                    placeholder="Enter your email"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="signup-password" className="text-gray-200">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="signup-password"
                    name="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className="pl-10 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400"
                    placeholder="Choose a password"
                  />
                </div>
              </div>
              
              {error && (
                <Alert className="bg-red-900/50 border-red-500 text-red-200">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              {success && (
                <Alert className="bg-green-900/50 border-green-500 text-green-200">
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}
              
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
    </div>
  )
}