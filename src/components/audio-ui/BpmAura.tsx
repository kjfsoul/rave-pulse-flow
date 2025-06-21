
import React from 'react';
import { motion } from 'framer-motion';
import { useAudioContext } from '@/contexts/AudioContext';

interface BpmAuraProps {
  bpm?: number;
  primary?: string;
  secondary?: string;
  className?: string;
}

const BpmAura: React.FC<BpmAuraProps> = ({
  bpm,
  primary = '#be6cff',
  secondary = '#00f0ff',
  className = ''
}) => {
  const audioContext = useAudioContext();
  const activeBpm = bpm || audioContext.bpm;
  
  // Convert BPM to milliseconds per beat
  const beatDuration = 60000 / activeBpm;

  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}>
      {/* Outer ring */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: `radial-gradient(circle, transparent 40%, ${primary}20 60%, transparent 80%)`
        }}
        animate={{
          scale: [1, 1.4, 1],
          opacity: [0.8, 0.2, 0.8]
        }}
        transition={{
          duration: beatDuration / 1000,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      {/* Inner core - opposite phase */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: `radial-gradient(circle, ${secondary}30 20%, transparent 50%)`
        }}
        animate={{
          scale: [1.1, 1, 1.1],
          opacity: [0.6, 1, 0.6]
        }}
        transition={{
          duration: beatDuration / 1000,
          repeat: Infinity,
          ease: "easeInOut",
          delay: (beatDuration / 1000) / 2 // Opposite phase
        }}
      />
    </div>
  );
};

export default BpmAura;
