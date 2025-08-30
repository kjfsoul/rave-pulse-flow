import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Rss, RefreshCw, AlertCircle, Smartphone } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase, LiveFeedItem } from '@/lib/supabase';
import { toast } from 'sonner';
import EnhancedFeedCard from './EnhancedFeedCard';
import MobileSwipeFeed from './MobileSwipeFeed';
import RSSWebSocketManager from './RSSWebSocketManager';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const RSSFeedStreamer: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [feedItems, setFeedItems] = useState<LiveFeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');

  const fetchFeedItems = async () => {
    try {
      setLoading(true);
      setError(null);

      const query = supabase
        .from('live_feed')
        .select('*')
        .not('title', 'eq', 'Connection Test')
        .not('source', 'eq', 'System by System')
        .order('pub_date', { ascending: false })
        .range((page - 1) * 3, page * 3 - 1);

      const { data, error: fetchError } = await query;

      if (fetchError) {
        throw fetchError;
      }

      if (data) {
        setFeedItems(data);
        if (data.length < 3) {
          setHasMore(false);
        }
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleViewMore = () => {
    if (!user) {
      toast.info('Sign up to view more news!');
      navigate('/profile');
    } else {
      if (hasMore && !loading) {
        setPage(prevPage => prevPage + 1);
      }
    }
  };

  useEffect(() => {
    fetchFeedItems();
  }, [page, location.pathname]);

  const refreshFeed = async () => {
    setPage(1);
    await fetchFeedItems();
    toast.success('Feed refreshed!');
  };

  const handleNewArticle = (newArticle: LiveFeedItem) => {
    setFeedItems(prev => [newArticle, ...prev.slice(0, 2)]);
  };

  const handleUpdate = (updatedArticle: LiveFeedItem) => {
    setFeedItems(prev =>
      prev.map(item =>
        item.id === updatedArticle.id ? updatedArticle : item
      )
    );
  };

  const handleWebSocketError = (error: any) => {
    // toast.error('Real-time connection error.');
  };

  return (
    <div className="w-full bg-transparent display-text">
      <RSSWebSocketManager
        onNewArticle={handleNewArticle}
        onUpdate={handleUpdate}
        onError={handleWebSocketError}
      />
      <div className="max-w-7xl mx-auto px-4 py-4">
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
              <motion.div
                className="absolute -top-1 -right-1 w-3 h-3 bg-neon-green rounded-full"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            </motion.div>
            <div>
              <h2 className="text-lg font-bold text-white glow">Enhanced EDM Live Feed</h2>
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

        {loading && feedItems.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Rss className="w-6 h-6 text-neon-purple" />
            </motion.div>
            <span className="ml-2 text-slate-400">Loading EDM news...</span>
          </div>
        ) : error ? (
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
        ) : (
          <>
            {viewMode === 'desktop' ? (
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              >
                {feedItems.map((item, index) => (
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
            ) : (
              <MobileSwipeFeed items={feedItems} />
            )}

            {hasMore && (
              <div className="flex justify-center mt-4">
                <Button onClick={handleViewMore} disabled={loading}>
                  {loading ? 'Loading...' : 'View More'}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default RSSFeedStreamer;