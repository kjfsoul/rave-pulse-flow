# Remote Supabase Deployment Guide

**Project ID:** `uzudveyglwouuofiaapq`

## Quick Deploy Commands

Run these commands in order:

### 1. Link to Remote Project
```bash
npx supabase link --project-ref uzudveyglwouuofiaapq
```
When prompted, you may need to enter your Supabase access token. Get it from:
https://supabase.com/dashboard/account/tokens

### 2. Push Database Migrations
```bash
npx supabase db push
```
This will deploy all migration files in `supabase/migrations/` including:
- `20250126_shuffle_challenges.sql`
- `20250812_festival_votes_update.sql`
- `20251119_tracks_and_submissions.sql` ← **Creates tracks & festival_submissions tables**

### 3. Deploy Edge Functions
```bash
npx supabase functions deploy printify-products --no-verify-jwt
npx supabase functions deploy rss-proxy --no-verify-jwt
npx supabase functions deploy freesound-search --no-verify-jwt
```

### 4. Create Storage Bucket
1. Go to: https://supabase.com/dashboard/project/uzudveyglwouuofiaapq/storage/buckets
2. Click "New bucket"
3. Name: `tracks`
4. Make it **Public** (if you want public URLs)

### 5. Set Environment Variables (Edge Functions)
1. Go to: https://supabase.com/dashboard/project/uzudveyglwouuofiaapq/settings/functions
2. Under "Secrets", add:
   - `FREESOUND_API_KEY` = (your Freesound API key)

## Verify Deployment

Visit `/system-check` in your app to verify all systems are operational.

## Troubleshooting

### "Migration already exists" error
If a migration was partially applied, you may need to manually fix the database or reset migrations.

### "Not authenticated" error
Run: `npx supabase login`

### "Project not found" error
Verify the project ID: `uzudveyglwouuofiaapq`
Check your Supabase dashboard to confirm this is the correct project.
