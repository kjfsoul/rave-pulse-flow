import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface DroneFormationsProps {
  isActive?: boolean;
  className?: string;
}

const DroneFormations = ({ isActive = true, className = "" }: DroneFormationsProps) => {
  const [formationPattern, setFormationPattern] = useState<'circle' | 'triangle' | 'wave' | 'scattered'>('circle');

  // Change formation pattern every 15 seconds
  useEffect(() => {
    if (!isActive) return;
    
    const patterns: Array<'circle' | 'triangle' | 'wave' | 'scattered'> = ['circle', 'triangle', 'wave', 'scattered'];
    let currentIndex = 0;
    
    const interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % patterns.length;
      setFormationPattern(patterns[currentIndex]);
    }, 15000);
    
    return () => clearInterval(interval);
  }, [isActive]);

  // Generate drone positions based on pattern
  const getDronePositions = (pattern: string, droneIndex: number, totalDrones: number) => {
    const centerX = 50; // Center percentage
    const centerY = 40; // Center percentage (upper area)
    
    switch (pattern) {
      case 'circle':
        const angle = (droneIndex / totalDrones) * 2 * Math.PI;
        const radius = 25;
        return {
          x: centerX + Math.cos(angle) * radius,
          y: centerY + Math.sin(angle) * radius * 0.6 // Flatter ellipse
        };
        
      case 'triangle':
        if (droneIndex < 3) {
          const triangleAngle = (droneIndex / 3) * 2 * Math.PI;
          const triangleRadius = 20;
          return {
            x: centerX + Math.cos(triangleAngle) * triangleRadius,
            y: centerY + Math.sin(triangleAngle) * triangleRadius * 0.6
          };
        } else {
          // Remaining drones form outer ring
          const outerAngle = ((droneIndex - 3) / (totalDrones - 3)) * 2 * Math.PI;
          const outerRadius = 35;
          return {
            x: centerX + Math.cos(outerAngle) * outerRadius,
            y: centerY + Math.sin(outerAngle) * outerRadius * 0.5
          };
        }
        
      case 'wave':
        const waveX = 20 + (droneIndex / totalDrones) * 60;
        const waveY = centerY + Math.sin((droneIndex / totalDrones) * 4 * Math.PI) * 15;
        return { x: waveX, y: waveY };
        
      case 'scattered':
      default:
        return {
          x: 15 + Math.random() * 70,
          y: 20 + Math.random() * 40
        };
    }
  };

  const drones = Array.from({ length: 8 }, (_, i) => {
    const position = getDronePositions(formationPattern, i, 8);
    const delay = i * 0.2;
    
    return (
      <motion.div
        key={`drone-${i}`}
        className="absolute w-3 h-3 pointer-events-none"
        initial={{ 
          left: `${position.x}%`, 
          top: `${position.y}%`,
          opacity: 0,
          scale: 0
        }}
        animate={{ 
          left: `${position.x}%`, 
          top: `${position.y}%`,
          opacity: isActive ? 0.8 : 0,
          scale: isActive ? 1 : 0
        }}
        transition={{
          duration: 3,
          delay: delay,
          ease: "easeInOut"
        }}
      >
        {/* Drone Body */}
        <motion.div
          className="relative w-full h-full"
          animate={{
            rotate: [0, 360]
          }}
          transition={{
            duration: 8 + i,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          {/* Main body */}
          <div className="absolute inset-0 bg-gradient-to-r from-neon-cyan to-neon-purple rounded-full shadow-lg">
            <div className="absolute inset-0.5 bg-bass-dark rounded-full" />
          </div>
          
          {/* Light beam effect */}
          <motion.div
            className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 w-0.5 bg-gradient-to-b from-neon-cyan to-transparent opacity-60"
            style={{ height: '2rem' }}
            animate={{
              opacity: [0.3, 0.8, 0.3],
              scaleY: [0.8, 1.2, 0.8]
            }}
            transition={{
              duration: 2 + i * 0.3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          {/* Propeller glow */}
          <motion.div
            className="absolute -inset-1 bg-neon-cyan rounded-full opacity-30 blur-sm"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.2, 0.4, 0.2]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.1
            }}
          />
        </motion.div>
        
        {/* Drone trail effect */}
        <motion.div
          className="absolute -inset-2 bg-gradient-to-r from-transparent via-neon-purple/20 to-transparent rounded-full blur-md"
          animate={{
            opacity: [0, 0.6, 0],
            scale: [0.5, 1.5, 0.5]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.5
          }}
        />
      </motion.div>
    );
  });

  if (!isActive) return null;

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      {/* Formation indicator */}
      <motion.div
        className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-bass-medium/80 backdrop-blur-sm rounded-lg px-3 py-1 z-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-xs text-neon-cyan font-medium">
          🚁 Drone Formation: {formationPattern.charAt(0).toUpperCase() + formationPattern.slice(1)}
        </div>
      </motion.div>
      
      {/* Drones */}
      {drones}
      
      {/* Ambient light effects */}
      <motion.div
        className="absolute inset-0 bg-gradient-radial from-neon-cyan/5 via-transparent to-transparent"
        animate={{
          opacity: [0.3, 0.6, 0.3],
          scale: [1, 1.1, 1]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </div>
  );
};

export default DroneFormations;