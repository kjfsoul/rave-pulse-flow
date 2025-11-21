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
      setIsLoading(false);
      return;
    }

    console.log('[useUserTracks] Fetching tracks for user:', user.id)
    setIsLoading(true);
    setError(null);

    try {
      // Verify session before query (required for RLS)
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !sessionData.session) {
        console.error('[useUserTracks] Session verification failed:', sessionError)
        throw new Error('Session expired. Please sign in again.');
      }
      console.log('[useUserTracks] Session verified:', sessionData.session.user.id)

      // Create query promise with timeout
      const queryPromise = supabase
        .from('tracks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      // Add 10-second timeout for query
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('Tracks query timed out. This might be due to RLS policy issues or network problems. Check Supabase dashboard > Database > Policies for tracks table.'))
        }, 10000)
      })

      console.log('[useUserTracks] Executing query...')
      const { data, error: fetchError } = await Promise.race([
        queryPromise,
        timeoutPromise
      ]) as any

      if (fetchError) {
        console.error('[useUserTracks] Query error:', fetchError)
        // Check for RLS violations
        if (fetchError.message?.includes('row-level security') || fetchError.message?.includes('RLS') || fetchError.code === '42501') {
          throw new Error('Permission denied. Run the SQL in FIX_TRACKS_RLS_POLICIES.sql in Supabase dashboard to fix RLS policies.')
        }
        throw fetchError;
      }

      console.log('[useUserTracks] Query successful, tracks:', data?.length || 0)
      setTracks((data || []) as Track[]);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch tracks');
      setError(error);
      console.error('[useUserTracks] Error:', error);
      setTracks([]); // Clear tracks on error
      toast.error('Failed to load tracks', {
        description: error.message,
      });
    } finally {
      setIsLoading(false);
      console.log('[useUserTracks] Fetch complete, isLoading set to false')
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
        console.log('[useUploadTrack] Starting upload for user:', user.id)
        console.log('[useUploadTrack] File:', { name: file.name, size: file.size, type: file.type })

        // Generate unique file key
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        const fileKey = `tracks/${user.id}/${fileName}`;
        console.log('[useUploadTrack] File key:', fileKey)

        // Upload file to Supabase Storage bucket 'tracks'
        console.log('[useUploadTrack] Uploading to storage...')
        const uploadStartTime = Date.now()

        const uploadPromise = supabase.storage
          .from('tracks')
          .upload(fileKey, file, {
            cacheControl: '3600',
            upsert: false,
          })

        // Add 30-second timeout for storage upload
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => {
            reject(new Error('Storage upload timed out after 30 seconds. The file may be too large or the storage bucket may not be accessible.'))
          }, 30000)
        })

        const { data: uploadData, error: uploadError } = await Promise.race([
          uploadPromise,
          timeoutPromise
        ]) as any

        const uploadDuration = Date.now() - uploadStartTime
        console.log('[useUploadTrack] Upload completed in', uploadDuration, 'ms')

        if (uploadError) {
          console.error('[useUploadTrack] Storage upload error:', uploadError)
          throw uploadError;
        }

        console.log('[useUploadTrack] Upload successful:', uploadData)

        // Get public URL
        console.log('[useUploadTrack] Getting public URL...')
        const { data: urlData } = supabase.storage.from('tracks').getPublicUrl(fileKey);

        if (!urlData) {
          throw new Error('Failed to get public URL');
        }

        const publicUrl = urlData.publicUrl;
        console.log('[useUploadTrack] Public URL:', publicUrl)

        // Verify session before database insert (required for RLS)
        console.log('[useUploadTrack] Verifying session...')
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !sessionData.session) {
          console.error('[useUploadTrack] Session verification failed:', sessionError)
          throw new Error('Session expired. Please sign in again.');
        }
        if (sessionData.session.user.id !== user.id) {
          console.error('[useUploadTrack] User ID mismatch:', { userId: user.id, sessionUserId: sessionData.session.user.id })
          throw new Error('Session user mismatch. Please sign in again.');
        }
        console.log('[useUploadTrack] Session verified:', sessionData.session.user.id)

        // Insert track record into database
        console.log('[useUploadTrack] Inserting track record...')
        const insertStartTime = Date.now()

        const { data: trackData, error: insertError } = await supabase
          .from('tracks')
          .insert({
            user_id: user.id, // Must match auth.uid() for RLS policy to allow
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

        const insertDuration = Date.now() - insertStartTime
        console.log('[useUploadTrack] Database insert completed in', insertDuration, 'ms')

        if (insertError) {
          console.error('[useUploadTrack] Database insert error:', insertError)
          console.error('[useUploadTrack] User ID:', user.id)
          console.error('[useUploadTrack] Session user ID:', sessionData.session.user.id)
          console.error('[useUploadTrack] Full error:', JSON.stringify(insertError, null, 2))

          // Clean up uploaded file if database insert fails
          console.log('[useUploadTrack] Cleaning up uploaded file...')
          await supabase.storage.from('tracks').remove([fileKey]).catch(console.error)

          // Provide more helpful error message for RLS violations
          if (insertError.message?.includes('row-level security') || insertError.message?.includes('RLS') || insertError.code === '42501') {
            throw new Error('Permission denied. Make sure you are logged in and RLS policies are configured correctly. Run the SQL in FIX_TRACKS_RLS_POLICIES.sql in Supabase dashboard.')
          }

          throw insertError;
        }

        console.log('[useUploadTrack] Track created successfully:', trackData)

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
