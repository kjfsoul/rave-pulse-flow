
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const LaserRaveBackground = () => {
  const [isAnimating, setIsAnimating] = useState(false);
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  // Start animation on user interaction (scroll or click)
  useEffect(() => {
    const handleUserInteraction = () => {
      // Clear existing timeout if any
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }

      // Start animation
      setIsAnimating(true);

      // Stop animation after 5 seconds
      animationTimeoutRef.current = setTimeout(() => {
        setIsAnimating(false);
        animationTimeoutRef.current = null;
      }, 5000);
    };

    // Listen for user interactions
    window.addEventListener('scroll', handleUserInteraction, { passive: true });
    window.addEventListener('click', handleUserInteraction);
    window.addEventListener('touchstart', handleUserInteraction, { passive: true });

    // Cleanup
    return () => {
      window.removeEventListener('scroll', handleUserInteraction);
      window.removeEventListener('click', handleUserInteraction);
      window.removeEventListener('touchstart', handleUserInteraction);
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
    };
  }, []);

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
          animate={isAnimating ? {
            rotate: [0, 360],
            opacity: [0.3, 1, 0.3],
          } : {
            rotate: 0,
            opacity: 0,
          }}
          transition={isAnimating ? {
            duration: laser.duration,
            repeat: Infinity,
            delay: laser.delay,
            ease: "linear",
          } : {
            duration: 0.5,
            ease: "easeOut",
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
          animate={isAnimating ? {
            x: [0, 50, -50, 0],
            y: [0, -30, 30, 0],
            opacity: [0.3, 0.7, 0.3],
          } : {
            x: 0,
            y: 0,
            opacity: 0,
          }}
          transition={isAnimating ? {
            duration: 8,
            repeat: Infinity,
            delay: particle.delay,
            ease: "easeInOut",
          } : {
            duration: 0.5,
            ease: "easeOut",
          }}
        />
      ))}

      {/* Strobe Flash Overlay */}
      <motion.div
        className="absolute inset-0"
        animate={isAnimating ? {
          backgroundColor: [
            "rgba(0, 0, 0, 0)",
            "rgba(191, 90, 242, 0.1)",
            "rgba(0, 0, 0, 0)",
            "rgba(6, 255, 165, 0.1)",
            "rgba(0, 0, 0, 0)",
          ],
        } : {
          backgroundColor: "rgba(0, 0, 0, 0)",
        }}
        transition={isAnimating ? {
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        } : {
          duration: 0.5,
          ease: "easeOut",
        }}
      />
    </div>
  );
};

export default LaserRaveBackground;
