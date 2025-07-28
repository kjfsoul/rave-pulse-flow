-- Shuffle Challenge System Tables
-- Add new tables for quest tracking, user stats, and analytics

-- User Challenge Statistics
CREATE TABLE IF NOT EXISTS user_challenge_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "userId" UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  "totalXP" INTEGER DEFAULT 0 NOT NULL,
  "currentStreak" INTEGER DEFAULT 0 NOT NULL,
  "longestStreak" INTEGER DEFAULT 0 NOT NULL,
  "questsCompleted" INTEGER DEFAULT 0 NOT NULL,
  level INTEGER DEFAULT 1 NOT NULL,
  "festivalStage" INTEGER DEFAULT 1 NOT NULL,
  "lastActiveDate" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  "weeklyXP" INTEGER DEFAULT 0 NOT NULL,
  "monthlyXP" INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  UNIQUE("userId")
);

-- Quest Progress Tracking
CREATE TABLE IF NOT EXISTS quest_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "userId" UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  "questId" TEXT NOT NULL,
  progress INTEGER DEFAULT 0 NOT NULL,
  completed BOOLEAN DEFAULT FALSE NOT NULL,
  "completedAt" TIMESTAMP WITH TIME ZONE,
  streak INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  UNIQUE("userId", "questId")
);

-- Analytics Events for Exists.ai Integration
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "userId" UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  event TEXT NOT NULL,
  properties JSONB DEFAULT '{}' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Reward Claims and Unlocks
CREATE TABLE IF NOT EXISTS user_rewards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "userId" UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  "rewardType" TEXT NOT NULL, -- 'sound_pack', 'dj_tool', 'badge', 'festival_unlock'
  "rewardId" TEXT NOT NULL,
  "rewardData" JSONB DEFAULT '{}' NOT NULL,
  "unlockedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  "questId" TEXT, -- Which quest unlocked this reward
  claimed BOOLEAN DEFAULT FALSE NOT NULL,
  "claimedAt" TIMESTAMP WITH TIME ZONE,
  
  UNIQUE("userId", "rewardType", "rewardId")
);

-- Festival Progression Tracking
CREATE TABLE IF NOT EXISTS festival_progression (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "userId" UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  "stageId" INTEGER NOT NULL,
  "stageName" TEXT NOT NULL,
  "unlockedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  "xpAtUnlock" INTEGER NOT NULL,
  active BOOLEAN DEFAULT FALSE NOT NULL,
  
  UNIQUE("userId", "stageId")
);

-- Weekly/Monthly Challenge Rotation
CREATE TABLE IF NOT EXISTS challenge_rotations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "rotationType" TEXT NOT NULL, -- 'daily', 'weekly', 'monthly', 'special'
  "startDate" DATE NOT NULL,
  "endDate" DATE NOT NULL,
  "questIds" TEXT[] NOT NULL,
  "specialRules" JSONB DEFAULT '{}',
  active BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- User Achievement Badges
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "userId" UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  "achievementId" TEXT NOT NULL,
  "achievementName" TEXT NOT NULL,
  "achievementDescription" TEXT NOT NULL,
  "iconUrl" TEXT,
  "earnedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  "questChain" TEXT[], -- Which quests led to this achievement
  "rarity" TEXT DEFAULT 'common' NOT NULL, -- 'common', 'rare', 'epic', 'legendary'
  
  UNIQUE("userId", "achievementId")
);

-- RLS Policies
ALTER TABLE user_challenge_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE quest_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE festival_progression ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_rotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- User can only access their own challenge data
CREATE POLICY "Users can view own challenge stats" ON user_challenge_stats
  FOR ALL USING (auth.uid() = "userId");

CREATE POLICY "Users can view own quest progress" ON quest_progress
  FOR ALL USING (auth.uid() = "userId");

CREATE POLICY "Users can view own analytics events" ON analytics_events
  FOR ALL USING (auth.uid() = "userId");

CREATE POLICY "Users can view own rewards" ON user_rewards
  FOR ALL USING (auth.uid() = "userId");

