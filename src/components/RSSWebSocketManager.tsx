import React, { useEffect, useRef, useCallback, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface RSSWebSocketManagerProps {
  onNewArticle?: (article: any) => void;
  onUpdate?: (update: any) => void;
  onError?: (error: { message: string; isFinal: boolean }) => void;
  onStatusChange?: (status: 'subscribed' | 'connecting' | 'disconnected' | 'error') => void;
}

const RSSWebSocketManager: React.FC<RSSWebSocketManagerProps> = ({
  onNewArticle,
  onUpdate,
  onError,
  onStatusChange,
}) => {
  const subscriptionRef = useRef<any>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 8; // Increased attempts

  const [isManualReconnect, setManualReconnect] = useState(false);

  const setupRealtimeSubscription = useCallback(() => {
    if (onStatusChange) onStatusChange('connecting');
    try {
      // Clean up existing subscription
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }

      console.log('Setting up daily RSS feed subscription (not real-time)...');

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

            toast.info('New article added!', {
              description: `${newArticle.title?.substring(0, 50)}...`,
              duration: 5000,
              action: {
                label: 'View',
                onClick: () => window.open(newArticle.link, '_blank')
              }
            });

            if (onNewArticle) onNewArticle(newArticle);
            reconnectAttempts.current = 0; // Reset on success
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
            if (onUpdate) onUpdate(payload.new);
          }
        )
        .subscribe((status, err) => {
          try {
          console.log('Real-time subscription status:', status);

          if (status === 'SUBSCRIBED') {
            console.log('Successfully subscribed to RSS feed updates');
            if (onStatusChange) onStatusChange('subscribed');
            reconnectAttempts.current = 0;
            if (isManualReconnect) {
              toast.success('Reconnected to the live feed!');
              setManualReconnect(false);
            }
          } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
            const errorReason = err ? (err as Error).message : 'Connection failed';
            console.error(`Subscription failed: ${status}. Reason: ${errorReason}`);
            if (onStatusChange) onStatusChange('disconnected');
            handleReconnection();
          }
        } catch (e) {
          console.error('Error in subscribe callback:', e);
        }
        });

    } catch (error) {
      console.error('Error setting up real-time subscription:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      if (onError) onError({ message: errorMessage, isFinal: false });
      if (onStatusChange) onStatusChange('error');
      handleReconnection();
    }
  }, [onNewArticle, onUpdate, onError, onStatusChange, isManualReconnect]);

  const handleReconnection = useCallback(() => {
    if (reconnectAttempts.current >= maxReconnectAttempts) {
      console.error('Max reconnection attempts reached. Giving up.');
      const finalError = 'Could not connect to the live feed. The server may be temporarily down.';
      if (onError) onError({ message: finalError, isFinal: true });
      if (onStatusChange) onStatusChange('error');

      toast.error('Live feed connection failed', {
        description: 'You can try to reconnect manually.',
        action: {
          label: 'Reconnect',
          onClick: () => {
            reconnectAttempts.current = 0;
            setManualReconnect(true);
            setupRealtimeSubscription();
          }
        }
      });
      return;
    }

    reconnectAttempts.current += 1;
    // Exponential backoff with jitter
    const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current) + Math.random() * 1000, 45000);

    console.log(`Attempting to reconnect in ${Math.round(delay / 1000)}s (attempt ${reconnectAttempts.current}/${maxReconnectAttempts})`);

    reconnectTimeoutRef.current = setTimeout(() => {
      setupRealtimeSubscription();
    }, delay);
  }, [setupRealtimeSubscription, onError, onStatusChange, maxReconnectAttempts]);

  const checkConnection = useCallback(() => {
    if (subscriptionRef.current) {
      const state = subscriptionRef.current.state;
      console.log('WebSocket connection state:', state);
      if (state !== 'joined') {
        console.warn('Connection appears to be lost, attempting to reconnect...');
        handleReconnection();
      }
    }
  }, [handleReconnection]);

  useEffect(() => {
    setupRealtimeSubscription();

    const healthCheckInterval = setInterval(checkConnection, 45000);
    const handleVisibilityChange = () => {
      if (!document.hidden && subscriptionRef.current?.state !== 'joined') {
        console.log('Tab became visible, checking and refreshing connection...');
        checkConnection();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(healthCheckInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (subscriptionRef.current) subscriptionRef.current.unsubscribe();
    };
  }, [setupRealtimeSubscription, checkConnection]);

  return null;
};

export default RSSWebSocketManager;
