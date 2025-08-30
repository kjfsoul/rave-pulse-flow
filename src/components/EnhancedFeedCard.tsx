import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Heart,
  Share2,
  Clock,
  ExternalLink,
  TrendingUp,
  Star,
  MessageCircle,
  Eye,
  Calendar,
  Music,
  Radio,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';

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

interface EnhancedFeedCardProps {
  item: EnhancedFeedItem;
  index: number;
  isHovered: boolean;
  onHoverStart: () => void;
  onHoverEnd: () => void;
}

const EnhancedFeedCard: React.FC<EnhancedFeedCardProps> = ({
  item,
  index,
  isHovered,
  onHoverStart,
  onHoverEnd
}) => {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Enhanced emoji mapping with more variety
  const getSourceEmoji = (source: string, category: string): string => {
    const sourceMap: Record<string, string> = {
      'Your EDM': '🎵',
      'Dancing Astronaut': '🚀',
      'EDM.com': '🎪',
      'Beatport': '💾',
      'Resident Advisor': '🎧',
      'Insomniac': '⚡',
      'DJ Mag': '🎤',
      'Mixmag': '🎛️'
    };

    const categoryMap: Record<string, string> = {
      'music': '🎵',
      'festival': '🎪',
      'news': '📰'
    };

    return sourceMap[source] || categoryMap[category] || '🎧';
  };

  // Enhanced category styling with more visual appeal
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'music': return <Music className="w-4 h-4" />;
      case 'festival': return <Calendar className="w-4 h-4" />;
      case 'news': return <Radio className="w-4 h-4" />;
      default: return <Zap className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'music': return 'bg-gradient-to-r from-neon-purple/20 to-neon-cyan/20 text-neon-purple border-neon-purple/30';
      case 'festival': return 'bg-gradient-to-r from-neon-cyan/20 to-neon-blue/20 text-neon-cyan border-neon-cyan/30';
      case 'news': return 'bg-gradient-to-r from-neon-pink/20 to-neon-purple/20 text-neon-pink border-neon-pink/30';
      default: return 'bg-gradient-to-r from-gray-500/20 to-gray-600/20 text-gray-400 border-gray-500/30';
    }
  };

  const getSentimentColor = (sentiment?: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-400';
      case 'negative': return 'text-red-400';
      default: return 'text-gray-400';
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

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: item.title,
          text: item.description,
          url: item.link,
        });
        toast.success('Shared successfully!');
      } catch (err) {
        // Fallback to clipboard
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(item.link);
      toast.success('Link copied to clipboard!');
    } catch (err) {
      toast.error('Failed to copy link');
    }
  };

  const handleLike = () => {
    toast.success('Added to favorites!');
    // Here you would typically save to user's favorites
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      onHoverStart={onHoverStart}
      onHoverEnd={onHoverEnd}
      className="relative group"
    >
      <div className="relative bg-bass-medium/50 border border-neon-purple/20 hover:border-neon-purple/40 transition-all duration-300 cursor-pointer group overflow-hidden h-64 rounded-lg flex flex-col">
        {/* Featured/Trending Badge */}
        <AnimatePresence>
          {(item.featured || item.trending) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute top-2 right-2 z-10"
            >
              <Badge className={`${
                item.featured
                  ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-yellow-400/30'
                  : 'bg-gradient-to-r from-neon-pink to-neon-purple text-white border-neon-pink/30'
              }`}>
                {item.featured ? <Star className="w-3 h-3 mr-1" /> : <TrendingUp className="w-3 h-3 mr-1" />}
                {item.featured ? 'Featured' : 'Trending'}
              </Badge>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Priority Indicator */}
        {item.priority && item.priority >= 4 && (
          <motion.div
            className="absolute top-2 left-2 z-10"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white border-red-400/30">
              <Zap className="w-3 h-3 mr-1" />
              Hot
            </Badge>
          </motion.div>
        )}

        <CardContent className="p-4">
          {item.image_url && (
            <div className="mb-4">
              <img src={item.image_url} alt={item.title} className="rounded-lg w-full h-auto" loading="lazy" />
            </div>
          )}
          <a href={item.link} target="_blank" rel="noopener noreferrer" className="block">
            <div className="flex items-start gap-3">
              {/* Enhanced Source Emoji with Animation */}
              <motion.div
                className="text-2xl flex-shrink-0 relative"
                whileHover={{ scale: 1.2, rotate: 5 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                {getSourceEmoji(item.source, item.category)}
                {item.sentiment === 'positive' && (
                  <motion.div
                    className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                )}
              </motion.div>

              <div className="flex-1 min-w-0">
                {/* Enhanced Header with Tags */}
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <Badge className={`text-sm font-rajdhani font-medium ${getCategoryColor(item.category)}`}>
                    {getCategoryIcon(item.category)}
                    <span className="ml-1 capitalize">{item.category}</span>
                  </Badge>

                  <span className="font-rajdhani text-sm text-slate-400 font-medium">{item.source}</span>

                  {item.author && (
                    <span className="font-rajdhani text-sm text-slate-500">by {item.author}</span>
                  )}
                </div>

                {/* Title with Enhanced Hover Effects */}
                <h3 className="font-rajdhani font-bold text-white text-base leading-snug mb-3 group-hover:text-neon-cyan transition-colors line-clamp-2 relative tracking-wide">
                  {item.title}
                  <motion.div
                    className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-neon-purple to-neon-cyan group-hover:w-full transition-all duration-300"
                    initial={{ width: 0 }}
                    whileHover={{ width: '100%' }}
                  />
                </h3>

                {/* Description */}
                <p className="font-rajdhani text-sm text-slate-300 line-clamp-2 mb-3 leading-relaxed">
                  {item.description}
                </p>

                {/* Tags */}
                {item.tags && item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {item.tags.slice(0, 3).map((tag, tagIndex) => (
                      <motion.span
                        key={tag}
                        className="font-rajdhani text-sm bg-bass-dark/50 text-slate-300 px-3 py-1 rounded-full border border-slate-600/30 font-medium"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 + tagIndex * 0.05 }}
                      >
                        #{tag}
                      </motion.span>
                    ))}
                  </div>
                )}

                {/* Enhanced Footer */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-sm text-slate-500">
                    <span className="font-rajdhani flex items-center font-medium">
                      <Clock className="w-4 h-4 mr-1" />
                      {formatTimeAgo(item.pub_date)}
                    </span>

                    {item.read_time && (
                      <span className="font-rajdhani flex items-center font-medium">
                        <Eye className="w-4 h-4 mr-1" />
                        {item.read_time}min
                      </span>
                    )}

                    {item.sentiment && (
                      <span className={`flex items-center text-base ${getSentimentColor(item.sentiment)}`}>
                        {item.sentiment === 'positive' ? '😊' : item.sentiment === 'negative' ? '😔' : '😐'}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <motion.button
                      onClick={(e) => {
                        e.preventDefault();
                        handleLike();
                      }}
                      className="p-1 rounded-full hover:bg-bass-dark/50 transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Heart className="w-3 h-3 text-slate-500 hover:text-red-400 transition-colors" />
                    </motion.button>

                    <motion.button
                      onClick={(e) => {
                        e.preventDefault();
                        handleShare();
                      }}
                      className="p-1 rounded-full hover:bg-bass-dark/50 transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Share2 className="w-3 h-3 text-slate-500 hover:text-neon-cyan transition-colors" />
                    </motion.button>

                    <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-neon-cyan transition-colors" />
                  </div>
                </div>
              </div>
            </div>
          </a>
        </CardContent>

        {/* Enhanced Hover Glow Effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-neon-purple/5 to-neon-cyan/5 rounded-lg pointer-events-none"
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </motion.div>
  );
};

export default EnhancedFeedCard;
