import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Rss,
  RefreshCw,
  AlertCircle,
  Search,
  Filter,
  TrendingUp,
  Star,
  Zap,
  Settings,
  Eye,
  Heart,
  Calendar,
  Music,
  Radio
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import EnhancedFeedCard from './EnhancedFeedCard';

interface EnhancedFeedItem {
  id: string;
  title: string;
  description: string;
  link: string;
  pub_date: string;
  category: 'music' | 'festival' | 'news';
  source: string;
  image_url?: string;
  author?: string;
  tags?: string[];
  read_time?: number;
  sentiment?: 'positive' | 'negative' | 'neutral';
  priority?: number;
  trending?: boolean;
  featured?: boolean;
}

interface FilterOptions {
  category: string;
  source: string;
  sentiment: string;
  sortBy: 'date' | 'priority' | 'trending';
  searchQuery: string;
}

const EnhancedRSSFeed: React.FC = () => {
  const [feedItems, setFeedItems] = useState<EnhancedFeedItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<EnhancedFeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    category: 'all',
    source: 'all',
    sentiment: 'all',
    sortBy: 'date',
    searchQuery: ''
  });

  // Real-time subscription ref
  const subscriptionRef = useRef<any>(null);

  // Fetch feed items from Supabase
  const fetchFeedItems = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('live_feed')
        .select('*')
        .order('pub_date', { ascending: false })
        .limit(50);

      if (fetchError) {
        throw fetchError;
      }

      if (data && data.length > 0) {
        setFeedItems(data);
        setLastRefresh(new Date());
      } else {
        setError('No feed items available. Refresh to fetch latest news.');
      }
    } catch (err) {
      console.error('Error fetching feed items:', err);
      setError('Failed to load news feed. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Trigger RSS feed update via Edge Function
  const refreshFeed = async () => {
    try {
      toast.info('Fetching latest EDM news...');

      const { data, error: functionError } = await supabase.functions.invoke('fetch-rss-feeds');

      if (functionError) {
        throw functionError;
      }

      if (data?.success) {
        toast.success(`Updated with ${data.itemsUpserted} new articles!`);
        await fetchFeedItems();
      } else {
        toast.error('Failed to update news feed');
      }
    } catch (err) {
      console.error('Error refreshing feed:', err);
      toast.error('Failed to refresh news feed');
    }
  };

  // Setup real-time subscription
  useEffect(() => {
    const setupRealtimeSubscription = () => {
      subscriptionRef.current = supabase
        .channel('live_feed_changes')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'live_feed'
          },
          (payload) => {
            console.log('New feed item:', payload.new);
            setFeedItems(prev => [payload.new as EnhancedFeedItem, ...prev]);
            toast.info('New article added!', {
              description: (payload.new as EnhancedFeedItem).title.substring(0, 50) + '...'
            });
          }
        )
        .subscribe();
    };

    setupRealtimeSubscription();

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
    };
  }, []);

  // Apply filters and search
  useEffect(() => {
    let filtered = [...feedItems];

    // Search filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.source.toLowerCase().includes(query) ||
        (item.tags && item.tags.some(tag => tag.toLowerCase().includes(query)))
      );
    }

    // Category filter
    if (filters.category !== 'all') {
      filtered = filtered.filter(item => item.category === filters.category);
    }

    // Source filter
    if (filters.source !== 'all') {
      filtered = filtered.filter(item => item.source === filters.source);
    }

    // Sentiment filter
    if (filters.sentiment !== 'all') {
      filtered = filtered.filter(item => item.sentiment === filters.sentiment);
    }

    // Sorting
    switch (filters.sortBy) {
      case 'priority':
        filtered.sort((a, b) => (b.priority || 0) - (a.priority || 0));
        break;
      case 'trending':
        filtered.sort((a, b) => {
          if (a.trending && !b.trending) return -1;
          if (!a.trending && b.trending) return 1;
          return new Date(b.pub_date).getTime() - new Date(a.pub_date).getTime();
        });
        break;
      case 'date':
      default:
        filtered.sort((a, b) => new Date(b.pub_date).getTime() - new Date(a.pub_date).getTime());
        break;
    }

    setFilteredItems(filtered);
  }, [feedItems, filters]);

  // Initial fetch
  useEffect(() => {
    fetchFeedItems();
  }, []);

  // Get unique sources for filter dropdown
  const uniqueSources = Array.from(new Set(feedItems.map(item => item.source)));

  // Get feed statistics
  const stats = {
    total: feedItems.length,
    trending: feedItems.filter(item => item.trending).length,
    featured: feedItems.filter(item => item.featured).length,
    positive: feedItems.filter(item => item.sentiment === 'positive').length
  };

  // Loading state
  if (loading) {
    return (
      <div className="w-full bg-gradient-to-r from-bass-dark via-bass-medium to-bass-dark border-b border-neon-purple/20">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-12">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Rss className="w-8 h-8 text-neon-purple" />
            </motion.div>
            <span className="ml-3 text-slate-400 text-lg">Loading enhanced EDM news feed...</span>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && feedItems.length === 0) {
    return (
      <div className="w-full bg-gradient-to-r from-bass-dark via-bass-medium to-bass-dark border-b border-neon-purple/20">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-slate-400">
              <AlertCircle className="w-6 h-6" />
              <span className="text-sm">{error}</span>
            </div>
            <Button
              onClick={refreshFeed}
              size="sm"
              variant="outline"
              className="border-neon-purple/30 hover:border-neon-purple/50"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-gradient-to-r from-bass-dark via-bass-medium to-bass-dark border-b border-neon-purple/20">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Enhanced Header */}
        <motion.div
          className="flex items-center justify-between mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-4">
            <motion.div
              className="w-10 h-10 bg-gradient-to-r from-neon-purple to-neon-cyan rounded-full flex items-center justify-center relative"
              animate={{
                boxShadow: [
                  '0 0 20px rgba(191, 90, 242, 0.5)',
                  '0 0 40px rgba(6, 255, 165, 0.5)',
                  '0 0 20px rgba(191, 90, 242, 0.5)'
                ]
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Rss className="w-5 h-5 text-white" />
              <motion.div
                className="absolute -top-1 -right-1 w-3 h-3 bg-neon-green rounded-full"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            </motion.div>

            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                Enhanced EDM Feed
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Zap className="w-5 h-5 text-neon-cyan" />
                </motion.div>
              </h2>
              <p className="text-sm text-slate-400">Real-time EDM news with AI-powered insights</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Stats Badges */}
            <div className="hidden md:flex items-center gap-2">
              <Badge variant="outline" className="bg-neon-cyan/10 text-neon-cyan border-neon-cyan/30">
                {stats.total} articles
              </Badge>
              {stats.trending > 0 && (
                <Badge variant="outline" className="bg-neon-pink/10 text-neon-pink border-neon-pink/30">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {stats.trending} trending
                </Badge>
              )}
              {stats.featured > 0 && (
                <Badge variant="outline" className="bg-yellow-500/10 text-yellow-400 border-yellow-400/30">
                  <Star className="w-3 h-3 mr-1" />
                  {stats.featured} featured
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2">
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
                title="Refresh news feed"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 overflow-hidden"
            >
              <Card className="bg-bass-medium/30 border-neon-purple/20">
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    {/* Search */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        placeholder="Search articles..."
                        value={filters.searchQuery}
                        onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
                        className="pl-10 bg-bass-dark/50 border-slate-600/30 text-white placeholder:text-slate-400"
                      />
                    </div>

                    {/* Category Filter */}
                    <Select
                      value={filters.category}
                      onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger className="bg-bass-dark/50 border-slate-600/30 text-white">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="music">Music</SelectItem>
                        <SelectItem value="festival">Festival</SelectItem>
                        <SelectItem value="news">News</SelectItem>
                      </SelectContent>
                    </Select>

                    {/* Source Filter */}
                    <Select
                      value={filters.source}
                      onValueChange={(value) => setFilters(prev => ({ ...prev, source: value }))}
                    >
                      <SelectTrigger className="bg-bass-dark/50 border-slate-600/30 text-white">
                        <SelectValue placeholder="Source" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Sources</SelectItem>
                        {uniqueSources.map(source => (
                          <SelectItem key={source} value={source}>{source}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Sentiment Filter */}
                    <Select
                      value={filters.sentiment}
                      onValueChange={(value) => setFilters(prev => ({ ...prev, sentiment: value }))}
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

                    {/* Sort By */}
                    <Select
                      value={filters.sortBy}
                      onValueChange={(value: any) => setFilters(prev => ({ ...prev, sortBy: value }))}
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

        {/* Feed Grid */}
        {filteredItems.length > 0 ? (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <AnimatePresence mode="popLayout">
              {filteredItems.map((item, index) => (
                <EnhancedFeedCard
                  key={`${item.id}-${index}`}
                  item={item}
                  index={index}
                  isHovered={hoveredIndex === index}
                  onHoverStart={() => setHoveredIndex(index)}
                  onHoverEnd={() => setHoveredIndex(null)}
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
            <div className="text-6xl mb-4">🎵</div>
            <h3 className="text-xl font-semibold text-white mb-2">No articles found</h3>
            <p className="text-slate-400 mb-4">
              {filters.searchQuery || filters.category !== 'all' || filters.source !== 'all'
                ? 'Try adjusting your filters'
                : 'No articles available at the moment'}
            </p>
            <Button
              onClick={refreshFeed}
              variant="outline"
              className="border-neon-purple/30 hover:border-neon-purple/50"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Feed
            </Button>
          </motion.div>
        )}

        {/* Real-time Indicator */}
        <motion.div
          className="fixed bottom-4 right-4 z-50"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          <Badge className="bg-neon-green/20 text-neon-green border-neon-green/30">
            <motion.div
              className="w-2 h-2 bg-neon-green rounded-full mr-2"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
            Live Updates Active
          </Badge>
        </motion.div>
      </div>
    </div>
  );
};

export default EnhancedRSSFeed;
