
import { motion } from "framer-motion";

const FloatingSneakers = () => {
  const sneakers = [
    { id: 1, delay: 0, x: "20%", y: "30%" },
    { id: 2, delay: 1, x: "70%", y: "60%" },
    { id: 3, delay: 2, x: "40%", y: "80%" },
    { id: 4, delay: 1.5, x: "80%", y: "20%" },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {sneakers.map((sneaker) => (
        <motion.div
          key={sneaker.id}
          className="absolute w-8 h-8 opacity-20"
          style={{
            left: sneaker.x,
            top: sneaker.y,
          }}
          animate={{
            y: [0, -30, 0],
            rotate: [0, 10, -10, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            delay: sneaker.delay,
            ease: "easeInOut",
          }}
        >
          <div className="w-full h-full bg-gradient-to-br from-neon-purple to-neon-cyan rounded-lg transform rotate-12" />
        </motion.div>
      ))}
    </div>
  );
};

export default FloatingSneakers;
