/* eslint-disable no-console */
import Parser from 'rss-parser';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONFIG = {
  maxItemsPerFeed: 12,
  maxTotalItems: 60,
  requestTimeout: 12000,
  requestDelay: 1800,
  maxRetries: 3,
  retryDelay: 2000,
  debug: process.env.DEBUG === 'true',
};

const parser = new Parser({
  timeout: CONFIG.requestTimeout,
  headers: {
    'User-Agent': 'EDM-Shuffle-Aggregator/1.0',
    Accept: 'application/rss+xml, application/xml, text/xml',
  },
  customFields: {
    item: [
      ['media:content', 'mediaContent'],
      ['media:thumbnail', 'mediaThumbnail'],
      ['content:encoded', 'contentEncoded'],
    ],
  },
});

const RSS_FEEDS = [
  { url: 'https://edmsauce.com/feed', source: 'EDM Sauce', priority: 10, category: 'news' },
  { url: 'https://www.youredm.com/feed', source: 'YourEDM', priority: 10, category: 'news' },
  { url: 'https://dancingastronaut.com/feed', source: 'Dancing Astronaut', priority: 10, category: 'news' },
  { url: 'https://edm.com/feed', source: 'EDM.com', priority: 10, category: 'news' },
  { url: 'https://weraveyou.com/feed', source: 'We Rave You', priority: 9, category: 'news' },
  { url: 'https://www.edmtunes.com/feed', source: 'EDMTunes', priority: 9, category: 'releases' },
  { url: 'https://thissongslaps.com/feed', source: 'This Song Slaps', priority: 9, category: 'releases' },
  { url: 'https://www.magneticmag.com/feed', source: 'Magnetic Magazine', priority: 8, category: 'news' },
  { url: 'https://www.attackmagazine.com/feed', source: 'Attack Magazine', priority: 8, category: 'production' },
  { url: 'https://www.insomniac.com/magazine/feed', source: 'Insomniac', priority: 10, category: 'festivals' },
  { url: 'https://www.festicket.com/magazine/feed', source: 'Festicket', priority: 8, category: 'festivals' },
  { url: 'https://daily-beat.com/feed', source: 'Daily Beat', priority: 7, category: 'news' },
  { url: 'https://edmlife.com/feed', source: 'EDM Life', priority: 7, category: 'news' },
  { url: 'https://findyoursounds.com/feed', source: 'FindYourSounds', priority: 7, category: 'releases' },
  { url: 'https://www.edmprod.com/feed', source: 'EDMProd', priority: 6, category: 'production' },
  { url: 'https://bythewavs.com/feed', source: 'By The Wavs', priority: 6, category: 'news' },
  { url: 'https://runthetrap.com/feed', source: 'Run The Trap', priority: 6, category: 'bass' },
  { url: 'https://edmidentity.com/feed', source: 'EDM Identity', priority: 6, category: 'news' },
  { url: 'https://www.thenocturnaltimes.com/feed', source: 'Nocturnal Times', priority: 6, category: 'news' },
  { url: 'https://datatransmission.co/feed', source: 'Data Transmission', priority: 5, category: 'house' },
  { url: 'https://ukf.com/feed', source: 'UKF', priority: 5, category: 'bass' },
];

const KEYWORDS = {
  festivals: [
    'festival',
    'lineup',
    'tickets',
    'tour dates',
    'tour announcement',
    'headliner',
    'stage',
    'performing live',
    'concert',
    'show dates',
    'edc',
    'ultra',
    'tomorrowland',
    'coachella',
    'lollapalooza',
  ],
  releases: [
    'new single',
    'new album',
    'new ep',
    'drops',
    'releases',
    'out now',
    'premiere',
    'exclusive',
    'stream',
    'listen',
    'available now',
    'remix',
    'vip',
    'bootleg',
    'edit',
  ],
  positive: [
    'announces',
    'unveils',
    'reveals',
    'drops',
    'massive',
    'epic',
    'incredible',
    'stunning',
    'breakthrough',
    'debut',
    'returns',
    'collaboration',
    'collab',
  ],
  negative: [
    'cancels',
    'cancelled',
    'postponed',
    'delayed',
    'controversy',
    'criticized',
    'backlash',
    'lawsuit',
    'arrested',
  ],
};

