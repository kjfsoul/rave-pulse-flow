
import { motion } from "framer-motion";
import BottomNavigation from "@/components/BottomNavigation";
import FloatingSneakers from "@/components/FloatingSneakers";
import EqualizerBars from "@/components/EqualizerBars";
import NeonButton from "@/components/NeonButton";
import PLUROrbsAnimation from "@/components/PLUROrbsAnimation";
import ParticleBurstAnimation from "@/components/ParticleBurstAnimation";
import ScrollHintArrow from "@/components/ScrollHintArrow";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Heart, Share2, TrendingUp } from "lucide-react";

const Index = () => {
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
      {/* Enhanced Hero Section */}
      <section className="relative h-screen flex flex-col items-center justify-center text-center px-4 overflow-hidden">
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

        {/* Wave-like Motion Overlay */}
        <motion.div
          className="absolute inset-0 opacity-20"
          animate={{
            background: [
              "linear-gradient(45deg, transparent 0%, rgba(191, 90, 242, 0.1) 25%, transparent 50%, rgba(6, 255, 165, 0.1) 75%, transparent 100%)",
              "linear-gradient(135deg, transparent 0%, rgba(6, 255, 165, 0.1) 25%, transparent 50%, rgba(191, 90, 242, 0.1) 75%, transparent 100%)",
            ]
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Particle Burst Animation */}
        <ParticleBurstAnimation />

        {/* Floating Sneakers with Enhanced Animation */}
        <FloatingSneakers />
        
        {/* Main Content Container */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="relative z-10"
        >
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

          {/* Subtitle */}
          <motion.p 
            className="text-xl md:text-2xl text-slate-300 mb-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
          >
            Find Your Beat • Master Your Flow • Join The Rave
          </motion.p>
          
          {/* Enhanced Equalizer */}
          <motion.div 
            className="mb-16"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.8, duration: 1 }}
          >
            <EqualizerBars barCount={40} className="h-24" />
          </motion.div>
          
          {/* PLUR CTA Section with Orbiting Elements */}
          <div className="relative mb-12">
            <PLUROrbsAnimation />
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 1.2, duration: 1 }}
              className="relative z-10"
            >
              <NeonButton 
                size="lg" 
                onClick={() => window.location.href = '/archetype-quiz'}
                className="text-xl px-12 py-6 relative overflow-hidden group"
              >
                <motion.span
                  className="relative z-10 flex items-center"
                  whileHover={{ scale: 1.05 }}
                >
                  🌈 Find Your Shuffle Archetype
                </motion.span>
                
                {/* Enhanced Shimmer Effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  initial={{ x: "-100%" }}
                  animate={{ x: "100%" }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 3,
                    ease: "easeInOut"
                  }}
                />
              </NeonButton>
            </motion.div>
          </div>
        </motion.div>

        {/* Scroll Hint Arrow */}
        <ScrollHintArrow />
      </section>

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
