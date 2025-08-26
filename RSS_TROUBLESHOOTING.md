# RSS Feed Loading Issues - Troubleshooting Guide

## Problem: RSS Feed Shows "Loading" Indefinitely

If the RSS feed component is perpetually showing a loading state, here are the most common causes and solutions:

## 🔍 Quick Diagnosis Steps

### 1. Check Browser Console
Open your browser's developer tools (F12) and look for:
- **Network errors** when fetching from Supabase
- **CORS errors** blocking the requests
- **JavaScript errors** in the console

### 2. Verify Environment Variables
Ensure your `.env` file contains the correct Supabase credentials:

```bash
# Required environment variables
VITE_SUPABASE_URL=https://uzudveyglwouuofiaapq.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. Check Database Table
Verify the `live_feed` table exists and has data:

```sql
-- Check if table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables
  WHERE table_name = 'live_feed'
);

-- Check table contents
SELECT COUNT(*) FROM live_feed;

-- Check recent data
SELECT * FROM live_feed
ORDER BY pub_date DESC
LIMIT 5;
```

## 🛠️ Common Solutions

### Solution 1: Database Migration Issue
**Problem**: The `live_feed` table doesn't exist or has incorrect schema.

**Solution**:
1. Run the database migration:
```bash
# Apply the migration via Supabase dashboard
# Go to: https://supabase.com/dashboard/project/YOUR_PROJECT/sql
# Run the contents of: supabase/migrations/20250824_enhance_live_feed_table.sql
```

2. Or use Supabase CLI:
```bash
supabase db push
```

### Solution 2: Missing Environment Variables
**Problem**: Supabase client can't connect due to missing credentials.

**Solution**:
1. Check if `.env` file exists in project root
2. Verify the variables are loaded:
```javascript
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Supabase Key:', import.meta.env.VITE_SUPABASE_ANON_KEY);
```

3. Restart your development server after adding environment variables

### Solution 3: Row Level Security (RLS) Issues
**Problem**: RLS policies are blocking read access to the `live_feed` table.

**Solution**:
1. Check RLS policies in Supabase dashboard:
   - Go to Authentication > Policies
   - Ensure `live_feed` table has a policy allowing public read access

2. Or create the policy manually:
```sql
-- Enable RLS
ALTER TABLE public.live_feed ENABLE ROW LEVEL SECURITY;

-- Create read policy
CREATE POLICY "live_feed_public_read" ON public.live_feed
  FOR SELECT USING (true);
```

### Solution 4: Edge Function Issues
**Problem**: The `fetch-rss-feeds` Edge Function isn't working properly.

**Solution**:
1. Check Edge Function logs in Supabase dashboard
2. Test the function directly:
```bash
curl -X POST 'https://uzudveyglwouuofiaapq.supabase.co/functions/v1/fetch-rss-feeds' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json'
```

3. Verify the function is deployed:
```bash
supabase functions deploy fetch-rss-feeds
```

### Solution 5: Network/Connection Issues
**Problem**: Network requests are being blocked or timing out.

**Solution**:
1. Check if Supabase is accessible:
```bash
curl -I https://uzudveyglwouuofiaapq.supabase.co
```

2. Verify CORS settings in Supabase dashboard
3. Check for VPN/firewall blocking requests

## 🧪 Testing the Fix

### Test 1: Direct Database Query
```javascript
// In browser console
import { supabase } from '@/lib/supabase';

const testConnection = async () => {
  const { data, error } = await supabase
    .from('live_feed')
    .select('*')
    .limit(1);

  console.log('Data:', data);
  console.log('Error:', error);
};

testConnection();
```

### Test 2: Edge Function Test
```javascript
// Test the RSS fetch function
const testEdgeFunction = async () => {
  const { data, error } = await supabase.functions.invoke('fetch-rss-feeds');
  console.log('Function response:', data);
  console.log('Function error:', error);
};

testEdgeFunction();
```

### Test 3: Component Debug
Add temporary debug logging to `RSSFeedStreamer.tsx`:

```javascript
// Add this to the fetchFeedItems function
const fetchFeedItems = async () => {
  console.log('🔄 Starting fetchFeedItems...');
  try {
    setLoading(true);
    setError(null);

    console.log('📡 Making Supabase request...');
    const { data, error: fetchError } = await supabase
      .from('live_feed')
      .select('*')
      .order('pub_date', { ascending: false })
      .limit(10);

    console.log('📊 Supabase response:', { data, error: fetchError });

    if (fetchError) {
      console.error('❌ Fetch error:', fetchError);
      throw fetchError;
    }

    // ... rest of function
  } catch (err) {
    console.error('💥 Catch block error:', err);
    // ... error handling
  } finally {
    console.log('🏁 Fetch complete');
    setLoading(false);
  }
};
```

## 🚨 Emergency Fixes

### Quick Fix 1: Add Sample Data
If the table is empty, add some test data:

```sql
INSERT INTO live_feed (title, description, link, source, category, pub_date, guid)
VALUES (
  'Test Article',
  'This is a test article to verify the RSS feed is working',
  'https://example.com/test',
  'Test Source',
  'news',
  NOW(),
  'test-guid-123'
);
```

### Quick Fix 2: Disable Loading Timeout
Add a timeout to prevent infinite loading:

```javascript
// In RSSFeedStreamer.tsx, modify the useEffect
useEffect(() => {
  const timeout = setTimeout(() => {
    if (loading) {
      setError('Loading timeout - please check your connection');
      setLoading(false);
    }
  }, 10000); // 10 second timeout

  fetchFeedItems();

  return () => clearTimeout(timeout);
}, []);
```

## 📊 Monitoring & Debugging

### Enable Debug Logging
Add this to your `.env` file:
```bash
VITE_DEBUG=true
```

### Check Network Tab
In browser dev tools:
1. Go to Network tab
2. Filter by "supabase"
3. Look for failed requests or long loading times

### Supabase Dashboard Monitoring
1. **Database**: Check query performance and errors
2. **Edge Functions**: Monitor function execution and errors
3. **Authentication**: Verify API key permissions

## 🔄 Recovery Steps

1. **Verify Environment**: Check all required environment variables
2. **Test Connection**: Use the test functions above
3. **Check Database**: Ensure `live_feed` table exists with data
4. **Test Functions**: Verify Edge Functions are deployed and working
5. **Check Permissions**: Ensure RLS policies allow read access
6. **Restart Services**: Restart your development server

## 📞 Getting Help

If issues persist:

1. **Check the console logs** for detailed error messages
2. **Verify Supabase project status** in the dashboard
3. **Test with sample data** to isolate the issue
4. **Check network connectivity** and firewall settings

## 🛡️ Prevention

To prevent future issues:

1. **Regular Backups**: Backup your database schema
2. **Monitor Logs**: Regularly check Supabase function logs
3. **Test Deployments**: Test in staging before production
4. **Document Changes**: Keep track of schema changes

---

**Last Updated**: August 24, 2025
**Version**: 1.0
**Status**: Active Troubleshooting Guide
