
import { motion } from "framer-motion";
import BottomNavigation from "@/components/BottomNavigation";
import NeonButton from "@/components/NeonButton";

const ArchetypeQuiz = () => {
  return (
    <div className="min-h-screen bg-bass-dark relative pb-20">
      <div className="p-6 pt-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-4xl font-bold text-neon-purple mb-4">
            🎭 Discover Your Shuffle Archetype
          </h1>
          <p className="text-slate-300 mb-8">
            Answer a few questions to find your perfect EDM persona
          </p>
          
          <div className="bg-bass-medium rounded-lg p-8 neon-border mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">Coming Soon!</h2>
            <p className="text-slate-400">
              The archetype quiz is being fine-tuned to match your vibe perfectly.
            </p>
          </div>
          
          <NeonButton onClick={() => window.history.back()}>
            Back to Home
          </NeonButton>
        </motion.div>
      </div>
      <BottomNavigation />
    </div>
  );
};

export default ArchetypeQuiz;
