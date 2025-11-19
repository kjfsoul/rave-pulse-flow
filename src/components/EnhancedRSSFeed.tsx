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
import { AnimatePresence, motion, PanInfo } from "framer-motion";
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
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import EnhancedFeedCard from "./EnhancedFeedCard";

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

interface FeedMetadata {
  generated: string;
  totalItems: number;
  totalSources: number;
  activeSources: number;
  sources: string[];
}

interface StaticFeedItem {
  id: string;
  title: string;
  description: string;
  fullContent?: string | null;
  link: string;
  pubDate: string;
  source: string;
  feedCategory?: string;
  contentCategory?: string;
  sentiment?: "positive" | "negative" | "neutral";
  priority?: number;
  image?: string | null;
  hasFullContent?: boolean;
  tags?: string[];
}

interface StaticFeedResponse {
  metadata: FeedMetadata;
  featured?: StaticFeedItem[];
  items: StaticFeedItem[];
}

const FALLBACK_ITEMS: EnhancedFeedItem[] = [
  {
    id: "fallback-1",
    title: "Tomorrowland 2025 Announces First Wave of Artists",
    description:
      "Tomorrowland reveals its 2025 lineup with headliners Armin van Buuren, Charlotte de Witte, and Martin Garrix. Ticket presales start next week.",
    link: "#",
    pub_date: new Date().toISOString(),
    category: "festival",
    source: "Tomorrowland",
    tags: ["festival", "lineup"],
    read_time: 2,
    sentiment: "positive",
    priority: 95,
    trending: true,
    featured: true,
  },
  {
    id: "fallback-2",
    title: "Deadmau5 Drops Surprise Album 'where phantoms sleep 04'",
    description:
      "Featuring collaborations with Rezz and Kaskade, Deadmau5 releases a surprise album exploring progressive and techno landscapes.",
    link: "#",
    pub_date: new Date(Date.now() - 3600 * 1000).toISOString(),
    category: "music",
    source: "EDM.com",
    tags: ["release", "album"],
    read_time: 3,
    sentiment: "positive",
    priority: 90,
    trending: true,
  },
  {
    id: "fallback-3",
    title: "Techno’s Underground Collectives Are Making Waves",
    description:
      "Independent techno collectives across Berlin, Detroit, and Seoul are redefining the rave experience with intimate warehouse events.",
    link: "#",
    pub_date: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    category: "news",
    source: "Dancing Astronaut",
    tags: ["techno", "culture"],
    read_time: 4,
    sentiment: "positive",
    priority: 70,
  },
];

const mapCategory = (category?: string): "music" | "festival" | "news" => {
  const normalized = (category || "").toLowerCase();
  if (normalized === "festivals" || normalized === "festival") return "festival";
  if (
    normalized === "releases" ||
    normalized === "music" ||
    normalized === "bass" ||
    normalized === "house" ||
    normalized === "production"
  ) {
    return "music";
  }
  return "news";
};

import { ChevronLeft, ChevronRight } from "lucide-react";

