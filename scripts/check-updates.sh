#!/bin/bash
# Check what needs to be done relative to all updates sorted by date
# Usage: ./scripts/check-updates.sh

set -euo pipefail

echo "📅 Checking Updates by Date"
echo "==========================="
echo ""

# Get recent commits (last 30 days)
echo "🔍 Recent Git Commits (last 30 days):"
echo ""
git log --since="30 days ago" --pretty=format:"%h | %ad | %s" --date=short 2>/dev/null | head -20 || echo "   No recent commits"
echo ""

# Get recently modified files
echo "📝 Recently Modified Files (last 7 days):"
echo ""
find . -type f ! -path "*/node_modules/*" ! -path "*/.git/*" ! -path "*/dist/*" ! -path "*/build/*" -mtime -7 -exec ls -lt {} + 2>/dev/null | head -20 | awk '{print "   " $6 " " $7 " " $8 " - " $9}' || echo "   No recent modifications"
echo ""

# Check Beads issues by date
if command -v bd &> /dev/null; then
    echo "📋 Beads Issues (sorted by date):"
    echo ""
    bd list --json 2>/dev/null | jq -r 'sort_by(.created_at) | reverse | .[] | "\(.created_at) | \(.status) | \(.title) [\(.id)]"' 2>/dev/null | head -20 || echo "   No Beads issues"
    echo ""
fi

# Check tasklist.md for unchecked items
if [ -f "tasklist.md" ]; then
    UNCHECKED=$(grep -cE '^\s*-\s+\[ \]' tasklist.md 2>/dev/null || echo "0")
    CHECKED=$(grep -cE '^\s*-\s+\[x\]' tasklist.md 2>/dev/null || echo "0")
    TOTAL=$((UNCHECKED + CHECKED))
    
    if [ "$TOTAL" -gt 0 ]; then
        echo "📋 Tasklist.md Status:"
        echo "   Total tasks: $TOTAL"
        echo "   ✅ Completed: $CHECKED"
        echo "   ⏳ Pending: $UNCHECKED"
        echo ""
    fi
fi

# Check for TODO/FIXME comments
echo "🔍 TODO/FIXME Comments in Code:"
echo ""
TODO_COUNT=$(grep -r --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" -E "(TODO|FIXME)" . --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=dist --exclude-dir=build 2>/dev/null | wc -l | tr -d ' ' || echo "0")
echo "   Found $TODO_COUNT TODO/FIXME comments"
grep -r --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" -E "(TODO|FIXME)" . --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=dist --exclude-dir=build 2>/dev/null | head -10 | sed 's/^/   /' || true
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ Update check complete"
echo ""
echo "Next steps:"
echo "  1. Review tasks: ./scripts/verify-tasks.sh tasklist.md"
echo "  2. Clean repo: ./scripts/cleanup-repo.sh --dry-run"
echo "  3. Analyze goals: ./scripts/analyze-project-goals.sh"

