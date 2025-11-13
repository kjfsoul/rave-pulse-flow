#!/bin/bash
# Import GitHub Issues to Beads
# Converts all GitHub issues from the current repository to Beads issues

set -euo pipefail

REPO=$(git config --get remote.origin.url 2>/dev/null | sed -E 's/.*github.com[:/]([^/]+\/[^/]+)(\.git)?$/\1/' | sed 's/\.git$//' || echo "")
if [ -z "$REPO" ]; then
    echo "❌ Could not detect GitHub repository"
    exit 1
fi

echo "🔄 Importing GitHub Issues to Beads"
echo "===================================="
echo "Repository: $REPO"
echo ""

# Check if bd is available
if ! command -v bd &> /dev/null; then
    if [[ ":$PATH:" != *":$HOME/go/bin:"* ]]; then
        export PATH="$PATH:$HOME/go/bin"
    fi
    if ! command -v bd &> /dev/null; then
        echo "❌ ERROR: 'bd' command not found"
        echo "   Please install Beads: go install github.com/bytedance/beads@latest"
        exit 1
    fi
fi

# Check if gh is available
if ! command -v gh &> /dev/null; then
    echo "❌ ERROR: 'gh' command not found"
    echo "   Please install GitHub CLI: brew install gh"
    exit 1
fi

# Fetch all GitHub issues
echo "📥 Fetching GitHub issues..."
GITHUB_ISSUES=$(gh issue list --repo "$REPO" --limit 1000 --json number,title,body,state,labels,assignees,createdAt,updatedAt,url 2>&1)

if [ $? -ne 0 ]; then
    echo "❌ Failed to fetch GitHub issues"
    echo "$GITHUB_ISSUES"
    exit 1
fi

ISSUE_COUNT=$(echo "$GITHUB_ISSUES" | jq 'length')
echo "   Found $ISSUE_COUNT issue(s)"
echo ""

if [ "$ISSUE_COUNT" -eq 0 ]; then
    echo "✅ No issues to import"
    exit 0
fi

# Track created issues
CREATED=0
SKIPPED=0
FAILED=0

