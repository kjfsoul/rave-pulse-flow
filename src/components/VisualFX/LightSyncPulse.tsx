
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAudioContext } from '@/contexts/AudioContext';

interface LightSyncPulseProps {
  bpm?: number;
  useAudioBpm?: boolean;
  intensity?: 'subtle' | 'medium' | 'intense';
  triggerBurst?: boolean; // For button press reactions
}

const LightSyncPulse: React.FC<LightSyncPulseProps> = ({
  bpm: propBpm,
  useAudioBpm = false,
  intensity = 'medium',
  triggerBurst = false
}) => {
  const { bpm: audioBpm } = useAudioContext();
  const effectiveBpm = useAudioBpm ? audioBpm : (propBpm || 128);
  const beatDuration = 60 / effectiveBpm;
  const [burstActive, setBurstActive] = useState(false);

  useEffect(() => {
    if (triggerBurst) {
      setBurstActive(true);
      setTimeout(() => setBurstActive(false), 2000);
    }
  }, [triggerBurst]);

  const getIntensityConfig = () => {
    switch (intensity) {
      case 'subtle':
        return {
          baseOpacity: 0.1,
          pulseOpacity: 0.3,
          blurAmount: 'blur-2xl',
          scale: 1.5
        };
      case 'medium':
        return {
          baseOpacity: 0.2,
          pulseOpacity: 0.5,
          blurAmount: 'blur-3xl',
          scale: 2
        };
      case 'intense':
        return {
          baseOpacity: 0.3,
          pulseOpacity: 0.7,
          blurAmount: 'blur-3xl',
          scale: 2.5
        };
    }
  };

  const config = getIntensityConfig();

  return (
    <div className="fixed inset-0 pointer-events-none z-20 overflow-hidden">
      {/* Corner Radial Pulses */}
      {[
        { position: 'top-0 left-0', gradient: 'from-neon-purple/40' },
        { position: 'top-0 right-0', gradient: 'from-neon-cyan/40' },
        { position: 'bottom-0 left-0', gradient: 'from-neon-cyan/40' },
        { position: 'bottom-0 right-0', gradient: 'from-neon-purple/40' }
      ].map((corner, i) => (
        <motion.div
          key={`corner-${i}`}
          className={`absolute ${corner.position} w-64 h-64 ${config.blurAmount}`}
          style={{
            background: `radial-gradient(circle, ${corner.gradient.replace('/40', `/${config.baseOpacity * 100}`)} 0%, transparent 70%)`,
            transform: 'translate(-50%, -50%)'
          }}
          animate={{
            opacity: [config.baseOpacity, config.pulseOpacity, config.baseOpacity],
            scale: [1, config.scale * 0.8, 1]
          }}
          transition={{
            duration: beatDuration * 2,
            repeat: Infinity,
            delay: i * (beatDuration * 0.5),
            ease: "easeInOut"
          }}
        />
      ))}

      {/* Center Radial Burst */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        animate={{
          opacity: burstActive ? [0, 0.8, 0] : [0, config.pulseOpacity * 0.5, 0],
          scale: burstActive ? [0.5, 3, 0.5] : [0.8, 1.2, 0.8]
        }}
        transition={{
          duration: burstActive ? 2 : beatDuration * 4,
          repeat: burstActive ? 1 : Infinity,
          ease: burstActive ? "easeOut" : "easeInOut"
        }}
      >
        <div
          className={`w-96 h-96 rounded-full ${config.blurAmount}`}
          style={{
            background: 'radial-gradient(circle, rgba(191, 90, 242, 0.4) 0%, rgba(6, 255, 165, 0.2) 50%, transparent 70%)'
          }}
        />
      </motion.div>

      {/* Edge Light Beams */}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (360 / 8) * i;
        const isVertical = i % 2 === 0;
        
        return (
          <motion.div
            key={`beam-${i}`}
            className="absolute inset-0 flex items-center justify-center"
            style={{ transform: `rotate(${angle}deg)` }}
          >
            <motion.div
              className={`${isVertical ? 'w-1 h-full' : 'w-full h-1'} bg-gradient-to-${isVertical ? 'b' : 'r'} from-transparent via-neon-purple/30 to-transparent ${config.blurAmount}`}
              animate={{
                opacity: [0, config.pulseOpacity * 0.3, 0],
                scaleY: isVertical ? [0.8, 1.2, 0.8] : 1,
                scaleX: !isVertical ? [0.8, 1.2, 0.8] : 1
              }}
              transition={{
                duration: beatDuration * 3,
                repeat: Infinity,
                delay: i * (beatDuration * 0.2),
                ease: "easeInOut"
              }}
            />
          </motion.div>
        );
      })}

      {/* Burst Effect Overlay */}
      {burstActive && (
        <motion.div
          className="absolute inset-0 bg-gradient-radial from-white/10 via-neon-purple/20 to-transparent"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: [0, 0.6, 0], scale: [0, 4, 8] }}
          transition={{ duration: 2, ease: "easeOut" }}
        />
      )}

      {/* Scanning Laser Effect */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        animate={{ rotate: [0, 360] }}
        transition={{
          duration: beatDuration * 16,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-neon-cyan/50 to-transparent blur-sm" />
      </motion.div>
    </div>
  );
};

export default LightSyncPulse;
