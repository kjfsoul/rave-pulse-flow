
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import BottomNavigation from "@/components/BottomNavigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import NeonButton from "@/components/NeonButton";
import EqualizerBars from "@/components/EqualizerBars";
import { Volume2, VolumeX, Play, Users, Crown, Zap } from "lucide-react";

const FestivalVotingStage = () => {
  const [selectedDJ, setSelectedDJ] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentBPM, setCurrentBPM] = useState(128);
  const [votes, setVotes] = useState<{[key: number]: number}>({
    1: 1240,
    2: 890,
    3: 635,
    4: 420
  });
  const [headliner, setHeadliner] = useState<number | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [crowdReactions, setCrowdReactions] = useState<string[]>([
    "🔥 This beat is insane!",
    "💃 Can't stop dancing!",
    "🎵 Best drop ever!",
    "⚡ Energy through the roof!"
  ]);

  const djs = [
    {
      id: 1,
      name: "DJ CyberStorm",
      archetype: "Firestorm",
      genre: "Hard Dance",
      track: "Digital Inferno",
      bpm: 140,
      gradient: "from-red-500 via-orange-500 to-yellow-500",
      color: "text-red-400"
    },
    {
      id: 2,
      name: "Bass Dreamer",
      archetype: "FrostPulse",
      genre: "Future Bass",
      track: "Glacial Waves",
      bpm: 110,
      gradient: "from-cyan-400 via-blue-500 to-purple-500",
      color: "text-cyan-400"
    },
    {
      id: 3,
      name: "Neon Pulse",
      archetype: "MoonWaver",
      genre: "Ambient Trance",
      track: "Cosmic Dreams",
      bpm: 126,
      gradient: "from-purple-500 via-pink-500 to-indigo-500",
      color: "text-purple-400"
    },
    {
      id: 4,
      name: "Phoenix Rise",
      archetype: "Firestorm",
      genre: "Progressive House",
      track: "Solar Flare",
      bpm: 132,
      gradient: "from-orange-500 via-red-500 to-pink-500",
      color: "text-orange-400"
    }
  ];

  const handleDJPreview = (dj: typeof djs[0]) => {
    setSelectedDJ(dj.id);
    setCurrentBPM(dj.bpm);
    setIsPlaying(true);
  };

  const handleVote = (djId: number) => {
    setVotes(prev => ({
      ...prev,
      [djId]: prev[djId] + 1
    }));
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 2000);
  };

  const handleTurntableInteraction = (action: string) => {
    // Simulate turntable effects
    if (action === 'scratch') {
      setCurrentBPM(prev => prev + 5);
      setTimeout(() => setCurrentBPM(prev => prev - 5), 500);
    }
  };

  useEffect(() => {
    // Check for headliner after votes
    const maxVotes = Math.max(...Object.values(votes));
    const headlinerId = Object.entries(votes).find(([_, v]) => v === maxVotes)?.[0];
    if (headlinerId && maxVotes > 1500) {
      setHeadliner(parseInt(headlinerId));
    }
  }, [votes]);

  const selectedDJData = djs.find(dj => dj.id === selectedDJ);

  return (
    <div className="min-h-screen bg-bass-dark relative pb-20 overflow-hidden">
      {/* Festival Arena Background */}
      <div className="absolute inset-0">
        {/* Crowd Silhouettes */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/80 to-transparent">
          <div className="absolute bottom-0 w-full h-16 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse" />
        </div>
        
        {/* Dynamic Background based on selected DJ */}
        <motion.div
          className="absolute inset-0"
          animate={{
            background: selectedDJData 
              ? `linear-gradient(135deg, ${selectedDJData.gradient.replace('from-', '').replace(' via-', ', ').replace(' to-', ', ')} 0.1)`
              : "radial-gradient(circle at center, rgba(191, 90, 242, 0.2) 0%, rgba(2, 6, 23, 1) 70%)"
          }}
          transition={{ duration: 1 }}
        />

        {/* Laser Effects */}
        {Array.from({ length: 6 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute inset-0"
            style={{
              background: `conic-gradient(from ${i * 60}deg, transparent 0%, rgba(191, 90, 242, 0.3) 1%, transparent 2%)`
            }}
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 8 + i, repeat: Infinity, ease: "linear" }}
          />
        ))}
      </div>

      {/* Festival Content */}
      <div className="relative z-10 p-4 pt-8">
        {/* Festival Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-2">
            <span className="text-transparent bg-gradient-to-r from-neon-purple via-neon-cyan to-neon-purple bg-clip-text">
              🪩 EDM SHUFFLE MAINSTAGE
            </span>
          </h1>
          <p className="text-neon-cyan text-lg">Live from the Digital Ultra Arena</p>
        </motion.div>

        {/* Music Controller */}
        <motion.div
          className="fixed top-4 right-4 bg-bass-medium/80 backdrop-blur-sm rounded-lg p-3 flex items-center gap-3 z-20"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <EqualizerBars barCount={5} className="h-6" />
          <div className="text-sm">
            <div className="text-white font-semibold">
              {selectedDJData?.track || "Festival Mix"}
            </div>
            <div className="text-neon-cyan">{currentBPM} BPM</div>
          </div>
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="text-neon-purple hover:text-neon-cyan transition-colors"
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
        </motion.div>

        {/* PLURcrew Corner */}
        <motion.div
          className="fixed top-4 left-4 bg-bass-medium/80 backdrop-blur-sm rounded-lg p-3 z-20"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="text-sm text-neon-cyan">🎴 BlazeTech Crew</div>
          <div className="text-xs text-slate-400">Festival Supporter</div>
        </motion.div>

        {/* DJ Stage */}
        <div className="mb-8">
          <motion.div
            className="bg-gradient-to-b from-bass-medium/50 to-bass-dark/80 rounded-2xl p-6 border border-neon-purple/20"
            animate={{
              boxShadow: selectedDJ 
                ? "0 0 40px rgba(191, 90, 242, 0.5)" 
                : "0 0 20px rgba(191, 90, 242, 0.2)"
            }}
          >
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">🎤 Live on Stage</h2>
              {headliner && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="mb-4"
                >
                  <Badge className="bg-neon-cyan text-bass-dark px-4 py-2 text-lg">
                    <Crown className="w-4 h-4 mr-2" />
                    Headliner: {djs.find(d => d.id === headliner)?.name}
                  </Badge>
                </motion.div>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {djs.map((dj, index) => (
                <motion.div
                  key={dj.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative"
                >
                  <Card className={`cursor-pointer transition-all duration-300 ${
                    selectedDJ === dj.id 
                      ? 'ring-2 ring-white ring-opacity-50 scale-105' 
                      : 'hover:scale-102'
                  }`}>
                    <CardContent className="p-4 text-center">
                      {/* Spotlight Effect */}
                      {selectedDJ === dj.id && (
                        <motion.div
                          className="absolute -inset-2 rounded-lg"
                          style={{
                            background: `linear-gradient(135deg, ${dj.gradient})`
                          }}
                          animate={{ opacity: [0.3, 0.6, 0.3] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        />
                      )}
                      
                      <div className="relative z-10">
                        <div className="text-4xl mb-2">
                          {dj.archetype === 'Firestorm' ? '🔥' : 
                           dj.archetype === 'FrostPulse' ? '❄️' : '🌙'}
                        </div>
                        <h3 className={`font-bold ${dj.color} mb-1`}>{dj.name}</h3>
                        <Badge className="mb-2 text-xs">{dj.archetype}</Badge>
                        <div className="text-xs text-slate-400 mb-2">
                          {dj.genre} • {dj.bpm} BPM
                        </div>
                        <div className="text-sm text-white mb-3">{dj.track}</div>
                        
                        <div className="space-y-2">
                          <NeonButton
                            size="sm"
                            onClick={() => handleDJPreview(dj)}
                            className="w-full text-xs"
                          >
                            🎧 Preview
                          </NeonButton>
                          <NeonButton
                            variant="secondary"
                            size="sm"
                            onClick={() => handleVote(dj.id)}
                            className="w-full text-xs"
                          >
                            🔥 Vote ({votes[dj.id]})
                          </NeonButton>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Interactive Turntables */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="bg-bass-medium/50 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-neon-cyan text-center mb-6">🎛️ Interactive Turntables</h3>
            
            <div className="flex justify-center items-center gap-8">
              {/* Left Turntable */}
              <motion.div
                className="relative"
                whileHover={{ scale: 1.05 }}
                onClick={() => handleTurntableInteraction('scratch')}
              >
                <div className="w-32 h-32 rounded-full bg-gradient-to-r from-neon-purple to-neon-cyan p-1 cursor-pointer">
                  <motion.div
                    className="w-full h-full rounded-full bg-bass-dark flex items-center justify-center"
                    animate={{ rotate: isPlaying ? [0, 360] : 0 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    <div className="w-4 h-4 bg-neon-purple rounded-full" />
                  </motion.div>
                </div>
                <div className="text-center mt-2 text-sm text-slate-400">Scratch</div>
              </motion.div>

              {/* Center Hype Button */}
              <motion.button
                className="bg-gradient-to-r from-neon-purple to-neon-cyan text-white px-6 py-3 rounded-full font-bold"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  setShowConfetti(true);
                  setTimeout(() => setShowConfetti(false), 2000);
                }}
              >
                <Zap className="w-5 h-5 mr-2 inline" />
                Hype Up The Crowd
              </motion.button>

              {/* Right Turntable */}
              <motion.div
                className="relative"
                whileHover={{ scale: 1.05 }}
                onClick={() => handleTurntableInteraction('echo')}
              >
                <div className="w-32 h-32 rounded-full bg-gradient-to-r from-neon-cyan to-neon-purple p-1 cursor-pointer">
                  <motion.div
                    className="w-full h-full rounded-full bg-bass-dark flex items-center justify-center"
                    animate={{ rotate: isPlaying ? [0, -360] : 0 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                  >
                    <div className="w-4 h-4 bg-neon-cyan rounded-full" />
                  </motion.div>
                </div>
                <div className="text-center mt-2 text-sm text-slate-400">Echo</div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Festival Lounge */}
        <motion.div
          className="fixed bottom-24 right-4 bg-bass-medium/80 backdrop-blur-sm rounded-lg p-3 max-w-64 z-20"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-neon-purple" />
            <span className="text-sm text-neon-purple font-semibold">🪩 Festival Lounge</span>
          </div>
          <div className="space-y-1 max-h-20 overflow-hidden">
            {crowdReactions.map((reaction, i) => (
              <motion.div
                key={i}
                className="text-xs text-slate-300"
                animate={{ y: [0, -20] }}
                transition={{ duration: 4, delay: i * 1, repeat: Infinity }}
              >
                {reaction}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Confetti Animation */}
        <AnimatePresence>
          {showConfetti && (
            <div className="fixed inset-0 pointer-events-none z-30">
              {Array.from({ length: 20 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute text-2xl"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 50}%`,
                  }}
                  initial={{ opacity: 1, scale: 0 }}
                  animate={{ 
                    opacity: 0, 
                    scale: 1,
                    y: 200,
                    rotate: 360
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 2 }}
                >
                  {['🎉', '✨', '🔥', '💫', '⚡'][Math.floor(Math.random() * 5)]}
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default FestivalVotingStage;
