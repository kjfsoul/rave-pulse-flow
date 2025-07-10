import React, { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  User, 
  Mail, 
  Trophy, 
  Zap, 
  Target, 
  LogOut, 
  Edit2, 
  Save, 
  X 
} from 'lucide-react'

export const UserProfile: React.FC = () => {
  const { user, profile, signOut, updateProfile } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    username: profile?.username || '',
    avatar_url: profile?.avatar_url || '',
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
    setError(null)
    setSuccess(null)
  }

  const handleSave = async () => {
    try {
      await updateProfile(formData)
      setIsEditing(false)
      setSuccess('Profile updated successfully!')
      setTimeout(() => setSuccess(null), 3000)
    } catch (error: any) {
      setError(error.message || 'Failed to update profile')
    }
  }

  const handleCancel = () => {
    setFormData({
      username: profile?.username || '',
      avatar_url: profile?.avatar_url || '',
    })
    setIsEditing(false)
    setError(null)
    setSuccess(null)
  }

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error: any) {
      setError(error.message || 'Failed to sign out')
    }
  }

  if (!user || !profile) {
    return null
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card className="bg-black/80 border-purple-500/30 backdrop-blur-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16 border-2 border-purple-500">
                <AvatarImage src={profile.avatar_url || ''} alt={profile.username || 'User'} />
                <AvatarFallback className="bg-purple-600 text-white text-lg">
                  {profile.username?.charAt(0).toUpperCase() || 
                   profile.email.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  {profile.username || 'Anonymous Raver'}
                </CardTitle>
                <CardDescription className="text-gray-300 flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  {profile.email}
                </CardDescription>
              </div>
            </div>
            <div className="flex space-x-2">
              {!isEditing ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="border-purple-500/30 hover:bg-purple-600/20"
                >
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              ) : (
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSave}
                    className="border-green-500/30 hover:bg-green-600/20"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancel}
                    className="border-red-500/30 hover:bg-red-600/20"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
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

          {isEditing ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-gray-200">
                  Username
                </Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400"
                  placeholder="Enter your username"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="avatar_url" className="text-gray-200">
                  Avatar URL
                </Label>
                <Input
                  id="avatar_url"
                  name="avatar_url"
                  type="url"
                  value={formData.avatar_url}
                  onChange={handleInputChange}
                  className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400"
                  placeholder="https://example.com/avatar.jpg"
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-3 p-3 bg-gray-800/30 rounded-lg">
                <Trophy className="h-8 w-8 text-yellow-500" />
                <div>
                  <p className="text-sm text-gray-400">Level</p>
                  <p className="text-2xl font-bold text-white">{profile.level}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-gray-800/30 rounded-lg">
                <Zap className="h-8 w-8 text-purple-500" />
                <div>
                  <p className="text-sm text-gray-400">PLUR Points</p>
                  <p className="text-2xl font-bold text-white">{profile.plur_points}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-gray-800/30 rounded-lg">
                <Target className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-sm text-gray-400">Streak</p>
                  <p className="text-2xl font-bold text-white">{profile.streak}</p>
                </div>
              </div>
            </div>
          )}

          {profile.archetype && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Archetype</h3>
              <Badge variant="secondary" className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                {profile.archetype}
              </Badge>
            </div>
          )}

          <Separator className="bg-gray-700" />

          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-400">
              <p>Joined: {new Date(profile.created_at).toLocaleDateString()}</p>
              <p>Last updated: {new Date(profile.updated_at).toLocaleDateString()}</p>
            </div>
            
            <Button
              variant="destructive"
              onClick={handleSignOut}
              className="bg-red-600 hover:bg-red-700"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}