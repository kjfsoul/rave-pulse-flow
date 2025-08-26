-- Add missing columns to existing live_feed table
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

-- Enable Row Level Security if not already enabled
ALTER TABLE public.live_feed ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'live_feed' AND policyname = 'Allow public read access to live_feed'
    ) THEN
        CREATE POLICY "Allow public read access to live_feed" ON public.live_feed
        FOR SELECT USING (true);
    END IF;
END $$;

-- Create policy for service role if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'live_feed' AND policyname = 'Allow service role full access to live_feed'
    ) THEN
        CREATE POLICY "Allow service role full access to live_feed" ON public.live_feed
        FOR ALL USING (auth.role() = 'service_role');
    END IF;
END $$;
