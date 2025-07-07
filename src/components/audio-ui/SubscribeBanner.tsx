import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Headphones, X, Star, Music } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SubscribeBannerProps {
  isVisible: boolean;
  onDismiss: () => void;
  onSubscribe: () => void;
  className?: string;
}

const SubscribeBanner: React.FC<SubscribeBannerProps> = ({
  isVisible,
  onDismiss,
  onSubscribe,
  className = ""
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={`fixed bottom-24 left-4 right-4 z-20 ${className}`}
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          whileHover={{ y: -5 }}
          onHoverStart={() => setIsHovered(true)}
          onHoverEnd={() => setIsHovered(false)}
        >
          <motion.div
            className="bg-gradient-to-r from-neon-purple/20 via-neon-cyan/20 to-neon-purple/20 backdrop-blur-md border-2 border-neon-purple/30 rounded-xl p-4 relative overflow-hidden"
            animate={{
              borderColor: isHovered 
                ? ['hsl(var(--neon-purple))', 'hsl(var(--neon-cyan))', 'hsl(var(--neon-purple))']
                : 'hsl(var(--neon-purple) / 0.3)'
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {/* Animated Background Gradient */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-neon-purple/10 via-transparent to-neon-cyan/10 opacity-50"
              animate={{
                background: [
                  'linear-gradient(90deg, hsl(var(--neon-purple) / 0.1), transparent, hsl(var(--neon-cyan) / 0.1))',
                  'linear-gradient(90deg, hsl(var(--neon-cyan) / 0.1), transparent, hsl(var(--neon-purple) / 0.1))',
                  'linear-gradient(90deg, hsl(var(--neon-purple) / 0.1), transparent, hsl(var(--neon-cyan) / 0.1))'
                ]
              }}
              transition={{ duration: 4, repeat: Infinity }}
            />

            {/* Dismiss Button */}
            <motion.button
              onClick={onDismiss}
              className="absolute top-2 right-2 text-slate-400 hover:text-white p-1 rounded transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <X className="w-4 h-4" />
            </motion.button>

            {/* Content */}
            <div className="relative z-10">
              <div className="flex items-center justify-center gap-3 flex-wrap">
                {/* Icon Animation */}
                <motion.div
                  animate={{ 
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Headphones className="w-6 h-6 text-neon-cyan" />
                </motion.div>

                {/* Text Content */}
                <div className="text-center flex-1 min-w-0">
                  <motion.div
                    className="text-white font-bold text-lg mb-1"
                    animate={{ 
                      textShadow: [
                        '0 0 10px rgba(6,255,165,0.3)',
                        '0 0 20px rgba(191,90,242,0.3)',
                        '0 0 10px rgba(6,255,165,0.3)'
                      ]
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    🌟 Ready to headline the Virtual Festival?
                  </motion.div>
                  <div className="text-neon-cyan text-sm">
                    Submit your mix and compete with DJs worldwide!
                  </div>
                </div>

                {/* CTA Button */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.button
                    onClick={onSubscribe}
                    className="bg-gradient-to-r from-neon-purple to-neon-cyan text-white px-6 py-2 rounded-full font-bold border-0 relative overflow-hidden"
                    animate={{
                      boxShadow: [
                        '0 0 20px rgba(191,90,242,0.3)',
                        '0 0 30px rgba(6,255,165,0.4)',
                        '0 0 20px rgba(191,90,242,0.3)'
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {/* Button Shine Effect */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      animate={{ x: ['-100%', '100%'] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    />
                    <span className="relative z-10 flex items-center gap-2">
                      <Star className="w-4 h-4" />
                      Submit My Mix!
                    </span>
                  </motion.button>
                </motion.div>
              </div>

              {/* Additional Features */}
              <motion.div 
                className="mt-3 pt-3 border-t border-neon-purple/20 flex items-center justify-center gap-6 text-xs text-slate-300"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <div className="flex items-center gap-1">
                  <Music className="w-3 h-3 text-neon-cyan" />
                  <span>Live Voting</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 text-neon-purple" />
                  <span>Global Rankings</span>
                </div>
                <div className="flex items-center gap-1">
                  <Headphones className="w-3 h-3 text-neon-cyan" />
                  <span>Pro Tools</span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SubscribeBanner;