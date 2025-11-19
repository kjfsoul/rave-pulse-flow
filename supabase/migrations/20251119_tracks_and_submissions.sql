-- Create tracks table for user audio files
CREATE TABLE IF NOT EXISTS tracks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  file_key TEXT NOT NULL,
  mime_type TEXT,
  file_size INTEGER,
  duration INTEGER,
  bpm_detected INTEGER,
  bpm_accurate INTEGER,
  musical_key TEXT,
  source TEXT NOT NULL CHECK (source IN ('upload', 'freesound', 'loudly')),
  broadcast_rights_confirmed BOOLEAN NOT NULL DEFAULT false,
  attribution_credits TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- Create festival_submissions table
CREATE TABLE IF NOT EXISTS festival_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  artist_name TEXT NOT NULL,
  file_key TEXT NOT NULL,
  url TEXT NOT NULL,
  attribution_credits TEXT,
  festival_scene TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  votes INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- Enable RLS (Row Level Security)
ALTER TABLE tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE festival_submissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tracks table
CREATE POLICY "Users can view their own tracks" ON tracks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tracks" ON tracks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tracks" ON tracks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tracks" ON tracks
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for festival_submissions table
CREATE POLICY "Users can view all approved submissions" ON festival_submissions
  FOR SELECT USING (status = 'approved' OR auth.uid() = user_id);

CREATE POLICY "Users can insert their own submissions" ON festival_submissions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own submissions" ON festival_submissions
  FOR UPDATE USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS tracks_user_id_idx ON tracks(user_id);
CREATE INDEX IF NOT EXISTS tracks_source_idx ON tracks(source);
CREATE INDEX IF NOT EXISTS festival_submissions_user_id_idx ON festival_submissions(user_id);
CREATE INDEX IF NOT EXISTS festival_submissions_status_idx ON festival_submissions(status);
CREATE INDEX IF NOT EXISTS festival_submissions_votes_idx ON festival_submissions(votes DESC);

-- Create updated_at trigger function (if not exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::TEXT, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
DROP TRIGGER IF EXISTS update_tracks_updated_at ON tracks;
CREATE TRIGGER update_tracks_updated_at
  BEFORE UPDATE ON tracks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_festival_submissions_updated_at ON festival_submissions;
CREATE TRIGGER update_festival_submissions_updated_at
  BEFORE UPDATE ON festival_submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
