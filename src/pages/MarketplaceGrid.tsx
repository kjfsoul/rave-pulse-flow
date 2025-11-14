import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { marketplaceOperations } from "@/lib/database";
import { toast } from "sonner";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import BottomNavigation from "@/components/BottomNavigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ShoppingCart, Download, Star, Zap, Check, ShoppingBag, ExternalLink } from "lucide-react";
import { usePrintifyProducts } from "@/hooks/usePrintifyProducts";
import { formatCurrency, getProductUrl } from "@/lib/printify";

interface Product {
  id: string;
  name: string;
  price: number;
  archetype: "Firestorm" | "FrostPulse" | "MoonWaver";
  emoji: string;
  description: string;
  category: string;
  downloadUrl?: string;
  rating: number;
  reviews: number;
}

const MarketplaceGrid = () => {
  const { user, profile } = useAuth();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [userPurchases, setUserPurchases] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);
  const { mergedProducts: mergedPrintifyProducts, loading: printifyLoading } = usePrintifyProducts({ fetchLimit: 30 });

  const printifyCatalog = useMemo(() => mergedPrintifyProducts, [mergedPrintifyProducts]);

  const getPrintifyImage = (
    images?: { preview?: string | null; src: string; isDefault?: boolean }[]
  ) => {
    if (!images || images.length === 0) return null;
    const preferred = images.find((image) => image.isDefault);
    return preferred?.preview || preferred?.src || images[0].preview || images[0].src || null;
  };

  const getPrintifyPrice = (product: (typeof mergedPrintifyProducts)[number]) => {
    if (product.priceRange) {
      return formatCurrency(product.priceRange.min, product.priceRange.currency || "USD");
    }
    const variantPrices = product.variants
      ?.map((variant) => variant.price)
      .filter((price): price is number => typeof price === "number" && !Number.isNaN(price));
    if (variantPrices && variantPrices.length > 0) {
      return formatCurrency(Math.min(...variantPrices));
    }
    return "See details";
  };

  const digitalProducts: Product[] = [
    { 
      id: "cyber-led-kicks", 
      name: "Cyber LED Kicks", 
      price: 199.99, 
      archetype: "Firestorm", 
      emoji: "🔥",
      description: "High-energy LED sneakers that pulse with every beat. Perfect for aggressive shuffling and hard dance.",
      category: "Footwear",
      downloadUrl: "https://example.com/cyber-kicks-3d-model",
      rating: 4.8,
      reviews: 127
    },
    { 
      id: "frost-pulse-hoodie", 
      name: "Frost Pulse Hoodie", 
      price: 89.99, 
      archetype: "FrostPulse", 
      emoji: "❄️",
      description: "Temperature-reactive hoodie with crystalline patterns that glow in UV light.",
      category: "Apparel",
      downloadUrl: "https://example.com/frost-hoodie-pattern",
      rating: 4.6,
      reviews: 89
    },
    { 
      id: "moon-glow-pants", 
      name: "Moon Glow Pants", 
      price: 129.99, 
      archetype: "MoonWaver", 
      emoji: "🌙",
      description: "Flowy pants with holographic fibers that create mesmerizing wave patterns in motion.",
      category: "Apparel",
      downloadUrl: "https://example.com/moon-pants-design",
      rating: 4.9,
      reviews: 156
    },
    { 
      id: "neon-bass-gloves", 
      name: "Neon Bass Gloves", 
      price: 45.99, 
      archetype: "Firestorm", 
      emoji: "⚡",
      description: "Touch-sensitive gloves that light up with hand movements. Great for light shows.",
      category: "Accessories",
      downloadUrl: "https://example.com/bass-gloves-tutorial",
      rating: 4.7,
      reviews: 203
    },
    { 
      id: "crystal-visor", 
      name: "Crystal Visor", 
      price: 75.99, 
      archetype: "FrostPulse", 
      emoji: "🔮",
      description: "Prismatic visor that splits light into rainbow effects. Essential for crystal pulse ravers.",
      category: "Accessories",
      downloadUrl: "https://example.com/crystal-visor-specs",
      rating: 4.5,
      reviews: 67
    },
    { 
      id: "lunar-cape", 
      name: "Lunar Cape", 
      price: 159.99, 
      archetype: "MoonWaver", 
      emoji: "🌌",
      description: "Flowing cape with fiber optic stars that twinkle like a night sky.",
      category: "Apparel",
      downloadUrl: "https://example.com/lunar-cape-pattern",
      rating: 4.8,
      reviews: 94
    }
  ];

  // Load user's purchase history
  useEffect(() => {
    const loadPurchases = async () => {
      if (!user) return;
      
      try {
        const purchases = await marketplaceOperations.getUserPurchases(user.id);
        setUserPurchases(purchases.map(p => p.item_id));
      } catch (error) {
        console.error('Error loading purchases:', error);
      }
    };
    
    loadPurchases();
  }, [user]);

  const handlePurchase = async (product: Product) => {
    if (!user) {
      toast.error("Please sign in to make purchases!");
      return;
    }

    if (userPurchases.includes(product.id)) {
      toast.info("You already own this item!");
      return;
    }

    setIsLoading(true);
    try {
      // Import Stripe processing
      const { processPaymentDev, isStripeConfigured } = await import('@/lib/stripe');
      
      // Convert product to Stripe format
      const stripeProduct = {
        id: product.id,
        name: product.name,
        price: product.price,
        currency: 'usd',
        description: product.description,
        metadata: {
          archetype: product.archetype,
          category: product.category,
          downloadUrl: product.downloadUrl,
        }
      };

      // Process payment (using dev mode for now)
      const paymentResult = await processPaymentDev(stripeProduct, user.email || '');
      
      if (!paymentResult.success) {
        toast.error(paymentResult.error || 'Payment failed');
        return;
      }

      // Record the purchase in database after successful payment
      const purchase = await marketplaceOperations.recordPurchase(
        user.id,
        product.id,
        product.category,
        product.price,
        product.downloadUrl,
        paymentResult.paymentIntentId // Store payment ID
      );

      if (purchase) {
        // Update local state
        setUserPurchases(prev => [...prev, product.id]);
        setPurchaseDialogOpen(false);
        
        // Show success message
        toast.success(`${product.name} purchased successfully!`, {
          icon: "🎉",
          description: "Payment processed! Check your downloads section to access your item."
        });

        // Archetype bonus points
        if (profile?.archetype === product.archetype) {
          toast.success("Archetype match bonus! +10 PLUR points!", {
            icon: "⚡"
          });
        }
      }
    } catch (error) {
      console.error('Error making purchase:', error);
      toast.error('Failed to complete purchase');
    } finally {
      setIsLoading(false);
    }
  };

  const getArchetypeColors = (archetype: string) => {
    switch (archetype) {
      case "Firestorm":
        return { 
          border: "border-red-500/50", 
          bg: "bg-red-500/10",
          text: "text-red-400"
        };
      case "FrostPulse":
        return { 
          border: "border-cyan-400/50", 
          bg: "bg-cyan-400/10",
          text: "text-cyan-400"
        };
      case "MoonWaver":
        return { 
          border: "border-purple-500/50", 
          bg: "bg-purple-500/10",
          text: "text-purple-400"
        };
      default:
        return { 
          border: "border-neon-cyan/30", 
          bg: "bg-neon-cyan/5",
          text: "text-neon-cyan"
        };
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-bass-dark relative pb-20">
        {/* User Profile Corner */}
        {profile && (
          <motion.div
            className="fixed top-4 left-4 z-30 bg-bass-medium/90 backdrop-blur-sm rounded-lg p-3 border border-neon-purple/30"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="flex items-center gap-2">
              <div className="text-xl">
                {profile.archetype === 'Firestorm' ? '🔥' : 
                 profile.archetype === 'FrostPulse' ? '❄️' : 
                 profile.archetype === 'MoonWaver' ? '🌙' : '🎭'}
              </div>
              <div>
                <div className="text-sm font-semibold text-neon-cyan">
                  {profile.plur_points || 0} PLUR
                </div>
                <div className="text-xs text-slate-400">
                  {profile.archetype || 'Unassigned'}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <div className="p-4 pt-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold text-neon-purple mb-2">
              🛍️ Rave Marketplace
            </h1>
            <p className="text-slate-400">Gear up for your next set • {userPurchases.length} items owned</p>
          </motion.div>

          <section className="mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between mb-6"
            >
              <div>
                <h2 className="text-2xl font-semibold text-neon-cyan flex items-center gap-2">
                  <ShoppingBag className="h-6 w-6" />
                  Printify Merch Catalog
                </h2>
                <p className="text-slate-400">
                  Live products synced from the EDM Shuffle Printify storefront. Only visible, published merch appears here.
                </p>
              </div>
              {printifyLoading && (
                <Badge className="bg-bass-medium/70 border-neon-cyan/40 text-neon-cyan">
                  Syncing latest drops...
                </Badge>
              )}
            </motion.div>

            {printifyLoading && printifyCatalog.length === 0 ? (
              <div className="bg-bass-medium/40 border border-neon-cyan/20 rounded-3xl py-12 text-center text-slate-400">
                Pulling merch catalogue from Printify...
              </div>
            ) : printifyCatalog.length === 0 ? (
              <div className="bg-bass-medium/40 border border-dashed border-neon-cyan/30 rounded-3xl py-12 text-center text-slate-400">
                No live merch available yet. Run{" "}
                <code className="px-2 py-1 bg-bass-medium rounded">npm run sync:printify</code> after publishing products.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {printifyCatalog.map((product, index) => {
                  const imageSrc = getPrintifyImage(product.images);
                  return (
                    <motion.a
                      key={product.id}
                      href={getProductUrl(product)}
                      target="_blank"
                      rel="noopener noreferrer"
                      initial={{ opacity: 0, scale: 0.95 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.04 }}
                    >
                      <Card className="bg-bass-medium/80 border-neon-cyan/20 hover:border-neon-cyan/50 hover:shadow-neon-cyan/20 hover:shadow-2xl transition-all duration-300 overflow-hidden h-full">
                        <CardContent className="p-0 flex flex-col h-full">
                          <div className="relative aspect-square bg-bass-dark/50">
                            {imageSrc ? (
                              <img
                                src={imageSrc}
                                alt={product.title}
                                className="h-full w-full object-cover"
                                loading="lazy"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center text-5xl text-neon-cyan/80">
                                <ShoppingBag className="h-12 w-12" />
                              </div>
                            )}
                            <Badge className="absolute top-3 left-3 bg-neon-purple/20 text-neon-purple border-neon-purple/30">
                              {product.source === "live" ? "Live" : "Catalog"}
                            </Badge>
                            <Badge className="absolute top-3 right-3 bg-bass-dark/80 border-neon-cyan/40 text-neon-cyan flex items-center gap-1">
                              <ExternalLink className="h-3.5 w-3.5" />
                              View
                            </Badge>
                          </div>
                          <div className="flex flex-1 flex-col p-5">
                            <h3 className="text-white text-lg font-semibold leading-tight line-clamp-2">
                              {product.title}
                            </h3>
                            <p className="text-sm text-slate-400 mt-2 line-clamp-3">
                              {product.description?.replace(/<[^>]*>/g, "") || "Limited edition EDM Shuffle drop"}
                            </p>
                            <div className="mt-auto flex items-center justify-between pt-4 text-sm">
                              <span className="text-neon-cyan text-xl font-bold">
                                {getPrintifyPrice(product)}
                              </span>
                              <Badge className="bg-bass-dark/80 border-neon-cyan/40 text-neon-cyan">
                                {product.variants?.length || 1} variant{(product.variants?.length || 1) > 1 ? "s" : ""}
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
          </section>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {digitalProducts.map((product, index) => {
              const colors = getArchetypeColors(product.archetype);
              const isOwned = userPurchases.includes(product.id);
              const isArchetypeMatch = profile?.archetype === product.archetype;
              
              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <Card className={`${colors.bg} border-2 ${colors.border} hover:shadow-lg hover:shadow-neon-purple/20 transition-all duration-300 relative overflow-hidden`}>
                    {/* Archetype Match Indicator */}
                    {isArchetypeMatch && (
                      <div className="absolute top-2 right-2 z-10">
                        <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                          <Zap className="w-3 h-3 mr-1" />
                          Match
                        </Badge>
                      </div>
                    )}

                    {/* Owned Indicator */}
                    {isOwned && (
                      <div className="absolute top-2 left-2 z-10">
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                          <Check className="w-3 h-3 mr-1" />
                          Owned
                        </Badge>
                      </div>
                    )}

                    <CardContent className="p-6">
                      <div className="text-6xl mb-4 text-center">{product.emoji}</div>
                      
                      <div className="flex items-center justify-between mb-2">
                        <Badge className="bg-neon-cyan/20 text-neon-cyan border-neon-cyan/30">
                          {product.archetype}
                        </Badge>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-sm text-slate-300">{product.rating}</span>
                          <span className="text-xs text-slate-500">({product.reviews})</span>
                        </div>
                      </div>
                      
                      <h3 className="font-bold text-white mb-2 text-lg">{product.name}</h3>
                      <p className="text-sm text-slate-400 mb-4 line-clamp-2">{product.description}</p>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-2xl font-bold text-neon-purple">${product.price}</p>
                          <p className="text-xs text-slate-500">{product.category}</p>
                        </div>
                        
                        <div className="flex gap-2">
                          {isOwned ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(product.downloadUrl, '_blank')}
                              className="border-green-500/30 text-green-400 hover:bg-green-500/20"
                            >
                              <Download className="w-4 h-4 mr-1" />
                              Download
                            </Button>
                          ) : (
                            <Dialog open={purchaseDialogOpen && selectedProduct?.id === product.id} 
                                    onOpenChange={(open) => {
                                      setPurchaseDialogOpen(open);
                                      if (!open) setSelectedProduct(null);
                                    }}>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSelectedProduct(product)}
                                  className="border-neon-purple/30 text-neon-purple hover:bg-neon-purple/20"
                                >
                                  <ShoppingCart className="w-4 h-4 mr-1" />
                                  Buy
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="bg-bass-dark border-neon-purple/30">
                                <DialogHeader>
                                  <DialogTitle className="text-white flex items-center gap-2">
                                    {product.emoji} {product.name}
                                  </DialogTitle>
                                  <DialogDescription className="text-slate-400">
                                    {product.description}
                                  </DialogDescription>
                                </DialogHeader>
                                
                                <div className="space-y-4">
                                  <div className="flex items-center justify-between">
                                    <span className="text-white">Price:</span>
                                    <span className="text-2xl font-bold text-neon-purple">${product.price}</span>
                                  </div>
                                  
                                  {isArchetypeMatch && (
                                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                                      <div className="flex items-center gap-2 text-yellow-400">
                                        <Zap className="w-4 h-4" />
                                        <span className="font-semibold">Archetype Match Bonus!</span>
                                      </div>
                                      <p className="text-sm text-yellow-300 mt-1">
                                        This item matches your {profile?.archetype} archetype. You'll earn +10 PLUR points!
                                      </p>
                                    </div>
                                  )}
                                  
                                  <div className="flex gap-3">
                                    <Button
                                      onClick={() => setPurchaseDialogOpen(false)}
                                      variant="outline"
                                      className="flex-1"
                                    >
                                      Cancel
                                    </Button>
                                    <Button
                                      onClick={() => handlePurchase(product)}
                                      disabled={isLoading}
                                      className="flex-1 bg-gradient-to-r from-neon-purple to-neon-pink"
                                    >
                                      {isLoading ? "Processing..." : `Buy for $${product.price}`}
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
        
        <BottomNavigation />
      </div>
    </ProtectedRoute>
  );
};

export default MarketplaceGrid;