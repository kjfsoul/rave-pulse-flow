
import { motion } from "framer-motion";
import { Home, Zap, ShoppingBag, Music, Dna, User } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const BottomNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const navItems = [
    { icon: Home, label: "Explore", path: "/" },
    { icon: Zap, label: "Challenges", path: "/shuffle-feed" },
    { icon: ShoppingBag, label: "Marketplace", path: "/marketplace" },
    { icon: Music, label: "Festival", path: "/festival" },
    { icon: Dna, label: "Archetype", path: "/archetype-quiz" },
    { icon: User, label: "Profile", path: "/profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-bass-dark/95 backdrop-blur-lg border-t border-neon-purple/20 z-50">
      <div className="flex justify-around items-center py-3 px-2">
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
                  className={`w-5 h-5 transition-colors duration-300 ${
                    isActive 
                      ? "text-neon-purple" 
                      : "text-slate-400 hover:text-neon-cyan"
                  }`}
                />
                {item.label === "Profile" && user && (
                  <motion.div
                    className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border border-bass-dark"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2 }}
                  />
                )}
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
