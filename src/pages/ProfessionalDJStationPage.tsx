import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, Library, Settings, Radio } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DJStation } from '@/components/vFLX10/DJStation'
import { SoundLibraryPanel } from '@/components/vFLX10/SoundLibraryPanel'
import BottomNavigation from '@/components/BottomNavigation'

const ProfessionalDJStationPage: React.FC = () => {
  const navigate = useNavigate()
  const [activeView, setActiveView] = useState<'studio' | 'library'>('studio')

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 flex flex-col">
      {/* Header Navigation - Always Visible */}
      <header className="sticky top-0 z-50 w-full bg-bass-dark/95 backdrop-blur-lg border-b border-neon-purple/20 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <motion.div
            className="flex items-center justify-between"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Left: Home Button */}
            <Button
              onClick={() => navigate('/')}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/10 flex items-center gap-2"
            >
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Home</span>
            </Button>

            {/* Center: Title */}
            <div className="flex items-center space-x-3">
              <Radio className="w-5 h-5 md:w-6 md:h-6 text-purple-400" />
              <h1 className="text-lg md:text-xl font-bold text-white">Professional DJ Studio</h1>
            </div>

            {/* Right: Navigation Buttons */}
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setActiveView('library')}
                variant={activeView === 'library' ? 'default' : 'ghost'}
                size="sm"
                className={`flex items-center gap-2 ${
                  activeView === 'library'
                    ? 'bg-neon-purple/20 text-neon-purple border border-neon-purple/30'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                <Library className="w-4 h-4" />
                <span className="hidden sm:inline">Library</span>
              </Button>
              <Button
                onClick={() => navigate('/profile')}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/10 flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Settings</span>
              </Button>
            </div>
          </motion.div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 relative z-10 p-4 pb-20 md:pb-24">
        {activeView === 'studio' ? (
          <DJStation />
        ) : (
          <div className="max-w-7xl mx-auto">
            <SoundLibraryPanel />
          </div>
        )}
      </main>

      {/* Footer - Desktop Only - Always Visible */}
      <footer className="hidden md:flex bg-bass-medium/90 border-t border-neon-purple/20 py-6 px-4 mt-auto">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🕺</span>
              <span className="text-xl font-bold text-white">EDM Shuffle</span>
            </div>

            <div className="flex items-center gap-6 text-sm">
              <Link
                to="/privacy-policy"
                className="text-slate-400 hover:text-neon-cyan transition-colors duration-200 flex items-center gap-1"
              >
                🔒 Privacy Policy
              </Link>
              <span className="text-slate-600">|</span>
              <span className="text-slate-500">© 2025 EDM Shuffle</span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-700/50 text-center">
            <p className="text-xs text-slate-500">
              Your privacy is our priority. We respect your dance floor and your data.
            </p>
          </div>
        </div>
      </footer>

      {/* Bottom Navigation - Mobile Only */}
      <BottomNavigation />
    </div>
  )
}

export default ProfessionalDJStationPage
