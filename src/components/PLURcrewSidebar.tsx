
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Zap, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PLURcrewMember {
  id: string;
  name: string;
  archetype: "Firestorm" | "FrostPulse" | "MoonWaver";
  power: number;
  mood: number;
  avatar: string;
}

interface PLURcrewSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  crew: PLURcrewMember[];
}

const PLURcrewSidebar = ({ isOpen, onClose, crew }: PLURcrewSidebarProps) => {
  const getArchetypeColors = (archetype: string) => {
    switch (archetype) {
      case "Firestorm":
        return { bg: "bg-red-500/20", border: "border-red-500", glow: "shadow-red-500/50" };
      case "FrostPulse":
        return { bg: "bg-cyan-400/20", border: "border-cyan-400", glow: "shadow-cyan-400/50" };
      case "MoonWaver":
        return { bg: "bg-purple-500/20", border: "border-purple-500", glow: "shadow-purple-500/50" };
      default:
        return { bg: "bg-slate-500/20", border: "border-slate-500", glow: "shadow-slate-500/50" };
    }
  };

  const emptySlots = Math.max(0, 6 - crew.length);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/60 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed right-0 top-0 h-full w-80 bg-bass-medium border-l border-neon-cyan/30 z-50 p-6 overflow-y-auto"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 20 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-neon-cyan flex items-center gap-2">
                🌈 My PLURcrew
              </h2>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-4">
              {crew.map((member) => {
                const colors = getArchetypeColors(member.archetype);
                return (
                  <motion.div
                    key={member.id}
                    className={`p-4 rounded-lg border-2 ${colors.bg} ${colors.border} ${colors.glow} shadow-lg cursor-pointer hover:scale-105 transition-transform`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-neon-purple to-neon-cyan flex items-center justify-center text-lg">
                        {member.avatar}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-white">{member.name}</h3>
                        <p className="text-xs text-slate-400">{member.archetype}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1 bg-bass-dark rounded-full h-2">
                            <div 
                              className="bg-neon-cyan h-2 rounded-full transition-all duration-300"
                              style={{ width: `${member.power}%` }}
                            />
                          </div>
                          <span className="text-xs text-neon-cyan">{member.power}%</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
                      <span>Mood: {"💫".repeat(Math.ceil(member.mood / 25))}</span>
                      <Sparkles className="w-3 h-3 text-neon-purple" />
                    </div>
                  </motion.div>
                );
              })}

              {/* Empty Slots */}
              {Array.from({ length: emptySlots }).map((_, index) => (
                <motion.div
                  key={`empty-${index}`}
                  className="p-4 rounded-lg border-2 border-dashed border-slate-600 bg-slate-800/20 flex items-center justify-center h-20"
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <div className="text-center text-slate-500">
                    <Zap className="w-6 h-6 mx-auto mb-1" />
                    <p className="text-xs">Empty Slot</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-neon-purple/10 rounded-lg border border-neon-purple/30">
              <h3 className="font-semibold text-neon-purple mb-2">PLURcrew Power</h3>
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-neon-pink" />
                <span className="text-sm text-white">
                  Total Boost: +{crew.reduce((sum, member) => sum + member.power, 0)}%
                </span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default PLURcrewSidebar;
