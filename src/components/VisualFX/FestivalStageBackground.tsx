
import React from 'react';
import { motion } from 'framer-motion';
import { useAudioContext } from '@/contexts/AudioContext';

interface FestivalStageBackgroundProps {
  archetype: 'Firestorm' | 'FrostPulse' | 'MoonWaver';
  bpm?: number;
  intensity?: 'low' | 'high';
  useAudioBpm?: boolean;
}

const FestivalStageBackground: React.FC<FestivalStageBackgroundProps> = ({
  archetype,
  bpm: propBpm,
  intensity = 'high',
  useAudioBpm = false
}) => {
  const { bpm: audioBpm } = useAudioContext();
  const effectiveBpm = useAudioBpm ? audioBpm : (propBpm || 128);
  const beatDuration = 60 / effectiveBpm;
  const intensityMultiplier = intensity === 'high' ? 1 : 0.6;

  const getArchetypeConfig = () => {
    switch (archetype) {
      case 'Firestorm':
        return {
          primaryColor: 'rgba(239, 68, 68, 0.4)', // red-500
          secondaryColor: 'rgba(249, 115, 22, 0.3)', // orange-500
          accentColor: 'rgba(251, 191, 36, 0.2)', // amber-400
          particles: '🔥',
          gradientFrom: 'from-red-500/20',
          gradientTo: 'to-orange-500/10',
        };
      case 'FrostPulse':
        return {
          primaryColor: 'rgba(56, 189, 248, 0.4)', // sky-400
          secondaryColor: 'rgba(14, 165, 233, 0.3)', // sky-500
          accentColor: 'rgba(6, 182, 212, 0.2)', // cyan-500
          particles: '❄️',
          gradientFrom: 'from-sky-400/20',
          gradientTo: 'to-cyan-500/10',
        };
      case 'MoonWaver':
        return {
          primaryColor: 'rgba(168, 85, 247, 0.4)', // purple-500
          secondaryColor: 'rgba(147, 51, 234, 0.3)', // purple-600
          accentColor: 'rgba(236, 72, 153, 0.2)', // pink-500
          particles: '🌙',
          gradientFrom: 'from-purple-500/20',
          gradientTo: 'to-pink-500/10',
        };
    }
  };

  const config = getArchetypeConfig();

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Base Gradient Layer */}
      <motion.div
        className={`absolute inset-0 bg-gradient-radial ${config.gradientFrom} ${config.gradientTo}`}
        animate={{
          opacity: [0.3 * intensityMultiplier, 0.6 * intensityMultiplier, 0.3 * intensityMultiplier]
        }}
        transition={{
          duration: beatDuration * 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Pulsing Radial Waves */}
      {Array.from({ length: 3 }).map((_, i) => (
        <motion.div
          key={`wave-${i}`}
          className="absolute inset-0 rounded-full"
          style={{
            background: `radial-gradient(circle, ${config.primaryColor} 0%, transparent 70%)`,
            transform: 'translate(-50%, -50%)',
            left: '50%',
            top: '50%',
          }}
          animate={{
            scale: [0, 2, 0],
            opacity: [0.8, 0.2, 0]
          }}
          transition={{
            duration: beatDuration * 4,
            repeat: Infinity,
            delay: i * (beatDuration * 1.3),
            ease: "easeOut"
          }}
        />
      ))}

      {/* Corner Light Beams */}
      {[
        { from: 'top-0 left-0', direction: 'to-bottom-right' },
        { from: 'top-0 right-0', direction: 'to-bottom-left' },
        { from: 'bottom-0 left-0', direction: 'to-top-right' },
        { from: 'bottom-0 right-0', direction: 'to-top-left' }
      ].map((beam, i) => (
        <motion.div
          key={`beam-${i}`}
          className={`absolute ${beam.from} w-32 h-32`}
          style={{
            background: `linear-gradient(${beam.direction}, ${config.secondaryColor}, transparent)`
          }}
          animate={{
            opacity: [0.2, 0.6 * intensityMultiplier, 0.2],
            scale: [1, 1.2, 1]
          }}
          transition={{
            duration: beatDuration,
            repeat: Infinity,
            delay: i * (beatDuration * 0.25),
            ease: "easeInOut"
          }}
        />
      ))}

      {/* Floating Particles */}
      {Array.from({ length: intensity === 'high' ? 12 : 6 }).map((_, i) => (
        <motion.div
          key={`particle-${i}`}
          className="absolute text-2xl opacity-40"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [-20, -40, -20],
            x: [0, Math.sin(i) * 20, 0],
            rotate: [0, 360],
            opacity: [0.2, 0.6, 0.2]
          }}
          transition={{
            duration: beatDuration * 8 + Math.random() * 4,
            repeat: Infinity,
            delay: Math.random() * 2,
            ease: "easeInOut"
          }}
        >
          {config.particles}
        </motion.div>
      ))}

      {/* Central Spotlight */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        animate={{
          opacity: [0.1, 0.3 * intensityMultiplier, 0.1]
        }}
        transition={{
          duration: beatDuration * 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <div
          className="w-96 h-96 rounded-full"
          style={{
            background: `radial-gradient(circle, ${config.accentColor} 0%, transparent 70%)`
          }}
        />
      </motion.div>
    </div>
  );
};

export default FestivalStageBackground;
