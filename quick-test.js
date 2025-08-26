// Quick test to verify Supabase connection with correct env vars
console.log('🔍 Testing Supabase Connection...');

// Check environment variables
console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ Present' : '❌ Missing');

// Test basic connection
import('./src/lib/supabase.js').then(({ supabase }) => {
  console.log('📡 Testing connection to live_feed table...');

  supabase.from('live_feed').select('count', { count: 'exact', head: true })
    .then(({ error }) => {
      if (error) {
        console.error('❌ Connection failed:', error.message);
        console.log('💡 This likely means the live_feed table doesn\'t exist yet');
        console.log('   You need to apply the database migration first');
      } else {
        console.log('✅ Connection successful! Table exists.');
        console.log('🎉 RSS feed should work now!');
      }
    })
    .catch(err => {
      console.error('💥 Error:', err.message);
    });
}).catch(err => {
  console.error('❌ Failed to import supabase:', err.message);
});
