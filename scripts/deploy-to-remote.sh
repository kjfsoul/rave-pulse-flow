#!/bin/bash

# Deployment Script for Remote Supabase Instance
# Project ID: uzudveyglwouuofiaapq
#
# This script helps deploy migrations, Edge Functions, and verify configuration
# to the remote Supabase instance.
#
# Usage:
#   chmod +x scripts/deploy-to-remote.sh
#   ./scripts/deploy-to-remote.sh

set -e  # Exit on error

PROJECT_REF="uzudveyglwouuofiaapq"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$PROJECT_ROOT"

echo "🚀 Rave Pulse Flow - Remote Supabase Deployment"
echo "================================================"
echo ""
echo "Target Project: $PROJECT_REF"
echo "Project Root: $PROJECT_ROOT"
echo ""

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Installing via npm..."
    npm install -g supabase
fi

# Check if user is logged in
if ! supabase projects list &> /dev/null; then
    echo "⚠️  Not logged in to Supabase CLI. Please run:"
    echo "   npx supabase login"
    echo ""
    exit 1
fi

echo "✅ Supabase CLI found"
echo ""

# Step 1: Link to remote project
echo "📌 Step 1: Linking to remote project..."
echo "   Run: npx supabase link --project-ref $PROJECT_REF"
echo ""
read -p "Press Enter after running the link command, or Ctrl+C to cancel..."
echo ""

# Step 2: Push migrations
echo "📦 Step 2: Deploying database migrations..."
echo "   Run: npx supabase db push"
echo ""
read -p "Press Enter after running db push, or Ctrl+C to cancel..."
echo ""

# Step 3: Deploy Edge Functions
echo "⚡ Step 3: Deploying Edge Functions..."
echo ""

FUNCTIONS=(
    "printify-products"
    "rss-proxy"
    "freesound-search"
)

for func in "${FUNCTIONS[@]}"; do
    if [ -d "supabase/functions/$func" ]; then
        echo "   Deploying: $func"
        echo "   Run: npx supabase functions deploy $func --no-verify-jwt"
        echo ""
        read -p "Press Enter after deploying $func, or Ctrl+C to cancel..."
        echo ""
    else
        echo "   ⚠️  Function not found: $func (skipping)"
    fi
done

# Step 4: Verify environment variables
echo "🔐 Step 4: Verify environment variables in Supabase Dashboard..."
echo ""
echo "   Required environment variables for Edge Functions:"
echo "   - FREESOUND_API_KEY (for freesound-search function)"
echo ""
echo "   To set environment variables:"
echo "   1. Go to https://supabase.com/dashboard/project/$PROJECT_REF/settings/functions"
echo "   2. Add FREESOUND_API_KEY under 'Secrets'"
echo ""

# Step 5: Verify storage bucket
echo "📁 Step 5: Verify Storage bucket exists..."
echo ""
echo "   Required bucket: 'tracks'"
echo "   To create/verify:"
echo "   1. Go to https://supabase.com/dashboard/project/$PROJECT_REF/storage/buckets"
echo "   2. Create bucket 'tracks' if it doesn't exist"
echo "   3. Set bucket to 'Public' if needed for public URLs"
echo ""

echo "✅ Deployment checklist complete!"
echo ""
echo "Next steps:"
echo "1. Visit /system-check in your app to verify all systems"
echo "2. Test upload functionality in Sound Library"
echo "3. Test RSS feed functionality"
echo "4. Test Freesound search (requires FREESOUND_API_KEY)"
echo ""
