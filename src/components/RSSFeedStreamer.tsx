import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Music, Radio, ExternalLink, Clock, Rss, RefreshCw, AlertCircle, Smartphone } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase, LiveFeedItem } from '@/lib/supabase';
import { mockSupabase } from '@/lib/mockSupabase';
import { toast } from 'sonner';
import EnhancedFeedCard from './EnhancedFeedCard';
import MobileSwipeFeed from './MobileSwipeFeed';
import RSSWebSocketManager from './RSSWebSocketManager';

// Emoji mapping for different sources and categories
const getSourceEmoji = (source: string, category: string): string => {
  const sourceMap: Record<string, string> = {
    'Your EDM': '🎵',
    'Dancing Astronaut': '🚀',
    'EDM.com': '🎪'
  };

  const categoryMap: Record<string, string> = {
    'music': '🎵',
    'festival': '🎪',
    'news': '📰'
  };

  return sourceMap[source] || categoryMap[category] || '🎧';
};

const RSSFeedStreamer: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [feedItems, setFeedItems] = useState<LiveFeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [isMobile, setIsMobile] = useState(false);

  // Fetch feed items with smart fallback
  const fetchFeedItems = async () => {
    console.log('🔄 Starting fetchFeedItems...');
    console.log('📡 Environment check:', {
      supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
      hasAnonKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY
    });

    try {
      setLoading(true);
      setError(null);

      console.log('📡 Making Supabase request to live_feed table...');
      const { data, error: fetchError } = await supabase
        .from('live_feed')
        .select('*')
        .order('pub_date', { ascending: false })
        .limit(10);

      console.log('📊 Supabase response:', { data, error: fetchError });

      if (fetchError) {
        console.error('❌ Supabase error:', fetchError);

        // Provide specific error messages based on error type
        if (fetchError.code === 'PGRST116') {
          console.log('📋 Table "live_feed" does not exist - using demo data');
          setError('Database table not found. Please run the database migration first.');
        } else if (fetchError.message?.includes('JWT')) {
          console.log('🔐 Authentication error - using demo data');
          setError('Authentication error. Please check your Supabase configuration.');
        } else if (fetchError.message?.includes('fetch')) {
          console.log('🌐 Network error - using demo data');
          setError('Network error. Please check your connection.');
        } else {
          console.log('❓ Unknown error - using demo data');
          setError(`Database error: ${fetchError.message}`);
        }

        console.log('🔄 Falling back to demo data...');
        loadDemoData();
        return;
      }

      if (data && data.length > 0) {
        console.log('✅ Found', data.length, 'real feed items from Supabase');
        setFeedItems(data);
        setLastRefresh(new Date());
        setError(null);
      } else {
        console.log('⚠️ No feed items found, using demo data');
        loadDemoData();
      }
    } catch (err) {
      console.error('💥 Error fetching feed items:', err);
      console.log('🔄 Using demo data as fallback...');
      loadDemoData();
    } finally {
      console.log('🏁 Fetch complete');
      setLoading(false);
    }
  };

  // Load demo data when Supabase is not available
  const loadDemoData = () => {
    console.log('🎵 Loading demo EDM news data...');
    const demoData: LiveFeedItem[] = [
      {
        id: 'demo-1',
        title: 'Tomorrowland 2025 Announces First Wave of Artists',
        description: 'The iconic Belgian festival has revealed its initial lineup featuring David Guetta, Martin Garrix, and Armin van Buuren. Early bird tickets selling fast.',
        link: 'https://tomorrowland.com/news/2025-lineup',
        source: 'Tomorrowland',
        category: 'festival',
        pub_date: new Date(Date.now() - 900000).toISOString(), // 15 minutes ago
        guid: 'demo-guid-1',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        author: 'Festival Team',
        tags: ['festival', 'lineup', 'tomorrowland'],
        read_time: 2,
        sentiment: 'positive',
        priority: 5,
        trending: true,
        featured: true
      },
      {
        id: 'demo-2',
        title: 'Deadmau5 Releases New Album "where phantoms sleep 04"',
        description: 'The Canadian electronic music producer drops his highly anticipated album featuring collaborations with various artists in the EDM scene.',
        link: 'https://deadmau5.com/releases/where-phantoms-sleep-04',
        source: 'EDM.com',
        category: 'music',
        pub_date: new Date(Date.now() - 1800000).toISOString(), // 30 minutes ago
        guid: 'demo-guid-2',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        author: 'Music Editor',
        tags: ['deadmau5', 'album', 'electronic'],
        read_time: 3,
        sentiment: 'positive',
        priority: 4
      },
      {
        id: 'demo-3',
        title: 'Ultra Music Festival 2025 Dates Confirmed',
        description: 'Miami\'s premier electronic music festival has announced its 2025 dates and early planning for what promises to be another spectacular year.',
        link: 'https://ultramusicfestival.com/2025',
        source: 'Ultra Music',
        category: 'festival',
        pub_date: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        guid: 'demo-guid-3',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        author: 'Festival News',
        tags: ['ultra', 'miami', 'festival'],
        read_time: 2,
        sentiment: 'positive',
        priority: 3,
        featured: true
      },
      {
        id: 'demo-4',
        title: 'Techno Revolution: Underground Scenes Making Waves',
        description: 'How underground techno collectives are influencing mainstream electronic music and creating new subgenres that push creative boundaries.',
        link: 'https://dancingastronaut.com/underground-techno',
        source: 'Dancing Astronaut',
        category: 'news',
        pub_date: new Date(Date.now() - 5400000).toISOString(), // 1.5 hours ago
        guid: 'demo-guid-4',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        author: 'Culture Reporter',
        tags: ['techno', 'underground', 'culture'],
        read_time: 5,
        sentiment: 'neutral',
        priority: 2
      },
      {
        id: 'demo-5',
        title: 'Beatport Releases 2024 Year-End Report',
        description: 'The digital music store reveals the most popular tracks, artists, and emerging trends from the past year in electronic dance music.',
        link: 'https://beatport.com/year-end-2024',
        source: 'Beatport',
        category: 'news',
        pub_date: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
        guid: 'demo-guid-5',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        author: 'Analytics Team',
        tags: ['beatport', 'analytics', 'year-end'],
        read_time: 4,
        sentiment: 'positive',
        priority: 3
      },
      {
        id: 'demo-6',
        title: 'Rising Star: Meet the Next Big EDM Producer',
        description: 'An exclusive interview with an up-and-coming producer who\'s tracks have been gaining massive traction across streaming platforms.',
        link: 'https://insomniac.com/rising-stars',
        source: 'Insomniac',
        category: 'news',
        pub_date: new Date(Date.now() - 10800000).toISOString(), // 3 hours ago
        guid: 'demo-guid-6',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        author: 'Features Editor',
        tags: ['producer', 'interview', 'rising-star'],
        read_time: 6,
        sentiment: 'positive',
        priority: 4,
        trending: true
      }
    ];

    setFeedItems(demoData);
    setError('Demo mode: Supabase connection timeout, showing sample data. Create the live_feed table to see real RSS data.');
    console.log('✅ Demo data loaded successfully');
  };

  // Trigger RSS feed update via Edge Function
  const refreshFeed = async () => {
    try {
      toast.info('Fetching latest EDM news...');

      console.log('🚀 Calling fetch-rss-feeds Edge Function...');
      const { data, error: functionError } = await supabase.functions.invoke('fetch-rss-feeds', {
        body: {},
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('📊 Edge Function response:', { data, error: functionError });

      if (functionError) {
        console.error('❌ Edge function error:', functionError);

        // Check if it's a "function not found" error
        if (functionError.message?.includes('function') && functionError.message?.includes('not found')) {
          toast.error('RSS function not deployed. Please deploy the fetch-rss-feeds Edge Function first.');
          return;
        }

        toast.error(`Failed to fetch RSS feeds: ${functionError.message}`);
        return;
      }

      if (data?.success) {
        const message = data.itemsUpserted > 0
          ? `Updated with ${data.itemsUpserted} new articles from ${data.sources?.length || 0} sources!`
          : 'Feed refreshed - no new articles found';

        toast.success(message);

        // Fetch the updated items after a short delay to allow DB to update
        setTimeout(async () => {
          await fetchFeedItems();
        }, 1000);

      } else if (data?.success === false) {
        console.log('⚠️ Edge function returned error:', data.error);
        toast.warning(`Feed update completed with warnings: ${data.error || 'Unknown error'}`);
      } else {
        console.log('⚠️ Edge function returned unexpected response:', data);
        toast.warning('Feed refresh completed - checking for updates...');
      }

      // Always refresh local data
      await fetchFeedItems();

    } catch (err) {
      console.error('💥 Error refreshing feed:', err);

      // Provide specific error messages
      if (err.message?.includes('fetch')) {
        toast.error('Network error - please check your connection');
      } else if (err.message?.includes('timeout')) {
        toast.error('Request timeout - RSS service may be busy');
      } else {
        toast.error(`Failed to refresh RSS feed: ${err.message || 'Unknown error'}`);
      }
    }
  };

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      setViewMode(window.innerWidth < 768 ? 'mobile' : 'desktop');
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle real-time new articles
  const handleNewArticle = (newArticle: LiveFeedItem) => {
    console.log('New article received via WebSocket:', newArticle);
    setFeedItems(prev => [newArticle, ...prev]);
  };

  // Handle real-time updates
  const handleUpdate = (updatedArticle: LiveFeedItem) => {
    console.log('Article updated via WebSocket:', updatedArticle);
    setFeedItems(prev =>
      prev.map(item =>
        item.id === updatedArticle.id ? updatedArticle : item
      )
    );
  };

  // Handle WebSocket errors
  const handleWebSocketError = (error: any) => {
    console.error('WebSocket error:', error);
    toast.error('Real-time connection error. Some updates may be delayed.');
  };

  // Initial fetch on component mount with timeout
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading) {
        console.log('⏰ Loading timeout reached');
        setError('Loading timeout - please check your connection');
        setLoading(false);
      }
    }, 15000); // 15 second timeout

    fetchFeedItems();

    return () => clearTimeout(timeout);
  }, []);

  // Auto-advance the feed items
  useEffect(() => {
    if (!isHovered && feedItems.length > 0) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % feedItems.length);
      }, 4000); // Change every 4 seconds

      return () => clearInterval(interval);
    }
  }, [isHovered, feedItems.length]);

  const getCurrentItem = () => feedItems[currentIndex];
  const getVisibleItems = () => {
    const items = [];
    for (let i = 0; i < Math.min(3, feedItems.length); i++) {
      const index = (currentIndex + i) % feedItems.length;
      items.push(feedItems[index]);
    }
    return items;
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'music': return <Music className="w-4 h-4" />;
      case 'festival': return <Calendar className="w-4 h-4" />;
      case 'news': return <Radio className="w-4 h-4" />;
      default: return <Rss className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'music': return 'bg-neon-purple/20 text-neon-purple border-neon-purple/30';
      case 'festival': return 'bg-neon-cyan/20 text-neon-cyan border-neon-cyan/30';
      case 'news': return 'bg-neon-pink/20 text-neon-pink border-neon-pink/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  // Loading state
  if (loading) {
    return (
      <div className="w-full bg-gradient-to-r from-bass-dark via-bass-medium to-bass-dark border-b border-neon-purple/20">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-center py-8">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Rss className="w-6 h-6 text-neon-purple" />
            </motion.div>
            <span className="ml-2 text-slate-400">Loading EDM news...</span>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && feedItems.length === 0) {
    return (
      <div className="w-full bg-gradient-to-r from-bass-dark via-bass-medium to-bass-dark border-b border-neon-purple/20">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-400">
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm">{error}</span>
            </div>
            <Button
              onClick={refreshFeed}
              size="sm"
              variant="outline"
              className="border-neon-purple/30 hover:border-neon-purple/50"
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Refresh
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (feedItems.length === 0) return null;

  // Mobile Swipe View
  if (viewMode === 'mobile') {
    return <MobileSwipeFeed items={feedItems} />;
  }

  return (
    <div className="w-full bg-gradient-to-r from-bass-dark via-bass-medium to-bass-dark border-b border-neon-purple/20">
      {/* Real-time WebSocket Manager */}
      <RSSWebSocketManager
        onNewArticle={handleNewArticle}
        onUpdate={handleUpdate}
        onError={handleWebSocketError}
      />

      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <motion.div
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              className="w-8 h-8 bg-gradient-to-r from-neon-purple to-neon-cyan rounded-full flex items-center justify-center relative"
              animate={{
                boxShadow: [
                  '0 0 10px rgba(191, 90, 242, 0.5)',
                  '0 0 20px rgba(6, 255, 165, 0.5)',
                  '0 0 10px rgba(191, 90, 242, 0.5)'
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Rss className="w-4 h-4 text-white" />
              {/* Real-time indicator */}
              <motion.div
                className="absolute -top-1 -right-1 w-3 h-3 bg-neon-green rounded-full"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            </motion.div>
            <div>
              <h2 className="text-lg font-bold text-white">Enhanced EDM Live Feed</h2>
              <p className="text-xs text-slate-400">AI-powered news with real-time updates</p>
            </div>
          </motion.div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-neon-cyan/10 text-neon-cyan border-neon-cyan/30">
              <motion.div
                className="w-2 h-2 bg-neon-cyan rounded-full mr-2"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
              Live
            </Badge>

            {/* View Mode Toggle */}
            <Button
              onClick={() => setViewMode(viewMode === 'desktop' ? 'mobile' : 'desktop')}
              size="sm"
              variant="ghost"
              className="text-slate-400 hover:text-white"
              title={`Switch to ${viewMode === 'desktop' ? 'mobile' : 'desktop'} view`}
            >
              <Smartphone className="w-4 h-4" />
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

        {/* Desktop View - Enhanced Cards */}
        <div className="hidden md:block">
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
          >
            {feedItems.slice(0, 6).map((item, index) => (
              <motion.div
                key={`${item.id}-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <EnhancedFeedCard
                  item={item}
                  index={index}
                  isHovered={false}
                  onHoverStart={() => {}}
                  onHoverEnd={() => {}}
                />
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Mobile View - Enhanced Cards */}
        <div className="md:hidden">
          <motion.div
            className="space-y-4"
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
          >
            {feedItems.slice(0, 3).map((item, index) => (
              <motion.div
                key={`${item.id}-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <EnhancedFeedCard
                  item={item}
                  index={index}
                  isHovered={false}
                  onHoverStart={() => {}}
                  onHoverEnd={() => {}}
                />
              </motion.div>
            ))}
          </motion.div>
        </div>

      </div>
    </div>
  );
};

export default RSSFeedStreamer;
