#!/usr/bin/env node

/**
 * Test script for RSS functionality
 * This script tests the Edge Function and database connectivity
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
const envPath = join(__dirname, '.env.local');
let envContent = '';
try {
  envContent = readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      const value = valueParts.join('=').trim();
      if (value && !value.startsWith('#')) { // Skip comments
        process.env[key.trim()] = value.replace(/^["']|["']$/g, '');
      }
    }
  });
  console.log('✅ Loaded environment variables from .env.local');
} catch (error) {
  console.log('Could not load .env.local file, using existing environment variables');
}

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  console.log('Please check your .env.local file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testDatabaseConnection() {
  console.log('🔍 Testing database connection...');

  try {
    const { data, error } = await supabase
      .from('live_feed')
      .select('count', { count: 'exact', head: true });

    if (error) {
      console.error('❌ Database connection failed:', error.message);
      return false;
    }

    console.log('✅ Database connection successful');
    return true;
  } catch (err) {
    console.error('❌ Database connection error:', err.message);
    return false;
  }
}

async function testEdgeFunction() {
  console.log('🚀 Testing Edge Function...');

  try {
    const { data, error } = await supabase.functions.invoke('fetch-rss-feeds');

    if (error) {
      console.error('❌ Edge Function error:', error.message);
      return false;
    }

    console.log('✅ Edge Function response:', data);
    return true;
  } catch (err) {
    console.error('❌ Edge Function call failed:', err.message);
    return false;
  }
}

async function checkFeedData() {
  console.log('📊 Checking feed data...');

  try {
    const { data, error } = await supabase
      .from('live_feed')
      .select('*')
      .order('pub_date', { ascending: false })
      .limit(5);

    if (error) {
      console.error('❌ Error fetching feed data:', error.message);
      return false;
    }

    if (data && data.length > 0) {
      console.log(`✅ Found ${data.length} feed items:`);
      data.forEach((item, index) => {
        console.log(`  ${index + 1}. ${item.title} (${item.source})`);
      });
      return true;
    } else {
      console.log('⚠️ No feed data found. You may need to run the Edge Function first.');
      return false;
    }
  } catch (err) {
    console.error('❌ Error checking feed data:', err.message);
    return false;
  }
}

async function runTests() {
  console.log('🧪 Starting RSS functionality tests...\n');

  const dbConnected = await testDatabaseConnection();
  console.log('');

  if (!dbConnected) {
    console.log('❌ Cannot proceed without database connection');
    console.log('Please check your Supabase configuration and database setup');
    process.exit(1);
  }

  const functionWorks = await testEdgeFunction();
  console.log('');

  const hasData = await checkFeedData();
  console.log('');

  console.log('📋 Test Results Summary:');
  console.log(`  Database Connection: ${dbConnected ? '✅' : '❌'}`);
  console.log(`  Edge Function: ${functionWorks ? '✅' : '❌'}`);
  console.log(`  Feed Data: ${hasData ? '✅' : '❌'}`);

  if (dbConnected && functionWorks && hasData) {
    console.log('\n🎉 All tests passed! Your RSS system is working correctly.');
  } else {
    console.log('\n⚠️ Some tests failed. Check the output above for details.');

    if (!hasData) {
      console.log('\n💡 To populate data, run the Edge Function:');
      console.log('  1. Go to Supabase Dashboard > Edge Functions');
      console.log('  2. Find "fetch-rss-feeds" function');
      console.log('  3. Click "Invoke" or "Test Function"');
    }
  }
}

// Handle command line arguments
const command = process.argv[2];

switch (command) {
  case 'test-db':
    testDatabaseConnection().then(() => process.exit(0));
    break;
  case 'test-function':
    testEdgeFunction().then(() => process.exit(0));
    break;
  case 'check-data':
    checkFeedData().then(() => process.exit(0));
    break;
  default:
    runTests();
}

export { testDatabaseConnection, testEdgeFunction, checkFeedData };
