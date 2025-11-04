#!/bin/bash
# Convert tasklist.md to Beads issues
# Usage: ./scripts/tasklist-to-beads.sh [tasklist.md] [parent-issue-id]

set -euo pipefail

TASKLIST_FILE="${1:-tasklist.md}"
PARENT_ID="${2:-}"

if [ ! -f "$TASKLIST_FILE" ]; then
    echo "❌ Error: $TASKLIST_FILE not found"
    exit 1
fi

if ! command -v bd &> /dev/null; then
    echo "❌ Error: Beads CLI (bd) not found"
    echo "   Add to PATH: export PATH=\"\$PATH:\$HOME/go/bin\""
    exit 1
fi

echo "📋 Processing $TASKLIST_FILE..."
echo ""

# Extract tasks (lines with - [ ] or - [x])
UNCHECKED_TASKS=$(grep -E '^\s*-\s+\[ \]' "$TASKLIST_FILE" || true)
CHECKED_TASKS=$(grep -E '^\s*-\s+\[x\]' "$TASKLIST_FILE" || true)

if [ -z "$UNCHECKED_TASKS" ] && [ -z "$CHECKED_TASKS" ]; then
    echo "⚠️  No checklist items found in $TASKLIST_FILE"
    echo "   Expected format: - [ ] Task description"
    exit 0
fi

UNCHECKED_COUNT=$(echo "$UNCHECKED_TASKS" | grep -c . || echo "0")
CHECKED_COUNT=$(echo "$CHECKED_TASKS" | grep -c . || echo "0")

echo "Found:"
echo "  ✅ Completed: $CHECKED_COUNT"
echo "  ⏳ Pending: $UNCHECKED_COUNT"
echo ""

if [ "$UNCHECKED_COUNT" -eq 0 ]; then
    echo "✅ All tasks completed!"
    exit 0
fi

# Process unchecked tasks
echo "Creating Beads issues..."
echo ""

while IFS= read -r line; do
    # Extract task text (remove - [ ] prefix)
    TASK_TEXT=$(echo "$line" | sed 's/^\s*-\s*\[ \]\s*//' | sed 's/^\s*-\s*\[x\]\s*//')
    
    if [ -z "$TASK_TEXT" ]; then
        continue
    fi
    
    # Check if issue already exists (by title)
    EXISTING=$(bd list --json 2>/dev/null | jq -r --arg title "$TASK_TEXT" '.[] | select(.title == $title) | .id' | head -1 || true)
    
    if [ -n "$EXISTING" ]; then
        echo "  ⏭️  Skipping (exists): $TASK_TEXT [$EXISTING]"
        ISSUE_ID="$EXISTING"
    else
        # Create new issue
        ISSUE_ID=$(bd create "$TASK_TEXT" -t task -p 2 --json 2>/dev/null | jq -r '.id' || echo "")
        
        if [ -z "$ISSUE_ID" ] || [ "$ISSUE_ID" = "null" ]; then
            echo "  ❌ Failed to create: $TASK_TEXT"
            continue
        fi
        
        echo "  ✅ Created: $TASK_TEXT [$ISSUE_ID]"
    fi
    
    # Link to parent if provided
    if [ -n "$PARENT_ID" ] && [ -n "$ISSUE_ID" ]; then
        bd dep add "$ISSUE_ID" "$PARENT_ID" --type parent-child 2>/dev/null || true
    fi
    
done <<< "$UNCHECKED_TASKS"

echo ""
echo "✅ Done! View with: bd list --json"

if [ -n "$PARENT_ID" ]; then
    echo "   Dependency tree: bd dep tree $PARENT_ID"
fi

