import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

interface FestivalEnvironmentProps {
  className?: string;
  currentArchetype?: 'Firestorm' | 'FrostPulse' | 'MoonWaver';
}

const FestivalEnvironment = ({ className = "", currentArchetype = 'MoonWaver' }: FestivalEnvironmentProps) => {
  const [nightCycle, setNightCycle] = useState(0); // 0-1 for night intensity

  // Night cycle animation
  useEffect(() => {
    const interval = setInterval(() => {
      setNightCycle(prev => (prev + 0.01) % 1);
    }, 200);
    return () => clearInterval(interval);
  }, []);

  // Generate stars
  const stars = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 60,
    size: Math.random() * 2 + 1,
    twinkleDelay: Math.random() * 3,
  }));

  // Generate water stations
  const waterStations = [
    { id: 1, x: 15, y: 75, type: 'fountain' },
    { id: 2, x: 85, y: 80, type: 'mist' },
    { id: 3, x: 50, y: 85, type: 'hydration' },
  ];

  // Generate nature elements
  const trees = [
    { id: 1, x: 5, y: 60, height: 'tall' },
    { id: 2, x: 12, y: 65, height: 'medium' },
    { id: 3, x: 88, y: 58, height: 'tall' },
    { id: 4, x: 95, y: 68, height: 'short' },
  ];

  // Archetype group areas
  const archetypeGroups = [
    { archetype: 'Firestorm', x: 20, y: 70, color: '#ef4444', emoji: '🔥', count: 8 },
    { archetype: 'FrostPulse', x: 80, y: 65, color: '#06b6d4', emoji: '❄️', count: 6 },
    { archetype: 'MoonWaver', x: 50, y: 75, color: '#8b5cf6', emoji: '🌙', count: 12 },
  ];

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      {/* Night Sky Gradient */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to bottom, 
            #0f0f23 0%, 
            #1a1a2e 30%, 
            #16213e 60%, 
            #0f172a 100%)`
        }}
        animate={{
          opacity: [0.8, 0.9, 0.8]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Stars */}
      {stars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute bg-white rounded-full"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
          }}
          animate={{
            opacity: [0.3, 1, 0.3],
            scale: [0.8, 1.2, 0.8]
          }}
          transition={{
            duration: 2 + star.twinkleDelay,
            repeat: Infinity,
            ease: "easeInOut",
            delay: star.twinkleDelay
          }}
        />
      ))}

      {/* Moon */}
      <motion.div
        className="absolute w-16 h-16 bg-gradient-to-br from-yellow-200 to-yellow-400 rounded-full shadow-lg"
        style={{ right: '10%', top: '15%' }}
        animate={{
          boxShadow: [
            '0 0 20px rgba(255, 255, 150, 0.5)',
            '0 0 40px rgba(255, 255, 150, 0.8)',
            '0 0 20px rgba(255, 255, 150, 0.5)'
          ]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        {/* Moon craters */}
        <div className="absolute w-2 h-2 bg-yellow-600 rounded-full top-2 left-3 opacity-30" />
        <div className="absolute w-1 h-1 bg-yellow-600 rounded-full top-6 right-4 opacity-40" />
        <div className="absolute w-1.5 h-1.5 bg-yellow-600 rounded-full bottom-3 left-2 opacity-35" />
      </motion.div>

      {/* Trees/Nature */}
      {trees.map((tree) => (
        <motion.div
          key={tree.id}
          className="absolute"
          style={{ left: `${tree.x}%`, bottom: `${100 - tree.y}%` }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1, delay: tree.id * 0.2 }}
        >
          {/* Tree trunk */}
          <div className="relative">
            <div 
              className={`w-3 bg-gradient-to-t from-amber-900 to-amber-700 ${
                tree.height === 'tall' ? 'h-20' : tree.height === 'medium' ? 'h-14' : 'h-10'
              }`} 
            />
            {/* Tree foliage */}
            <motion.div
              className={`absolute -top-6 -left-4 w-10 ${
                tree.height === 'tall' ? 'h-12' : tree.height === 'medium' ? 'h-10' : 'h-8'
              } bg-gradient-to-b from-green-600 to-green-800 rounded-full`}
              animate={{
                scale: [1, 1.05, 1]
              }}
              transition={{
                duration: 3 + tree.id,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            {/* Tree glow */}
            <motion.div
              className="absolute -top-8 -left-6 w-14 h-16 bg-green-400 rounded-full opacity-20 blur-md"
              animate={{
                opacity: [0.1, 0.3, 0.1]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: tree.id * 0.5
              }}
            />
          </div>
        </motion.div>
      ))}

      {/* Water Stations */}
      {waterStations.map((station) => (
        <motion.div
          key={station.id}
          className="absolute"
          style={{ left: `${station.x}%`, bottom: `${100 - station.y}%` }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: station.id * 0.3 }}
        >
          {station.type === 'fountain' && (
            <div className="relative">
              {/* Fountain base */}
              <div className="w-8 h-4 bg-gradient-to-t from-slate-600 to-slate-400 rounded-t-lg" />
              {/* Water effect */}
              <motion.div
                className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-1 h-6 bg-gradient-to-t from-cyan-400 to-transparent"
                animate={{
                  height: ['1.5rem', '2rem', '1.5rem'],
                  opacity: [0.6, 1, 0.6]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              {/* Water particles */}
              {Array.from({ length: 3 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-cyan-300 rounded-full"
                  style={{
                    left: `${50 + (i - 1) * 20}%`,
                    top: '-0.5rem'
                  }}
                  animate={{
                    y: [0, -10, 0],
                    opacity: [0, 1, 0]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * 0.3
                  }}
                />
              ))}
            </div>
          )}
          
          {station.type === 'mist' && (
            <div className="relative">
              {/* Mist station */}
              <div className="w-6 h-6 bg-gradient-to-t from-blue-600 to-blue-400 rounded-full" />
              {/* Mist effect */}
              <motion.div
                className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-12 h-8 bg-cyan-200 rounded-full opacity-30 blur-sm"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.2, 0.5, 0.2]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </div>
          )}
          
          {station.type === 'hydration' && (
            <div className="relative">
              {/* Hydration tent */}
              <div className="w-10 h-6 bg-gradient-to-t from-purple-600 to-purple-400 rounded-t-lg" />
              <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 text-xs">💧</div>
              {/* Glow effect */}
              <motion.div
                className="absolute -inset-2 bg-purple-400 rounded-lg opacity-20 blur-md"
                animate={{
                  opacity: [0.1, 0.4, 0.1]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </div>
          )}
        </motion.div>
      ))}

      {/* Archetype Groups */}
      {archetypeGroups.map((group) => (
        <motion.div
          key={group.archetype}
          className="absolute"
          style={{ left: `${group.x}%`, bottom: `${100 - group.y}%` }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          {/* Group indicator */}
          <motion.div
            className="relative w-16 h-8 rounded-full flex items-center justify-center text-sm font-bold"
            style={{ 
              backgroundColor: `${group.color}20`,
              border: `2px solid ${group.color}60`
            }}
            animate={{
              boxShadow: [
                `0 0 10px ${group.color}40`,
                `0 0 20px ${group.color}60`,
                `0 0 10px ${group.color}40`
              ]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <span className="mr-1">{group.emoji}</span>
            <span className="text-white text-xs">{group.count}</span>
          </motion.div>
          
          {/* Individual ravers */}
          {Array.from({ length: Math.min(group.count, 6) }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full"
              style={{
                backgroundColor: group.color,
                left: `${-20 + i * 8 + Math.random() * 10}px`,
                top: `${-10 + Math.random() * 20}px`
              }}
              animate={{
                y: [0, -3, 0],
                opacity: [0.6, 1, 0.6]
              }}
              transition={{
                duration: 1.5 + i * 0.2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.1
              }}
            />
          ))}
          
          {/* Group highlight for current user's archetype */}
          {group.archetype === currentArchetype && (
            <motion.div
              className="absolute -inset-4 rounded-full border-2 border-white"
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.3, 0.7, 0.3]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          )}
        </motion.div>
      ))}

      {/* Floating festival elements */}
      <motion.div
        className="absolute bottom-10 left-1/4 text-2xl"
        animate={{
          y: [0, -10, 0],
          rotate: [0, 5, 0]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        🎪
      </motion.div>
      
      <motion.div
        className="absolute bottom-16 right-1/4 text-xl"
        animate={{
          y: [0, -8, 0],
          rotate: [0, -3, 0]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
      >
        🎨
      </motion.div>
    </div>
  );
};

export default FestivalEnvironment;