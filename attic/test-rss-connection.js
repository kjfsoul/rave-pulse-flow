// Quick test script to check RSS feed database connection
// Run with: node test-rss-connection.js

const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config();

async function testConnection() {
  console.log('🔍 Testing RSS Feed Database Connection...\n');

  // Check environment variables
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

  console.log('📋 Environment Check:');
  console.log('   Supabase URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
  console.log('   Supabase Key:', supabaseKey ? '✅ Set' : '❌ Missing');

  if (!supabaseUrl || !supabaseKey) {
    console.log('\n❌ Missing environment variables. Please check your .env file.');
    return;
  }

  try {
    // Initialize Supabase client
    console.log('\n🔌 Initializing Supabase connection...');
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Test 1: Check if we can connect
    console.log('📡 Testing basic connection...');
    const { data: connectionTest, error: connectionError } = await supabase
      .from('live_feed')
      .select('count', { count: 'exact', head: true });

    if (connectionError) {
      console.log('❌ Connection failed:', connectionError.message);
      return;
    }

    console.log('✅ Connection successful!');

    // Test 2: Check table existence and data
    console.log('\n📊 Checking live_feed table...');
    const { data, error, count } = await supabase
      .from('live_feed')
      .select('*')
      .limit(3);

    if (error) {
      console.log('❌ Table query failed:', error.message);
      console.log('💡 This might mean:');
      console.log('   - The live_feed table doesn\'t exist');
      console.log('   - Row Level Security is blocking access');
      console.log('   - The migration hasn\'t been applied');
      return;
    }

    console.log(`✅ Table exists with ${count} records`);

    if (count === 0) {
      console.log('⚠️  Table is empty - no RSS feed data found');
      console.log('💡 You need to:');
      console.log('   1. Run the RSS fetch function');
      console.log('   2. Or add some sample data');
    } else {
      console.log('📝 Sample data:');
      data.forEach((item, index) => {
        console.log(`   ${index + 1}. ${item.title} (${item.source})`);
      });
    }

    // Test 3: Check Edge Function
    console.log('\n🚀 Testing Edge Function...');
    const { data: functionData, error: functionError } = await supabase.functions.invoke('fetch-rss-feeds');

    if (functionError) {
      console.log('❌ Edge Function failed:', functionError.message);
      console.log('💡 This might mean:');
      console.log('   - The function isn\'t deployed');
      console.log('   - There\'s an error in the function code');
    } else {
      console.log('✅ Edge Function working:', functionData);
    }

  } catch (err) {
    console.log('💥 Unexpected error:', err.message);
  }

  console.log('\n🎯 Test complete!');
  console.log('\n📋 Next steps if issues persist:');
  console.log('   1. Check Supabase dashboard for table existence');
  console.log('   2. Apply the database migration');
  console.log('   3. Deploy the Edge Function');
  console.log('   4. Check browser console for detailed errors');
}

// Run the test
testConnection().catch(console.error);
