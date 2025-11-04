#!/bin/bash
# Context Recovery Script
# Recovers context from Beads when agent loses conversation memory

set -euo pipefail

echo "🔍 Context Recovery from Beads"
echo "================================"
echo ""

# Check if bd is available
if ! command -v bd &> /dev/null; then
    if [[ ":$PATH:" != *":$HOME/go/bin:"* ]]; then
        export PATH="$PATH:$HOME/go/bin"
    fi
    if ! command -v bd &> /dev/null; then
        echo "❌ ERROR: 'bd' command not found"
        echo "   Cannot recover context without Beads"
        exit 1
    fi
fi

# Function to query Beads with error handling
query_beads() {
    local cmd=$1
    local description=$2

    echo "📊 $description..."
    if output=$(bd $cmd --json 2>&1); then
        if [ -n "$output" ] && [ "$output" != "[]" ] && [ "$output" != "null" ]; then
            echo "$output" | jq '.' 2>/dev/null || echo "$output"
            return 0
        else
            echo "   (none found)"
            return 1
        fi
    else
        echo "   ⚠️  Query failed: $output"
        return 1
    fi
}

# 1. Check for in-progress work
echo "1️⃣ Checking for in-progress work..."
IN_PROGRESS=$(bd list --status in_progress --json 2>/dev/null || echo "[]")

if [ "$IN_PROGRESS" != "[]" ] && [ -n "$IN_PROGRESS" ]; then
    ISSUE_COUNT=$(echo "$IN_PROGRESS" | jq 'length')
    echo "   Found $ISSUE_COUNT issue(s) in progress"
    echo ""

    # Show first issue details
    FIRST_ISSUE=$(echo "$IN_PROGRESS" | jq -r '.[0]')
    ISSUE_ID=$(echo "$FIRST_ISSUE" | jq -r '.id')
    ISSUE_TITLE=$(echo "$FIRST_ISSUE" | jq -r '.title')
    ISSUE_STATUS=$(echo "$FIRST_ISSUE" | jq -r '.status')

    echo "   📋 Current Work:"
    echo "      ID: $ISSUE_ID"
    echo "      Title: $ISSUE_TITLE"
    echo "      Status: $ISSUE_STATUS"
    echo ""

    # Get full issue details
    echo "   📄 Full Context:"
    bd show "$ISSUE_ID" --json 2>/dev/null | jq '.' || echo "   ⚠️  Could not load full details"
    echo ""

    # Check dependencies
    echo "   🔗 Dependencies:"
    bd dep tree "$ISSUE_ID" 2>/dev/null || echo "   (no dependencies found)"
    echo ""
else
    echo "   (no in-progress work found)"
    echo ""
fi

# 2. Check ready work
echo "2️⃣ Checking ready work (no blockers)..."
query_beads "ready" "Ready work" || true
echo ""

# 3. Check blocked issues
echo "3️⃣ Checking blocked issues..."
query_beads "blocked" "Blocked issues" || true
echo ""

# 4. Recent closed issues (last 5)
echo "4️⃣ Recent completed work (last 5)..."
RECENT=$(bd list --status closed --limit 5 --json 2>/dev/null || echo "[]")
if [ "$RECENT" != "[]" ] && [ -n "$RECENT" ]; then
    echo "$RECENT" | jq -r '.[] | "   \(.id): \(.title)"'
else
    echo "   (none found)"
fi
echo ""

# 5. Project statistics
echo "5️⃣ Project Health..."
bd stats 2>/dev/null || echo "   ⚠️  Could not load stats"
echo ""

# Summary
echo "✅ Context Recovery Complete"
echo ""
echo "Next steps:"
if [ "$IN_PROGRESS" != "[]" ] && [ -n "$IN_PROGRESS" ]; then
    ISSUE_ID=$(echo "$IN_PROGRESS" | jq -r '.[0].id')
    echo "1. Continue work on: $ISSUE_ID"
    echo "2. Query full details: bd show $ISSUE_ID --json"
    echo "3. Check dependencies: bd dep tree $ISSUE_ID"
else
    echo "1. Review ready work above"
    echo "2. Select an issue: bd ready --json"
    echo "3. Start work: bd update <id> --status in_progress --json"
fi
echo "4. Reference issue IDs in conversation to maintain context"
echo ""
