#!/bin/bash
# Verify tasks in tasklist.md before converting to Beads
# Usage: ./scripts/verify-tasks.sh [tasklist.md]

set -euo pipefail

TASKLIST_FILE="${1:-tasklist.md}"

if [ ! -f "$TASKLIST_FILE" ]; then
    echo "❌ Error: $TASKLIST_FILE not found"
    exit 1
fi

echo "🔍 Verifying Tasks in $TASKLIST_FILE"
echo "====================================="
echo ""

# Extract tasks
TASKS=$(grep -E '^\s*-\s+\[ \]' "$TASKLIST_FILE" || true)
TASK_COUNT=$(echo "$TASKS" | grep -c . || echo "0")

if [ "$TASK_COUNT" -eq 0 ]; then
    echo "⚠️  No unchecked tasks found"
    exit 0
fi

echo "Found $TASK_COUNT unchecked tasks:"
echo ""

# Show tasks with numbers
COUNTER=1
while IFS= read -r line; do
    TASK_TEXT=$(echo "$line" | sed 's/^\s*-\s*\[ \]\s*//')
    echo "$COUNTER. $TASK_TEXT"
    COUNTER=$((COUNTER + 1))
done <<< "$TASKS"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ Review complete. These tasks will be created in Beads."
echo ""
echo "To proceed:"
echo "  ./scripts/tasklist-to-beads.sh $TASKLIST_FILE"
echo ""
echo "To edit tasks, modify $TASKLIST_FILE and run this again."

