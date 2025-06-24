
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Music, Headphones, Zap } from 'lucide-react';

interface SubscribeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const SubscribeModal: React.FC<SubscribeModalProps> = ({
  isOpen,
  onClose,
  onConfirm
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-gradient-to-br from-bass-medium via-bass-dark to-bass-medium border-2 border-neon-purple/50 rounded-2xl p-8 max-w-md w-full relative overflow-hidden"
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Animated background effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-neon-purple/10 via-neon-cyan/10 to-neon-purple/10"
              animate={{
                background: [
                  'linear-gradient(45deg, rgba(191,90,242,0.1), rgba(6,255,165,0.1), rgba(191,90,242,0.1))',
                  'linear-gradient(45deg, rgba(6,255,165,0.1), rgba(191,90,242,0.1), rgba(6,255,165,0.1))',
                  'linear-gradient(45deg, rgba(191,90,242,0.1), rgba(6,255,165,0.1), rgba(191,90,242,0.1))'
                ]
              }}
              transition={{ duration: 3, repeat: Infinity }}
            />

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Content */}
            <div className="relative z-10 text-center">
              {/* Icon */}
              <motion.div
                className="flex justify-center mb-6"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <div className="w-16 h-16 bg-gradient-to-br from-neon-purple to-neon-cyan rounded-full flex items-center justify-center">
                  <Star className="w-8 h-8 text-white" />
                </div>
              </motion.div>

              {/* Title */}
              <motion.h2
                className="text-2xl font-bold mb-4 text-transparent bg-gradient-to-r from-neon-purple via-neon-cyan to-neon-purple bg-clip-text"
                animate={{ 
                  backgroundPosition: ['0%', '100%', '0%']
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                🌟 Join the Festival Lineup!
              </motion.h2>

              {/* Description */}
              <p className="text-slate-300 mb-6 leading-relaxed">
                Ready to headline the Virtual Festival? Submit your mix and get featured 
                alongside the biggest names in EDM. Your beats could be the next crowd favorite!
              </p>

              {/* Features */}
              <div className="space-y-3 mb-8 text-left">
                <motion.div 
                  className="flex items-center gap-3 text-neon-cyan"
                  whileHover={{ x: 5 }}
                >
                  <Music className="w-5 h-5" />
                  <span>Featured on main stage rotation</span>
                </motion.div>
                <motion.div 
                  className="flex items-center gap-3 text-neon-purple"
                  whileHover={{ x: 5 }}
                >
                  <Headphones className="w-5 h-5" />
                  <span>Access to premium DJ tools</span>
                </motion.div>
                <motion.div 
                  className="flex items-center gap-3 text-neon-cyan"
                  whileHover={{ x: 5 }}
                >
                  <Zap className="w-5 h-5" />
                  <span>Real-time crowd feedback</span>
                </motion.div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-6 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
                >
                  Maybe Later
                </button>
                <motion.button
                  onClick={onConfirm}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-neon-purple to-neon-cyan text-white font-bold rounded-lg"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  animate={{
                    boxShadow: [
                      '0 0 20px rgba(191,90,242,0.3)',
                      '0 0 30px rgba(6,255,165,0.3)',
                      '0 0 20px rgba(191,90,242,0.3)'
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  🎵 Submit My Mix!
                </motion.button>
              </div>

              {/* Fine print */}
              <p className="text-xs text-slate-500 mt-4">
                By submitting, you agree to showcase your mix in the virtual festival environment
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SubscribeModal;
