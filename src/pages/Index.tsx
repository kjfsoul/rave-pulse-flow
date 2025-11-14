import { motion, AnimatePresence } from "framer-motion";
import { useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import BottomNavigation from "@/components/BottomNavigation";
import EqualizerBars from "@/components/EqualizerBars";
import LaserRaveBackground from "@/components/LaserRaveBackground";
import ShuffleDancers from "@/components/ShuffleDancers";
import VibePreview from "@/components/VibePreview";
import ScrollHintArrow from "@/components/ScrollHintArrow";
import EnhancedRSSFeed from "@/components/EnhancedRSSFeed";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LogIn, UserPlus, Trophy, ShoppingBag, ExternalLink } from "lucide-react";
import { usePrintifyProducts } from "@/hooks/usePrintifyProducts";
import { formatCurrency, getProductUrl } from "@/lib/printify";

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

  const { mergedProducts: mergedPrintifyProducts, loading: printifyLoading } = usePrintifyProducts({ fetchLimit: 16 });

  const featuredPrintifyProducts = useMemo(() => mergedPrintifyProducts.slice(0, 7), [mergedPrintifyProducts]);

  const getPrimaryImage = (images?: { preview?: string | null; src: string; isDefault?: boolean }[]) => {
    if (!images || images.length === 0) return null;
    const preferred = images.find((image) => image.isDefault);
    return (preferred?.preview || preferred?.src || images[0].preview || images[0].src || null) ?? null;
  };

  const getDisplayPrice = (product: (typeof mergedPrintifyProducts)[number]) => {
    if (product.priceRange) {
      return formatCurrency(product.priceRange.min, product.priceRange.currency || "USD");
    }
    const variantPrices = product.variants?.map((variant) => variant.price).filter((price) => typeof price === "number" && !Number.isNaN(price));
    if (variantPrices && variantPrices.length > 0) {
      const minPrice = Math.min(...variantPrices);
      return formatCurrency(minPrice);
    }
    return "See details";
  };

  return (
    <div className="min-h-screen bg-bass-dark relative pb-20">
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

              {/* Action Buttons */}
              <div className="flex gap-6 flex-col sm:flex-row">
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

                {/* Pro Studio Button */}
                <motion.button
                  onClick={() => navigate('/pro-dj-station')}
                  className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xl px-12 py-6 rounded-full font-bold hover:shadow-2xl hover:shadow-orange-500/50 transition-all duration-300 relative overflow-hidden group"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 1.4, duration: 1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.span
                    className="relative z-10 flex items-center"
                    animate={{
                      y: [0, -2, 0],
                    }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                  >
                    🎛️ Pro Studio
                  </motion.span>

                  {/* Shimmer Effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    initial={{ x: "-100%" }}
                    animate={{ x: "100%" }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      repeatDelay: 3,
                      ease: "easeInOut"
                    }}
                  />
                </motion.button>
              </div>
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

      {/* Enhanced RSS Feed */}
      <EnhancedRSSFeed />

      {/* Live Merch Drops */}
      <section className="px-4 mb-12">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="mb-6"
        >
          <h2 className="text-3xl font-bold text-neon-cyan mb-2">
            🔥 Live Merch Drops
          </h2>
          <p className="text-slate-400">
            Fresh from the EDM Shuffle Printify store — only published products, updated live.
          </p>
        </motion.div>

        {printifyLoading && featuredPrintifyProducts.length === 0 ? (
          <div className="bg-bass-medium/40 border border-neon-cyan/20 rounded-2xl py-12 text-center text-slate-400">
            Syncing merch drops from Printify...
          </div>
        ) : featuredPrintifyProducts.length === 0 ? (
          <div className="bg-bass-medium/40 border border-neon-cyan/20 rounded-2xl py-12 text-center text-slate-400">
            No merch drops are live yet. Run <code className="px-2 py-1 bg-bass-medium rounded">npm run sync:printify</code> once products
            are published.
          </div>
        ) : (
          <div className="flex overflow-x-auto space-x-4 pb-4 scrollbar-hide snap-x snap-mandatory">
            {featuredPrintifyProducts.map((product, index) => {
              const imageSrc = getPrimaryImage(product.images);
              return (
                <motion.a
                  key={product.id}
                  href={getProductUrl(product)}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08 }}
                  className="flex-shrink-0 w-64 snap-start"
                >
                  <Card className="bg-bass-medium/80 border-neon-cyan/20 hover:border-neon-cyan/50 hover:shadow-lg hover:shadow-neon-cyan/20 transition-all duration-300 h-full">
                    <CardContent className="p-0 flex flex-col h-full">
                      <div className="relative aspect-square overflow-hidden rounded-t-2xl bg-bass-dark/60">
                        {imageSrc ? (
                          <img
                            src={imageSrc}
                            alt={product.title}
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-4xl text-neon-cyan/80">
                            <ShoppingBag className="h-10 w-10" />
                          </div>
                        )}
                        <Badge className="absolute top-3 left-3 bg-neon-purple/20 text-neon-purple border-neon-purple/30">
                          {product.source === "live" ? "Live" : "Catalog"}
                        </Badge>
                      </div>
                      <div className="flex flex-1 flex-col p-4 space-y-3">
                        <div>
                          <h3 className="text-white text-lg font-semibold leading-tight line-clamp-2">
                            {product.title}
                          </h3>
                          <p className="text-sm text-slate-400 mt-1 line-clamp-2">
                            {product.description?.replace(/<[^>]*>/g, "") || "Limited edition EDM Shuffle drop"}
                          </p>
                        </div>
                        <div className="mt-auto flex items-center justify-between text-sm">
                          <span className="text-neon-cyan text-lg font-bold">
                            {getDisplayPrice(product)}
                          </span>
                          <Badge className="bg-bass-dark/80 border-neon-cyan/40 text-neon-cyan flex items-center gap-1">
                            <ExternalLink className="h-3.5 w-3.5" />
                            View
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.a>
              );
            })}
          </div>
        )}

        {printifyLoading && featuredPrintifyProducts.length > 0 && (
          <p className="text-center text-xs text-slate-500 mt-4">
            Updating live merch data from Printify...
          </p>
        )}
      </section>

      {/* Footer */}
      <footer className="bg-bass-medium/50 border-t border-neon-purple/20 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🕺</span>
              <span className="text-xl font-bold text-white">EDM Shuffle</span>
            </div>

          <div className="flex items-center gap-6 text-sm">
              <Link
                to="/privacy-policy"
                className="text-slate-400 hover:text-neon-cyan transition-colors duration-200 flex items-center gap-1"
              >
                🔒 Privacy Policy
              </Link>
              <span className="text-slate-600">|</span>
              <span className="text-slate-500">© 2025 EDM Shuffle</span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-700/50 text-center">
            <p className="text-xs text-slate-500">
              Your privacy is our priority. We respect your dance floor and your data.
            </p>
          </div>
        </div>
      </footer>

      <BottomNavigation />
    </div>
  );
};

export default Index;
