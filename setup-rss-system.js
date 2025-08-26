#!/usr/bin/env node

/**
 * Setup script for RSS system
 * This script helps set up the complete RSS functionality
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  console.log('Please check your .env.local file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function setupDatabase() {
  console.log('🗄️ Setting up database...');

  try {
    // Read the migration file
    const migrationPath = path.join(__dirname, 'supabase', 'migrations', '20250824_create_rss_database.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('📋 Running database migration...');

    // Execute the migration SQL
    const { error } = await supabase.rpc('exec_sql', { sql: migrationSQL });

    if (error) {
      console.error('❌ Migration failed:', error.message);
      console.log('💡 You may need to run this SQL manually in your Supabase dashboard:');
      console.log('   Go to SQL Editor and paste the contents of:');
      console.log('   supabase/migrations/20250824_create_rss_database.sql');
      return false;
    }

    console.log('✅ Database setup complete');
    return true;
  } catch (err) {
    console.error('❌ Database setup error:', err.message);
    return false;
  }
}

async function testConnection() {
  console.log('🔍 Testing database connection...');

  try {
    const { data, error } = await supabase
      .from('live_feed')
      .select('count', { count: 'exact', head: true });

    if (error) {
      console.error('❌ Connection test failed:', error.message);
      return false;
    }

    console.log('✅ Database connection successful');
    return true;
  } catch (err) {
    console.error('❌ Connection test error:', err.message);
    return false;
  }
}

async function provideInstructions() {
  console.log('\n📋 Next Steps:');
  console.log('');
  console.log('1. 🚀 Deploy Edge Function:');
  console.log('   - Go to Supabase Dashboard > Edge Functions');
  console.log('   - Create function named "fetch-rss-feeds"');
  console.log('   - Copy code from: supabase/functions/fetch-rss-feeds/index.ts');
  console.log('   - Deploy the function');
  console.log('');

  console.log('2. 🧪 Test the system:');
  console.log('   - Run: node test-rss-functionality.js');
  console.log('   - Or click the refresh button in your app');
  console.log('');

  console.log('3. 🎉 Enjoy real-time RSS feeds!');
  console.log('   - Your app will automatically show real EDM news');
  console.log('   - Use the refresh button to get latest updates');
  console.log('');

  console.log('📚 Files created:');
  console.log('   ✅ supabase/migrations/20250824_create_rss_database.sql');
  console.log('   ✅ test-rss-functionality.js');
  console.log('   ✅ setup-rss-system.js (this file)');
  console.log('');

  console.log('🔧 Existing files:');
  console.log('   ✅ supabase/functions/fetch-rss-feeds/index.ts');
  console.log('   ✅ src/components/RSSFeedStreamer.tsx');
}

async function runSetup() {
  console.log('🚀 Setting up RSS system...\n');

  const connected = await testConnection();
  if (!connected) {
    console.log('❌ Cannot connect to database. Please check your configuration.');
    process.exit(1);
  }

  const dbSetup = await setupDatabase();
  console.log('');

  await provideInstructions();

  if (dbSetup) {
    console.log('🎉 Setup completed successfully!');
    console.log('Follow the next steps above to finish the setup.');
  } else {
    console.log('⚠️ Setup completed with warnings.');
    console.log('You may need to run the database migration manually.');
  }
}

// Handle command line arguments
const command = process.argv[2];

switch (command) {
  case 'test':
    testConnection().then(() => process.exit(0));
    break;
  case 'db':
    setupDatabase().then(() => process.exit(0));
    break;
  default:
    runSetup();
}

module.exports = { setupDatabase, testConnection, provideInstructions };
