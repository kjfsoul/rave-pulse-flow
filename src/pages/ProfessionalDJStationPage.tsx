import React from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Radio } from 'lucide-react'
import { Button } from '@/components/ui/button'
import ProfessionalDJStation from '@/components/ProfessionalDJStation'
import BottomNavigation from '@/components/BottomNavigation'

const ProfessionalDJStationPage: React.FC = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900">
      {/* Header Navigation */}
      <div className="relative z-10 p-4">
        <motion.div 
          className="flex items-center justify-between"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Button
            onClick={() => navigate('/')}
            variant="outline"
            size="sm"
            className="text-white border-white/20 hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Home
          </Button>
          
          <div className="flex items-center space-x-3">
            <Radio className="w-6 h-6 text-purple-400" />
            <h1 className="text-xl font-bold text-white">Professional DJ Studio</h1>
          </div>
          
          <div className="w-20" /> {/* Spacer for centering */}
        </motion.div>
      </div>

      {/* Main DJ Station */}
      <div className="relative z-10">
        <ProfessionalDJStation />
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  )
}

export default ProfessionalDJStationPage