# Process each issue
echo "$GITHUB_ISSUES" | jq -c '.[]' | while IFS= read -r issue; do
    NUMBER=$(echo "$issue" | jq -r '.number')
    TITLE=$(echo "$issue" | jq -r '.title')
    BODY=$(echo "$issue" | jq -r '.body // ""')
    STATE=$(echo "$issue" | jq -r '.state')
    LABELS=$(echo "$issue" | jq -r '.labels[].name' | tr '\n' ',' | sed 's/,$//')
    ASSIGNEES=$(echo "$issue" | jq -r '.assignees[].login' | tr '\n' ',' | sed 's/,$//')
    CREATED_AT=$(echo "$issue" | jq -r '.createdAt')
    UPDATED_AT=$(echo "$issue" | jq -r '.updatedAt')
    URL=$(echo "$issue" | jq -r '.url')

    echo "📋 Processing #$NUMBER: $TITLE"

    # Check if issue already exists (by checking if title matches)
    EXISTING=$(bd list --json 2>/dev/null | jq -r --arg title "$TITLE" '.[] | select(.title == $title) | .id' | head -1 || echo "")

    if [ -n "$EXISTING" ]; then
        echo "   ⏭️  Skipping (already exists): [$EXISTING]"
        SKIPPED=$((SKIPPED + 1))
        continue
    fi

    # Map GitHub state to Beads status
    case "$STATE" in
        "open")
            STATUS="open"
            ;;
        "closed")
            STATUS="closed"
            ;;
        *)
            STATUS="open"
            ;;
    esac

    # Determine issue type from labels or default to task
    TYPE="task"
    if echo "$LABELS" | grep -qi "bug"; then
        TYPE="bug"
    elif echo "$LABELS" | grep -qi "feature\|enhancement"; then
        TYPE="feature"
    elif echo "$LABELS" | grep -qi "chore\|maintenance"; then
        TYPE="chore"
    elif echo "$LABELS" | grep -qi "epic"; then
        TYPE="epic"
    fi

    # Determine priority from labels (default to 2)
    PRIORITY=2
    if echo "$LABELS" | grep -qi "priority.*high\|urgent\|critical"; then
        PRIORITY=0
    elif echo "$LABELS" | grep -qi "priority.*medium"; then
        PRIORITY=1
    elif echo "$LABELS" | grep -qi "priority.*low"; then
        PRIORITY=3
    fi

    # Build description with GitHub metadata
    DESCRIPTION=""
    if [ -n "$BODY" ] && [ "$BODY" != "null" ]; then
        DESCRIPTION="$BODY"
    fi

    # Add metadata footer
    METADATA="\n\n---\n"
    METADATA="${METADATA}**Imported from GitHub**\n"
    METADATA="${METADATA}- GitHub Issue: #$NUMBER\n"
    METADATA="${METADATA}- URL: $URL\n"
    if [ -n "$ASSIGNEES" ]; then
        METADATA="${METADATA}- Assignees: $ASSIGNEES\n"
    fi
    METADATA="${METADATA}- Created: $CREATED_AT\n"
    METADATA="${METADATA}- Updated: $UPDATED_AT\n"

    DESCRIPTION="${DESCRIPTION}${METADATA}"

    # Build labels (include GitHub labels + github-import)
    BEADS_LABELS="github-import"
    if [ -n "$LABELS" ]; then
        BEADS_LABELS="${BEADS_LABELS},${LABELS}"
    fi

    # Create Beads issue
    echo "   Creating Beads issue..."

    # Escape description for JSON
    ESCAPED_DESC=$(echo "$DESCRIPTION" | jq -Rs '.')

    # Create issue with description
    RESULT=$(bd create "$TITLE" \
        -d "$DESCRIPTION" \
        -p "$PRIORITY" \
        -t "$TYPE" \
        -l "$BEADS_LABELS" \
        --json 2>&1) || {
        echo "   ❌ Failed to create issue"
        echo "   Error: $RESULT"
        FAILED=$((FAILED + 1))
        continue
    }

    BEADS_ID=$(echo "$RESULT" | jq -r '.id // empty' || echo "")

    if [ -z "$BEADS_ID" ] || [ "$BEADS_ID" = "null" ]; then
        echo "   ❌ Failed to parse issue ID from: $RESULT"
        FAILED=$((FAILED + 1))
        continue
    fi

    # Update status if closed
    if [ "$STATUS" = "closed" ]; then
        bd update "$BEADS_ID" --status closed --json > /dev/null 2>&1 || true
        # Add close reason
        bd close "$BEADS_ID" --reason "Imported from GitHub issue #$NUMBER (was closed)" --json > /dev/null 2>&1 || true
    fi

    CREATED=$((CREATED + 1))
    echo "   ✅ Created: [$BEADS_ID]"
    echo ""
done

# Note: Variables modified in while loop don't persist in bash
# We'll recalculate the summary
CREATED=$(echo "$GITHUB_ISSUES" | jq -c '.[]' | while IFS= read -r issue; do
    TITLE=$(echo "$issue" | jq -r '.title')
    EXISTING=$(bd list --json 2>/dev/null | jq -r --arg title "$TITLE" '.[] | select(.title == $title) | .id' | head -1 || echo "")
    if [ -z "$EXISTING" ]; then
        echo "created"
    fi
done | grep -c "created" || echo "0")

SKIPPED=$(echo "$GITHUB_ISSUES" | jq -c '.[]' | while IFS= read -r issue; do
    TITLE=$(echo "$issue" | jq -r '.title')
    EXISTING=$(bd list --json 2>/dev/null | jq -r --arg title "$TITLE" '.[] | select(.title == $title) | .id' | head -1 || echo "")
    if [ -n "$EXISTING" ]; then
        echo "skipped"
    fi
done | grep -c "skipped" || echo "0")

echo ""
echo "===================================="
echo "✅ Import Complete"
echo ""
echo "Summary:"
echo "  Created: $CREATED"
echo "  Skipped: $SKIPPED"
echo "  Failed: $FAILED"
echo ""
echo "View imported issues:"
echo "  bd list --label github-import --json"
echo ""
