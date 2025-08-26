-- Create the live_feed table for RSS feed storage
CREATE TABLE IF NOT EXISTS public.live_feed (
  id VARCHAR(255) PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  link TEXT NOT NULL,
  source VARCHAR(255) NOT NULL,
  category VARCHAR(100) DEFAULT 'news',
  pub_date TIMESTAMP WITH TIME ZONE NOT NULL,
  guid VARCHAR(500) UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  author VARCHAR(255),
  tags TEXT[],
  read_time INTEGER DEFAULT 1,
  sentiment VARCHAR(20) DEFAULT 'neutral',
  priority INTEGER DEFAULT 1,
  trending BOOLEAN DEFAULT false,
  featured BOOLEAN DEFAULT false
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_live_feed_pub_date ON public.live_feed(pub_date DESC);
CREATE INDEX IF NOT EXISTS idx_live_feed_source ON public.live_feed(source);
CREATE INDEX IF NOT EXISTS idx_live_feed_category ON public.live_feed(category);
CREATE INDEX IF NOT EXISTS idx_live_feed_sentiment ON public.live_feed(sentiment);
CREATE INDEX IF NOT EXISTS idx_live_feed_priority ON public.live_feed(priority DESC);
CREATE INDEX IF NOT EXISTS idx_live_feed_trending ON public.live_feed(trending) WHERE trending = true;
CREATE INDEX IF NOT EXISTS idx_live_feed_featured ON public.live_feed(featured) WHERE featured = true;

-- Enable Row Level Security
ALTER TABLE public.live_feed ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Allow public read access to live_feed" ON public.live_feed
  FOR SELECT USING (true);

-- Create policy for service role to insert/update
CREATE POLICY "Allow service role full access to live_feed" ON public.live_feed
  FOR ALL USING (auth.role() = 'service_role');

-- Create a function to automatically determine trending content
CREATE OR REPLACE FUNCTION update_trending_content()
RETURNS void AS $$
BEGIN
  -- Mark items as trending if they have high priority and are recent
  UPDATE public.live_feed
  SET trending = true
  WHERE pub_date >= NOW() - INTERVAL '24 hours'
    AND priority >= 3
    AND (sentiment = 'positive' OR sentiment IS NULL);

  -- Unmark old trending items
  UPDATE public.live_feed
  SET trending = false
  WHERE pub_date < NOW() - INTERVAL '7 days'
    AND trending = true;
END;
$$ LANGUAGE plpgsql;

-- Create a function to automatically feature important content
CREATE OR REPLACE FUNCTION update_featured_content()
RETURNS void AS $$
BEGIN
  -- Feature high-priority items from premium sources
  UPDATE public.live_feed
  SET featured = true
  WHERE source IN ('Dancing Astronaut', 'EDM.com', 'Insomniac', 'Beatport')
    AND priority >= 4
    AND pub_date >= NOW() - INTERVAL '48 hours'
    AND featured = false;
END;
$$ LANGUAGE plpgsql;

-- Add comment to table
COMMENT ON TABLE public.live_feed IS 'Enhanced RSS feed storage with content analysis and prioritization';
