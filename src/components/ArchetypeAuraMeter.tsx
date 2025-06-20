
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface ArchetypeAuraMeterProps {
  answers: string[];
  currentVibe: "fire" | "frost" | "wave" | null;
}

const ArchetypeAuraMeter = ({ answers, currentVibe }: ArchetypeAuraMeterProps) => {
  const [dominantArchetype, setDominantArchetype] = useState<string | null>(null);

  useEffect(() => {
    if (answers.length === 0) return;

    const counts = answers.reduce((acc, answer) => {
      acc[answer] = (acc[answer] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const dominant = Object.entries(counts).reduce((a, b) => 
      counts[a[0]] > counts[b[0]] ? a : b
    )[0];

    setDominantArchetype(dominant);
  }, [answers]);

  const getArchetypeColors = (archetype: string | null) => {
    switch (archetype) {
      case "Firestorm":
        return {
          primary: "rgba(239, 68, 68, 0.8)",
          secondary: "rgba(251, 146, 60, 0.6)",
          glow: "rgba(239, 68, 68, 0.4)"
        };
      case "FrostPulse":
        return {
          primary: "rgba(6, 255, 165, 0.8)",
          secondary: "rgba(56, 189, 248, 0.6)",
          glow: "rgba(6, 255, 165, 0.4)"
        };
      case "MoonWaver":
        return {
          primary: "rgba(191, 90, 242, 0.8)",
          secondary: "rgba(168, 85, 247, 0.6)",
          glow: "rgba(191, 90, 242, 0.4)"
        };
      default:
        return {
          primary: "rgba(148, 163, 184, 0.5)",
          secondary: "rgba(100, 116, 139, 0.3)",
          glow: "rgba(148, 163, 184, 0.2)"
        };
    }
  };

  const colors = getArchetypeColors(dominantArchetype);
  const intensity = Math.min(answers.length / 3, 1);

  return (
    <motion.div
      className="absolute top-1/4 right-8 z-20"
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.5, duration: 1 }}
    >
      {/* Main Aura Orb */}
      <motion.div
        className="relative w-24 h-24 rounded-full"
        animate={{
          scale: currentVibe ? [1, 1.3, 1] : [1, 1.1, 1],
          rotate: [0, 360],
        }}
        transition={{
          scale: { duration: currentVibe ? 0.5 : 2, repeat: Infinity },
          rotate: { duration: 8, repeat: Infinity, ease: "linear" }
        }}
        style={{
          background: `radial-gradient(circle, ${colors.primary} 0%, ${colors.secondary} 50%, transparent 100%)`,
          boxShadow: `0 0 ${20 + intensity * 30}px ${colors.glow}`
        }}
      >
        {/* Particle Cluster */}
        {Array.from({ length: 8 }).map((_, index) => (
          <motion.div
            key={index}
            className="absolute w-2 h-2 rounded-full"
            style={{
              background: colors.primary,
              left: '50%',
              top: '50%',
            }}
            animate={{
              x: [0, Math.cos(index * Math.PI / 4) * (30 + intensity * 20)],
              y: [0, Math.sin(index * Math.PI / 4) * (30 + intensity * 20)],
              opacity: [0.8, 0.3, 0.8],
              scale: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: index * 0.1,
              ease: "easeInOut"
            }}
          />
        ))}

        {/* Center Core */}
        <motion.div
          className="absolute inset-2 rounded-full"
          animate={{
            opacity: [0.8, 1, 0.8],
            scale: currentVibe ? [1, 1.5, 1] : [1, 1.2, 1]
          }}
          transition={{
            duration: currentVibe ? 0.3 : 1.5,
            repeat: Infinity
          }}
          style={{
            background: `radial-gradient(circle, ${colors.primary} 0%, transparent 70%)`,
          }}
        />
      </motion.div>

      {/* Archetype Label */}
      {dominantArchetype && (
        <motion.div
          className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          <div 
            className="text-xs font-semibold px-3 py-1 rounded-full border"
            style={{
              color: colors.primary,
              borderColor: colors.glow,
              background: `rgba(0, 0, 0, 0.5)`
            }}
          >
            {dominantArchetype}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default ArchetypeAuraMeter;
