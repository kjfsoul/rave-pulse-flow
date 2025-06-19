
import { motion } from "framer-motion";
import { Home, Zap, ShoppingBag, Music } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const BottomNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { icon: Home, label: "Explore", path: "/" },
    { icon: Zap, label: "Challenges", path: "/shuffle-feed" },
    { icon: ShoppingBag, label: "Marketplace", path: "/marketplace" },
    { icon: Music, label: "Festival", path: "/festival" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-bass-dark/95 backdrop-blur-lg border-t border-neon-purple/20 z-50">
      <div className="flex justify-around items-center py-3 px-4">
        {navItems.map((item, index) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          
          return (
            <motion.button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="flex flex-col items-center space-y-1 p-2 rounded-lg relative"
              whileTap={{ scale: 0.9 }}
            >
              <motion.div
                className={`p-2 rounded-lg transition-all duration-300 ${
                  isActive 
                    ? "bg-neon-purple/20 neon-glow" 
                    : "hover:bg-neon-purple/10"
                }`}
                animate={{
                  boxShadow: isActive 
                    ? "0 0 20px rgba(191, 90, 242, 0.5)" 
                    : "0 0 0px rgba(191, 90, 242, 0)"
                }}
              >
                <Icon 
                  className={`w-6 h-6 transition-colors duration-300 ${
                    isActive 
                      ? "text-neon-purple" 
                      : "text-slate-400 hover:text-neon-cyan"
                  }`}
                />
              </motion.div>
              <span 
                className={`text-xs transition-colors duration-300 ${
                  isActive 
                    ? "text-neon-purple font-medium" 
                    : "text-slate-500"
                }`}
              >
                {item.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavigation;
