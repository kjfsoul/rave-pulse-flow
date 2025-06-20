
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NewAvatar {
  name: string;
  archetype: "Firestorm" | "FrostPulse" | "MoonWaver";
  avatar: string;
  power: number;
}

interface AvatarSummonModalProps {
  isOpen: boolean;
  onClose: () => void;
  newAvatar: NewAvatar | null;
}

const AvatarSummonModal = ({ isOpen, onClose, newAvatar }: AvatarSummonModalProps) => {
  if (!newAvatar) return null;

  const getArchetypeColors = (archetype: string) => {
    switch (archetype) {
      case "Firestorm":
        return { from: "from-red-500", to: "to-orange-400", glow: "shadow-red-500/50" };
      case "FrostPulse":
        return { from: "from-cyan-400", to: "to-blue-500", glow: "shadow-cyan-400/50" };
      case "MoonWaver":
        return { from: "from-purple-500", to: "to-pink-400", glow: "shadow-purple-500/50" };
      default:
        return { from: "from-slate-500", to: "to-slate-400", glow: "shadow-slate-500/50" };
    }
  };

  const colors = getArchetypeColors(newAvatar.archetype);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Confetti Animation */}
          {Array.from({ length: 20 }).map((_, index) => (
            <motion.div
              key={index}
              className="absolute w-2 h-2 bg-neon-cyan rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -100, -200],
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
                rotate: [0, 360],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}

          <motion.div
            className="bg-bass-medium border-2 border-neon-cyan rounded-lg p-8 text-center max-w-md w-full"
            initial={{ scale: 0, rotateY: 180 }}
            animate={{ scale: 1, rotateY: 0 }}
            exit={{ scale: 0, rotateY: 180 }}
            transition={{ type: "spring", damping: 15 }}
          >
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="mb-6"
            >
              <Sparkles className="w-12 h-12 text-neon-purple mx-auto" />
            </motion.div>

            <h2 className="text-2xl font-bold text-neon-cyan mb-4">
              🎉 New PLURcrew Member!
            </h2>

            <motion.div
              className={`w-24 h-24 rounded-full bg-gradient-to-br ${colors.from} ${colors.to} ${colors.glow} shadow-2xl flex items-center justify-center text-3xl mx-auto mb-4`}
              animate={{ 
                scale: [1, 1.2, 1],
                boxShadow: [
                  "0 0 20px rgba(191, 90, 242, 0.5)",
                  "0 0 40px rgba(6, 255, 165, 0.8)",
                  "0 0 20px rgba(191, 90, 242, 0.5)"
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {newAvatar.avatar}
            </motion.div>

            <h3 className="text-xl font-semibold text-white mb-2">
              {newAvatar.name}
            </h3>
            <p className="text-neon-purple mb-2">{newAvatar.archetype}</p>
            <div className="flex items-center justify-center gap-2 mb-6">
              <Star className="w-4 h-4 text-neon-cyan" />
              <span className="text-neon-cyan">Power: {newAvatar.power}%</span>
            </div>

            <Button
              onClick={onClose}
              className="bg-gradient-to-r from-neon-purple to-neon-cyan hover:from-neon-cyan hover:to-neon-purple transition-all duration-300"
            >
              Add to PLURcrew
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AvatarSummonModal;
