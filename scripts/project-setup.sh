#!/bin/bash
# Complete project setup: cleanup + analyze + verify + generate tasks
# Usage: ./scripts/project-setup.sh [goals-file] [features-file]

set -euo pipefail

GOALS="${1:-}"
FEATURES="${2:-}"

echo "🚀 Complete Project Setup"
echo "========================="
echo ""

# Step 0: Secret Check (MANDATORY FIRST)
echo "Step 0/5: Checking for secrets (MANDATORY)..."
echo ""
if [ -f "scripts/check-secrets.sh" ]; then
    if ./scripts/check-secrets.sh 2>&1 | grep -q "No secrets detected"; then
        echo "   ✅ No secrets detected - safe to proceed"
    else
        echo "   ❌ SECRETS DETECTED - Must fix before continuing"
        echo ""
        read -p "Attempt automatic fix? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            ./scripts/check-secrets.sh --fix
            echo ""
            echo "   ⚠️  Review fixes carefully before proceeding"
        else
            echo "   ⚠️  Setup paused - fix secrets first"
            exit 1
        fi
    fi
else
    echo "   ⚠️  check-secrets.sh not found - skipping secret check"
fi
echo ""

# Step 1: Cleanup
echo "Step 1/5: Cleaning repository..."
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
echo "Step 2/5: Checking recent updates..."
echo ""
./scripts/check-updates.sh
echo ""

# Step 3: Analyze goals/features
echo "Step 3/5: Analyzing project goals and features..."
echo ""
if [ -n "$GOALS" ] || [ -n "$FEATURES" ]; then
    ./scripts/analyze-project-goals.sh "$GOALS" "$FEATURES"
else
    echo "   Auto-detecting goals/features..."
    ./scripts/analyze-project-goals.sh
fi
echo ""

# Step 4: Verify tasks
echo "Step 4/5: Verifying generated tasks..."
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

# Step 5: Final secret check
echo ""
echo "Step 5/5: Final secret check..."
echo ""
if [ -f "scripts/check-secrets.sh" ]; then
    if ./scripts/check-secrets.sh 2>&1 | grep -q "No secrets detected"; then
        echo "   ✅ No secrets detected - setup complete"
    else
        echo "   ⚠️  Secrets still detected - review and fix"
    fi
fi

echo ""
echo "✅ Project setup complete!"
echo ""
echo "Next steps:"
echo "  1. ✅ Secret check passed"
echo "  2. Review tasklist.md"
echo "  3. Tell Cursor: 'read startup.md' to begin work"
echo "  4. Work on tasks from Beads: bd ready --json"
