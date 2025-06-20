
import { motion } from "framer-motion";
import { Flame, Zap } from "lucide-react";

interface PLURstreakMeterProps {
  streak: number;
  plurMeter: number;
}

const PLURstreakMeter = ({ streak, plurMeter }: PLURstreakMeterProps) => {
  const getPLUREmojis = (level: number) => {
    if (level >= 80) return "🫂❤️🌀💥";
    if (level >= 60) return "🫂❤️🌀";
    if (level >= 40) return "🫂❤️";
    if (level >= 20) return "🫂";
    return "";
  };

  return (
    <motion.div
      className="fixed top-4 left-4 z-30"
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.5 }}
    >
      {/* Streak Counter */}
      <motion.div
        className="bg-bass-medium/90 backdrop-blur-sm border border-neon-cyan/30 rounded-lg p-3 mb-3"
        animate={{ 
          boxShadow: [
            "0 0 10px rgba(6, 255, 165, 0.3)",
            "0 0 20px rgba(6, 255, 165, 0.6)",
            "0 0 10px rgba(6, 255, 165, 0.3)"
          ]
        }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Flame className="w-5 h-5 text-orange-400" />
          </motion.div>
          <div>
            <p className="text-xs text-slate-400">Daily Flow</p>
            <p className="text-lg font-bold text-neon-cyan">{streak}</p>
          </div>
        </div>
      </motion.div>

      {/* PLUR Meter */}
      <motion.div
        className="bg-bass-medium/90 backdrop-blur-sm border border-neon-purple/30 rounded-lg p-3"
        animate={{ 
          borderColor: [
            "rgba(191, 90, 242, 0.3)",
            "rgba(191, 90, 242, 0.6)",
            "rgba(191, 90, 242, 0.3)"
          ]
        }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <div className="flex items-center gap-2 mb-2">
          <Zap className="w-4 h-4 text-neon-purple" />
          <span className="text-xs text-slate-400">PLUR Meter</span>
        </div>
        
        <div className="w-32 h-2 bg-bass-dark rounded-full mb-2">
          <motion.div
            className="h-2 bg-gradient-to-r from-neon-purple to-neon-pink rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${plurMeter}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
        
        <div className="text-lg">
          {getPLUREmojis(plurMeter)}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PLURstreakMeter;
