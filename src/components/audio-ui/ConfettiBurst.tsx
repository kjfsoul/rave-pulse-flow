
import React from 'react';
import { motion } from 'framer-motion';

const ConfettiBurst: React.FC = () => {
  const confettiColors = ['#bf5af2', '#06ffa5', '#1e40af', '#f72585', '#39ff14'];
  
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {Array.from({ length: 50 }).map((_, i) => (
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
            rotate: 0,
            opacity: 1,
            scale: 1 
          }}
          animate={{ 
            y: window.innerHeight + 100,
            rotate: 360 * (Math.random() > 0.5 ? 1 : -1),
            opacity: [1, 1, 0],
            scale: [1, 0.8, 0.6]
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            delay: Math.random() * 0.5,
            ease: "easeOut"
          }}
        />
      ))}
      
      {/* Crowd Cheer Text */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: [0, 1, 1, 0], scale: [0.5, 1.2, 1.2, 0.8] }}
        transition={{ duration: 2, times: [0, 0.2, 0.8, 1] }}
      >
        <div className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-neon-purple to-neon-cyan bg-clip-text text-transparent text-center">
          🔥 EPIC DROP! 🔥
        </div>
      </motion.div>
    </div>
  );
};

export default ConfettiBurst;
