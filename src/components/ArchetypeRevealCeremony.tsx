
import { motion } from "framer-motion";
import NeonButton from "./NeonButton";

interface ArchetypeRevealCeremonyProps {
  archetype: "Firestorm" | "FrostPulse" | "MoonWaver";
  onContinue: () => void;
  onRetake: () => void;
}

const archetypeData = {
  Firestorm: {
    emoji: "🔥",
    title: "Firestorm",
    description: "You are the chaos catalyst. Your shuffle burns bright with aggressive energy, sharp cuts, and explosive power. You thrive in the eye of the storm.",
    colors: {
      primary: "rgba(239, 68, 68, 0.9)",
      secondary: "rgba(251, 146, 60, 0.7)",
      glow: "rgba(239, 68, 68, 0.5)"
    }
  },
  FrostPulse: {
    emoji: "❄️",
    title: "FrostPulse",
    description: "You are liquid precision. Your shuffle flows like ice water, smooth and calculated. Every move is perfectly timed, every beat precisely caught.",
    colors: {
      primary: "rgba(6, 255, 165, 0.9)",
      secondary: "rgba(56, 189, 248, 0.7)",
      glow: "rgba(6, 255, 165, 0.5)"
    }
  },
  MoonWaver: {
    emoji: "🌙",
    title: "MoonWaver",
    description: "You are the dream dancer. Your shuffle waves through dimensions, hypnotic and ethereal. You move to the music's soul, not just its beat.",
    colors: {
      primary: "rgba(191, 90, 242, 0.9)",
      secondary: "rgba(168, 85, 247, 0.7)",
      glow: "rgba(191, 90, 242, 0.5)"
    }
  }
};

const ArchetypeRevealCeremony = ({ archetype, onContinue, onRetake }: ArchetypeRevealCeremonyProps) => {
  const data = archetypeData[archetype];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Cosmic Background Animation */}
      <motion.div
        className="absolute inset-0"
        animate={{
          background: [
            `radial-gradient(circle at 50% 50%, ${data.colors.glow} 0%, transparent 70%)`,
            `radial-gradient(circle at 30% 70%, ${data.colors.secondary} 0%, transparent 60%)`,
            `radial-gradient(circle at 70% 30%, ${data.colors.glow} 0%, transparent 70%)`,
          ]
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Expanding Badge Orb */}
      <motion.div
        className="relative mb-12"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 2, ease: "easeOut" }}
      >
        <motion.div
          className="w-40 h-40 rounded-full flex items-center justify-center relative"
          animate={{
            scale: [1, 1.1, 1],
            boxShadow: [
              `0 0 20px ${data.colors.glow}`,
              `0 0 60px ${data.colors.glow}`,
              `0 0 20px ${data.colors.glow}`
            ]
          }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{
            background: `radial-gradient(circle, ${data.colors.primary} 0%, ${data.colors.secondary} 100%)`,
          }}
        >
          <motion.div
            className="text-6xl"
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            {data.emoji}
          </motion.div>

          {/* Pulsing Ring */}
          <motion.div
            className="absolute inset-0 rounded-full border-4"
            style={{ borderColor: data.colors.primary }}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.8, 0, 0.8]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.div>

        {/* Orbiting Particles */}
        {Array.from({ length: 12 }).map((_, index) => (
          <motion.div
            key={index}
            className="absolute w-3 h-3 rounded-full"
            style={{
              background: data.colors.primary,
              left: '50%',
              top: '50%',
            }}
            animate={{
              x: [0, Math.cos(index * Math.PI / 6) * 100],
              y: [0, Math.sin(index * Math.PI / 6) * 100],
              opacity: [0, 1, 0],
              scale: [0, 1, 0]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: index * 0.1,
              ease: "easeOut"
            }}
          />
        ))}
      </motion.div>

      {/* Reveal Text */}
      <motion.div
        className="text-center max-w-2xl"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.5, delay: 1 }}
      >
        <motion.h1
          className="text-6xl font-bold mb-6"
          style={{ color: data.colors.primary }}
          animate={{
            textShadow: [
              `0 0 20px ${data.colors.glow}`,
              `0 0 40px ${data.colors.glow}`,
              `0 0 20px ${data.colors.glow}`
            ]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          You are {data.title}
        </motion.h1>

        <motion.p
          className="text-xl text-slate-300 mb-12 leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
        >
          {data.description}
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.5, duration: 1 }}
        >
          <NeonButton
            onClick={onContinue}
            size="lg"
            className="relative overflow-hidden group"
          >
            <motion.span
              className="flex items-center justify-center"
              whileHover={{ scale: 1.05 }}
            >
              🎧 Enter Your Shuffle Feed
            </motion.span>
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              initial={{ x: "-100%" }}
              whileHover={{ x: "100%" }}
              transition={{ duration: 0.6 }}
            />
          </NeonButton>

          <button
            onClick={onRetake}
            className="px-6 py-3 text-slate-400 hover:text-white border border-slate-600 hover:border-slate-400 rounded-lg transition-all duration-300"
          >
            🔄 Retake Quiz
          </button>
        </motion.div>
      </motion.div>

      {/* Subtle Back Button */}
      <motion.button
        onClick={() => window.history.back()}
        className="absolute bottom-8 left-8 text-slate-500 hover:text-slate-300 transition-colors duration-300 text-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3 }}
      >
        ← Back to Home
      </motion.button>
    </div>
  );
};

export default ArchetypeRevealCeremony;
