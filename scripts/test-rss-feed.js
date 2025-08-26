// Script to test the RSS feed Edge Function locally
// Run with: node scripts/test-rss-feed.js

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testRSSFeed() {
  console.log('Testing RSS Feed Edge Function...\n');

  try {
    // First, let's check if the table exists and has any data
    const { data: existingData, error: fetchError } = await supabase
      .from('live_feed')
      .select('id, title, source, pub_date')
      .order('pub_date', { ascending: false })
      .limit(5);

    if (fetchError) {
      console.error('Error fetching existing data:', fetchError);
    } else {
      console.log(`Current feed items: ${existingData?.length || 0}`);
      if (existingData && existingData.length > 0) {
        console.log('\nLatest items:');
        existingData.forEach(item => {
          console.log(`- ${item.title} (${item.source})`);
        });
      }
    }

    // Now invoke the Edge Function
    console.log('\n\nInvoking fetch-rss-feeds Edge Function...');
    const { data, error } = await supabase.functions.invoke('fetch-rss-feeds');

    if (error) {
      console.error('Error invoking function:', error);
      return;
    }

    console.log('\nFunction response:', JSON.stringify(data, null, 2));

    // Fetch the updated data
    const { data: updatedData, error: updatedError } = await supabase
      .from('live_feed')
      .select('*')
      .order('pub_date', { ascending: false })
      .limit(5);

    if (updatedError) {
      console.error('Error fetching updated data:', updatedError);
    } else {
      console.log(`\nUpdated feed items: ${updatedData?.length || 0}`);
      if (updatedData && updatedData.length > 0) {
        console.log('\nLatest items after update:');
        updatedData.forEach(item => {
          console.log(`\n- Title: ${item.title}`);
          console.log(`  Source: ${item.source}`);
          console.log(`  Category: ${item.category}`);
          console.log(`  Published: ${new Date(item.pub_date).toLocaleString()}`);
          console.log(`  Link: ${item.link}`);
        });
      }
    }

  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

// Run the test
testRSSFeed();