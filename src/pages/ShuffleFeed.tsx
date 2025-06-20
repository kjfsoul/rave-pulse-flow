
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import BottomNavigation from "@/components/BottomNavigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, Heart, Share2, Gamepad2, Sparkles, Users } from "lucide-react";
import PLURcrewSidebar from "@/components/PLURcrewSidebar";
import AvatarSummonModal from "@/components/AvatarSummonModal";
import PLURstreakMeter from "@/components/PLURstreakMeter";

interface Challenge {
  id: number;
  title: string;
  difficulty: string;
  archetype: "Firestorm" | "FrostPulse" | "MoonWaver";
  plurPower: number;
  bpm: number;
}

interface PLURcrewMember {
  id: string;
  name: string;
  archetype: "Firestorm" | "FrostPulse" | "MoonWaver";
  power: number;
  mood: number;
  avatar: string;
}

const ShuffleFeed = () => {
  const [crewSidebarOpen, setCrewSidebarOpen] = useState(false);
  const [summonModalOpen, setSummonModalOpen] = useState(false);
  const [newAvatar, setNewAvatar] = useState<any>(null);
  const [streak, setStreak] = useState(7);
  const [plurMeter, setPlurMeter] = useState(65);
  const [showCrewOverlay, setShowCrewOverlay] = useState(false);
  const [pulsingCard, setPulsingCard] = useState<number | null>(null);

  const [plurCrew, setPlurCrew] = useState<PLURcrewMember[]>([
    { id: "1", name: "BlazeTech", archetype: "Firestorm", power: 85, mood: 90, avatar: "🔥" },
    { id: "2", name: "CrystalFlow", archetype: "FrostPulse", power: 72, mood: 80, avatar: "❄️" },
    { id: "3", name: "VoidDancer", archetype: "MoonWaver", power: 68, mood: 95, avatar: "🌙" },
  ]);

  const challenges: Challenge[] = [
    { 
      id: 1, 
      title: "🔥 Fire Mode Shuffle", 
      difficulty: "Expert", 
      archetype: "Firestorm", 
      plurPower: 15, 
      bpm: 140 
    },
    { 
      id: 2, 
      title: "❄️ Frost Glide Challenge", 
      difficulty: "Intermediate", 
      archetype: "FrostPulse", 
      plurPower: 12, 
      bpm: 128 
    },
    { 
      id: 3, 
      title: "⚡ Lightning Step", 
      difficulty: "Beginner", 
      archetype: "MoonWaver", 
      plurPower: 8, 
      bpm: 120 
    },
    { 
      id: 4, 
      title: "🌊 Wave Rider Flow", 
      difficulty: "Expert", 
      archetype: "MoonWaver", 
      plurPower: 18, 
      bpm: 132 
    },
  ];

  const getArchetypeColors = (archetype: string) => {
    switch (archetype) {
      case "Firestorm":
        return { 
          border: "border-red-500/50 hover:border-red-400", 
          glow: "shadow-red-500/30", 
          bg: "bg-red-500/5" 
        };
      case "FrostPulse":
        return { 
          border: "border-cyan-400/50 hover:border-cyan-300", 
          glow: "shadow-cyan-400/30", 
          bg: "bg-cyan-400/5" 
        };
      case "MoonWaver":
        return { 
          border: "border-purple-500/50 hover:border-purple-400", 
          glow: "shadow-purple-500/30", 
          bg: "bg-purple-500/5" 
        };
      default:
        return { 
          border: "border-neon-cyan/20 hover:border-neon-cyan/50", 
          glow: "shadow-neon-cyan/20", 
          bg: "bg-neon-cyan/5" 
        };
    }
  };

  const handleCardInteraction = (challenge: Challenge) => {
    // Simulate BPM pulse
    setPulsingCard(challenge.id);
    setTimeout(() => setPulsingCard(null), 2000);

    // Increase PLUR meter
    setPlurMeter(prev => Math.min(100, prev + 5));

    // Random chance to summon new avatar (20% chance)
    if (Math.random() < 0.2) {
      const avatars = ["🎭", "🦄", "🔮", "⚡", "🌟", "🎪", "🎨", "🎯"];
      const names = ["VibeMaster", "FlowQueen", "BeatKing", "RaveAngel", "NeonSoul", "BassHero"];
      const archetypes: ("Firestorm" | "FrostPulse" | "MoonWaver")[] = ["Firestorm", "FrostPulse", "MoonWaver"];
      
      const newMember = {
        name: names[Math.floor(Math.random() * names.length)],
        archetype: archetypes[Math.floor(Math.random() * archetypes.length)],
        avatar: avatars[Math.floor(Math.random() * avatars.length)],
        power: Math.floor(Math.random() * 30) + 60,
      };

      setNewAvatar(newMember);
      setSummonModalOpen(true);
    }
  };

  const handleSummonClose = () => {
    if (newAvatar) {
      const newMember: PLURcrewMember = {
        id: Date.now().toString(),
        ...newAvatar,
        mood: Math.floor(Math.random() * 40) + 60,
      };
      setPlurCrew(prev => [...prev, newMember]);
    }
    setSummonModalOpen(false);
    setNewAvatar(null);
  };

  // Simulate BPM pulsing animation
  useEffect(() => {
    const interval = setInterval(() => {
      challenges.forEach(challenge => {
        if (pulsingCard === challenge.id) {
          // This would sync with BPM in a real app
        }
      });
    }, 60000 / 130); // ~130 BPM average

    return () => clearInterval(interval);
  }, [pulsingCard]);

  return (
    <div className="min-h-screen bg-bass-dark relative pb-20">
      <PLURstreakMeter streak={streak} plurMeter={plurMeter} />
      
      {/* Crew Overlay Toggle */}
      <div className="fixed top-4 right-4 z-30">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowCrewOverlay(!showCrewOverlay)}
          className="bg-bass-medium/90 backdrop-blur-sm border-neon-purple/30 text-neon-purple hover:bg-neon-purple/20"
        >
          🎴 {showCrewOverlay ? "Hide" : "Show"} Fam Overlay
        </Button>
      </div>

      {/* Crew Watermark */}
      {showCrewOverlay && (
        <motion.div
          className="fixed top-16 right-4 z-20 bg-bass-medium/70 backdrop-blur-sm rounded-lg p-2 border border-neon-cyan/30"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="flex gap-1">
            {plurCrew.slice(0, 3).map(member => (
              <div key={member.id} className="text-lg">{member.avatar}</div>
            ))}
          </div>
          <p className="text-xs text-neon-cyan">PLURcrew</p>
        </motion.div>
      )}

      <div className="p-4 pt-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-neon-cyan mb-2">
                ⚡ Remix Dojo
              </h1>
              <p className="text-slate-400">Master the moves, evolve your crew</p>
            </div>
            
            <motion.button
              onClick={() => setCrewSidebarOpen(true)}
              className="bg-gradient-to-r from-neon-purple to-neon-cyan text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg hover:shadow-neon-purple/50 transition-all duration-300 flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Users className="w-5 h-5" />
              🌈 Build My PLURcrew
            </motion.button>
          </div>
        </motion.div>
        
        <div className="space-y-4">
          {challenges.map((challenge, index) => {
            const colors = getArchetypeColors(challenge.archetype);
            const isPulsing = pulsingCard === challenge.id;
            
            return (
              <motion.div
                key={challenge.id}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={`${colors.bg} border-2 ${colors.border} ${colors.glow} shadow-xl transition-all duration-300 group overflow-hidden relative`}>
                  {/* Archetype Glow Ring */}
                  <motion.div
                    className="absolute inset-0 rounded-lg opacity-20"
                    animate={isPulsing ? {
                      boxShadow: [
                        `0 0 20px ${colors.glow.replace('/30', '/60')}`,
                        `0 0 40px ${colors.glow.replace('/30', '/80')}`,
                        `0 0 20px ${colors.glow.replace('/30', '/60')}`
                      ]
                    } : {}}
                    transition={{ duration: 60000 / challenge.bpm / 1000, repeat: isPulsing ? Infinity : 0 }}
                  />

                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-semibold text-white">
                            {challenge.title}
                          </h3>
                          <Badge variant="outline" className="border-neon-purple text-neon-purple">
                            PLURpower +{challenge.plurPower}%
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-4 mb-3">
                          <Badge variant="outline" className="border-neon-cyan text-neon-cyan">
                            {challenge.difficulty}
                          </Badge>
                          <span className="text-sm text-slate-400">
                            {challenge.bpm} BPM
                          </span>
                          <span className="text-sm text-neon-purple">
                            {challenge.archetype}
                          </span>
                        </div>

                        {/* Hover Overlay */}
                        <motion.div
                          className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                          initial={false}
                        >
                          <Button
                            size="sm"
                            onClick={() => handleCardInteraction(challenge)}
                            className="bg-neon-cyan/20 hover:bg-neon-cyan/40 text-neon-cyan border-neon-cyan/50 flex items-center gap-1"
                            variant="outline"
                          >
                            <Gamepad2 className="w-3 h-3" />
                            Remix This
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleCardInteraction(challenge)}
                            className="bg-neon-pink/20 hover:bg-neon-pink/40 text-neon-pink border-neon-pink/50 flex items-center gap-1"
                            variant="outline"
                          >
                            <Heart className="w-3 h-3" />
                            PLURit
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleCardInteraction(challenge)}
                            className="bg-neon-purple/20 hover:bg-neon-purple/40 text-neon-purple border-neon-purple/50 flex items-center gap-1"
                            variant="outline"
                          >
                            <Sparkles className="w-3 h-3" />
                            Evolve Fam
                          </Button>
                        </motion.div>
                      </div>
                      
                      <div className="flex space-x-3">
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Play className="w-6 h-6 text-neon-cyan cursor-pointer transition-colors" />
                        </motion.div>
                        <motion.div
                          whileHover={{ scale: 1.1, color: "#ec4899" }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Heart className="w-6 h-6 text-slate-500 hover:text-neon-pink cursor-pointer transition-colors" />
                        </motion.div>
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Share2 className="w-6 h-6 text-slate-500 hover:text-neon-cyan cursor-pointer transition-colors" />
                        </motion.div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      <PLURcrewSidebar
        isOpen={crewSidebarOpen}
        onClose={() => setCrewSidebarOpen(false)}
        crew={plurCrew}
      />

      <AvatarSummonModal
        isOpen={summonModalOpen}
        onClose={handleSummonClose}
        newAvatar={newAvatar}
      />

      <BottomNavigation />
    </div>
  );
};

export default ShuffleFeed;
