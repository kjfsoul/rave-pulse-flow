// Quick verification script - run this in browser console
console.log('🔍 Verifying Supabase Connection...');

// Check if environment variables are loaded
console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ Present' : '❌ Missing');

// Test basic connection
import { supabase } from './src/lib/supabase.js';

async function testConnection() {
  try {
    console.log('📡 Testing connection...');
    const { data, error } = await supabase.from('live_feed').select('count', { count: 'exact', head: true });

    if (error) {
      console.error('❌ Connection failed:', error.message);
      return false;
    }

    console.log('✅ Connection successful!');
    return true;
  } catch (err) {
    console.error('💥 Error:', err.message);
    return false;
  }
}

// Run the test
testConnection().then(success => {
  if (success) {
    console.log('🎉 RSS Feed should now work! Refresh the page.');
  } else {
    console.log('❌ Still having issues. Check the troubleshooting guide.');
  }
});
