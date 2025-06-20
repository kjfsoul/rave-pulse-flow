
import { motion } from "framer-motion";

interface QuizBackgroundAnimationProps {
  vibe: "fire" | "frost" | "wave" | null;
}

const QuizBackgroundAnimation = ({ vibe }: QuizBackgroundAnimationProps) => {
  const getFireAnimation = () => (
    <div className="absolute inset-0">
      {/* Fire Sparks */}
      {Array.from({ length: 30 }).map((_, index) => (
        <motion.div
          key={`fire-${index}`}
          className="absolute w-1 h-1 bg-red-500 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -100, -200],
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: Math.random() * 2,
            ease: "easeOut"
          }}
        />
      ))}
      {/* Flicker Background */}
      <motion.div
        className="absolute inset-0"
        animate={{
          background: [
            "radial-gradient(circle at 30% 70%, rgba(239, 68, 68, 0.3) 0%, transparent 50%)",
            "radial-gradient(circle at 70% 30%, rgba(251, 146, 60, 0.4) 0%, transparent 50%)",
            "radial-gradient(circle at 50% 80%, rgba(239, 68, 68, 0.2) 0%, transparent 50%)",
          ]
        }}
        transition={{ duration: 0.5, repeat: Infinity }}
      />
    </div>
  );

  const getFrostAnimation = () => (
    <div className="absolute inset-0">
      {/* Glacial Waves */}
      {Array.from({ length: 5 }).map((_, index) => (
        <motion.div
          key={`frost-${index}`}
          className="absolute inset-0"
          animate={{
            background: [
              `linear-gradient(${45 + index * 30}deg, transparent 0%, rgba(6, 255, 165, 0.1) 30%, rgba(56, 189, 248, 0.2) 50%, transparent 70%)`,
              `linear-gradient(${45 + index * 30}deg, transparent 20%, rgba(6, 255, 165, 0.2) 50%, rgba(56, 189, 248, 0.1) 70%, transparent 90%)`,
            ]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: index * 0.5,
            ease: "easeInOut"
          }}
        />
      ))}
      {/* Ice Crystals */}
      {Array.from({ length: 15 }).map((_, index) => (
        <motion.div
          key={`crystal-${index}`}
          className="absolute w-2 h-2 bg-cyan-400 opacity-60"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            clipPath: "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)"
          }}
          animate={{
            rotate: [0, 360],
            scale: [0.5, 1, 0.5],
            opacity: [0.3, 0.8, 0.3]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            delay: Math.random() * 4,
            ease: "linear"
          }}
        />
      ))}
    </div>
  );

  const getWaveAnimation = () => (
    <div className="absolute inset-0">
      {/* Vaporwave Swirls */}
      {Array.from({ length: 8 }).map((_, index) => (
        <motion.div
          key={`wave-${index}`}
          className="absolute rounded-full border border-purple-500 opacity-30"
          style={{
            width: `${100 + index * 50}px`,
            height: `${100 + index * 50}px`,
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)'
          }}
          animate={{
            scale: [1, 2, 1],
            opacity: [0.1, 0.5, 0.1],
            rotate: [0, 180, 360]
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            delay: index * 0.3,
            ease: "easeInOut"
          }}
        />
      ))}
      {/* Dreamy Trails */}
      <motion.div
        className="absolute inset-0"
        animate={{
          background: [
            "radial-gradient(ellipse at 20% 30%, rgba(191, 90, 242, 0.2) 0%, transparent 50%)",
            "radial-gradient(ellipse at 80% 70%, rgba(168, 85, 247, 0.3) 0%, transparent 50%)",
            "radial-gradient(ellipse at 50% 20%, rgba(191, 90, 242, 0.15) 0%, transparent 50%)",
          ]
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );

  return (
    <motion.div
      className="absolute inset-0 pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: vibe ? 1 : 0 }}
      transition={{ duration: 0.8 }}
    >
      {vibe === "fire" && getFireAnimation()}
      {vibe === "frost" && getFrostAnimation()}
      {vibe === "wave" && getWaveAnimation()}
    </motion.div>
  );
};

export default QuizBackgroundAnimation;
