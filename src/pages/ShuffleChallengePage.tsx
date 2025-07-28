import React from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import ShuffleChallenge from '@/components/ShuffleChallenge'
import BottomNavigation from '@/components/BottomNavigation'

const ShuffleChallengePage: React.FC = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900">
      {/* Header */}
      <div className="relative z-10 p-4">
        <motion.div 
          className="flex items-center space-x-4"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Button
            onClick={() => navigate('/')}
            variant="outline"
            size="sm"
            className="text-white border-white/20 hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </motion.div>
      </div>

      {/* Challenge Component */}
      <div className="relative z-10">
        <ShuffleChallenge
          onClose={() => navigate('/')}
        />
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  )
}

export default ShuffleChallengePage