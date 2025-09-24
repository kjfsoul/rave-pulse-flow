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

// Enhanced RSS sources with multiple feeds for fresh content
const RSS_FEEDS = [
  {
    url: 'https://www.dancingastronaut.com/feed/',
    source: 'Dancing Astronaut',
    category: 'news'
  },
  {
    url: 'https://www.youredm.com/feed/',
    source: 'Your EDM',
    category: 'news'
  },
  {
    url: 'https://edm.com/feed',
    source: 'EDM.com',
    category: 'news'
  },
  {
    url: 'https://mixmag.net/feed',
    source: 'Mixmag',
    category: 'news'
  },
  {
    url: 'https://djmag.com/feed',
    source: 'DJ Mag',
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

// Enhanced content analysis for EDM/rave content
function analyzeSentiment(text: string): 'positive' | 'negative' | 'neutral' {
  const positiveWords = [
    'amazing', 'awesome', 'epic', 'fire', 'hot', 'incredible', 'massive', 
    'legendary', 'mind-blowing', 'spectacular', 'phenomenal', 'electrifying',
    'festival', 'lineup', 'drop', 'banger', 'heater', 'anthem', 'remix',
    'collaboration', 'debut', 'premiere', 'exclusive', 'breakthrough'
  ];
  const negativeWords = [
    'disappointing', 'boring', 'terrible', 'cancelled', 'postponed', 
    'controversy', 'drama', 'lawsuit', 'banned', 'arrest', 'criticism'
  ];

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
  const keywords = [
    'EDM', 'techno', 'house', 'festival', 'DJ', 'trance', 'dubstep', 
    'drum and bass', 'bass', 'electronic', 'dance', 'rave', 'club',
    'remix', 'mix', 'track', 'album', 'EP', 'single', 'release',
    'lineup', 'tour', 'concert', 'show', 'set', 'performance',
    'producer', 'artist', 'collaboration', 'featuring'
  ];

  const lowerText = text.toLowerCase();
  keywords.forEach(keyword => {
    if (lowerText.includes(keyword.toLowerCase())) {
      tags.push(keyword);
    }
  });

  return Array.from(new Set(tags));
}

// Calculate priority based on recency and content
function calculatePriority(pubDate: string, sentiment: string, tags: string[]): number {
  const date = new Date(pubDate);
  const now = new Date();
  const hoursAgo = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

  let priority = 1;

  // Boost priority for recent content
  if (hoursAgo < 6) priority += 3;
  else if (hoursAgo < 24) priority += 2;
  else if (hoursAgo < 48) priority += 1;

  // Boost for positive sentiment
  if (sentiment === 'positive') priority += 1;

  // Boost for important keywords
  const importantTags = ['festival', 'lineup', 'collaboration', 'premiere', 'exclusive'];
  if (tags.some(tag => importantTags.includes(tag.toLowerCase()))) {
    priority += 1;
  }

  return Math.min(priority, 5); // Cap at 5
}

async function fetchRSSFeed(feedUrl: string, source: string) {
  try {
    console.log(`Fetching RSS from ${source}...`);

    const response = await fetch(feedUrl, {
      headers: {
        'User-Agent': 'RavePulseFlow/1.0 (EDM News Aggregator)'
      },
      signal: AbortSignal.timeout(15000) // Increased timeout
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch RSS feed from ${source}: ${response.status}`);
    }

    const xmlText = await response.text();
    const items = parseXML(xmlText);

    // Get more items and sort by date to get freshest content
    return items.slice(0, 8).map(item => {
      const fullText = `${item.title} ${item.description}`;
      const tags = extractTags(fullText);
      const sentiment = analyzeSentiment(fullText);
      const pubDate = item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString();
      const priority = calculatePriority(pubDate, sentiment, tags);

      // Determine if trending based on priority and recent keywords
      const trending = priority >= 4 || tags.some(tag => 
        ['festival', 'lineup', 'premiere', 'exclusive', 'collaboration'].includes(tag.toLowerCase())
      );

      // Determine if featured based on very high priority
      const featured = priority >= 5;

      return {
        id: generateUUID(),
        title: item.title.substring(0, 500),
        description: item.description || '',
        link: item.link.substring(0, 1000),
        source: source,
        category: 'news',
        pub_date: pubDate,
        guid: item.guid,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        author: null,
        tags: tags,
        read_time: calculateReadTime(fullText),
        sentiment: sentiment,
        priority: priority,
        trending: trending,
        featured: featured
      };
    }).sort((a, b) => new Date(b.pub_date).getTime() - new Date(a.pub_date).getTime());
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

    // Daily update check: Only fetch if the last post is older than 24 hours.
    // This ensures RSS feeds are updated once per day instead of constantly.
    const { data: latestPost, error: latestPostError } = await supabase
      .from('live_feed')
      .select('pub_date')
      .order('pub_date', { ascending: false })
      .limit(1);

    if (latestPostError) {
      console.warn("Could not check latest post, proceeding with fetch.", latestPostError);
    } else if (latestPost && latestPost.length > 0) {
      const lastPostDate = new Date(latestPost[0].pub_date);
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      if (lastPostDate > twentyFourHoursAgo) {
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Feed is up-to-date. Next update scheduled for tomorrow.',
            lastUpdate: lastPostDate.toISOString(),
            nextUpdate: new Date(lastPostDate.getTime() + 24 * 60 * 60 * 1000).toISOString()
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        );
      }
    }

    console.log('Starting RSS feed processing...');

    const allItems = [];

    // Process each RSS feed with error handling
    for (const feed of RSS_FEEDS) {
      try {
        console.log(`Processing feed: ${feed.source}`);
        const items = await fetchRSSFeed(feed.url, feed.source);
        allItems.push(...items);
        console.log(`✅ ${feed.source}: ${items.length} items fetched`);
      } catch (error) {
        console.error(`❌ Failed to fetch ${feed.source}:`, error);
        // Continue with other feeds even if one fails
      }

      // Delay between requests to be respectful
      if (RSS_FEEDS.indexOf(feed) < RSS_FEEDS.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
    }

    // Sort all items by date (most recent first) and limit total
    allItems.sort((a, b) => new Date(b.pub_date).getTime() - new Date(a.pub_date).getTime());
    const recentItems = allItems.slice(0, 20); // Keep only 20 most recent

    console.log(`Total items processed: ${allItems.length}, keeping: ${recentItems.length}`);

    // Clean up old data (older than 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    try {
      const { error: deleteError } = await supabase
        .from('live_feed')
        .delete()
        .lt('pub_date', sevenDaysAgo.toISOString());

      if (deleteError) {
        console.warn('Failed to clean up old data:', deleteError);
      } else {
        console.log('✅ Cleaned up old data');
      }
    } catch (error) {
      console.warn('Failed to clean up old data:', error);
    }

    // Insert new items
    if (recentItems.length > 0) {
      const { data, error } = await supabase
        .from('live_feed')
        .upsert(recentItems, { onConflict: 'guid' })
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
          recentItemsKept: recentItems.length,
          sources: RSS_FEEDS.map(f => f.source),
          latestUpdate: new Date().toISOString(),
          cleanupPerformed: true
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
