import React, { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface RSSWebSocketManagerProps {
  onNewArticle?: (article: any) => void;
  onUpdate?: (update: any) => void;
  onError?: (error: any) => void;
}

const RSSWebSocketManager: React.FC<RSSWebSocketManagerProps> = ({
  onNewArticle,
  onUpdate,
  onError
}) => {
  const subscriptionRef = useRef<any>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const setupRealtimeSubscription = useCallback(() => {
    try {
      // Clean up existing subscription
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }

      console.log('Setting up real-time subscription for live_feed...');

      subscriptionRef.current = supabase
        .channel('enhanced_rss_feed')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'live_feed'
          },
          (payload) => {
            console.log('New RSS article received:', payload.new);
            const newArticle = payload.new;

            // Show notification for new articles
            toast.info('New article added!', {
              description: `${newArticle.title?.substring(0, 50)}...`,
              duration: 4000,
              action: {
                label: 'View',
                onClick: () => window.open(newArticle.link, '_blank')
              }
            });

            // Call the callback if provided
            if (onNewArticle) {
              onNewArticle(newArticle);
            }

            // Reset reconnect attempts on successful message
            reconnectAttempts.current = 0;
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'live_feed'
          },
          (payload) => {
            console.log('RSS article updated:', payload.new);

            if (onUpdate) {
              onUpdate(payload.new);
            }
          }
        )
        .subscribe((status) => {
          console.log('Real-time subscription status:', status);

          if (status === 'SUBSCRIBED') {
            console.log('Successfully subscribed to RSS feed updates');
            reconnectAttempts.current = 0;
          } else if (status === 'CHANNEL_ERROR') {
            console.error('Channel error in RSS subscription');
            handleReconnection();
          } else if (status === 'TIMED_OUT') {
            console.error('Real-time subscription timed out');
            handleReconnection();
          } else if (status === 'CLOSED') {
            console.log('Real-time subscription closed');
            handleReconnection();
          }
        });

    } catch (error) {
      console.error('Error setting up real-time subscription:', error);
      if (onError) {
        onError(error);
      }
      handleReconnection();
    }
  }, [onNewArticle, onUpdate, onError]);

  const handleReconnection = useCallback(() => {
    if (reconnectAttempts.current >= maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      toast.error('Real-time connection lost. Please refresh the page.');
      return;
    }

    reconnectAttempts.current += 1;
    const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000); // Exponential backoff

    console.log(`Attempting to reconnect in ${delay}ms (attempt ${reconnectAttempts.current}/${maxReconnectAttempts})`);

    reconnectTimeoutRef.current = setTimeout(() => {
      setupRealtimeSubscription();
    }, delay);
  }, [setupRealtimeSubscription]);

  const checkConnection = useCallback(() => {
    if (subscriptionRef.current) {
      const state = subscriptionRef.current.state;
      console.log('WebSocket connection state:', state);

      if (state !== 'joined') {
        console.log('Connection lost, attempting to reconnect...');
        handleReconnection();
      }
    }
  }, [handleReconnection]);

  useEffect(() => {
    setupRealtimeSubscription();

    // Set up connection health check
    const healthCheckInterval = setInterval(checkConnection, 30000); // Check every 30 seconds

    // Set up visibility change listener to check connection when tab becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('Tab became visible, checking connection...');
        checkConnection();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(healthCheckInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }

      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
    };
  }, [setupRealtimeSubscription, checkConnection]);

  // This component doesn't render anything visible
  return null;
};

export default RSSWebSocketManager;