const log = (level, msg, data = null) => {
  const icons = { info: 'ℹ️', success: '✅', warning: '⚠️', error: '❌', debug: '🔍' };
  console.log(`[${new Date().toISOString()}] ${icons[level] || 'ℹ️'} ${msg}`);
  if (data && CONFIG.debug) console.log(JSON.stringify(data, null, 2));
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function withRetry(fn, name, retries = CONFIG.maxRetries) {
  for (let i = 1; i <= retries; i += 1) {
    try {
      // eslint-disable-next-line no-await-in-loop
      return await fn();
    } catch (err) {
      if (i === retries) {
        log('error', `Failed ${name} after ${retries} attempts`, { error: err.message });
        throw err;
      }
      const delay = CONFIG.retryDelay * (2 ** (i - 1));
      log('warning', `Retry ${i}/${retries} for ${name} in ${delay}ms`, { error: err.message });
      // eslint-disable-next-line no-await-in-loop
      await sleep(delay);
    }
  }
  return null;
}

function cleanText(text) {
  if (!text) return '';
  return String(text).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function analyzeContent(text) {
  const lower = text.toLowerCase();
  const sentiment = KEYWORDS.positive.some((k) => lower.includes(k))
    ? 'positive'
    : KEYWORDS.negative.some((k) => lower.includes(k))
    ? 'negative'
    : 'neutral';

  const festivalScore = KEYWORDS.festivals.filter((k) => lower.includes(k)).length;
  const releaseScore = KEYWORDS.releases.filter((k) => lower.includes(k)).length;

  let category = 'news';
  if (festivalScore > releaseScore && festivalScore > 0) category = 'festivals';
  else if (releaseScore > 0) category = 'releases';

  return { sentiment, category, festivalScore, releaseScore };
}

function extractImage(item) {
  const media = Array.isArray(item.mediaContent) ? item.mediaContent[0] : item.mediaContent;
  if (media?.$?.url) return media.$.url;
  if (item.enclosure?.url && /\.(jpg|jpeg|png|gif|webp)$/i.test(item.enclosure.url)) return item.enclosure.url;
  if (item.mediaThumbnail?.$?.url) return item.mediaThumbnail.$.url;
  const content = item.contentEncoded || item.content || item.description || '';
  const match = content.match(/<img[^>]+src=["']([^"']+)["']/i);
  return match ? match[1] : null;
}

function calculatePriority(item, feedPriority, pubDateISO) {
  let score = feedPriority * 10;
  const published = new Date(pubDateISO).getTime();
  const hoursOld = (Date.now() - published) / 3_600_000;
  if (hoursOld < 6) score += 50;
  else if (hoursOld < 24) score += 35;
  else if (hoursOld < 48) score += 20;
  else if (hoursOld < 72) score += 10;
  const analysis = analyzeContent(item.title + (item.contentSnippet || ''));
  if (analysis.category === 'festivals') score += 25;
  else if (analysis.category === 'releases') score += 15;
  if (analysis.sentiment === 'positive') score += 10;
  if (item.image && /1200|1080|2048/.test(item.image)) score += 5;
  return Math.round(score);
}

function normalizeItem(rawItem, feedConfig) {
  const title = cleanText(rawItem.title);
  const link = rawItem.link || rawItem.guid;
  if (!title || !link) return null;

  const description = cleanText(rawItem.contentSnippet || rawItem.content || rawItem.description);
  const pubDate = rawItem.pubDate || rawItem.isoDate || new Date().toISOString();
  const image = extractImage(rawItem);
  const analysis = analyzeContent(`${title} ${description}`);
  const priority = calculatePriority({ title, contentSnippet: rawItem.contentSnippet, image }, feedConfig.priority, pubDate);

  return {
    id: rawItem.guid || rawItem.id || link,
    title,
    description: description.slice(0, 350),
    fullContent: rawItem.contentEncoded || null,
    link,
    pubDate,
    source: feedConfig.source,
    feedCategory: feedConfig.category,
    contentCategory: analysis.category,
    sentiment: analysis.sentiment,
    priority,
    image,
    hasFullContent: Boolean(rawItem.contentEncoded),
    tags: [feedConfig.category, analysis.category, analysis.sentiment].filter(Boolean),
  };
}

async function fetchFeed(feedConfig) {
  log('info', `Fetching ${feedConfig.source}`);
  const feed = await withRetry(() => parser.parseURL(feedConfig.url), feedConfig.source);
  const items = (feed?.items || [])
    .slice(0, CONFIG.maxItemsPerFeed)
    .map((item) => normalizeItem(item, feedConfig))
    .filter(Boolean);
  log('success', `${feedConfig.source}: ${items.length} items`);
  return items;
}

function dedupe(items) {
  const map = new Map();
  items.forEach((item) => {
    if (!map.has(item.id) || map.get(item.id).priority < item.priority) {
      map.set(item.id, item);
    }
  });
  return Array.from(map.values());
}

async function writeJSON(filePath, data) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  log('success', `Wrote ${path.relative(process.cwd(), filePath)}`);
}

async function main() {
  log('info', 'Fetching EDM news from sources...', { feeds: RSS_FEEDS.length });
  const allItems = [];

  for (const feed of RSS_FEEDS) {
    try {
      // eslint-disable-next-line no-await-in-loop
      const items = await fetchFeed(feed);
      allItems.push(...items);
    } catch (error) {
      log('error', `Skipping ${feed.source}`, { error: error.message });
    }
    // eslint-disable-next-line no-await-in-loop
    await sleep(CONFIG.requestDelay);
  }

  if (!allItems.length) {
    throw new Error('No feed data generated.');
  }

  const uniqueItems = dedupe(allItems);
  uniqueItems.sort((a, b) => {
    if (b.priority !== a.priority) return b.priority - a.priority;
    return new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime();
  });

  const topItems = uniqueItems.slice(0, CONFIG.maxTotalItems);
  const activeSources = Array.from(new Set(topItems.map((item) => item.source)));

  const output = {
    metadata: {
      generated: new Date().toISOString(),
      totalItems: topItems.length,
      totalSources: RSS_FEEDS.length,
      activeSources: activeSources.length,
      sources: activeSources,
    },
    featured: topItems.slice(0, 5),
    items: topItems,
  };

  const dir = path.join(__dirname, '..', 'public', 'data');
  await writeJSON(path.join(dir, 'edm-news.json'), output);
  await writeJSON(path.join(dir, 'edm-news-backup.json'), output);
  log('success', `Generated ${topItems.length} items from ${activeSources.length} sources`);
}

main().catch((error) => {
  console.error('Feed generation failed:', error.message);
  process.exit(1);
});
