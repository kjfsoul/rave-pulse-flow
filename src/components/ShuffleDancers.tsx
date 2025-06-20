
import { motion } from "framer-motion";
import { useState } from "react";

interface Archetype {
  id: string;
  name: string;
  emoji: string;
  color: string;
  gradient: string;
  description: string;
  vibe: string;
}

interface ShuffleDancersProps {
  onArchetypeSelect: (archetype: Archetype) => void;
  selectedArchetype: Archetype | null;
}

const ShuffleDancers = ({ onArchetypeSelect, selectedArchetype }: ShuffleDancersProps) => {
  const [hoveredDancer, setHoveredDancer] = useState<string | null>(null);

  const archetypes: Archetype[] = [
    {
      id: "firestorm",
      name: "Firestorm",
      emoji: "🔥",
      color: "text-red-400",
      gradient: "from-red-500 to-orange-500",
      description: "High energy • Fast beats • Explosive moves",
      vibe: "Feel the heat rise"
    },
    {
      id: "frostpulse",
      name: "FrostPulse", 
      emoji: "❄️",
      color: "text-cyan-400",
      gradient: "from-cyan-400 to-blue-500",
      description: "Cool flow • Smooth steps • Glacial grace",
      vibe: "Chill with precision"
    },
    {
      id: "moonwaver",
      name: "MoonWaver",
      emoji: "🌙",
      color: "text-purple-400", 
      gradient: "from-purple-500 to-pink-500",
      description: "Dreamy vibes • Ambient pulse • Ethereal motion",
      vibe: "Float between worlds"
    }
  ];

  return (
    <div className="flex justify-center items-center gap-8 md:gap-16">
      {archetypes.map((archetype, index) => {
        const isSelected = selectedArchetype?.id === archetype.id;
        const isHovered = hoveredDancer === archetype.id;
        
        return (
          <motion.div
            key={archetype.id}
            className="relative cursor-pointer group"
            onMouseEnter={() => setHoveredDancer(archetype.id)}
            onMouseLeave={() => setHoveredDancer(null)}
            onClick={() => onArchetypeSelect(archetype)}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.2, duration: 0.8 }}
          >
            {/* Dancer Container */}
            <motion.div
              className={`relative w-32 h-32 md:w-40 md:h-40 rounded-full flex items-center justify-center ${
                isSelected ? 'ring-4 ring-white ring-opacity-50' : ''
              }`}
              style={{
                background: `linear-gradient(135deg, ${
                  archetype.id === 'firestorm' ? '#ef4444, #f97316' :
                  archetype.id === 'frostpulse' ? '#06b6d4, #3b82f6' :
                  '#a855f7, #ec4899'
                })`,
              }}
              animate={isSelected || isHovered ? {
                boxShadow: [
                  `0 0 20px ${archetype.id === 'firestorm' ? '#ef4444' : archetype.id === 'frostpulse' ? '#06b6d4' : '#a855f7'}`,
                  `0 0 40px ${archetype.id === 'firestorm' ? '#f97316' : archetype.id === 'frostpulse' ? '#3b82f6' : '#ec4899'}`,
                  `0 0 20px ${archetype.id === 'firestorm' ? '#ef4444' : archetype.id === 'frostpulse' ? '#06b6d4' : '#a855f7'}`,
                ]
              } : {}}
              transition={{ duration: 2, repeat: Infinity }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Dancing Animation */}
              <motion.div
                className="text-6xl md:text-7xl"
                animate={{
                  y: archetype.id === 'firestorm' ? [-5, 5, -5] : 
                     archetype.id === 'frostpulse' ? [-2, 2, -2] :
                     [-3, 0, -3],
                  rotate: archetype.id === 'firestorm' ? [-5, 5, -5] :
                          archetype.id === 'frostpulse' ? [-2, 2, -2] :
                          [-10, 10, -10],
                }}
                transition={{
                  duration: archetype.id === 'firestorm' ? 0.4 :
                           archetype.id === 'frostpulse' ? 1.2 :
                           0.8,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                {archetype.emoji}
              </motion.div>

              {/* Particle Effects */}
              {(isSelected || isHovered) && (
                <div className="absolute inset-0">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-2 h-2 rounded-full opacity-60"
                      style={{
                        background: archetype.id === 'firestorm' ? '#f97316' :
                                   archetype.id === 'frostpulse' ? '#06b6d4' :
                                   '#ec4899',
                        left: `${20 + i * 15}%`,
                        top: `${20 + (i % 2) * 60}%`,
                      }}
                      animate={{
                        scale: [0, 1, 0],
                        opacity: [0, 1, 0],
                        y: [0, -20, -40],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        delay: i * 0.2,
                      }}
                    />
                  ))}
                </div>
              )}
            </motion.div>

            {/* Archetype Info */}
            <motion.div
              className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: isHovered || isSelected ? 1 : 0.7 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className={`text-xl font-bold ${archetype.color} mb-1`}>
                {archetype.name}
              </h3>
              <p className="text-sm text-slate-400">{archetype.vibe}</p>
              
              {(isHovered || isSelected) && (
                <motion.p
                  className="text-xs text-slate-500 mt-1"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  {archetype.description}
                </motion.p>
              )}
            </motion.div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default ShuffleDancers;
