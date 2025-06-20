
import { motion } from "framer-motion";

const PLUROrbsAnimation = () => {
  const plur = [
    { 
      label: "Peace", 
      color: "from-purple-400 to-purple-600", 
      shadow: "shadow-purple-500/50",
      angle: 0 
    },
    { 
      label: "Love", 
      color: "from-pink-400 to-red-500", 
      shadow: "shadow-pink-500/50",
      angle: 90 
    },
    { 
      label: "Unity", 
      color: "from-cyan-400 to-blue-500", 
      shadow: "shadow-cyan-500/50",
      angle: 180 
    },
    { 
      label: "Respect", 
      color: "from-green-400 to-emerald-500", 
      shadow: "shadow-green-500/50",
      angle: 270 
    },
  ];

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      {plur.map((orb, index) => (
        <motion.div
          key={orb.label}
          className={`absolute w-16 h-16 rounded-full bg-gradient-to-br ${orb.color} ${orb.shadow} opacity-80`}
          animate={{
            x: [
              Math.cos((orb.angle * Math.PI) / 180) * 120,
              Math.cos(((orb.angle + 360) * Math.PI) / 180) * 120,
            ],
            y: [
              Math.sin((orb.angle * Math.PI) / 180) * 120,
              Math.sin(((orb.angle + 360) * Math.PI) / 180) * 120,
            ],
            scale: [1, 1.2, 1],
            rotate: [0, 360],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            delay: index * 0.5,
            ease: "easeInOut",
          }}
        >
          <div className="absolute inset-0 rounded-full animate-ping opacity-30 bg-gradient-to-br from-white to-transparent" />
          <div className="flex items-center justify-center h-full text-xs font-bold text-white">
            {orb.label[0]}
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default PLUROrbsAnimation;