CREATE POLICY "Users can view own festival progression" ON festival_progression
  FOR ALL USING (auth.uid() = "userId");

CREATE POLICY "Users can view own achievements" ON user_achievements
  FOR ALL USING (auth.uid() = "userId");

-- Challenge rotations are public read-only
CREATE POLICY "Anyone can view challenge rotations" ON challenge_rotations
  FOR SELECT USING (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_challenge_stats_user_id ON user_challenge_stats("userId");
CREATE INDEX IF NOT EXISTS idx_quest_progress_user_id ON quest_progress("userId");
CREATE INDEX IF NOT EXISTS idx_quest_progress_quest_id ON quest_progress("questId");
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON analytics_events("userId");
CREATE INDEX IF NOT EXISTS idx_analytics_events_event ON analytics_events(event);
CREATE INDEX IF NOT EXISTS idx_user_rewards_user_id ON user_rewards("userId");
CREATE INDEX IF NOT EXISTS idx_festival_progression_user_id ON festival_progression("userId");
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements("userId");

-- Functions for automated operations
CREATE OR REPLACE FUNCTION update_challenge_stats_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER update_user_challenge_stats_timestamp
  BEFORE UPDATE ON user_challenge_stats
  FOR EACH ROW
  EXECUTE FUNCTION update_challenge_stats_timestamp();

CREATE TRIGGER update_quest_progress_timestamp
  BEFORE UPDATE ON quest_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_challenge_stats_timestamp();

-- Function to reset weekly/monthly XP
CREATE OR REPLACE FUNCTION reset_periodic_xp()
RETURNS void AS $$
BEGIN
  -- Reset weekly XP on Mondays
  IF EXTRACT(DOW FROM NOW()) = 1 THEN
    UPDATE user_challenge_stats SET "weeklyXP" = 0;
  END IF;
  
  -- Reset monthly XP on the 1st
  IF EXTRACT(DAY FROM NOW()) = 1 THEN
    UPDATE user_challenge_stats SET "monthlyXP" = 0;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to auto-unlock festival stages
CREATE OR REPLACE FUNCTION check_festival_progression()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if user has unlocked new festival stages
  INSERT INTO festival_progression ("userId", "stageId", "stageName", "xpAtUnlock")
  SELECT 
    NEW."userId",
    stage_id,
    stage_name,
    NEW."totalXP"
  FROM (VALUES
    (1, 'Underground Club', 0),
    (2, 'Local Festival', 500),
    (3, 'City Arena', 1500),
    (4, 'National Festival', 3500),
    (5, 'International Superstar', 7500),
    (6, 'EDM Hall of Fame', 15000)
  ) AS stages(stage_id, stage_name, xp_required)
  WHERE NEW."totalXP" >= xp_required
    AND NOT EXISTS (
      SELECT 1 FROM festival_progression 
      WHERE "userId" = NEW."userId" AND "stageId" = stage_id
    );
  
  -- Update current active stage
  UPDATE festival_progression 
  SET active = FALSE 
  WHERE "userId" = NEW."userId";
  
  UPDATE festival_progression 
  SET active = TRUE 
  WHERE "userId" = NEW."userId" 
    AND "stageId" = (
      SELECT MAX("stageId") 
      FROM festival_progression 
      WHERE "userId" = NEW."userId"
    );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for festival progression
CREATE TRIGGER check_festival_progression_trigger
  AFTER UPDATE OF "totalXP" ON user_challenge_stats
  FOR EACH ROW
  EXECUTE FUNCTION check_festival_progression();

-- Insert default challenge rotation for current period
INSERT INTO challenge_rotations ("rotationType", "startDate", "endDate", "questIds", "specialRules")
VALUES (
  'daily',
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '1 day',
  ARRAY[
    'bpm_drop_128',
    'crossfade_master', 
    'vocal_chop_master',
    'eq_sculpting',
    'archetype_enhancement'
  ],
  '{"multiplier": 1.0, "bonus_xp": 0}'
) ON CONFLICT DO NOTHING;