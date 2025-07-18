import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import BottomNavigation from "@/components/BottomNavigation";
import EqualizerBars from "@/components/EqualizerBars";
import LaserRaveBackground from "@/components/LaserRaveBackground";
import ShuffleDancers from "@/components/ShuffleDancers";
import VibePreview from "@/components/VibePreview";
import ScrollHintArrow from "@/components/ScrollHintArrow";
import RSSFeedStreamer from "@/components/RSSFeedStreamer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, Heart, Share2, TrendingUp, LogIn, UserPlus } from "lucide-react";

interface Archetype {
  id: string;
  name: string;
  emoji: string;
  color: string;
  gradient: string;
  description: string;
  vibe: string;
}

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showDancers, setShowDancers] = useState(false);
  const [selectedArchetype, setSelectedArchetype] = useState<Archetype | null>(null);
  const [showVibePreview, setShowVibePreview] = useState(false);
  const [audioStarted, setAudioStarted] = useState(false);

  const handleStartDancing = () => {
    setAudioStarted(true);
    setShowDancers(true);
  };

  const handleArchetypeSelect = (archetype: Archetype) => {
    setSelectedArchetype(archetype);
    setShowVibePreview(true);
  };

  const handleLockFlow = () => {
    // Navigate to shuffle feed with selected archetype
    navigate('/shuffle-feed');
  };

  const handleExploreMore = () => {
    setShowVibePreview(false);
    setSelectedArchetype(null);
    // Could add reshuffle logic here
  };

  const trendingClips = [
    { id: 1, title: "Fire Shuffle Combo", likes: "2.3K", trend: "+15%" },
    { id: 2, title: "Moonwalk Bass Drop", likes: "1.8K", trend: "+23%" },
    { id: 3, title: "Frost Step Master", likes: "3.1K", trend: "+8%" },
    { id: 4, title: "Neon Glide Flow", likes: "942", trend: "+41%" },
  ];

  const gearDrops = [
    { id: 1, name: "LED Shuffle Kicks", price: "$149", archetype: "Firestorm", image: "🔥" },
    { id: 2, name: "Cyber Glow Hoodie", price: "$89", archetype: "FrostPulse", image: "❄️" },
    { id: 3, name: "Bass Drop Headphones", price: "$199", archetype: "MoonWaver", image: "🌙" },
    { id: 4, name: "Neon Rave Gloves", price: "$39", archetype: "Firestorm", image: "⚡" },
  ];

  return (
    <div className="min-h-screen bg-bass-dark relative pb-20">
      {/* RSS Feed Streamer */}
      <RSSFeedStreamer />
      
      {/* Authentication Buttons - Top Right */}
      {!user && (
        <motion.div
          className="absolute top-4 right-4 flex gap-2 z-50"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Button
            onClick={() => navigate('/profile')}
            variant="outline"
            size="sm"
            className="bg-bass-medium/80 backdrop-blur-sm border-purple-500/30 text-white hover:bg-purple-600/20 hover:border-purple-400"
          >
            <LogIn className="w-4 h-4 mr-1" />
            Sign In
          </Button>
          <Button
            onClick={() => navigate('/profile')}
            size="sm"
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
          >
            <UserPlus className="w-4 h-4 mr-1" />
            Sign Up
          </Button>
        </motion.div>
      )}
      
      {/* Enhanced Hero Section with Rave Drop */}
      <section className="relative h-screen flex flex-col items-center justify-center text-center px-4 overflow-hidden">
        {/* Laser Rave Background */}
        <LaserRaveBackground />

        {/* Animated Twilight Gradient Background */}
        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              "radial-gradient(circle at 20% 50%, rgba(191, 90, 242, 0.4) 0%, rgba(30, 64, 175, 0.2) 50%, rgba(2, 6, 23, 1) 100%)",
              "radial-gradient(circle at 80% 50%, rgba(6, 255, 165, 0.4) 0%, rgba(191, 90, 242, 0.2) 50%, rgba(2, 6, 23, 1) 100%)",
              "radial-gradient(circle at 50% 20%, rgba(30, 64, 175, 0.4) 0%, rgba(6, 255, 165, 0.2) 50%, rgba(2, 6, 23, 1) 100%)",
              "radial-gradient(circle at 50% 80%, rgba(191, 90, 242, 0.4) 0%, rgba(30, 64, 175, 0.2) 50%, rgba(2, 6, 23, 1) 100%)",
            ]
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Main Content Container */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="relative z-10"
        >
          {!showDancers ? (
            <>
              {/* Main Title */}
              <motion.h1 
                className="text-6xl md:text-8xl font-bold mb-6"
                animate={{
                  textShadow: [
                    "0 0 20px rgba(191, 90, 242, 0.8)",
                    "0 0 40px rgba(6, 255, 165, 0.8)",
                    "0 0 20px rgba(191, 90, 242, 0.8)",
                  ]
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <span className="text-white">EDM</span>
                <span className="text-transparent bg-gradient-to-r from-neon-purple via-neon-cyan to-neon-purple bg-clip-text animate-shimmer">
                  Shuffle
                </span>
              </motion.h1>

              {/* New Tagline */}
              <motion.p 
                className="text-2xl md:text-3xl text-slate-300 mb-12"
                initial={{ opacity: 0 }}
                animate={{ 
                  opacity: 1,
                  x: [0, 5, -5, 0],
                }}
                transition={{ 
                  opacity: { delay: 0.5, duration: 1 },
                  x: { duration: 3, repeat: Infinity, ease: "easeInOut" }
                }}
              >
                🔥 Enter The Rave. Your Flow Will Find You.
              </motion.p>
              
              {/* Enhanced Equalizer */}
              <motion.div 
                className="mb-16"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.8, duration: 1 }}
              >
                <EqualizerBars barCount={50} className="h-32" />
              </motion.div>
              
              {/* Start Dancing CTA */}
              <motion.button
                onClick={handleStartDancing}
                className="bg-gradient-to-r from-neon-purple to-neon-cyan text-white text-2xl px-16 py-6 rounded-full font-bold hover:shadow-2xl hover:shadow-neon-purple/50 transition-all duration-300 relative overflow-hidden group"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 1.2, duration: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.span
                  className="relative z-10 flex items-center"
                  animate={{
                    y: [0, -2, 0],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  🎶 Start Dancing
                </motion.span>
                
                {/* Shimmer Effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  initial={{ x: "-100%" }}
                  animate={{ x: "100%" }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    repeatDelay: 2,
                    ease: "easeInOut"
                  }}
                />
              </motion.button>
            </>
          ) : (
            <>
              {/* Dancer Selection Mode */}
              <motion.h2
                className="text-4xl md:text-5xl font-bold text-white mb-4"
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                Choose Your Vibe
              </motion.h2>
              
              <motion.p
                className="text-xl text-slate-300 mb-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.8 }}
              >
                Feel the energy that calls to you
              </motion.p>

              {/* Shuffle Dancers */}
              <ShuffleDancers 
                onArchetypeSelect={handleArchetypeSelect}
                selectedArchetype={selectedArchetype}
              />

              {/* Audio Started Indicator */}
              {audioStarted && (
                <motion.div
                  className="absolute top-4 left-4 bg-bass-medium/80 backdrop-blur-sm rounded-lg px-4 py-2 flex items-center gap-2"
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1 }}
                >
                  <motion.div
                    className="w-3 h-3 bg-neon-green rounded-full"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                  <span className="text-sm text-slate-300">Beat Drop Active</span>
                </motion.div>
              )}

              {/* BPM Indicator */}
              <motion.div
                className="absolute top-4 right-4 bg-bass-medium/80 backdrop-blur-sm rounded-lg px-4 py-2"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.2 }}
              >
                <motion.span
                  className="text-sm text-neon-cyan font-mono"
                  animate={{ opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                >
                  ♪ 128 BPM
                </motion.span>
              </motion.div>
            </>
          )}
        </motion.div>
      </section>

      {/* Vibe Preview Modal */}
      <AnimatePresence>
        {showVibePreview && selectedArchetype && (
          <VibePreview
            archetype={selectedArchetype}
            onLockFlow={handleLockFlow}
            onExploreMore={handleExploreMore}
          />
        )}
      </AnimatePresence>

      {/* Trending Shuffle Clips */}
      <section className="px-4 mb-12">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="mb-6"
        >
          <h2 className="text-3xl font-bold text-neon-purple mb-2 flex items-center">
            <TrendingUp className="mr-3" />
            Trending Shuffle Clips
          </h2>
          <p className="text-slate-400">Hot moves lighting up the feed</p>
        </motion.div>
        
        <div className="grid grid-cols-2 gap-4">
          {trendingClips.map((clip, index) => (
            <motion.div
              key={clip.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="relative group"
            >
              <Card className="bg-bass-medium border-neon-purple/20 hover:border-neon-purple/50 transition-all duration-300 overflow-hidden">
                <CardContent className="p-0">
                  <div className="aspect-square bg-gradient-to-br from-neon-purple/20 to-neon-cyan/20 relative flex items-center justify-center">
                    <motion.div
                      className="w-12 h-12 bg-neon-purple/80 rounded-full flex items-center justify-center"
                      whileHover={{ scale: 1.1 }}
                    >
                      <Play className="w-6 h-6 text-white ml-1" />
                    </motion.div>
                    
                    <Badge className="absolute top-2 right-2 bg-neon-cyan text-bass-dark">
                      {clip.trend}
                    </Badge>
                  </div>
                  
                  <div className="p-3">
                    <h3 className="font-semibold text-white mb-1">{clip.title}</h3>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400 flex items-center">
                        <Heart className="w-4 h-4 mr-1 text-neon-pink" />
                        {clip.likes}
                      </span>
                      <Share2 className="w-4 h-4 text-slate-500 hover:text-neon-cyan cursor-pointer" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Gear Drops Carousel */}
      <section className="px-4 mb-12">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="mb-6"
        >
          <h2 className="text-3xl font-bold text-neon-cyan mb-2">
            🔥 Gear Drops of the Day
          </h2>
          <p className="text-slate-400">Fresh fits for every archetype</p>
        </motion.div>
        
        <div className="flex overflow-x-auto space-x-4 pb-4 scrollbar-hide">
          {gearDrops.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="flex-shrink-0 w-48"
            >
              <Card className="bg-bass-medium border-neon-cyan/20 hover:border-neon-cyan/50 hover:shadow-lg hover:shadow-neon-cyan/20 transition-all duration-300 cursor-pointer group">
                <CardContent className="p-4">
                  <div className="text-4xl mb-3 text-center">{item.image}</div>
                  <Badge className="mb-2 bg-neon-purple/20 text-neon-purple border-neon-purple/30">
                    {item.archetype}
                  </Badge>
                  <h3 className="font-semibold text-white mb-2 group-hover:text-neon-cyan transition-colors">
                    {item.name}
                  </h3>
                  <p className="text-2xl font-bold text-neon-cyan">{item.price}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      <BottomNavigation />
    </div>
  );
};

export default Index;
