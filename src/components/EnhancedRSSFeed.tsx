import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/lib/supabase";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  Filter,
  RefreshCw,
  Rss,
  Search,
  Signal,
  SignalHigh,
  SignalLow,
  SignalMedium,
  Star,
  TrendingUp,
  XCircle,
  Zap,
} from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import EnhancedFeedCard from "./EnhancedFeedCard";
import RSSWebSocketManager from "./RSSWebSocketManager";

// Types
type ConnectionStatus =
  | "subscribed"
  | "connecting"
  | "disconnected"
  | "error"
  | "stale";

interface EnhancedFeedItem {
  id: string;
  title: string;
  description: string;
  link: string;
  pub_date: string;
  category: "music" | "festival" | "news";
  source: string;
  image_url?: string;
  author?: string;
  tags?: string[];
  read_time?: number;
  sentiment?: "positive" | "negative" | "neutral";
  priority?: number;
  trending?: boolean;
  featured?: boolean;
}

interface FilterOptions {
  category: string;
  source: string;
  sentiment: string;
  sortBy: "date" | "priority" | "trending";
  searchQuery: string;
}

// Helper function to check for stale data (now checks for 2 days for daily updates)
const isDataStale = (items: EnhancedFeedItem[]): boolean => {
  if (items.length === 0) return false;
  const latestPostDate = new Date(items[0].pub_date);
  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2); // 48 hours for daily RSS updates
  return latestPostDate < twoDaysAgo;
};

