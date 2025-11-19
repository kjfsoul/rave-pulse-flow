import { z } from 'zod';
import { protectedProcedure, router } from '../_core/trpc';
import { TRPCError } from '@trpc/server';

// Freesound API base URL
const FREESOUND_API_URL = 'https://freesound.org/apiv2';

// Freesound API Key from environment
const FREESOUND_API_KEY = process.env.FREESOUND_API_KEY;

if (!FREESOUND_API_KEY) {
  console.warn('[Freesound] FREESOUND_API_KEY not found in environment variables');
}

/**
 * Freesound API Router
 * 
 * LEGAL COMPLIANCE:
 * - Only returns CC0 (Public Domain) and CC-BY (Attribution) licensed sounds
 * - Does NOT copy, download, or re-host any audio files
 * - Audio is streamed directly from Freesound servers
 * - CC-BY samples require attribution tracking in client
 */
export const freesoundRouter = router({
  /**
   * Search Freesound for samples with CC0/CC-BY licenses only
   */
  search: protectedProcedure
    .input(
      z.object({
        query: z.string().min(1).max(100),
        page: z.number().int().min(1).default(1),
        pageSize: z.number().int().min(1).max(50).default(15),
      })
    )
    .query(async ({ input }) => {
      if (!FREESOUND_API_KEY) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Freesound API key not configured. Please contact administrator.',
        });
      }

      try {
        // Build Freesound API search URL with CC0/CC-BY filter
        const params = new URLSearchParams({
          query: input.query,
          page: input.page.toString(),
          page_size: input.pageSize.toString(),
          // MANDATORY: Only CC0 (Public Domain) and CC-BY (Attribution) licenses
          // Use filter parameter with Solr syntax for multiple license values
          filter: 'license:("Creative Commons 0" OR "Attribution")',
          fields: 'id,name,username,duration,previews,license,url,description',
          token: FREESOUND_API_KEY,
        });

        const response = await fetch(
          `${FREESOUND_API_URL}/search/text/?${params.toString()}`
        );

        if (!response.ok) {
          const errorText = await response.text();
          console.error('[Freesound] API error:', response.status, errorText);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: `Freesound API error: ${response.statusText}`,
          });
        }

        const data = await response.json();

        // Transform results to our format
        const results = data.results.map((sound: any) => ({
          id: sound.id,
          name: sound.name,
          username: sound.username,
          duration: sound.duration,
          // Use high-quality MP3 preview for streaming
          previewUrl: sound.previews['preview-hq-mp3'] || sound.previews['preview-lq-mp3'],
          license: sound.license,
          freesoundUrl: sound.url,
          description: sound.description || '',
          // Generate attribution string for CC-BY samples
          attribution:
            sound.license === 'Attribution'
              ? `"${sound.name}" by ${sound.username} (freesound.org)`
              : null,
        }));

        return {
          results,
          count: data.count,
          next: data.next,
          previous: data.previous,
        };
      } catch (error: any) {
        console.error('[Freesound] Search error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to search Freesound',
        });
      }
    }),

  /**
   * Get detailed information about a specific sound
   */
  getSound: protectedProcedure
    .input(z.object({ soundId: z.number().int() }))
    .query(async ({ input }) => {
      if (!FREESOUND_API_KEY) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Freesound API key not configured',
        });
      }

      try {
        const response = await fetch(
          `${FREESOUND_API_URL}/sounds/${input.soundId}/?token=${FREESOUND_API_KEY}`
        );

        if (!response.ok) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Sound not found on Freesound',
          });
        }

        const sound = await response.json();

        return {
          id: sound.id,
          name: sound.name,
          username: sound.username,
          duration: sound.duration,
          previewUrl: sound.previews['preview-hq-mp3'] || sound.previews['preview-lq-mp3'],
          license: sound.license,
          freesoundUrl: sound.url,
          description: sound.description || '',
          tags: sound.tags || [],
          attribution:
            sound.license === 'Attribution'
              ? `"${sound.name}" by ${sound.username} (freesound.org)`
              : null,
        };
      } catch (error: any) {
        console.error('[Freesound] Get sound error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to get sound details',
        });
      }
    }),
});
