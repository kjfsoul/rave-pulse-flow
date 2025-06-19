
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
          className="bg-gradient-to-t from-neon-purple to-neon-cyan rounded-t-sm"
          style={{
            width: '3px',
            minHeight: '4px',
          }}
          animate={{
            height: [
              Math.random() * 20 + 10,
              Math.random() * 40 + 20,
              Math.random() * 60 + 30,
              Math.random() * 40 + 20,
              Math.random() * 20 + 10,
            ],
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: index * 0.05,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

export default EqualizerBars;
