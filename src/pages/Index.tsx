
import { motion } from "framer-motion";
import BottomNavigation from "@/components/BottomNavigation";
import FloatingSneakers from "@/components/FloatingSneakers";
import EqualizerBars from "@/components/EqualizerBars";
import NeonButton from "@/components/NeonButton";
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
      <FloatingSneakers />
      
      {/* Hero Section */}
      <section className="relative h-screen flex flex-col items-center justify-center text-center px-4 overflow-hidden">
        <motion.div
          className="absolute inset-0 opacity-30"
          animate={{
            background: [
              "radial-gradient(circle at 30% 30%, rgba(191, 90, 242, 0.3) 0%, transparent 50%)",
              "radial-gradient(circle at 70% 70%, rgba(6, 255, 165, 0.3) 0%, transparent 50%)",
              "radial-gradient(circle at 50% 50%, rgba(30, 64, 175, 0.3) 0%, transparent 50%)",
            ]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="relative z-10"
        >
          <h1 className="text-6xl md:text-8xl font-bold mb-4 neon-text">
            EDM<span className="text-neon-cyan">Shuffle</span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-300 mb-8">
            Find Your Beat • Master Your Flow • Join The Rave
          </p>
          
          <div className="mb-12">
            <EqualizerBars barCount={30} className="h-20" />
          </div>
          
          <NeonButton 
            size="lg" 
            onClick={() => window.location.href = '/archetype-quiz'}
            className="mb-8"
          >
            🎭 Find Your Shuffle Archetype
          </NeonButton>
        </motion.div>
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
