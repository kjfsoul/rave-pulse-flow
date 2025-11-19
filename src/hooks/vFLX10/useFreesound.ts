import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface FreesoundSample {
  id: number;
  name: string;
  url: string;
  previewUrl: string | null;
  license: string;
  username: string;
  description: string | null;
  attribution: string;
}

export interface FreesoundSearchResponse {
  results: FreesoundSample[];
  count: number;
  query: string;
}

/**
 * Hook to search Freesound via Supabase Edge Function
 */
export function useFreesoundSearch() {
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<FreesoundSample[]>([]);
  const [error, setError] = useState<Error | null>(null);

  const search = useCallback(async (query: string): Promise<FreesoundSearchResponse | null> => {
    if (!query || query.trim().length === 0) {
      setResults([]);
      return null;
    }

    setIsSearching(true);
    setError(null);

    try {
      const { data, error: invokeError } = await supabase.functions.invoke('freesound-search', {
        body: { query: query.trim() },
      });

      if (invokeError) {
        throw invokeError;
      }

      const response = data as FreesoundSearchResponse;
      setResults(response.results || []);

      if (response.results && response.results.length === 0) {
        toast.info('No results found', {
          description: `No CC0 or CC-BY samples found for "${query}"`,
        });
      }

      return response;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to search Freesound');
      setError(error);
      console.error('[useFreesoundSearch] Error:', error);
      toast.error('Search failed', {
        description: error.message,
      });
      return null;
    } finally {
      setIsSearching(false);
    }
  }, []);

  return {
    search,
    results,
    isSearching,
    error,
  };
}
