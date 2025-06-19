
import { motion } from "framer-motion";
import BottomNavigation from "@/components/BottomNavigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import NeonButton from "@/components/NeonButton";
import { TrendingUp } from "lucide-react";

const FestivalVotingStage = () => {
  const contestants = [
    { id: 1, name: "DJ CyberStorm", votes: 1240, percentage: 45 },
    { id: 2, name: "Bass Dreamer", votes: 890, percentage: 32 },
    { id: 3, name: "Neon Pulse", votes: 635, percentage: 23 },
  ];

  return (
    <div className="min-h-screen bg-bass-dark relative pb-20">
      <div className="p-4 pt-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <h1 className="text-3xl font-bold text-neon-cyan mb-2">
            🎪 Festival Voting Stage
          </h1>
          <p className="text-slate-400">Vote for the next headliner</p>
        </motion.div>
        
        <div className="space-y-4 mb-8">
          {contestants.map((contestant, index) => (
            <motion.div
              key={contestant.id}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-bass-medium border-neon-cyan/20 hover:border-neon-cyan/50 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-white">{contestant.name}</h3>
                      <p className="text-slate-400">{contestant.votes} votes</p>
                    </div>
                    <Badge className="bg-neon-purple/20 text-neon-purple">
                      #{index + 1}
                    </Badge>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-400">Progress</span>
                      <span className="text-sm text-neon-cyan">{contestant.percentage}%</span>
                    </div>
                    <div className="w-full bg-bass-dark rounded-full h-2">
                      <motion.div
                        className="bg-gradient-to-r from-neon-purple to-neon-cyan h-2 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${contestant.percentage}%` }}
                        transition={{ duration: 1, delay: index * 0.2 }}
                      />
                    </div>
                  </div>
                  
                  <NeonButton 
                    variant="secondary" 
                    size="sm"
                    className="w-full"
                  >
                    Vote to Headline
                  </NeonButton>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
        
        <Card className="bg-bass-medium border-neon-purple/20 p-6 text-center">
          <TrendingUp className="w-12 h-12 text-neon-purple mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Live Voting Active</h3>
          <p className="text-slate-400 mb-4">Results update in real-time</p>
          <Badge className="bg-neon-green/20 text-neon-green">
            🔴 LIVE
          </Badge>
        </Card>
      </div>
      <BottomNavigation />
    </div>
  );
};

export default FestivalVotingStage;
