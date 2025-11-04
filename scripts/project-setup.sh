#!/bin/bash
# Complete project setup: cleanup + analyze + verify + generate tasks
# Usage: ./scripts/project-setup.sh [goals-file] [features-file]

set -euo pipefail

GOALS="${1:-}"
FEATURES="${2:-}"

echo "🚀 Complete Project Setup"
echo "========================="
echo ""

# Step 1: Cleanup
echo "Step 1/4: Cleaning repository..."
echo ""
./scripts/cleanup-repo.sh --dry-run
echo ""
read -p "Proceed with cleanup? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    ./scripts/cleanup-repo.sh --interactive
else
    echo "   ⏭️  Skipped cleanup"
fi
echo ""

# Step 2: Check updates
echo "Step 2/4: Checking recent updates..."
echo ""
./scripts/check-updates.sh
echo ""

# Step 3: Analyze goals/features
echo "Step 3/4: Analyzing project goals and features..."
echo ""
if [ -n "$GOALS" ] || [ -n "$FEATURES" ]; then
    ./scripts/analyze-project-goals.sh "$GOALS" "$FEATURES"
else
    echo "   Auto-detecting goals/features..."
    ./scripts/analyze-project-goals.sh
fi
echo ""

# Step 4: Verify tasks
echo "Step 4/4: Verifying generated tasks..."
echo ""
if [ -f "tasklist.md" ]; then
    ./scripts/verify-tasks.sh tasklist.md
    echo ""
    read -p "Convert tasks to Beads issues? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        ./scripts/tasklist-to-beads.sh tasklist.md
    fi
else
    echo "   ⚠️  tasklist.md not found - run analyze-project-goals.sh first"
fi

echo ""
echo "✅ Project setup complete!"
echo ""
echo "Next steps:"
echo "  1. Review tasklist.md"
echo "  2. Tell Cursor: 'read startup.md' to begin work"
echo "  3. Work on tasks from Beads: bd ready --json"

