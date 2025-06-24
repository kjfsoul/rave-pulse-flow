
import React from 'react';
import { motion } from 'framer-motion';

const ConfettiBurst: React.FC = () => {
  const confettiColors = ['#bf5af2', '#06ffa5', '#1e40af', '#f72585', '#39ff14', '#ff6b35', '#ffd700'];
  
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {/* Main confetti burst */}
      {Array.from({ length: 100 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-sm"
          style={{
            backgroundColor: confettiColors[i % confettiColors.length],
            left: `${Math.random() * 100}%`,
            top: '-10px',
          }}
          initial={{ 
            y: -10,
            x: 0,
            rotate: 0,
            opacity: 1,
            scale: 1 
          }}
          animate={{ 
            y: window.innerHeight + 100,
            x: (Math.random() - 0.5) * 400, // Random horizontal drift
            rotate: 720 * (Math.random() > 0.5 ? 1 : -1),
            opacity: [1, 1, 0.8, 0],
            scale: [1, 1.2, 0.8, 0.4]
          }}
          transition={{
            duration: 4 + Math.random() * 2,
            delay: Math.random() * 1,
            ease: "easeOut"
          }}
        />
      ))}
      
      {/* Larger confetti pieces */}
      {Array.from({ length: 30 }).map((_, i) => (
        <motion.div
          key={`large-${i}`}
          className="absolute w-4 h-4 rounded-full"
          style={{
            backgroundColor: confettiColors[i % confettiColors.length],
            left: `${Math.random() * 100}%`,
            top: '-20px',
          }}
          initial={{ 
            y: -20,
            rotate: 0,
            opacity: 1,
            scale: 1 
          }}
          animate={{ 
            y: window.innerHeight + 150,
            rotate: 360 * (Math.random() > 0.5 ? 2 : -2),
            opacity: [1, 1, 0.5, 0],
            scale: [1, 1.5, 1, 0.3]
          }}
          transition={{
            duration: 5 + Math.random() * 2,
            delay: Math.random() * 0.8,
            ease: "easeOut"
          }}
        />
      ))}
      
      {/* Epic Drop Text */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: [0, 1, 1, 0], scale: [0.5, 1.3, 1.3, 0.8] }}
        transition={{ duration: 3, times: [0, 0.2, 0.8, 1] }}
      >
        <div className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-neon-purple to-neon-cyan bg-clip-text text-transparent text-center drop-shadow-2xl">
          🔥 EPIC DROP! 🔥
        </div>
      </motion.div>

      {/* Additional burst effects */}
      <motion.div
        className="absolute inset-0 bg-gradient-radial from-white/5 via-neon-purple/10 to-transparent"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: [0, 0.3, 0], scale: [0, 3, 6] }}
        transition={{ duration: 2, ease: "easeOut" }}
      />
    </div>
  );
};

export default ConfettiBurst;
