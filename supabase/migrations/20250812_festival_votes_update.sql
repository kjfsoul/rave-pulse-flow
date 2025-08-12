-- Migration: Update festival_votes table for anti-spam voting system
-- Date: 2025-08-12
-- Purpose: Remove unique constraint to allow time-based voting restrictions

-- Drop the existing unique constraint
ALTER TABLE festival_votes DROP CONSTRAINT IF EXISTS festival_votes_user_id_artist_id_key;

-- Rename artist_id to dj_id to match requirements
ALTER TABLE festival_votes RENAME COLUMN artist_id TO dj_id;

-- Update the index name to match new column
DROP INDEX IF EXISTS idx_festival_votes_artist_id;
CREATE INDEX IF NOT EXISTS idx_festival_votes_dj_id ON festival_votes(dj_id);

-- Add a compound index for efficient anti-spam queries
CREATE INDEX IF NOT EXISTS idx_festival_votes_user_dj_time ON festival_votes(user_id, dj_id, created_at);

-- Update the existing RLS policies to use dj_id
-- Note: The policies already use user_id which is correct for the security model

-- Add a partial index for recent votes (last 24 hours) to optimize anti-spam checks
CREATE INDEX IF NOT EXISTS idx_festival_votes_recent ON festival_votes(user_id, dj_id, created_at) 
WHERE created_at > NOW() - INTERVAL '24 hours';