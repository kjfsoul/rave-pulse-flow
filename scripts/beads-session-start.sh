#!/bin/bash
# Beads Session Startup Script
# Ensures Beads workflow is followed at session start

set -euo pipefail

echo "🔮 Mystic Arcana - Beads Session Startup"
echo "=========================================="
echo ""

# Check if bd is available
if ! command -v bd &> /dev/null; then
    echo "⚠️  WARNING: 'bd' command not found"
    echo "   Checking common locations..."

    # Check if Go bin is in PATH
    if [[ ":$PATH:" != *":$HOME/go/bin:"* ]]; then
        echo "   Go bin not in PATH. Trying to add it..."
        export PATH="$PATH:$HOME/go/bin"
    fi

    # Check again
    if ! command -v bd &> /dev/null; then
        echo "❌ ERROR: 'bd' command still not found"
        echo "   Please install Beads or add it to PATH"
        echo "   Expected location: $HOME/go/bin/bd"
        echo ""
        echo "   You can still proceed, but Beads workflow will be unavailable."
        echo "   All discovered work should be documented for later filing."
        echo ""
        read -p "Continue anyway? (y/N) " -n 1 -r
        echo ""
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
fi

# Check if .beads directory exists
if [ ! -d ".beads" ]; then
    echo "⚠️  WARNING: .beads directory not found"
    echo "   Beads may not be initialized for this project"
    echo "   Run 'bd init' if this is a new project"
    echo ""
fi

# Function to query Beads with error handling
query_beads() {
    local cmd=$1
    local description=$2

    echo "📊 $description..."
    if command -v bd &> /dev/null; then
        if output=$(bd $cmd --json 2>&1); then
            echo "$output" | jq '.' 2>/dev/null || echo "$output"
        else
            echo "   ⚠️  Query failed: $output"
        fi
    else
        echo "   ⚠️  bd command not available"
    fi
    echo ""
}

# Step 1: Query ready work
query_beads "ready" "Checking ready work (no blockers)"

# Step 2: Review project health
echo "📈 Project Health Statistics..."
if command -v bd &> /dev/null; then
    bd stats 2>&1 || echo "   ⚠️  Stats query failed"
else
    echo "   ⚠️  bd command not available"
fi
echo ""

# Step 3: Check blocked issues
query_beads "blocked" "Checking blocked issues"

# Step 4: Summary
echo "✅ Beads Session Startup Complete"
echo ""
echo "Next steps:"
echo "1. Review the ready work above"
echo "2. Select an issue to work on"
echo "3. Update status: bd update <id> --status in_progress --json"
echo "4. Get full context: bd show <id> --json"
echo "5. Proceed with mandatory protocol check"
echo ""
