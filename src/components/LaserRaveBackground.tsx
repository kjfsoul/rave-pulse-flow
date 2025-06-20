
import { motion } from "framer-motion";

const LaserRaveBackground = () => {
  const lasers = Array.from({ length: 8 }).map((_, index) => ({
    id: index,
    delay: Math.random() * 2,
    duration: Math.random() * 3 + 2,
    angle: Math.random() * 360,
    opacity: Math.random() * 0.6 + 0.4,
  }));

  const fogParticles = Array.from({ length: 15 }).map((_, index) => ({
    id: index,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 100 + 50,
    delay: Math.random() * 4,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Laser Beams */}
      {lasers.map((laser) => (
        <motion.div
          key={laser.id}
          className="absolute inset-0 origin-center"
          style={{
            background: `conic-gradient(from ${laser.angle}deg, transparent 0%, rgba(191, 90, 242, ${laser.opacity}) 1%, transparent 2%, transparent 98%, rgba(6, 255, 165, ${laser.opacity}) 99%, transparent 100%)`,
          }}
          animate={{
            rotate: [0, 360],
            opacity: [0.3, 1, 0.3],
          }}
          transition={{
            duration: laser.duration,
            repeat: Infinity,
            delay: laser.delay,
            ease: "linear",
          }}
        />
      ))}

      {/* Fog Effect */}
      {fogParticles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            background: "radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%)",
            filter: "blur(20px)",
          }}
          animate={{
            x: [0, 50, -50, 0],
            y: [0, -30, 30, 0],
            opacity: [0.3, 0.7, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            delay: particle.delay,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Strobe Flash Overlay */}
      <motion.div
        className="absolute inset-0"
        animate={{
          backgroundColor: [
            "rgba(0, 0, 0, 0)",
            "rgba(191, 90, 242, 0.1)",
            "rgba(0, 0, 0, 0)",
            "rgba(6, 255, 165, 0.1)",
            "rgba(0, 0, 0, 0)",
          ],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
};

export default LaserRaveBackground;