const EnhancedRSSFeed: React.FC = () => {
  const [feedItems, setFeedItems] = useState<EnhancedFeedItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<EnhancedFeedItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 6; // 2 rows × 3 columns
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("connecting");
  const [showFilters, setShowFilters] = useState(false);
  const [metadata, setMetadata] = useState<FeedMetadata | null>(null);
  const [filters, setFilters] = useState<FilterOptions>({
    category: "all",
    source: "all",
    sentiment: "all",
    sortBy: "date",
    searchQuery: "",
  });

  const [isChangingPage, setIsChangingPage] = useState(false);

  const mapStaticFeedItem = useCallback(
    (
      item: StaticFeedItem,
      featuredIds: Set<string>
    ): EnhancedFeedItem => {
      const category = mapCategory(item.contentCategory || item.feedCategory);
      const readTime = Math.max(
        1,
        Math.round((item.description?.split(/\s+/).length || 0) / 200)
      );
      const trending = Boolean(item.priority && item.priority >= 80);

      return {
        id: item.id,
        title: item.title ?? "Untitled",
        description: item.description ?? "",
        link: item.link,
        pub_date: item.pubDate,
        category,
        source: item.source,
        image_url: item.image ?? undefined,
        tags: item.tags ?? [],
        read_time: readTime,
        sentiment: (item.sentiment ?? "neutral") as
          | "positive"
          | "negative"
          | "neutral",
        priority: item.priority,
        trending,
        featured: featuredIds.has(item.id),
      };
    },
    []
  );

  const loadEmbeddedFallback = useCallback(() => {
    setFeedItems(FALLBACK_ITEMS);
    setFilteredItems(FALLBACK_ITEMS);
    setMetadata({
      generated: new Date().toISOString(),
      totalItems: FALLBACK_ITEMS.length,
      totalSources: 1,
      activeSources: 1,
      sources: Array.from(new Set(FALLBACK_ITEMS.map((item) => item.source))),
    });
    setConnectionStatus("error");
  }, []);

  const loadStaticFeed = useCallback(
    (data: StaticFeedResponse, origin: "primary" | "backup") => {
      if (!data?.items?.length) {
        throw new Error("Feed returned no items");
      }

      const featuredIds = new Set(
        data.featured?.map((item) => item.id) ?? []
      );
      const mappedItems = data.items.map((item) =>
        mapStaticFeedItem(item, featuredIds)
      );
      setFeedItems(mappedItems);
      setMetadata(data.metadata);

      const generatedTime = data.metadata?.generated
        ? new Date(data.metadata.generated)
        : null;
      const hoursSinceUpdate = generatedTime
        ? (Date.now() - generatedTime.getTime()) / 3_600_000
        : null;
      if (hoursSinceUpdate !== null && hoursSinceUpdate > 48) {
        setConnectionStatus("stale");
        if (origin === "backup") {
          toast.warning("Using backup news feed (latest refresh delayed).");
        }
      } else {
        setConnectionStatus("subscribed");
        if (origin === "backup") {
          toast.warning("Primary feed unavailable. Using backup copy.");
        }
      }
    },
    [mapStaticFeedItem]
  );

  // Fetch RSS feed via proxy to avoid CORS issues
  const fetchRSSViaProxy = useCallback(async (rssUrl: string): Promise<string> => {
    try {
      const { data, error } = await supabase.functions.invoke('rss-proxy', {
        body: { url: rssUrl },
      });

      if (error) {
        throw new Error(error.message || 'Failed to fetch RSS feed');
      }

      if (typeof data !== 'string') {
        throw new Error('Invalid response format from RSS proxy');
      }

      return data;
    } catch (error) {
      console.error('[RSS Proxy] Error:', error);
      throw error;
    }
  }, []);

  // Parse RSS XML content using native browser DOMParser and convert to StaticFeedResponse format
  const parseRSSXML = useCallback((xmlText: string, sourceUrl: string): StaticFeedResponse => {
    try {
      // Extract source name from URL
      const urlObj = new URL(sourceUrl);
      const sourceName = urlObj.hostname.replace('www.', '').split('.')[0]
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ') || 'RSS Feed';

      // Parse XML using native browser API
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

      // Check for parsing errors
      const parseError = xmlDoc.querySelector('parsererror');
      if (parseError) {
        throw new Error('Failed to parse XML: ' + parseError.textContent);
      }

      // Get all items (RSS 2.0) or entries (Atom)
      const items = Array.from(xmlDoc.querySelectorAll('item, entry'));

      // Extract feed image if available
      const feedImage = xmlDoc.querySelector('image url, image url')?.textContent ||
                        xmlDoc.querySelector('itunes\\:image, itunes:image')?.getAttribute('href') || null;

      // Analyze content for category and sentiment
      const analyzeContent = (text: string): { category: 'music' | 'festival' | 'news'; sentiment: 'positive' | 'negative' | 'neutral' } => {
        const lowerText = text.toLowerCase();
        let category: 'music' | 'festival' | 'news' = 'news';
        let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral';

        if (lowerText.includes('festival') || lowerText.includes('concert') || lowerText.includes('event')) {
          category = 'festival';
        } else if (lowerText.includes('release') || lowerText.includes('album') || lowerText.includes('single')) {
          category = 'music';
        }

        const positiveWords = ['amazing', 'incredible', 'epic', 'best', 'awesome', 'legendary', 'winner', 'success'];
        const negativeWords = ['canceled', 'delay', 'problem', 'issue', 'criticism', 'controversy'];

        const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length;
        const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length;

        if (positiveCount > negativeCount) sentiment = 'positive';
        else if (negativeCount > positiveCount) sentiment = 'negative';

        return { category, sentiment };
      };

      // Extract image from item
      const extractImage = (item: Element): string | null => {
        // Try media:content (RSS Media extension)
        const mediaContent = item.querySelector('media\\:content, media:content');
        if (mediaContent?.getAttribute('url')) {
          return mediaContent.getAttribute('url');
        }

        // Try media:thumbnail
        const mediaThumbnail = item.querySelector('media\\:thumbnail, media:thumbnail');
        if (mediaThumbnail?.getAttribute('url')) {
          return mediaThumbnail.getAttribute('url');
        }

        // Try enclosure (RSS 2.0)
        const enclosure = item.querySelector('enclosure');
        if (enclosure?.getAttribute('type')?.startsWith('image/')) {
          return enclosure.getAttribute('url');
        }

        // Try to extract from description/content HTML
        const description = item.querySelector('description, content, summary')?.textContent || '';
        const imgMatch = description.match(/<img[^>]+src=["']([^"']+)["']/i);
        if (imgMatch?.[1]) return imgMatch[1];

        return feedImage;
      };

      // Convert RSS items to StaticFeedItem format
      const convertedItems: StaticFeedItem[] = items.map((item, index) => {
        const title = item.querySelector('title')?.textContent?.trim() || 'Untitled';
        const link = item.querySelector('link')?.textContent?.trim() ||
                     item.querySelector('link')?.getAttribute('href') ||
                     item.querySelector('id')?.textContent?.trim() ||
                     '#';
        const description = item.querySelector('description, content, summary')?.textContent?.trim() || '';
        const pubDate = item.querySelector('pubDate, published, updated')?.textContent?.trim() ||
                        item.querySelector('pubDate, published, updated')?.getAttribute('dateTime') ||
                        new Date().toISOString();

        const guid = item.querySelector('guid, id')?.textContent?.trim() || link;
        const image = extractImage(item);
        const analysis = analyzeContent(`${title} ${description}`);

        // Calculate priority based on recency and content
        const pubDateObj = new Date(pubDate);
        const hoursSincePub = (Date.now() - pubDateObj.getTime()) / (1000 * 60 * 60);
        let priority = 50;
        if (hoursSincePub < 24) priority = 90;
        else if (hoursSincePub < 48) priority = 70;
        else if (hoursSincePub < 72) priority = 50;
        else priority = 30;

        if (analysis.sentiment === 'positive') priority += 10;
        if (image) priority += 5;

        // Strip HTML from description
        const cleanDescription = description.replace(/<[^>]*>/g, '').trim().slice(0, 350);

        return {
          id: guid || `rss-${index}`,
          title,
          description: cleanDescription,
          fullContent: item.querySelector('content\\:encoded, content:encoded, content')?.textContent || null,
          link,
          pubDate,
          source: sourceName,
          feedCategory: analysis.category,
          contentCategory: analysis.category,
          sentiment: analysis.sentiment,
          priority: Math.min(100, Math.max(0, priority)),
          image,
          hasFullContent: Boolean(item.querySelector('content\\:encoded, content:encoded')),
          tags: [analysis.category, analysis.sentiment].filter(Boolean),
        };
      });

      // Filter items from last 48 hours
      const now = Date.now();
      const fortyEightHoursAgo = now - (48 * 60 * 60 * 1000);
      const recentItems = convertedItems.filter(item => {
        const itemDate = new Date(item.pubDate).getTime();
        return itemDate >= fortyEightHoursAgo;
      });

      return {
        metadata: {
          generated: new Date().toISOString(),
          totalItems: recentItems.length,
          totalSources: 1,
          activeSources: 1,
          sources: [sourceName],
        },
        featured: recentItems.filter(item => item.priority >= 80).slice(0, 3),
        items: recentItems.sort((a, b) => {
          // Sort by priority first, then by date
          if (b.priority !== a.priority) return b.priority - a.priority;
          return new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime();
        }),
      };
    } catch (error) {
      console.error('[RSS Parser] Error parsing XML:', error);
      throw new Error(`Failed to parse RSS feed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }, []);

  const fetchJson = useCallback(async (url: string) => {
    // Check if this is an RSS feed URL (should use proxy)
    if (url.match(/\.(xml|rss|atom)$/i) || url.includes('/feed')) {
      const xmlContent = await fetchRSSViaProxy(url);
      const parsedFeed = parseRSSXML(xmlContent, url);
      return parsedFeed;
    }

    const response = await fetch(url, {
      cache: "no-store",
    });
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }
    return (await response.json()) as StaticFeedResponse;
  }, [fetchRSSViaProxy, parseRSSXML]);

  const fetchFeedItems = useCallback(
    async ({
      showToast = false,
      forceReload = false,
    }: {
      showToast?: boolean;
      forceReload?: boolean;
    } = {}) => {
      setLoading(true);
      setError(null);

      const querySuffix = forceReload ? `?ts=${Date.now()}` : "";

      try {
        const primaryData = await fetchJson(
          `/data/edm-news.json${querySuffix}`
        );
        loadStaticFeed(primaryData, "primary");
        if (showToast) {
          toast.success("News feed refreshed.");
        }
      } catch (primaryError) {
        console.error("Primary feed failed:", primaryError);
        try {
          const backupData = await fetchJson(
            `/data/edm-news-backup.json${querySuffix}`
          );
          loadStaticFeed(backupData, "backup");
          if (showToast) {
            toast.success("Loaded backup feed.");
          }
        } catch (backupError) {
          console.error("Backup feed failed:", backupError);
          setError("Unable to load news feed right now.");
          setConnectionStatus("error");
          loadEmbeddedFallback();
        }
      } finally {
        setLoading(false);
      }
    },
    [fetchJson, loadEmbeddedFallback, loadStaticFeed]
  );

  const refreshFeed = async () => {
    toast.info("Refreshing EDM news feed...");
    await fetchFeedItems({ showToast: true, forceReload: true });
  };

  useEffect(() => {
    fetchFeedItems();
  }, [fetchFeedItems]);

  // Filter items from last 48 hours
  useEffect(() => {
    const now = Date.now();
    const fortyEightHoursAgo = now - (48 * 60 * 60 * 1000);

    const recentItems = feedItems.filter(item => {
      const itemDate = new Date(item.pub_date).getTime();
      return itemDate >= fortyEightHoursAgo;
    });

    setFilteredItems(recentItems);
  }, [feedItems]);

  // Apply additional filters (search, category, etc.)
  useEffect(() => {
    let filtered = [...feedItems];

    // 48-hour filter FIRST
    const now = Date.now();
    const fortyEightHoursAgo = now - (48 * 60 * 60 * 1000);
    filtered = filtered.filter(item => {
      const itemDate = new Date(item.pub_date).getTime();
      return itemDate >= fortyEightHoursAgo;
    });

    // Then apply user filters
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

    // Sorting
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
    setCurrentPage(1); // Reset to page 1 when filters change
  }, [feedItems, filters]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentItems = filteredItems.slice(startIndex, endIndex);

  const goToNextPage = useCallback(() => {
    if (currentPage < totalPages) {
      setIsChangingPage(true);
      setTimeout(() => {
        setCurrentPage(prev => prev + 1);
        setIsChangingPage(false);
        document.getElementById('rss-feed-top')?.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }, 150);
    }
  }, [currentPage, totalPages]);

  const goToPrevPage = useCallback(() => {
    if (currentPage > 1) {
      setIsChangingPage(true);
      setTimeout(() => {
        setCurrentPage(prev => prev - 1);
        setIsChangingPage(false);
        document.getElementById('rss-feed-top')?.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }, 150);
    }
  }, [currentPage]);

  // Add this to your component
  const handleDragEnd = (
    event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    const swipeThreshold = 50;

    // Swipe left (next page)
    if (info.offset.x < -swipeThreshold && currentPage < totalPages) {
      goToNextPage();
    }

    // Swipe right (previous page)
    if (info.offset.x > swipeThreshold && currentPage > 1) {
      goToPrevPage();
    }
  };

  const uniqueSources = useMemo(() => {
    if (metadata?.sources?.length) return metadata.sources;
    return Array.from(new Set(feedItems.map((item) => item.source)));
  }, [feedItems, metadata]);

  const stats = useMemo(() => {
    // Only count items from last 48 hours
    const now = Date.now();
    const fortyEightHoursAgo = now - (48 * 60 * 60 * 1000);

    const recentItems = feedItems.filter(item => {
      const itemDate = new Date(item.pub_date).getTime();
      return itemDate >= fortyEightHoursAgo;
    });

    return {
      total: recentItems.length,
      trending: recentItems.filter((item) => item.trending).length,
      featured: recentItems.filter((item) => item.featured).length,
    };
  }, [feedItems]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" && currentPage > 1) {
        goToPrevPage();
      }
      if (e.key === "ArrowRight" && currentPage < totalPages) {
        goToNextPage();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [currentPage, totalPages, goToPrevPage, goToNextPage]);

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
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <motion.div
          id="rss-feed-top"
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
                AI-powered EDM news — last 48 hours from {metadata?.sources?.length ?? uniqueSources.length} sources
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2">
              <Badge
                variant="outline"
                className="bg-neon-cyan/10 text-neon-cyan border-neon-cyan/30"
              >
                {filteredItems.length} in 48h
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

        {/* Content - Carousel with Pagination */}
        {currentItems.length > 0 ? (
          <div className="space-y-6">
            <div className="relative">
              {isChangingPage && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 bg-bass-dark/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Rss className="w-8 h-8 text-neon-purple" />
                  </motion.div>
                </motion.div>
              )}

              {/* Carousel Grid - 2 rows × 3 columns */}
              <motion.div
                key={currentPage} // Re-animate on page change
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 cursor-grab active:cursor-grabbing"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={handleDragEnd}
              >
                {currentItems.map((item, index) => (
                  <EnhancedFeedCard
                    key={`${item.id}-${currentPage}-${index}`}
                    item={item}
                    index={index}
                    isHovered={false}
                    onHoverStart={() => {}}
                    onHoverEnd={() => {}}
                  />
                ))}
              </motion.div>
            </div>

                {/* Mobile Pagination - Simplified */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-neon-purple/20">
                  <Button
                    onClick={goToPrevPage}
                    disabled={currentPage === 1}
                    variant="outline"
                    size="lg"
                    aria-label="Go to previous page"
                    aria-disabled={currentPage === 1}
                        className={`
                      w-full sm:w-auto
                      border-neon-purple/30 text-white
                      ${currentPage === 1
                        ? 'opacity-30 cursor-not-allowed'
                        : 'hover:bg-neon-purple/20 hover:border-neon-purple'
                      }
                    `}
                  >
                    <ChevronLeft className="w-5 h-5 mr-2" />
                    Previous
                  </Button>

                  {/* Page Indicator - Stacked on Mobile */}
                  <div className="flex flex-col items-center gap-2">
                    <p className="text-sm text-slate-400">
                      Page {currentPage} of {totalPages}
                    </p>
                    <p className="text-xs text-slate-500">
                      {startIndex + 1}-{Math.min(endIndex, filteredItems.length)} of {filteredItems.length} stories
                    </p>

                    {/* Mobile Page Dots - Show only on tablet+ */}
                    {totalPages <= 10 && (
                      <div className="hidden sm:flex items-center gap-2 mt-2">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <button
                            key={page}
                            onClick={() => {
                              setCurrentPage(page);
                              document.getElementById('rss-feed-top')?.scrollIntoView({
                                behavior: 'smooth'
                              });
                            }}
                            className={`
                              w-2 h-2 rounded-full transition-all
                              ${page === currentPage
                                ? 'bg-neon-purple w-8'
                                : 'bg-slate-600 hover:bg-slate-500'
                              }
                            `}
                            aria-label={`Go to page ${page}`}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  <Button
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                    variant="outline"
                    size="lg"
                    aria-label="Go to next page"
                    aria-disabled={currentPage === totalPages}
                    className={`
                      w-full sm:w-auto
                      border-neon-purple/30 text-white
                      ${currentPage === totalPages
                        ? 'opacity-30 cursor-not-allowed'
                        : 'hover:bg-neon-purple/20 hover:border-neon-purple'
                      }
                    `}
                  >
                    Next
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </Button>
                            </div>

                            {/* Live region for screen readers */}
                            <div
                              role="status"
                              aria-live="polite"
                              aria-atomic="true"
                              className="sr-only"
                            >
                              Page {currentPage} of {totalPages}, showing {currentItems.length} articles
                            </div>

                            {/* Quick Jump (optional - for many pages) */}
                            {totalPages > 10 && (
                              <div className="flex items-center justify-center gap-2 pt-4">
                                <span className="text-sm text-slate-400">Jump to page:</span>
                                <Input
                                  type="number"
                                  min={1}
                                  max={totalPages}
                                  value={currentPage}
                                  onChange={(e) => {
                                    const page = parseInt(e.target.value);
                                    if (page >= 1 && page <= totalPages) {
                                      setCurrentPage(page);
                                      document.getElementById('rss-feed-top')?.scrollIntoView({
                                        behavior: 'smooth'
                                      });
                                    }
                                  }}
                                  className="w-20 bg-bass-dark/50 border-slate-600/30 text-white text-center"
                                />
                              </div>
                            )}
                          </div>
                        ) : (
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center py-12"
                          >
                            <Rss className="w-12 h-12 mx-auto text-slate-500" />
                            <h3 className="mt-4 text-xl font-bold text-white">
                              No Articles Found in Last 48 Hours
                            </h3>
                            <p className="mt-2 text-slate-400">
                              Try adjusting your filters or check back later for fresh content.
                            </p>
                            <Button
                              onClick={refreshFeed}
                              variant="outline"
                              className="mt-6 border-neon-purple/30 text-neon-purple"
                            >
                              <RefreshCw className="w-4 h-4 mr-2" />
                              Refresh Feed
                            </Button>
                          </motion.div>
                        )}

                        {/* View All Stories Link */}
                        <div className="text-center pt-6">
                          <Button
                            variant="ghost"
                            size="lg"
                            className="text-neon-cyan hover:text-neon-purple transition-colors"
                            onClick={() => window.location.href = '/news'}
                          >
                            View All {filteredItems.length} Stories from Last 48 Hours
                            <ChevronRight className="w-4 h-4 ml-2" />
                          </Button>
                        </div>

                        <StatusIndicator />
                      </div>
                    </div>
                  );
                };

export default EnhancedRSSFeed;
