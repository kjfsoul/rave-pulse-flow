import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { UserProfile } from "@/components/auth/UserProfile";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import BottomNavigation from "@/components/BottomNavigation";
import LaserRaveBackground from "@/components/LaserRaveBackground";

const Profile = () => {
  const { user } = useAuth();

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-bass-dark via-slate-900 to-bass-dark">
        <LaserRaveBackground />
        
        <div className="relative z-10 pb-20">
          <div className="container mx-auto px-4 py-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-8"
            >
              <h1 className="text-4xl font-bold bg-gradient-to-r from-neon-purple to-neon-pink bg-clip-text text-transparent mb-2">
                Your Profile
              </h1>
              <p className="text-slate-300 text-lg">
                Manage your rave identity and track your journey
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <UserProfile />
            </motion.div>
          </div>
        </div>

        <BottomNavigation />
      </div>
    </ProtectedRoute>
  );
};

export default Profile;