-- Fix RLS policies for live_feed table to work in production
-- This migration addresses the timeout issues in Vercel deployment

-- Enable Row Level Security (if not already enabled)
ALTER TABLE public.live_feed ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Allow public read access to live_feed" ON public.live_feed;
DROP POLICY IF EXISTS "Allow service role full access to live_feed" ON public.live_feed;

-- Create policy for public read access (allows anonymous users to read)
-- This is more explicit and should work better in production
CREATE POLICY "Allow public read access to live_feed" ON public.live_feed
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Create policy for service role to insert/update (allows the Edge Function to write)
CREATE POLICY "Allow service role full access to live_feed" ON public.live_feed
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Grant necessary permissions
GRANT SELECT ON public.live_feed TO anon, authenticated;
GRANT ALL ON public.live_feed TO service_role;

-- Ensure the table is accessible
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- Add a test row to verify the table is working (will be overwritten by RSS feeds)
INSERT INTO public.live_feed (
  id, title, description, link, source, category, pub_date, guid,
  created_at, updated_at, author, tags, read_time, sentiment, priority
) VALUES (
  'test-connection-' || gen_random_uuid()::text,
  'Connection Test',
  'This is a test entry to verify the table is accessible',
  'https://test.com',
  'System',
  'news',
  NOW(),
  'test-guid-' || gen_random_uuid()::text,
  NOW(),
  NOW(),
  'System',
  ARRAY['test'],
  1,
  'neutral',
  1
) ON CONFLICT (guid) DO NOTHING;

-- Clean up test data after 1 hour
DELETE FROM public.live_feed
WHERE source = 'System'
  AND created_at < NOW() - INTERVAL '1 hour';
