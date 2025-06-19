
import { motion } from "framer-motion";
import BottomNavigation from "@/components/BottomNavigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const MarketplaceGrid = () => {
  const products = [
    { id: 1, name: "Cyber LED Kicks", price: "$199", archetype: "Firestorm", emoji: "🔥" },
    { id: 2, name: "Frost Pulse Hoodie", price: "$89", archetype: "FrostPulse", emoji: "❄️" },
    { id: 3, name: "Moon Glow Pants", price: "$129", archetype: "MoonWaver", emoji: "🌙" },
    { id: 4, name: "Neon Bass Gloves", price: "$45", archetype: "Firestorm", emoji: "⚡" },
  ];

  return (
    <div className="min-h-screen bg-bass-dark relative pb-20">
      <div className="p-4 pt-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-neon-purple mb-2">
            🛍️ Rave Marketplace
          </h1>
          <p className="text-slate-400">Gear up for your next set</p>
        </motion.div>
        
        <div className="grid grid-cols-2 gap-4">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              className="cursor-pointer"
            >
              <Card className="bg-bass-medium border-neon-purple/20 hover:border-neon-purple/50 hover:shadow-lg hover:shadow-neon-purple/20 transition-all duration-300">
                <CardContent className="p-4">
                  <div className="text-4xl mb-3 text-center">{product.emoji}</div>
                  <Badge className="mb-2 bg-neon-cyan/20 text-neon-cyan border-neon-cyan/30">
                    {product.archetype}
                  </Badge>
                  <h3 className="font-semibold text-white mb-2">{product.name}</h3>
                  <p className="text-xl font-bold text-neon-purple">{product.price}</p>
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

export default MarketplaceGrid;
