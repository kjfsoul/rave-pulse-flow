
import { motion } from "framer-motion";
import { ReactNode } from "react";

interface NeonButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary";
  size?: "sm" | "md" | "lg";
  className?: string;
  disabled?: boolean;
}

const NeonButton = ({ 
  children, 
  onClick, 
  variant = "primary", 
  size = "md",
  className = "",
  disabled = false
}: NeonButtonProps) => {
  const baseClasses = "relative font-semibold rounded-lg transition-all duration-300 overflow-hidden";
  
  const variants = {
    primary: "bg-gradient-to-r from-neon-purple to-neon-cyan text-bass-dark hover:shadow-lg hover:shadow-neon-purple/50",
    secondary: "bg-bass-medium text-neon-purple border border-neon-purple/50 hover:bg-neon-purple/10 hover:shadow-lg hover:shadow-neon-purple/30"
  };
  
  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg"
  };

  const disabledClasses = disabled ? "opacity-50 cursor-not-allowed" : "";

  return (
    <motion.button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${disabledClasses} ${className}`}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      whileHover={disabled ? {} : { scale: 1.05 }}
      whileTap={disabled ? {} : { scale: 0.95 }}
    >
      <motion.div
        className="absolute inset-0 shimmer-bg"
        animate={{ backgroundPosition: ["0% 0%", "100% 0%"] }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      />
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
};

export default NeonButton;
