-- Create live_feed table for storing RSS feed data
CREATE TABLE IF NOT EXISTS public.live_feed (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(500) NOT NULL,
    description TEXT,
    link VARCHAR(1000) NOT NULL,
    source VARCHAR(255) NOT NULL,
    category VARCHAR(50) DEFAULT 'news',
    pub_date TIMESTAMP WITH TIME ZONE NOT NULL,
    guid VARCHAR(500) UNIQUE,
    image_url VARCHAR(1000),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_live_feed_pub_date ON public.live_feed(pub_date DESC);
CREATE INDEX idx_live_feed_category ON public.live_feed(category);
CREATE INDEX idx_live_feed_source ON public.live_feed(source);

-- Enable Row Level Security
ALTER TABLE public.live_feed ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to read the feed (public content)
CREATE POLICY "live_feed_public_read" ON public.live_feed
    FOR SELECT
    USING (true);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to auto-update updated_at
CREATE TRIGGER update_live_feed_updated_at 
    BEFORE UPDATE ON public.live_feed 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Add comment to table
COMMENT ON TABLE public.live_feed IS 'Stores RSS feed items for the EDM Live Feed on the homepage';