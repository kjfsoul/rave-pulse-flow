
import React from 'react';
import { motion } from 'framer-motion';
import { useAudioContext } from '@/contexts/AudioContext';

interface ArchetypeAuraSpriteProps {
  archetype: 'Firestorm' | 'FrostPulse' | 'MoonWaver';
  bpm?: number;
  useAudioBpm?: boolean;
  intensity?: number; // 0-100
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
}

const ArchetypeAuraSprite: React.FC<ArchetypeAuraSpriteProps> = ({
  archetype,
  bpm: propBpm,
  useAudioBpm = false,
  intensity = 50,
  position = 'top-right'
}) => {
  const { bpm: audioBpm } = useAudioContext();
  const effectiveBpm = useAudioBpm ? audioBpm : (propBpm || 128);
  const beatDuration = 60 / effectiveBpm;

  const getArchetypeConfig = () => {
    switch (archetype) {
      case 'Firestorm':
        return {
          emoji: '🔥',
          primaryColor: '#ef4444',
          secondaryColor: '#f97316',
          glowColor: 'rgba(239, 68, 68, 0.6)',
          animation: 'aggressive'
        };
      case 'FrostPulse':
        return {
          emoji: '❄️',
          primaryColor: '#06b6d4',
          secondaryColor: '#3b82f6',
          glowColor: 'rgba(6, 182, 212, 0.6)',
          animation: 'smooth'
        };
      case 'MoonWaver':
        return {
          emoji: '🌙',
          primaryColor: '#a855f7',
          secondaryColor: '#ec4899',
          glowColor: 'rgba(168, 85, 247, 0.6)',
          animation: 'dreamy'
        };
    }
  };

  const config = getArchetypeConfig();
  const intensityMultiplier = intensity / 100;

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
        return 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2';
      default:
        return 'top-4 right-4';
    }
  };

  const getAnimationConfig = () => {
    const baseScale = 1 + (intensityMultiplier * 0.3);
    const pulseScale = baseScale + (intensityMultiplier * 0.2);

    switch (config.animation) {
      case 'aggressive':
        return {
          scale: [baseScale, pulseScale, baseScale],
          rotate: [-5, 5, -5],
          duration: beatDuration * 0.5
        };
      case 'smooth':
        return {
          scale: [baseScale, pulseScale * 0.8, baseScale],
          rotate: [-2, 2, -2],
          duration: beatDuration * 1.5
        };
      case 'dreamy':
        return {
          scale: [baseScale, pulseScale * 0.6, baseScale],
          rotate: [-10, 10, -10],
          duration: beatDuration * 2
        };
    }
  };

  const animConfig = getAnimationConfig();

  return (
    <div className={`fixed ${getPositionClasses()} z-30 pointer-events-none`}>
      {/* Main Avatar */}
      <motion.div
        className="relative w-20 h-20 rounded-full flex items-center justify-center backdrop-blur-sm"
        style={{
          background: `linear-gradient(135deg, ${config.primaryColor}, ${config.secondaryColor})`,
          boxShadow: `0 0 30px ${config.glowColor}`
        }}
        animate={{
          scale: animConfig.scale,
          rotate: animConfig.rotate,
          boxShadow: [
            `0 0 20px ${config.glowColor}`,
            `0 0 40px ${config.glowColor}`,
            `0 0 20px ${config.glowColor}`
          ]
        }}
        transition={{
          duration: animConfig.duration,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        {/* Emoji */}
        <motion.div
          className="text-3xl"
          animate={{
            y: archetype === 'Firestorm' ? [-2, 2, -2] : 
               archetype === 'FrostPulse' ? [-1, 1, -1] :
               [-3, 0, -3]
          }}
          transition={{
            duration: beatDuration,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          {config.emoji}
        </motion.div>

        {/* Pulsing Ring */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 opacity-60"
          style={{ borderColor: config.primaryColor }}
          animate={{
            scale: [1, 1.4, 1],
            opacity: [0.6, 0.2, 0.6]
          }}
          transition={{
            duration: beatDuration * 2,
            repeat: Infinity,
            ease: "easeOut"
          }}
        />
      </motion.div>

      {/* Floating Particles */}
      {Array.from({ length: 4 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full opacity-80"
          style={{
            background: i % 2 === 0 ? config.primaryColor : config.secondaryColor,
            left: `${30 + i * 15}%`,
            top: `${20 + (i % 2) * 60}%`
          }}
          animate={{
            y: [0, -15, 0],
            opacity: [0, 1, 0],
            scale: [0.5, 1, 0.5]
          }}
          transition={{
            duration: beatDuration * 3,
            repeat: Infinity,
            delay: i * (beatDuration * 0.5),
            ease: "easeInOut"
          }}
        />
      ))}

      {/* Energy Trails */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: `radial-gradient(circle, transparent 60%, ${config.glowColor} 100%)`
        }}
        animate={{
          scale: [0.8, 1.2, 0.8],
          opacity: [0.3, 0.1, 0.3]
        }}
        transition={{
          duration: beatDuration * 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </div>
  );
};

export default ArchetypeAuraSprite;