const EnhancedRSSFeed: React.FC = () => {
  const [feedItems, setFeedItems] = useState<EnhancedFeedItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<EnhancedFeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("connecting");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    category: "all",
    source: "all",
    sentiment: "all",
    sortBy: "date",
    searchQuery: "",
  });

  const fetchFeedItems = useCallback(
    async (isFallback = false) => {
      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from("live_feed")
          .select("*")
          .order("pub_date", { ascending: false })
          .limit(50);

        if (fetchError) throw fetchError;

        if (data && data.length > 0) {
          setFeedItems(data);
          if (isDataStale(data) && connectionStatus !== "error") {
            setConnectionStatus("stale");
            toast.warning("RSS feed is stale", {
              description:
                "Data hasn't updated in over 48 hours. Attempting to refresh...",
            });
            refreshFeed();
          }
        } else {
          setError("No feed items available. The rave gods are silent.");
        }
      } catch (err) {
        console.error("Error fetching feed items:", err);
        setError("Failed to load news feed. The signal is lost.");
        setConnectionStatus("error");
      } finally {
        setLoading(false);
      }
    },
    [connectionStatus]
  );

  const refreshFeed = async () => {
    try {
      toast.info("Forcing feed refresh...");
      const { data, error: functionError } = await supabase.functions.invoke(
        "fetch-rss-feeds"
      );
      if (functionError) throw functionError;
      if (data?.success) {
        toast.success(
          `Feed refresh successful! ${data.itemsUpserted || 0} new articles.`
        );
        await fetchFeedItems();
      } else {
        toast.error("Feed refresh failed on the server.");
      }
    } catch (err) {
      console.error("Error refreshing feed:", err);
      toast.error("Failed to trigger feed refresh.");
    }
  };

  const handleNewArticle = (article: EnhancedFeedItem) => {
    setFeedItems((prev) => [
      article,
      ...prev.filter((item) => item.id !== article.id),
    ]);
  };

  const handleWebSocketError = ({
    message,
    isFinal,
  }: {
    message: string;
    isFinal: boolean;
  }) => {
    setError(message);
    if (isFinal) {
      setConnectionStatus("error");
      toast.error("RSS connection failed. Falling back to static feed.", {
        description:
          "You'll see the latest loaded data. RSS feeds update daily.",
      });
      fetchFeedItems(true); // Fetch as a fallback
    }
  };

  useEffect(() => {
    fetchFeedItems();
  }, [fetchFeedItems]);

  useEffect(() => {
    let filtered = [...feedItems];
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.title.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query) ||
          item.source.toLowerCase().includes(query) ||
          (item.tags &&
            item.tags.some((tag) => tag.toLowerCase().includes(query)))
      );
    }
    if (filters.category !== "all")
      filtered = filtered.filter((item) => item.category === filters.category);
    if (filters.source !== "all")
      filtered = filtered.filter((item) => item.source === filters.source);
    if (filters.sentiment !== "all")
      filtered = filtered.filter(
        (item) => item.sentiment === filters.sentiment
      );

    switch (filters.sortBy) {
      case "priority":
        filtered.sort((a, b) => (b.priority || 0) - (a.priority || 0));
        break;
      case "trending":
        filtered.sort((a, b) =>
          a.trending === b.trending ? 0 : a.trending ? -1 : 1
        );
        break;
      default:
        filtered.sort(
          (a, b) =>
            new Date(b.pub_date).getTime() - new Date(a.pub_date).getTime()
        );
        break;
    }
    setFilteredItems(filtered);
  }, [feedItems, filters]);

  const uniqueSources = Array.from(
    new Set(feedItems.map((item) => item.source))
  );
  const stats = {
    total: feedItems.length,
    trending: feedItems.filter((item) => item.trending).length,
    featured: feedItems.filter((item) => item.featured).length,
  };

  const StatusIndicator = () => {
    const indicatorMap = {
      subscribed: {
        icon: SignalHigh,
        color: "text-neon-green",
        text: "Daily Updates",
      },
      connecting: {
        icon: Signal,
        color: "text-yellow-400 animate-pulse",
        text: "Connecting...",
      },
      disconnected: {
        icon: SignalLow,
        color: "text-orange-500",
        text: "Reconnecting...",
      },
      error: {
        icon: XCircle,
        color: "text-neon-pink",
        text: "Connection Failed",
      },
      stale: {
        icon: SignalMedium,
        color: "text-amber-500",
        text: "Feed Stale",
      },
    };
    const { icon: Icon, color, text } = indicatorMap[connectionStatus];

    return (
      <motion.div
        className="fixed bottom-4 right-4 z-50"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Badge
          className={`bg-black/50 border ${color.replace(
            "text-",
            "border-"
          )} backdrop-blur-sm`}
        >
          <Icon className={`w-4 h-4 mr-2 ${color}`} />
          <span className={color}>{text}</span>
        </Badge>
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="w-full bg-gradient-to-r from-bass-dark via-bass-medium to-bass-dark py-8">
        <div className="flex items-center justify-center py-12">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          >
            <Rss className="w-8 h-8 text-neon-purple" />
          </motion.div>
          <span className="ml-3 text-slate-400 text-lg">
            Tuning into the digital underground...
          </span>
        </div>
      </div>
    );
  }

  if (error && feedItems.length === 0) {
    return (
      <div className="w-full bg-gradient-to-r from-bass-dark via-bass-medium to-bass-dark py-8">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 mx-auto text-neon-pink" />
          <h3 className="mt-4 text-xl font-bold text-white">
            Connection Error
          </h3>
          <p className="mt-2 text-slate-400">{error}</p>
          <Button
            onClick={refreshFeed}
            size="sm"
            variant="outline"
            className="mt-6 border-neon-purple text-neon-purple"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-gradient-to-r from-bass-dark via-bass-medium to-bass-dark border-b border-neon-purple/20">
      <RSSWebSocketManager
        onNewArticle={handleNewArticle}
        onUpdate={handleNewArticle} // Treat updates as new articles for simplicity
        onError={handleWebSocketError}
        onStatusChange={setConnectionStatus}
      />
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <motion.div
          className="flex items-center justify-between mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-4">
            <motion.div
              className="w-10 h-10 bg-gradient-to-r from-neon-purple to-neon-cyan rounded-full flex items-center justify-center"
              animate={{
                boxShadow: [
                  "0 0 20px rgba(191, 90, 242, 0.5)",
                  "0 0 40px rgba(6, 255, 165, 0.5)",
                  "0 0 20px rgba(191, 90, 242, 0.5)",
                ],
              }}
              transition={{ duration: 2.5, repeat: Infinity }}
            >
              <Rss className="w-5 h-5 text-white" />
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                Enhanced EDM Feed <Zap className="w-5 h-5 text-neon-cyan" />
              </h2>
              <p className="text-sm text-slate-400">
                AI-powered, real-time rave news
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2">
              <Badge
                variant="outline"
                className="bg-neon-cyan/10 text-neon-cyan border-neon-cyan/30"
              >
                {stats.total} total
              </Badge>
              {stats.trending > 0 && (
                <Badge
                  variant="outline"
                  className="bg-neon-pink/10 text-neon-pink border-neon-pink/30"
                >
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {stats.trending} trending
                </Badge>
              )}
              {stats.featured > 0 && (
                <Badge
                  variant="outline"
                  className="bg-yellow-500/10 text-yellow-400 border-yellow-400/30"
                >
                  <Star className="w-3 h-3 mr-1" />
                  {stats.featured} featured
                </Badge>
              )}
            </div>
            <Button
              onClick={() => setShowFilters(!showFilters)}
              size="sm"
              variant="ghost"
              className="text-slate-400 hover:text-white"
            >
              <Filter className="w-4 h-4" />
            </Button>
            <Button
              onClick={refreshFeed}
              size="sm"
              variant="ghost"
              className="text-slate-400 hover:text-white"
              title="Force refresh feed"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>

        {/* Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 overflow-hidden"
            >
              <Card className="bg-bass-medium/30 border-neon-purple/20">
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div className="relative col-span-1 md:col-span-2">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        placeholder="Search articles..."
                        value={filters.searchQuery}
                        onChange={(e) =>
                          setFilters((prev) => ({
                            ...prev,
                            searchQuery: e.target.value,
                          }))
                        }
                        className="pl-10 bg-bass-dark/50 border-slate-600/30 text-white"
                      />
                    </div>
                    <Select
                      value={filters.source}
                      onValueChange={(value) =>
                        setFilters((prev) => ({ ...prev, source: value }))
                      }
                    >
                      <SelectTrigger className="bg-bass-dark/50 border-slate-600/30 text-white">
                        <SelectValue placeholder="Source" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Sources</SelectItem>
                        {uniqueSources.map((source) => (
                          <SelectItem key={source} value={source}>
                            {source}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={filters.sentiment}
                      onValueChange={(value) =>
                        setFilters((prev) => ({ ...prev, sentiment: value }))
                      }
                    >
                      <SelectTrigger className="bg-bass-dark/50 border-slate-600/30 text-white">
                        <SelectValue placeholder="Sentiment" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Sentiments</SelectItem>
                        <SelectItem value="positive">Positive</SelectItem>
                        <SelectItem value="neutral">Neutral</SelectItem>
                        <SelectItem value="negative">Negative</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select
                      value={filters.sortBy}
                      onValueChange={(value: any) =>
                        setFilters((prev) => ({ ...prev, sortBy: value }))
                      }
                    >
                      <SelectTrigger className="bg-bass-dark/50 border-slate-600/30 text-white">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="date">Latest</SelectItem>
                        <SelectItem value="priority">Priority</SelectItem>
                        <SelectItem value="trending">Trending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content */}
        {filteredItems.length > 0 ? (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <AnimatePresence>
              {filteredItems.map((item, index) => (
                <EnhancedFeedCard
                  key={`${item.id}-${index}`}
                  item={item}
                  index={index}
                  isHovered={false}
                  onHoverStart={() => {}}
                  onHoverEnd={() => {}}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <Rss className="w-12 h-12 mx-auto text-slate-500" />
            <h3 className="mt-4 text-xl font-bold text-white">
              No Articles Found
            </h3>
            <p className="mt-2 text-slate-400">
              Try adjusting your filters or refreshing the feed.
            </p>
            <Button
              onClick={refreshFeed}
              variant="outline"
              className="mt-6 border-neon-purple/30 text-neon-purple"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </motion.div>
        )}

        <StatusIndicator />
      </div>
    </div>
  );
};

export default EnhancedRSSFeed;
