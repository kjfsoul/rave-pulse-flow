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

// Debug component for production troubleshooting
const RSSFeedStreamerDebug: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [feedItems, setFeedItems] = useState<LiveFeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [isMobile, setIsMobile] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>({});

  // Enhanced fetch with detailed debugging
  const fetchFeedItems = async () => {
    const startTime = Date.now();
    console.log('🔄 [DEBUG] Starting fetchFeedItems at', new Date().toISOString());

    // Comprehensive environment check
    const envCheck = {
      supabaseUrl: import.meta.env.VITE_SUPABASE_URL ? '✅ Set' : '❌ Missing',
      hasAnonKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ Present' : '❌ Missing',
      nodeEnv: import.meta.env.NODE_ENV,
      mode: import.meta.env.MODE,
      isProduction: import.meta.env.PROD,
      isDev: import.meta.env.DEV,
      timestamp: new Date().toISOString()
    };

    console.log('📡 [DEBUG] Environment check:', envCheck);
    setDebugInfo(prev => ({ ...prev, envCheck }));

    try {
      setLoading(true);
      setError(null);

      console.log('📡 [DEBUG] Making Supabase request to live_feed table...');

      // Test basic connectivity first
      console.log('🔍 [DEBUG] Testing Supabase client...');
      const { data: testData, error: testError } = await supabase
        .from('live_feed')
        .select('count', { count: 'exact', head: true });

      console.log('🔍 [DEBUG] Connectivity test result:', {
        count: testData,
        error: testError,
        duration: Date.now() - startTime
      });

      // Add timeout to the request
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout after 10 seconds')), 10000);
      });

      const supabaseRequest = supabase
        .from('live_feed')
        .select('*')
        .order('pub_date', { ascending: false })
        .limit(10);

      console.log('🔍 [DEBUG] Executing main query...');

      const { data, error: fetchError } = await Promise.race([
        supabaseRequest,
        timeoutPromise
      ]) as any;

      const duration = Date.now() - startTime;
      console.log('📊 [DEBUG] Query completed in', duration, 'ms');

      const responseInfo = {
        data: data ? `${data.length} items received` : 'null',
        error: fetchError ? '❌ Error present' : '✅ No error',
        hasData: !!data,
        dataLength: data?.length || 0,
        duration,
        timestamp: new Date().toISOString()
      };

      console.log('📊 [DEBUG] Supabase response:', responseInfo);
      setDebugInfo(prev => ({ ...prev, responseInfo }));

      if (fetchError) {
        console.error('❌ [DEBUG] Supabase error details:', {
          message: fetchError.message,
          code: fetchError.code,
          details: fetchError.details,
          hint: fetchError.hint,
          fullError: fetchError
        });

        // Provide specific error messages based on error type
        if (fetchError.code === 'PGRST116' || fetchError.code === '42P01') {
          console.log('📋 [DEBUG] Table "live_feed" does not exist');
          setError('Database table not found. Please run the database migration first.');
        } else if (fetchError.message?.includes('JWT') || fetchError.code === 'PGRST301') {
          console.log('🔐 [DEBUG] Authentication/RLS error');
          setError('Access denied. Please check Supabase configuration and RLS policies.');
        } else if (fetchError.message?.includes('fetch') || fetchError.message?.includes('network')) {
          console.log('🌐 [DEBUG] Network connectivity error');
          setError('Network error. Please check your connection and Supabase status.');
        } else {
          console.log('❓ [DEBUG] Unknown database error');
          setError(`Database error: ${fetchError.message}`);
        }

        console.log('🔄 [DEBUG] Falling back to demo data...');
        loadDemoData();
        return;
      }

      if (data && data.length > 0) {
        console.log('✅ [DEBUG] Successfully loaded real feed items:', data.length);
        console.log('📝 [DEBUG] First item sample:', {
          id: data[0].id,
          title: data[0].title?.substring(0, 50) + '...',
          source: data[0].source,
          pub_date: data[0].pub_date
        });
        setFeedItems(data);
        setLastRefresh(new Date());
        setError(null);
      } else {
        console.log('⚠️ [DEBUG] No feed items found in database, using demo data');
        loadDemoData();
      }
    } catch (err: any) {
      const duration = Date.now() - startTime;
      console.error('💥 [DEBUG] Unexpected error in fetchFeedItems:', {
        message: err.message,
        stack: err.stack,
        name: err.name,
        duration,
        timestamp: new Date().toISOString()
      });

      // Provide specific error messages
      if (err.message?.includes('timeout')) {
        console.log('⏰ [DEBUG] Request timeout - likely network or server issue');
        setError('Request timeout. The database may be slow or unreachable.');
      } else if (err.message?.includes('fetch') || err.message?.includes('network')) {
        console.log('🌐 [DEBUG] Network connectivity issue');
        setError('Network error. Please check your internet connection.');
      } else {
        console.log('🔄 [DEBUG] Using demo data as fallback');
        setError(`Connection error: ${err.message}`);
      }

      loadDemoData();
    } finally {
      console.log('🏁 [DEBUG] Fetch operation complete');
      setLoading(false);
    }
  };

  // Load demo data when Supabase is not available
  const loadDemoData = () => {
    console.log('🎵 [DEBUG] Loading demo EDM news data...');
    const demoData: LiveFeedItem[] = [
      {
        id: 'demo-1',
        title: 'Tomorrowland 2025 Announces First Wave of Artists',
        description: 'The iconic Belgian festival has revealed its initial lineup featuring David Guetta, Martin Garrix, and Armin van Buuren. Early bird tickets selling fast.',
        link: 'https://tomorrowland.com/news/2025-lineup',
        source: 'Tomorrowland',
        category: 'festival',
        pub_date: new Date(Date.now() - 900000).toISOString(),
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
      }
    ];

    setFeedItems(demoData);
    setError('Demo mode: Supabase connection timeout, showing sample data. Check debug info above.');
    console.log('✅ [DEBUG] Demo data loaded successfully');
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

  // Initial fetch on component mount with timeout
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading) {
        console.log('⏰ [DEBUG] Loading timeout reached');
        setError('Loading timeout - please check your connection');
        setLoading(false);
      }
    }, 15000);

    fetchFeedItems();

    return () => clearTimeout(timeout);
  }, []);

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

          {/* Debug Info Panel */}
          <div className="mt-4 p-4 bg-black/50 rounded-lg border border-slate-700">
            <h3 className="text-sm font-bold text-slate-300 mb-2">🔍 Debug Information</h3>
            <pre className="text-xs text-slate-400 whitespace-pre-wrap">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
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
              onClick={fetchFeedItems}
              size="sm"
              variant="outline"
              className="border-neon-purple/30 hover:border-neon-purple/50"
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Refresh
            </Button>
          </div>

          {/* Debug Info Panel */}
          <div className="mt-4 p-4 bg-black/50 rounded-lg border border-slate-700">
            <h3 className="text-sm font-bold text-slate-300 mb-2">🔍 Debug Information</h3>
            <pre className="text-xs text-slate-400 whitespace-pre-wrap">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    );
  }

  if (feedItems.length === 0) return null;

  return (
    <div className="w-full bg-gradient-to-r from-bass-dark via-bass-medium to-bass-dark border-b border-neon-purple/20">
      {/* Debug Info Panel */}
      <div className="max-w-7xl mx-auto px-4 py-2">
        <div className="p-2 bg-black/30 rounded border border-slate-600">
          <h3 className="text-xs font-bold text-slate-400 mb-1">🔍 Debug Panel</h3>
          <pre className="text-xs text-slate-500 whitespace-pre-wrap max-h-32 overflow-y-auto">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>
      </div>

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
            </motion.div>
            <div>
              <h2 className="text-lg font-bold text-white">Enhanced EDM Live Feed (DEBUG)</h2>
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
              onClick={fetchFeedItems}
              size="sm"
              variant="ghost"
              className="text-slate-400 hover:text-white"
              title="Refresh news feed"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Feed Items */}
        <div className="space-y-4">
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
        </div>
      </div>
    </div>
  );
};

export default RSSFeedStreamerDebug;
