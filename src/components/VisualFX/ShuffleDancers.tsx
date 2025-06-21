
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAudioContext } from '@/contexts/AudioContext';

interface ShuffleDancersProps {
  bpm?: number;
  dancerCount?: number;
  useAudioBpm?: boolean;
  intensity?: 'low' | 'medium' | 'high';
}

const ShuffleDancers: React.FC<ShuffleDancersProps> = ({
  bpm: propBpm,
  dancerCount = 6,
  useAudioBpm = false,
  intensity = 'medium'
}) => {
  const { bpm: audioBpm } = useAudioContext();
  const effectiveBpm = useAudioBpm ? audioBpm : (propBpm || 128);
  const beatDuration = 60 / effectiveBpm;

  const getDancerStyles = () => {
    const styles = [
      // Stomp kick + flare hands
      {
        moves: [
          { transform: 'translateY(0px) scaleX(1)', arms: 'rotate(0deg)' },
          { transform: 'translateY(-15px) scaleX(1.1)', arms: 'rotate(15deg)' },
          { transform: 'translateY(0px) scaleX(1)', arms: 'rotate(-15deg)' },
          { transform: 'translateY(-8px) scaleX(0.95)', arms: 'rotate(0deg)' }
        ],
        icon: '🕺',
        name: 'stomp'
      },
      // Slide + toe tap combo  
      {
        moves: [
          { transform: 'translateX(0px) rotate(0deg)', arms: 'rotate(0deg)' },
          { transform: 'translateX(10px) rotate(5deg)', arms: 'rotate(-20deg)' },
          { transform: 'translateX(-10px) rotate(-5deg)', arms: 'rotate(20deg)' },
          { transform: 'translateX(0px) rotate(0deg)', arms: 'rotate(0deg)' }
        ],
        icon: '💃',
        name: 'slide'
      },
      // Arms up spin pulse
      {
        moves: [
          { transform: 'rotate(0deg) scale(1)', arms: 'rotate(0deg)' },
          { transform: 'rotate(90deg) scale(1.1)', arms: 'rotate(45deg)' },
          { transform: 'rotate(180deg) scale(1)', arms: 'rotate(90deg)' },
          { transform: 'rotate(270deg) scale(1.1)', arms: 'rotate(135deg)' },
          { transform: 'rotate(360deg) scale(1)', arms: 'rotate(180deg)' }
        ],
        icon: '🕴️',
        name: 'spin'
      }
    ];
    return styles;
  };

  const dancerStyles = getDancerStyles();
  const opacityByIntensity = {
    low: 0.3,
    medium: 0.5,
    high: 0.7
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden">
      <AnimatePresence>
        {Array.from({ length: dancerCount }).map((_, i) => {
          const style = dancerStyles[i % dancerStyles.length];
          const randomX = Math.random() * 80 + 10; // 10% to 90%
          const randomY = Math.random() * 60 + 20; // 20% to 80%
          const randomDelay = Math.random() * 4;
          const randomScale = 0.8 + Math.random() * 0.4; // 0.8 to 1.2

          return (
            <motion.div
              key={`dancer-${i}`}
              className="absolute text-4xl"
              style={{
                left: `${randomX}%`,
                top: `${randomY}%`,
                transform: `scale(${randomScale})`
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ 
                opacity: [0, opacityByIntensity[intensity], 0],
                scale: [0, randomScale, 0]
              }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{
                duration: 8 + Math.random() * 4,
                delay: randomDelay,
                repeat: Infinity,
                repeatDelay: Math.random() * 3
              }}
            >
              {/* Dancer Silhouette */}
              <motion.div
                className="relative"
                animate={style.moves.reduce((acc, move, idx) => {
                  acc[`step${idx}`] = move;
                  return acc;
                }, {} as any)}
                transition={{
                  duration: beatDuration * style.moves.length,
                  repeat: Infinity,
                  ease: "linear",
                  delay: Math.random() * beatDuration
                }}
              >
                {/* Main Body */}
                <motion.div
                  className="text-4xl filter drop-shadow-lg"
                  style={{
                    color: 'rgba(255, 255, 255, 0.6)',
                    textShadow: '0 0 10px rgba(191, 90, 242, 0.5)'
                  }}
                  animate={{
                    textShadow: [
                      '0 0 10px rgba(191, 90, 242, 0.5)',
                      '0 0 20px rgba(6, 255, 165, 0.5)',
                      '0 0 10px rgba(191, 90, 242, 0.5)'
                    ]
                  }}
                  transition={{
                    duration: beatDuration * 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  {style.icon}
                </motion.div>

                {/* Energy Trails */}
                <motion.div
                  className="absolute inset-0 rounded-full blur-md opacity-30"
                  style={{
                    background: 'radial-gradient(circle, rgba(191, 90, 242, 0.4) 0%, transparent 70%)'
                  }}
                  animate={{
                    scale: [0.8, 1.2, 0.8],
                    opacity: [0.2, 0.4, 0.2]
                  }}
                  transition={{
                    duration: beatDuration,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </motion.div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default ShuffleDancers;
