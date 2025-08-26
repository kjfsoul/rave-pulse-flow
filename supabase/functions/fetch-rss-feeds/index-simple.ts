import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Generate a proper UUID for the id field
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Simplified RSS sources - just one to start
const RSS_FEEDS = [
  {
    url: 'https://www.dancingastronaut.com/feed/',
    source: 'Dancing Astronaut',
    category: 'news'
  }
]

// Simple XML parser for Deno
function parseXML(xmlText: string): any[] {
  const items = [];
  const itemMatches = xmlText.match(/<item>[\s\S]*?<\/item>/g);

  if (!itemMatches) return items;

  for (const itemMatch of itemMatches) {
    const title = itemMatch.match(/<title>(.*?)<\/title>/)?.[1]?.replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1');
    const description = itemMatch.match(/<description>(.*?)<\/description>/)?.[1]?.replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1')?.replace(/<[^>]*>/g, '');
    const link = itemMatch.match(/<link>(.*?)<\/link>/)?.[1];
    const pubDate = itemMatch.match(/<pubDate>(.*?)<\/pubDate>/)?.[1];
    const guid = itemMatch.match(/<guid[^>]*>(.*?)<\/guid>/)?.[1];

    if (title && link) {
      items.push({
        title: title.trim(),
        description: description ? description.trim().substring(0, 300) : '',
        link: link.trim(),
        pubDate: pubDate ? pubDate.trim() : new Date().toISOString(),
        guid: guid ? guid.trim() : link.trim()
      });
    }
  }

  return items;
}

// Simple content analysis
function analyzeSentiment(text: string): 'positive' | 'negative' | 'neutral' {
  const positiveWords = ['amazing', 'awesome', 'epic', 'fire', 'hot'];
  const negativeWords = ['disappointing', 'boring', 'terrible'];

  const lowerText = text.toLowerCase();
  const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length;
  const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length;

  if (positiveCount > negativeCount) return 'positive';
  if (negativeCount > positiveCount) return 'negative';
  return 'neutral';
}

function calculateReadTime(text: string): number {
  const wordsPerMinute = 200;
  const wordCount = text.split(' ').length;
  return Math.max(1, Math.round(wordCount / wordsPerMinute));
}

function extractTags(text: string): string[] {
  const tags: string[] = [];
  const keywords = ['EDM', 'techno', 'house', 'festival', 'DJ'];

  const lowerText = text.toLowerCase();
  keywords.forEach(keyword => {
    if (lowerText.includes(keyword.toLowerCase())) {
      tags.push(keyword);
    }
  });

  return Array.from(new Set(tags));
}

async function fetchRSSFeed(feedUrl: string, source: string) {
  try {
    console.log(`Fetching RSS from ${source}...`);

    const response = await fetch(feedUrl, {
      headers: {
        'User-Agent': 'RavePulseFlow/1.0 (EDM News Aggregator)'
      },
      signal: AbortSignal.timeout(10000)
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch RSS feed: ${response.status}`);
    }

    const xmlText = await response.text();
    const items = parseXML(xmlText);

    return items.slice(0, 5).map(item => {
      const fullText = `${item.title} ${item.description}`;

      return {
        id: generateUUID(),
        title: item.title.substring(0, 500),
        description: item.description || '',
        link: item.link.substring(0, 1000),
        source: source,
        category: 'news',
        pub_date: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
        guid: item.guid,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        author: null,
        tags: extractTags(fullText),
        read_time: calculateReadTime(fullText),
        sentiment: analyzeSentiment(fullText),
        priority: 1,
        trending: false,
        featured: false
      };
    });
  } catch (error) {
    console.error(`Error fetching RSS feed from ${feedUrl}:`, error);
    return [];
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Starting RSS feed processing...');

    const allItems = [];

    // Process each RSS feed
    for (const feed of RSS_FEEDS) {
      const items = await fetchRSSFeed(feed.url, feed.source);
      allItems.push(...items);

      // Small delay between requests
      if (RSS_FEEDS.indexOf(feed) < RSS_FEEDS.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    console.log(`Total items fetched: ${allItems.length}`);

    // Insert items
    if (allItems.length > 0) {
      const { data, error } = await supabase
        .from('live_feed')
        .upsert(allItems, { onConflict: 'id' })
        .select();

      if (error) {
        console.error('Error inserting items:', error);
        throw error;
      }

      console.log(`Successfully upserted ${data?.length || 0} items`);

      return new Response(
        JSON.stringify({
          success: true,
          itemsProcessed: allItems.length,
          itemsUpserted: data?.length || 0,
          sources: RSS_FEEDS.map(f => f.source)
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        itemsProcessed: 0,
        message: 'No items to process'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in fetch-rss-feeds function:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
