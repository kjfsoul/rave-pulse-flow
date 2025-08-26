-- Enhance live_feed table with additional fields for improved RSS processing
ALTER TABLE public.live_feed
ADD COLUMN IF NOT EXISTS author VARCHAR(255),
ADD COLUMN IF NOT EXISTS tags TEXT[],
ADD COLUMN IF NOT EXISTS read_time INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS sentiment VARCHAR(20) DEFAULT 'neutral',
ADD COLUMN IF NOT EXISTS priority INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS trending BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;

-- Create indexes for new fields
CREATE INDEX IF NOT EXISTS idx_live_feed_sentiment ON public.live_feed(sentiment);
CREATE INDEX IF NOT EXISTS idx_live_feed_priority ON public.live_feed(priority DESC);
CREATE INDEX IF NOT EXISTS idx_live_feed_trending ON public.live_feed(trending) WHERE trending = true;
CREATE INDEX IF NOT EXISTS idx_live_feed_featured ON public.live_feed(featured) WHERE featured = true;

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
