import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import BottomNavigation from "@/components/BottomNavigation";
import Layout from "@/components/Layout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { usePrintifyProducts } from "@/hooks/usePrintifyProducts";
import { marketplaceOperations } from "@/lib/database";
import { formatCurrency, getProductUrl } from "@/lib/printify";
import { motion } from "framer-motion";
import { ExternalLink, ShoppingBag } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const MarketplaceGrid = () => {
  const { user, profile } = useAuth();
  const [userPurchases, setUserPurchases] = useState<string[]>([]);
  const { mergedProducts: mergedPrintifyProducts, loading: printifyLoading } =
    usePrintifyProducts({ fetchLimit: 30 });

  const printifyCatalog = useMemo(
    () => mergedPrintifyProducts,
    [mergedPrintifyProducts]
  );

  const getPrintifyImage = (
    images?: { preview?: string | null; src: string; isDefault?: boolean }[]
  ) => {
    if (!images || images.length === 0) return null;
    const preferred = images.find((image) => image.isDefault);
    return (
      preferred?.preview ||
      preferred?.src ||
      images[0].preview ||
      images[0].src ||
      null
    );
  };

  const getPrintifyPrice = (
    product: (typeof mergedPrintifyProducts)[number]
  ) => {
    if (product.priceRange) {
      return formatCurrency(
        product.priceRange.min,
        product.priceRange.currency || "USD"
      );
    }
    const variantPrices = product.variants
      ?.map((variant) => variant.price)
      .filter(
        (price): price is number =>
          typeof price === "number" && !Number.isNaN(price)
      );
    if (variantPrices && variantPrices.length > 0) {
      return formatCurrency(Math.min(...variantPrices));
    }
    return "See details";
  };

  // Load user's purchase history (for Printify products if needed)
  useEffect(() => {
    const loadPurchases = async () => {
      if (!user) return;

      try {
        const purchases = await marketplaceOperations.getUserPurchases(user.id);
        setUserPurchases(purchases.map((p) => p.item_id));
      } catch (error) {
        console.error("Error loading purchases:", error);
      }
    };

    loadPurchases();
  }, [user]);

  return (
    <ProtectedRoute>
      <Layout title="Rave Marketplace">
        {/* User Profile Corner */}
        {profile && (
          <motion.div
            className="fixed top-4 left-4 z-30 bg-bass-medium/90 backdrop-blur-sm rounded-lg p-3 border border-neon-purple/30"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="flex items-center gap-2">
              <div className="text-xl">
                {profile.archetype === "Firestorm"
                  ? "🔥"
                  : profile.archetype === "FrostPulse"
                  ? "❄️"
                  : profile.archetype === "MoonWaver"
                  ? "🌙"
                  : "🎭"}
              </div>
              <div>
                <div className="text-sm font-semibold text-neon-cyan">
                  {profile.plur_points || 0} PLUR
                </div>
                <div className="text-xs text-slate-400">
                  {profile.archetype || "Unassigned"}
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
            <p className="text-slate-400">
              Fresh merch drops from our Printify store
            </p>
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
                  Live products synced from the EDM Shuffle Printify storefront.
                  Only visible, published merch appears here.
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
                <code className="px-2 py-1 bg-bass-medium rounded">
                  npm run sync:printify
                </code>{" "}
                after publishing products.
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
                              {product.description?.replace(/<[^>]*>/g, "") ||
                                "Limited edition EDM Shuffle drop"}
                            </p>
                            <div className="mt-auto flex items-center justify-between pt-4 text-sm">
                              <span className="text-neon-cyan text-xl font-bold">
                                {getPrintifyPrice(product)}
                              </span>
                              <Badge className="bg-bass-dark/80 border-neon-cyan/40 text-neon-cyan">
                                {product.variants?.length || 1} variant
                                {(product.variants?.length || 1) > 1 ? "s" : ""}
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
        </div>

        <BottomNavigation />
      </Layout>
    </ProtectedRoute>
  );
};

export default MarketplaceGrid;
