# RSS Daily Update Cron Job Configuration

## Overview
This document describes how to set up a daily RSS feed update cron job for the EDM Shuffle application.

## Current Implementation
- RSS feeds are updated once per day instead of real-time
- The `fetch-rss-feeds` Edge Function checks if the last post is older than 24 hours
- If data is fresh (less than 24 hours old), the function returns without fetching

## Recommended Cron Schedule
Set up a cron job to call the RSS function once per day at a convenient time (e.g., 6 AM UTC):

```bash
# Daily at 6 AM UTC
0 6 * * * curl -X POST "https://your-project.supabase.co/functions/v1/fetch-rss-feeds" \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json"
```

## Alternative: GitHub Actions (Recommended)
Create a GitHub Action that runs daily:

```yaml
name: Daily RSS Update
on:
  schedule:
    - cron: '0 6 * * *'  # Daily at 6 AM UTC
  workflow_dispatch:  # Allow manual trigger

jobs:
  update-rss:
    runs-on: ubuntu-latest
    steps:
      - name: Update RSS Feeds
        run: |
          curl -X POST "${{ secrets.SUPABASE_URL }}/functions/v1/fetch-rss-feeds" \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}" \
            -H "Content-Type: application/json"
```

## Benefits of Daily Updates
1. **Reduced Server Load**: No constant real-time processing
2. **Better Performance**: Less frequent database operations
3. **Cost Effective**: Lower Supabase function execution costs
4. **Reliable**: Less prone to connection issues and timeouts
5. **User Experience**: Users get fresh content daily without overwhelming updates

## Monitoring
- Check Supabase function logs for successful daily updates
- Monitor the `live_feed` table for new entries
- Set up alerts if no updates occur for 48+ hours

## Manual Override
Users can still manually refresh feeds using the refresh button in the UI, which will bypass the 24-hour check if needed.
