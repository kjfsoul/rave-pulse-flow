import { useState, useEffect, useCallback } from 'react';
import { supabase, type Track } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// Re-export Track type from supabase for convenience
export type { Track };

/**
 * Hook to fetch user's tracks from the tracks table
 */
export function useUserTracks() {
  const { user } = useAuth();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchTracks = useCallback(async () => {
    if (!user) {
      setTracks([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('tracks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setTracks((data || []) as Track[]);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch tracks');
      setError(error);
      console.error('[useUserTracks] Error:', error);
      toast.error('Failed to load tracks', {
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchTracks();
  }, [fetchTracks]);

  return {
    tracks,
    isLoading,
    error,
    refetch: fetchTracks,
  };
}

/**
 * Hook to upload a track to Supabase Storage and create a track record
 */
export function useUploadTrack() {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);

  const uploadTrack = useCallback(
    async (
      file: File,
      options: {
        broadcastRightsConfirmed: boolean;
        bpmDetected?: number;
        duration?: number;
      }
    ): Promise<Track | null> => {
      if (!user) {
        throw new Error('You must be logged in to upload tracks');
      }

      setIsUploading(true);

      try {
        // Generate unique file key
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        const fileKey = `tracks/${user.id}/${fileName}`;

        // Upload file to Supabase Storage bucket 'tracks'
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('tracks')
          .upload(fileKey, file, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) {
          throw uploadError;
        }

        // Get public URL
        const { data: urlData } = supabase.storage.from('tracks').getPublicUrl(fileKey);

        if (!urlData) {
          throw new Error('Failed to get public URL');
        }

        const publicUrl = urlData.publicUrl;

        // Insert track record into database
        const { data: trackData, error: insertError } = await supabase
          .from('tracks')
          .insert({
            user_id: user.id,
            name: file.name.replace(/\.[^/.]+$/, ''), // Remove extension
            url: publicUrl,
            file_key: fileKey,
            mime_type: file.type || 'audio/mpeg',
            file_size: file.size,
            duration: options.duration || null,
            bpm_detected: options.bpmDetected || null,
            source: 'upload',
            broadcast_rights_confirmed: options.broadcastRightsConfirmed,
          })
          .select()
          .single();

        if (insertError) {
          // Clean up uploaded file if database insert fails
          await supabase.storage.from('tracks').remove([fileKey]);
          throw insertError;
        }

        toast.success('Track uploaded successfully', {
          description: options.bpmDetected
            ? `BPM: ${options.bpmDetected}`
            : 'Track is ready to use',
        });

        return trackData as Track;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to upload track');
        console.error('[useUploadTrack] Error:', error);
        toast.error('Upload failed', {
          description: error.message,
        });
        throw error;
      } finally {
        setIsUploading(false);
      }
    },
    [user]
  );

  return {
    uploadTrack,
    isUploading,
  };
}
