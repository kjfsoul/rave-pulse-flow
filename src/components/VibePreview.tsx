
import { motion } from "framer-motion";

interface Archetype {
  id: string;
  name: string;
  emoji: string;
  color: string;
  gradient: string;
  description: string;
  vibe: string;
}

interface VibePreviewProps {
  archetype: Archetype;
  onLockFlow: () => void;
  onExploreMore: () => void;
}

const VibePreview = ({ archetype, onLockFlow, onExploreMore }: VibePreviewProps) => {
  const getVibeEffects = () => {
    switch (archetype.id) {
      case 'firestorm':
        return {
          particles: Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-orange-400 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                scale: [0, 1, 0],
                opacity: [0, 1, 0],
                y: [0, -50],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.1,
              }}
            />
          )),
          background: "bg-gradient-to-br from-red-900/30 to-orange-900/30"
        };
      case 'frostpulse':
        return {
          particles: Array.from({ length: 15 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-cyan-300 rounded-full opacity-40"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                x: [0, 30, -30, 0],
                y: [0, -20, 20, 0],
                opacity: [0.2, 0.6, 0.2],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          )),
          background: "bg-gradient-to-br from-cyan-900/30 to-blue-900/30"
        };
      case 'moonwaver':
        return {
          particles: Array.from({ length: 12 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-3 h-3 bg-purple-300 rounded-full opacity-30"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                scale: [0.5, 1.2, 0.5],
                opacity: [0.2, 0.8, 0.2],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                delay: i * 0.3,
              }}
            />
          )),
          background: "bg-gradient-to-br from-purple-900/30 to-pink-900/30"
        };
      default:
        return { particles: [], background: "" };
    }
  };

  const effects = getVibeEffects();

  return (
    <motion.div
      className={`fixed inset-0 z-40 ${effects.background} backdrop-blur-sm flex items-center justify-center`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {effects.particles}
      
      <motion.div
        className="bg-bass-medium/90 backdrop-blur-lg border border-neon-purple/30 rounded-2xl p-8 max-w-md mx-4 text-center"
        initial={{ scale: 0.8, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <motion.div
          className="text-6xl mb-4"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 5, -5, 0],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {archetype.emoji}
        </motion.div>
        
        <h2 className={`text-3xl font-bold mb-2 ${archetype.color}`}>
          {archetype.name}
        </h2>
        
        <p className="text-slate-300 mb-4">{archetype.description}</p>
        
        <motion.p
          className="text-neon-cyan mb-6 text-lg"
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          🌀 Looks like you're vibing with {archetype.name}
        </motion.p>
        
        <div className="flex flex-col gap-3">
          <motion.button
            onClick={onLockFlow}
            className={`bg-gradient-to-r ${archetype.gradient} text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-300`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            💫 Lock My Flow
          </motion.button>
          
          <motion.button
            onClick={onExploreMore}
            className="border border-neon-purple/50 text-neon-purple px-6 py-3 rounded-full font-semibold hover:bg-neon-purple/10 transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            🔁 Show Me Another Vibe
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default VibePreview;
