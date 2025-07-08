import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Music, Radio, ExternalLink, Clock, Rss } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface FeedItem {
  id: string;
  title: string;
  description: string;
  link: string;
  pubDate: string;
  category: 'music' | 'festival' | 'news';
  source: string;
  image?: string;
}

// Mock RSS data - In production, this would come from actual RSS feeds
const mockFeedData: FeedItem[] = [
  {
    id: '1',
    title: 'Ultra Music Festival 2024 Lineup Revealed',
    description: 'The biggest names in EDM confirmed for Miami\'s ultimate dance music experience',
    link: 'https://example.com/ultra-2024',
    pubDate: '2024-01-15T12:00:00Z',
    category: 'festival',
    source: 'EDM.com',
    image: '🎪'
  },
  {
    id: '2',
    title: 'David Guetta Drops New Progressive House Anthem',
    description: 'The French DJ returns with a euphoric 7-minute journey through electronic bliss',
    link: 'https://example.com/guetta-new-track',
    pubDate: '2024-01-14T18:30:00Z',
    category: 'music',
    source: 'Dance Music Weekly',
    image: '🎵'
  },
  {
    id: '3',
    title: 'Tomorrowland Winter 2024 Dates Announced',
    description: 'The alpine edition returns to France with an incredible mountain festival experience',
    link: 'https://example.com/tomorrowland-winter',
    pubDate: '2024-01-14T10:15:00Z',
    category: 'festival',
    source: 'Festival Insider',
    image: '⛷️'
  },
  {
    id: '4',
    title: 'Deadmau5 Launches New Record Label',
    description: 'Electronic music pioneer creates platform for underground progressive artists',
    link: 'https://example.com/deadmau5-label',
    pubDate: '2024-01-13T16:45:00Z',
    category: 'news',
    source: 'Electronic Music News',
    image: '🏷️'
  },
  {
    id: '5',
    title: 'Electric Daisy Carnival Las Vegas 2024',
    description: 'Three days of non-stop electronic music under the electric sky returns to Vegas',
    link: 'https://example.com/edc-vegas-2024',
    pubDate: '2024-01-13T14:20:00Z',
    category: 'festival',
    source: 'Rave Central',
    image: '🎆'
  },
  {
    id: '6',
    title: 'Skrillex Collaborates with Four Tet',
    description: 'Unexpected collaboration between dubstep king and experimental electronic artist',
    link: 'https://example.com/skrillex-fourtet',
    pubDate: '2024-01-12T20:00:00Z',
    category: 'music',
    source: 'Beats Magazine',
    image: '🤝'
  }
];

const RSSFeedStreamer: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [feedItems] = useState<FeedItem[]>(mockFeedData);

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

  if (feedItems.length === 0) return null;

  return (
    <div className="w-full bg-gradient-to-r from-bass-dark via-bass-medium to-bass-dark border-b border-neon-purple/20">
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
              className="w-8 h-8 bg-gradient-to-r from-neon-purple to-neon-cyan rounded-full flex items-center justify-center"
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
            </motion.div>
            <div>
              <h2 className="text-lg font-bold text-white">EDM Live Feed</h2>
              <p className="text-xs text-slate-400">Latest music & festival updates</p>
            </div>
          </motion.div>

          <Badge variant="outline" className="bg-neon-cyan/10 text-neon-cyan border-neon-cyan/30">
            Live
          </Badge>
        </div>

        {/* Desktop View - Horizontal Scroll */}
        <div className="hidden md:block">
          <motion.div 
            className="flex gap-4 overflow-hidden"
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
          >
            <AnimatePresence mode="popLayout">
              {getVisibleItems().map((item, index) => (
                <motion.div
                  key={`${item.id}-${currentIndex}`}
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex-1 min-w-0"
                >
                  <Card className="bg-bass-medium/50 border-neon-purple/20 hover:border-neon-purple/40 transition-all duration-300 cursor-pointer group h-full">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="text-2xl flex-shrink-0">{item.image}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={`text-xs ${getCategoryColor(item.category)}`}>
                              {getCategoryIcon(item.category)}
                              <span className="ml-1 capitalize">{item.category}</span>
                            </Badge>
                            <span className="text-xs text-slate-400">{item.source}</span>
                          </div>
                          <h3 className="font-semibold text-white text-sm leading-tight mb-2 group-hover:text-neon-cyan transition-colors line-clamp-2">
                            {item.title}
                          </h3>
                          <p className="text-xs text-slate-400 line-clamp-2 mb-2">
                            {item.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-500 flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              {formatTimeAgo(item.pubDate)}
                            </span>
                            <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-neon-cyan transition-colors" />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Mobile View - Single Item */}
        <div className="md:hidden">
          <motion.div
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                <Card className="bg-bass-medium/50 border-neon-purple/20 hover:border-neon-purple/40 transition-all duration-300 cursor-pointer group">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="text-2xl flex-shrink-0">{getCurrentItem().image}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={`text-xs ${getCategoryColor(getCurrentItem().category)}`}>
                            {getCategoryIcon(getCurrentItem().category)}
                            <span className="ml-1 capitalize">{getCurrentItem().category}</span>
                          </Badge>
                          <span className="text-xs text-slate-400">{getCurrentItem().source}</span>
                        </div>
                        <h3 className="font-semibold text-white text-sm leading-tight mb-2 group-hover:text-neon-cyan transition-colors">
                          {getCurrentItem().title}
                        </h3>
                        <p className="text-xs text-slate-400 mb-2">
                          {getCurrentItem().description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-500 flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {formatTimeAgo(getCurrentItem().pubDate)}
                          </span>
                          <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-neon-cyan transition-colors" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {/* Progress Indicators */}
          <div className="flex justify-center gap-1 mt-3">
            {feedItems.map((_, index) => (
              <motion.button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex 
                    ? 'bg-neon-purple shadow-lg shadow-neon-purple/50' 
                    : 'bg-slate-600 hover:bg-slate-500'
                }`}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
              />
            ))}
          </div>
        </div>

        {/* TODO: Integrate with real RSS feeds */}
        {/* TODO: Add error handling for failed RSS requests */}
        {/* TODO: Implement caching mechanism for feed data */}
        {/* TODO: Add user preferences for feed sources */}
      </div>
    </div>
  );
};

export default RSSFeedStreamer;