
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

const ScrollHintArrow = () => {
  return (
    <motion.div
      className="absolute bottom-8 left-1/2 transform -translate-x-1/2 cursor-pointer"
      animate={{
        y: [0, 10, 0],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      <motion.div
        className="relative"
        whileHover={{ scale: 1.1 }}
        onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
      >
        <ChevronDown 
          className="w-8 h-8 text-neon-cyan drop-shadow-lg" 
          style={{
            filter: "drop-shadow(0 0 10px rgba(6, 255, 165, 0.8))"
          }}
        />
        <motion.div
          className="absolute inset-0 rounded-full"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 0, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            background: "radial-gradient(circle, rgba(6, 255, 165, 0.3) 0%, transparent 70%)",
          }}
        />
      </motion.div>
    </motion.div>
  );
};

export default ScrollHintArrow;
