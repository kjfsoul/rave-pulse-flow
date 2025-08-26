// @ts-ignore - Deno imports work differently than Node.js
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-ignore - Deno imports work differently than Node.js  
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

// Generate a proper UUID for the id field
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : r & 0x3 | 0x8;
    return v.toString(16);
  });
}

// Enhanced RSS sources with verified working feeds for fresh EDM content
const RSS_FEEDS = [
  {
    url: 'https://www.dancingastronaut.com/feed/',
    source: 'Dancing Astronaut',
    category: 'news'
  },
  {
    url: 'https://www.edmtunes.com/feed/',
    source: 'EDMTunes', 
    category: 'news'
  },
  {
    url: 'https://edmsauce.com/feed/',
    source: 'EDM Sauce',
    category: 'news'
  },
  {
    url: 'https://weraveyou.com/feed/',
    source: 'We Rave You',
    category: 'news'
  },
  {
    url: 'https://djtechtools.com/feed/',
    source: 'DJ TechTools',
    category: 'news'
  },
  {
    url: 'https://edmchicago.com/feed/',
    source: 'EDM Chicago',
    category: 'news'
  }
];

// Enhanced XML parser for Deno with better date handling
function parseXML(xmlText: string): any[] {
  const items = [];
  
  // Try to match both <item> and <entry> tags (RSS 2.0 and Atom feeds)
  const itemMatches = xmlText.match(/<(item|entry)>[\s\S]*?<\/(item|entry)>/g);
  if (!itemMatches) return items;
  
  for (const itemMatch of itemMatches) {
    // Extract title (handle CDATA sections)
    const title = itemMatch.match(/<title[^>]*>(.*?)<\/title>/)?.[1]
      ?.replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1')
      ?.replace(/&amp;/g, '&')
      ?.replace(/&lt;/g, '<')
      ?.replace(/&gt;/g, '>')
      ?.replace(/&quot;/g, '"')
      ?.replace(/&#039;/g, "'");
    
    // Extract description/summary (handle CDATA and HTML entities)
    const description = (itemMatch.match(/<(description|summary)[^>]*>(.*?)<\/(description|summary)>/)?.[2] || '')
      ?.replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1')
      ?.replace(/<[^>]*>/g, '') // Remove HTML tags
      ?.replace(/&amp;/g, '&')
      ?.replace(/&nbsp;/g, ' ')
      ?.replace(/\s+/g, ' ') // Normalize whitespace
      ?.trim();
    
    // Extract link (handle different formats)
    let link = itemMatch.match(/<link[^>]*>(.*?)<\/link>/)?.[1];
    if (!link) {
      // Try href attribute format (common in Atom feeds)
      link = itemMatch.match(/<link[^>]*href="([^"]+)"/)?.[1];
    }
    
    // Extract publication date (try multiple date fields)
    let pubDate = itemMatch.match(/<(pubDate|published|updated|dc:date)[^>]*>(.*?)<\/(pubDate|published|updated|dc:date)>/)?.[2];
    
    // Extract GUID
    const guid = itemMatch.match(/<(guid|id)[^>]*>(.*?)<\/(guid|id)>/)?.[2];
    
    if (title && link) {
      items.push({
        title: title.trim(),
        description: description ? description.substring(0, 500) : '',
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
  const tags = [];
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
        'User-Agent': 'EDMShuffle/2.0 (Electronic Dance Music News Aggregator)',
        'Accept': 'application/rss+xml, application/xml, text/xml, */*'
      },
      signal: AbortSignal.timeout(15000) // 15 second timeout
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch RSS feed: ${response.status}`);
    }
    
    const xmlText = await response.text();
    const items = parseXML(xmlText);
    
    // Get more items and filter out old content
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    // Filter and process only recent items
    return items
      .filter(item => {
        // Only include items from the last week
        const itemDate = new Date(item.pubDate);
        return itemDate > oneWeekAgo;
      })
      .slice(0, 10) // Get up to 10 recent items per feed
      .map(item => {
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

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  
  try {
    // @ts-ignore - Deno global is available in Deno runtime
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    // @ts-ignore - Deno global is available in Deno runtime
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
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
    const recentItems = allItems.slice(0, 30); // Keep only 30 most recent items
    
    console.log(`Total items processed: ${allItems.length}, keeping: ${recentItems.length}`);
    
    // Clean up old data (older than 3 days for fresher content)
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    
    try {
      const { error: deleteError } = await supabase
        .from('live_feed')
        .delete()
        .lt('pub_date', threeDaysAgo.toISOString());
      
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
          status: 200
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
        status: 200
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
        status: 500
      }
    );
  }
});