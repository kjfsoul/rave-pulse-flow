
import React from 'react';
import { motion } from 'framer-motion';
import { useAudioContext } from '@/contexts/AudioContext';

interface ArchetypeAuraSpriteProps {
  archetype: 'Firestorm' | 'FrostPulse' | 'MoonWaver';
  bpm?: number;
  intensity?: number; // 0-100
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  useAudioBpm?: boolean;
}

const ArchetypeAuraSprite: React.FC<ArchetypeAuraSpriteProps> = ({
  archetype,
  bpm: propBpm,
  intensity = 80,
  position = 'top-right',
  useAudioBpm = false
}) => {
  const { bpm: audioBpm } = useAudioContext();
  const effectiveBpm = useAudioBpm ? audioBpm : (propBpm || 128);
  const beatDuration = 60 / effectiveBpm;
  const intensityFactor = intensity / 100;

  const getArchetypeSprite = () => {
    switch (archetype) {
      case 'Firestorm':
        return {
          emoji: '🔥',
          colors: ['#ef4444', '#f97316', '#fbbf24'],
          glowColor: 'rgba(239, 68, 68, 0.6)',
          name: 'Firestorm',
        };
      case 'FrostPulse':
        return {
          emoji: '❄️',
          colors: ['#38bdf8', '#0ea5e9', '#06b6d4'],
          glowColor: 'rgba(56, 189, 248, 0.6)',
          name: 'FrostPulse',
        };
      case 'MoonWaver':
        return {
          emoji: '🌙',
          colors: ['#a855f7', '#9333ea', '#ec4899'],
          glowColor: 'rgba(168, 85, 247, 0.6)',
          name: 'MoonWaver',
        };
    }
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'top-left':
        return 'top-4 left-4';
      case 'top-right':
        return 'top-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'bottom-right':
        return 'bottom-4 right-4';
      case 'center':
        return 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2';
      default:
        return 'top-4 right-4';
    }
  };

  const sprite = getArchetypeSprite();

  return (
    <motion.div
      className={`fixed ${getPositionClasses()} z-30 pointer-events-none`}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0 }}
    >
      {/* Main Sprite Container */}
      <motion.div
        className="relative flex flex-col items-center"
        animate={{
          y: [0, -10 * intensityFactor, 0],
          scale: [1, 1 + (0.1 * intensityFactor), 1]
        }}
        transition={{
          duration: beatDuration,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        {/* Aura Glow */}
        <motion.div
          className="absolute inset-0 rounded-full blur-lg"
          style={{
            background: `radial-gradient(circle, ${sprite.glowColor} 0%, transparent 70%)`,
            width: '80px',
            height: '80px',
            transform: 'translate(-50%, -50%)',
            left: '50%',
            top: '50%',
          }}
          animate={{
            opacity: [0.3, 0.8 * intensityFactor, 0.3],
            scale: [0.8, 1.2, 0.8]
          }}
          transition={{
            duration: beatDuration * 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Sprite Avatar */}
        <motion.div
          className="relative z-10 w-12 h-12 rounded-full flex items-center justify-center text-2xl bg-bass-medium/80 backdrop-blur-sm border-2"
          style={{ borderColor: sprite.colors[0] }}
          animate={{
            borderColor: sprite.colors,
            boxShadow: [
              `0 0 10px ${sprite.glowColor}`,
              `0 0 20px ${sprite.glowColor}`,
              `0 0 10px ${sprite.glowColor}`
            ]
          }}
          transition={{
            duration: beatDuration,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <motion.span
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{
              duration: beatDuration * 0.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            {sprite.emoji}
          </motion.span>
        </motion.div>

        {/* Archetype Name Badge */}
        <motion.div
          className="mt-2 px-2 py-1 rounded-full text-xs font-medium bg-bass-dark/80 backdrop-blur-sm border"
          style={{ 
            borderColor: sprite.colors[0],
            color: sprite.colors[0]
          }}
          animate={{
            opacity: [0.7, 1, 0.7]
          }}
          transition={{
            duration: beatDuration * 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          {sprite.name}
        </motion.div>

        {/* Orbiting Particles */}
        {Array.from({ length: 3 }).map((_, i) => (
          <motion.div
            key={`orbit-${i}`}
            className="absolute w-2 h-2 rounded-full"
            style={{
              background: sprite.colors[i % sprite.colors.length],
              boxShadow: `0 0 6px ${sprite.colors[i % sprite.colors.length]}`
            }}
            animate={{
              rotate: [0, 360],
              scale: [0.5, 1, 0.5]
            }}
            transition={{
              rotate: {
                duration: beatDuration * 4,
                repeat: Infinity,
                ease: "linear"
              },
              scale: {
                duration: beatDuration,
                repeat: Infinity,
                delay: i * (beatDuration * 0.33),
                ease: "easeInOut"
              }
            }}
            style={{
              transformOrigin: `0 ${30 + i * 10}px`,
              left: '50%',
              top: '50%'
            }}
          />
        ))}
      </motion.div>
    </motion.div>
  );
};

export default ArchetypeAuraSprite;
