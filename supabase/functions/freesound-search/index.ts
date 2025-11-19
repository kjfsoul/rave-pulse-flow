import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';

interface FreesoundResult {
  id: number;
  name: string;
  url: string;
  previews: {
    'preview-hq-mp3'?: string;
    'preview-lq-mp3'?: string;
  };
  license: string;
  username: string;
  description?: string;
}

interface FreesoundResponse {
  results: FreesoundResult[];
  count: number;
}

/**
 * Supabase Edge Function to proxy Freesound API searches
 * Filters for CC0 (Public Domain) and CC-BY (Attribution) licenses only
 */
serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method Not Allowed' }),
        {
          status: 405,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { query } = await req.json();

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Query is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const FREESOUND_API_KEY = Deno.env.get('FREESOUND_API_KEY');

    if (!FREESOUND_API_KEY) {
      console.error('FREESOUND_API_KEY environment variable not set');
      return new Response(
        JSON.stringify({ error: 'Freesound API not configured' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Build Freesound API URL with filters for CC0 and CC-BY licenses
    const searchParams = new URLSearchParams({
      query: query.trim(),
      filter: 'license:("Attribution" OR "CC0")', // Only CC0 and CC-BY licenses
      fields: 'id,name,url,previews,license,username,description',
      page_size: '20',
    });

    const freesoundUrl = `https://freesound.org/apiv2/search/text/?${searchParams.toString()}`;

    // Fetch from Freesound API
    const response = await fetch(freesoundUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Token ${FREESOUND_API_KEY}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => response.statusText);
      console.error('Freesound API error:', response.status, errorText);
      throw new Error(`Freesound API error: ${response.status} ${response.statusText}`);
    }

    const data: FreesoundResponse = await response.json();

    // Sanitize results: filter and format for our use
    const sanitizedResults = data.results
      .filter((result) => {
        // Double-check license (API should filter, but verify)
        const license = result.license?.toLowerCase() || '';
        return license.includes('cc0') || license.includes('attribution');
      })
      .map((result) => ({
        id: result.id,
        name: result.name,
        url: result.url,
        previewUrl: result.previews?.['preview-hq-mp3'] || result.previews?.['preview-lq-mp3'] || null,
        license: result.license,
        username: result.username,
        description: result.description || null,
        attribution: `Sample by ${result.username} from Freesound.org (${result.license})`,
      }));

    return new Response(
      JSON.stringify({
        results: sanitizedResults,
        count: sanitizedResults.length,
        query: query.trim(),
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
        },
      }
    );
  } catch (error) {
    console.error('Freesound search function error:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to search Freesound',
        details: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
