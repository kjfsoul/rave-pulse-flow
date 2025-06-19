
import { motion } from "framer-motion";
import BottomNavigation from "@/components/BottomNavigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Heart, Share2 } from "lucide-react";

const ShuffleFeed = () => {
  const challenges = [
    { id: 1, title: "🔥 Fire Mode Shuffle", difficulty: "Expert" },
    { id: 2, title: "❄️ Frost Glide Challenge", difficulty: "Intermediate" },
    { id: 3, title: "⚡ Lightning Step", difficulty: "Beginner" },
  ];

  return (
    <div className="min-h-screen bg-bass-dark relative pb-20">
      <div className="p-4 pt-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-neon-cyan mb-2">
            ⚡ Shuffle Challenges
          </h1>
          <p className="text-slate-400">Master the moves, climb the ranks</p>
        </motion.div>
        
        <div className="space-y-4">
          {challenges.map((challenge, index) => (
            <motion.div
              key={challenge.id}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-bass-medium border-neon-cyan/20 hover:border-neon-cyan/50 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-2">
                        {challenge.title}
                      </h3>
                      <Badge variant="outline" className="border-neon-purple text-neon-purple">
                        {challenge.difficulty}
                      </Badge>
                    </div>
                    <div className="flex space-x-3">
                      <Play className="w-6 h-6 text-neon-cyan cursor-pointer hover:scale-110 transition-transform" />
                      <Heart className="w-6 h-6 text-slate-500 hover:text-neon-pink cursor-pointer transition-colors" />
                      <Share2 className="w-6 h-6 text-slate-500 hover:text-neon-cyan cursor-pointer transition-colors" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
      <BottomNavigation />
    </div>
  );
};

export default ShuffleFeed;
