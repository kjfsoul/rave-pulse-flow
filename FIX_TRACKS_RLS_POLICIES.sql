-- Fix RLS policies for tracks table
-- Run this in Supabase Dashboard > SQL Editor

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view their own tracks" ON tracks;
DROP POLICY IF EXISTS "Users can insert their own tracks" ON tracks;
DROP POLICY IF EXISTS "Users can update their own tracks" ON tracks;
DROP POLICY IF EXISTS "Users can delete their own tracks" ON tracks;

-- Recreate RLS policies for tracks table
-- These policies ensure users can only manage their own tracks
CREATE POLICY "Users can view their own tracks" ON tracks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tracks" ON tracks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tracks" ON tracks
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tracks" ON tracks
  FOR DELETE USING (auth.uid() = user_id);

-- Verify RLS is enabled
ALTER TABLE tracks ENABLE ROW LEVEL SECURITY;
