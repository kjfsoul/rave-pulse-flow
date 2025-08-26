import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
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
  Zap,
  ChevronLeft,
  ChevronRight,
  Eye,
  MessageCircle,
  Music,
  Calendar,
  Radio
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

interface MobileSwipeFeedProps {
  items: EnhancedFeedItem[];
}

const MobileSwipeFeed: React.FC<MobileSwipeFeedProps> = ({ items }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragDirection, setDragDirection] = useState<'left' | 'right' | null>(null);
  const constraintsRef = useRef<HTMLDivElement>(null);

  const currentItem = items[currentIndex];
  const nextItem = items[(currentIndex + 1) % items.length];
  const prevItem = items[(currentIndex - 1 + items.length) % items.length];

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

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const handleDragEnd = (event: any, info: PanInfo) => {
    setIsDragging(false);
    const threshold = 100;

    if (info.offset.x > threshold) {
      // Swipe right - previous item
      setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
      setDragDirection(null);
    } else if (info.offset.x < -threshold) {
      // Swipe left - next item
      setCurrentIndex((prev) => (prev + 1) % items.length);
      setDragDirection(null);
    } else {
      setDragDirection(null);
    }
  };

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDrag = (event: any, info: PanInfo) => {
    if (Math.abs(info.offset.x) > 10) {
      setDragDirection(info.offset.x > 0 ? 'right' : 'left');
    }
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
  };

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: currentItem.title,
          text: currentItem.description,
          url: currentItem.link,
        });
        toast.success('Shared successfully!');
      } catch (err) {
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(currentItem.link);
      toast.success('Link copied to clipboard!');
    } catch (err) {
      toast.error('Failed to copy link');
    }
  };

  const handleLike = () => {
    toast.success('Added to favorites!');
  };

  if (!currentItem) return null;

  return (
    <div className="relative h-screen w-full overflow-hidden bg-gradient-to-br from-bass-dark via-bass-medium to-bass-dark">
      {/* Progress Indicators */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 flex gap-1">
        {items.map((_, index) => (
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

      {/* Navigation Buttons */}
      <motion.button
        onClick={goToPrev}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 w-10 h-10 bg-bass-medium/80 backdrop-blur-sm rounded-full flex items-center justify-center border border-neon-purple/20"
        whileHover={{ scale: 1.1, x: -2 }}
        whileTap={{ scale: 0.9 }}
      >
        <ChevronLeft className="w-5 h-5 text-neon-purple" />
      </motion.button>

      <motion.button
        onClick={goToNext}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 w-10 h-10 bg-bass-medium/80 backdrop-blur-sm rounded-full flex items-center justify-center border border-neon-purple/20"
        whileHover={{ scale: 1.1, x: 2 }}
        whileTap={{ scale: 0.9 }}
      >
        <ChevronRight className="w-5 h-5 text-neon-purple" />
      </motion.button>

      {/* Swipe Container */}
      <div
        ref={constraintsRef}
        className="h-full w-full relative"
      >
        {/* Previous Card (behind) */}
        <motion.div
          key={`prev-${prevItem.id}`}
          className="absolute inset-4 z-10"
          initial={{ opacity: 0, scale: 0.9, x: '-100%' }}
          animate={{ opacity: 0.3, scale: 0.9, x: '-50%' }}
          transition={{ duration: 0.3 }}
        >
          <Card className="h-full bg-bass-medium/30 border-neon-purple/10 rounded-2xl overflow-hidden">
            <CardContent className="p-4 h-full flex flex-col justify-center">
              <div className="text-center opacity-50">
                <div className="text-4xl mb-2">{getSourceEmoji(prevItem.source, prevItem.category)}</div>
                <h3 className="text-sm font-medium text-slate-400 line-clamp-2">{prevItem.title}</h3>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Current Card */}
        <motion.div
          key={`current-${currentItem.id}`}
          className="absolute inset-4 z-20"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          drag="x"
          dragConstraints={constraintsRef}
          dragElastic={0.1}
          onDragStart={handleDragStart}
          onDrag={handleDrag}
          onDragEnd={handleDragEnd}
          whileDrag={{ scale: 1.02, rotateY: dragDirection === 'left' ? -5 : dragDirection === 'right' ? 5 : 0 }}
        >
            <Card className="h-full bg-gradient-to-br from-bass-medium/80 to-bass-dark/80 border-neon-purple/30 rounded-2xl overflow-hidden backdrop-blur-sm relative group">
              {/* Featured/Trending Badge */}
              {(currentItem.featured || currentItem.trending) && (
                <motion.div
                  className="absolute top-4 right-4 z-30"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <Badge className={`${
                    currentItem.featured
                      ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-yellow-400/30'
                      : 'bg-gradient-to-r from-neon-pink to-neon-purple text-white border-neon-pink/30'
                  }`}>
                    {currentItem.featured ? <Star className="w-3 h-3 mr-1" /> : <TrendingUp className="w-3 h-3 mr-1" />}
                    {currentItem.featured ? 'Featured' : 'Trending'}
                  </Badge>
                </motion.div>
              )}

              {/* Priority Indicator */}
              {currentItem.priority && currentItem.priority >= 4 && (
                <motion.div
                  className="absolute top-4 left-4 z-30"
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white border-red-400/30">
                    <Zap className="w-3 h-3 mr-1" />
                    Hot
                  </Badge>
                </motion.div>
              )}

              <CardContent className="p-6 h-full flex flex-col">
                {/* Header */}
                <div className="flex items-center gap-3 mb-4">
                  <motion.div
                    className="text-3xl flex-shrink-0"
                    whileHover={{ scale: 1.2, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    {getSourceEmoji(currentItem.source, currentItem.category)}
                  </motion.div>

                  <div className="flex-1 min-w-0">
                    <Badge className={`text-xs mb-1 ${getCategoryColor(currentItem.category)}`}>
                      {getCategoryIcon(currentItem.category)}
                      <span className="ml-1 capitalize">{currentItem.category}</span>
                    </Badge>
                    <p className="text-xs text-slate-400">{currentItem.source}</p>
                    {currentItem.author && (
                      <p className="text-xs text-slate-500">by {currentItem.author}</p>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col justify-center text-center">
                  <motion.h2
                    className="text-xl font-bold text-white mb-4 leading-tight"
                    layoutId={`title-${currentItem.id}`}
                  >
                    {currentItem.title}
                  </motion.h2>

                  <motion.p
                    className="text-sm text-slate-300 mb-4 line-clamp-3"
                    layoutId={`description-${currentItem.id}`}
                  >
                    {currentItem.description}
                  </motion.p>

                  {/* Tags */}
                  {currentItem.tags && currentItem.tags.length > 0 && (
                    <div className="flex flex-wrap justify-center gap-2 mb-4">
                      {currentItem.tags.slice(0, 3).map((tag, tagIndex) => (
                        <motion.span
                          key={tag}
                          className="text-xs bg-bass-dark/50 text-slate-400 px-3 py-1 rounded-full border border-slate-600/30"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: tagIndex * 0.1 }}
                        >
                          #{tag}
                        </motion.span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="mt-auto">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-4">
                    <span className="flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {formatTimeAgo(currentItem.pub_date)}
                    </span>

                    {currentItem.read_time && (
                      <span className="flex items-center">
                        <Eye className="w-3 h-3 mr-1" />
                        {currentItem.read_time}min
                      </span>
                    )}

                    {currentItem.sentiment && (
                      <span className={`flex items-center ${
                        currentItem.sentiment === 'positive' ? 'text-green-400' :
                        currentItem.sentiment === 'negative' ? 'text-red-400' : 'text-gray-400'
                      }`}>
                        {currentItem.sentiment === 'positive' ? '😊' :
                         currentItem.sentiment === 'negative' ? '😔' : '😐'}
                      </span>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <motion.button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLike();
                        }}
                        className="w-10 h-10 bg-bass-dark/50 backdrop-blur-sm rounded-full flex items-center justify-center border border-slate-600/30 hover:border-red-400/50 transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Heart className="w-4 h-4 text-slate-400 hover:text-red-400 transition-colors" />
                      </motion.button>

                      <motion.button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleShare();
                        }}
                        className="w-10 h-10 bg-bass-dark/50 backdrop-blur-sm rounded-full flex items-center justify-center border border-slate-600/30 hover:border-neon-cyan/50 transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Share2 className="w-4 h-4 text-slate-400 hover:text-neon-cyan transition-colors" />
                      </motion.button>
                    </div>

                    <motion.a
                      href={currentItem.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-12 h-10 bg-gradient-to-r from-neon-purple to-neon-cyan rounded-full flex items-center justify-center text-white font-medium hover:shadow-lg hover:shadow-neon-purple/50 transition-all"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </motion.a>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Next Card (behind) */}
          <motion.div
            key={`next-${nextItem.id}`}
            className="absolute inset-4 z-10"
            initial={{ opacity: 0, scale: 0.9, x: '100%' }}
            animate={{ opacity: 0.3, scale: 0.9, x: '50%' }}
            transition={{ duration: 0.3 }}
          >
            <Card className="h-full bg-bass-medium/30 border-neon-purple/10 rounded-2xl overflow-hidden">
              <CardContent className="p-4 h-full flex flex-col justify-center">
                <div className="text-center opacity-50">
                  <div className="text-4xl mb-2">{getSourceEmoji(nextItem.source, nextItem.category)}</div>
                  <h3 className="text-sm font-medium text-slate-400 line-clamp-2">{nextItem.title}</h3>
                </div>
              </CardContent>
            </Card>
          </motion.div>
      </div>

      {/* Swipe Hint */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
      >
        <p className="text-xs text-slate-400 mb-2">Swipe to navigate</p>
        <motion.div
          className="flex gap-1"
          animate={{ x: [0, 20, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-1 h-1 bg-neon-purple rounded-full" />
          <div className="w-1 h-1 bg-slate-600 rounded-full" />
          <div className="w-1 h-1 bg-slate-600 rounded-full" />
        </motion.div>
      </motion.div>
    </div>
  );
};

export default MobileSwipeFeed;
