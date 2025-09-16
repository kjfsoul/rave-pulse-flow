import React from 'react';
import { render, screen, act, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import RSSWebSocketManager from '../RSSWebSocketManager';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    channel: vi.fn().mockReturnThis(),
    on: vi.fn().mockReturnThis(),
    subscribe: vi.fn(),
  },
}));

// Mock sonner
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

describe('RSSWebSocketManager', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it('should attempt to connect on mount', () => {
    render(<RSSWebSocketManager />);
    expect(supabase.channel).toHaveBeenCalledWith('enhanced_rss_feed');
    expect(supabase.subscribe).toHaveBeenCalled();
  });

  it('should report successful subscription', () => {
    const onStatusChange = vi.fn();
    render(<RSSWebSocketManager onStatusChange={onStatusChange} />);

    const subscribeCallback = (supabase.subscribe as vi.Mock).mock.calls[0][0];
    act(() => {
      subscribeCallback('SUBSCRIBED');
    });

    expect(onStatusChange).toHaveBeenCalledWith('subscribed');
  });

  it('should handle new articles', () => {
    const onNewArticle = vi.fn();
    render(<RSSWebSocketManager onNewArticle={onNewArticle} />);

    const onCallback = (supabase.on as vi.Mock).mock.calls[0][2];
    const mockArticle = { id: '1', title: 'New Test Article' };

    act(() => {
      onCallback({ new: mockArticle });
    });

    expect(onNewArticle).toHaveBeenCalledWith(mockArticle);
  });

  it('should attempt to reconnect on channel error', () => {
    const onStatusChange = vi.fn();
    render(<RSSWebSocketManager onStatusChange={onStatusChange} />);

    const subscribeCallback = (supabase.subscribe as vi.Mock).mock.calls[0][0];
    act(() => {
      subscribeCallback('CHANNEL_ERROR');
    });

    expect(onStatusChange).toHaveBeenCalledWith('disconnected');

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(supabase.subscribe).toHaveBeenCalledTimes(2);
  });

  it('should give up after max reconnect attempts and allow manual reconnect', () => {
    const onError = vi.fn();
    render(<RSSWebSocketManager onError={onError} />);
    const subscribeCallback = (supabase.subscribe as vi.Mock).mock.calls[0][0];

    for (let i = 0; i < 8; i++) {
      act(() => {
        subscribeCallback('TIMED_OUT');
      });
      act(() => {
        vi.advanceTimersByTime(50000);
      });
    }

    expect(toast.error).toHaveBeenCalled();
  });
});
