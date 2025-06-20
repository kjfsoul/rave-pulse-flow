
import { motion } from "framer-motion";

interface EqualizerBarsProps {
  barCount?: number;
  className?: string;
}

const EqualizerBars = ({ barCount = 20, className = "" }: EqualizerBarsProps) => {
  return (
    <div className={`flex items-end justify-center space-x-1 ${className}`}>
      {Array.from({ length: barCount }).map((_, index) => (
        <motion.div
          key={index}
          className="bg-gradient-to-t from-neon-purple via-neon-cyan to-white rounded-t-sm relative overflow-hidden"
          style={{
            width: '3px',
            minHeight: '4px',
          }}
          animate={{
            height: [
              Math.random() * 20 + 10,
              Math.random() * 60 + 40,
              Math.random() * 80 + 60,
              Math.random() * 40 + 30,
              Math.random() * 20 + 10,
            ],
            opacity: [0.7, 1, 0.8, 1, 0.7],
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: index * 0.03,
            ease: "easeInOut",
          }}
        >
          {/* Glow Effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-t from-neon-purple/50 to-neon-cyan/50 blur-sm"
            animate={{
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: index * 0.05,
            }}
          />
        </motion.div>
      ))}
    </div>
  );
};

export default EqualizerBars;
