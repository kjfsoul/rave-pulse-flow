#!/bin/bash
# Verify all files were copied successfully to target projects
# Usage: ./scripts/verify-copy.sh

set -euo pipefail

TARGETS=(
    "/Users/kfitz/3dsolardeepagent"
    "/Users/kfitz/3iatlas"
    "/Users/kfitz/rave-pulse-flow"
    "/Users/kfitz/birthdaygen.com"
)

REQUIRED_FILES=(
    "scripts/integrated-session-start.sh"
    "scripts/recover-context.sh"
    "scripts/beads-session-start.sh"
    ".cursor/rules/beads-workflow.mdc"
    "startup.md"
    "recover.md"
    "AGENTS.md"
)

REQUIRED_SCRIPTS=(
    "scripts/analyze-project-goals.sh"
    "scripts/verify-tasks.sh"
    "scripts/cleanup-repo.sh"
    "scripts/check-updates.sh"
    "scripts/project-setup.sh"
    "scripts/tasklist-to-beads.sh"
)

echo "🔍 Verifying File Copies"
echo "========================"
echo ""

ALL_GOOD=true

for TARGET in "${TARGETS[@]}"; do
    echo "📦 Checking: $TARGET"

    if [ ! -d "$TARGET" ]; then
        echo "   ❌ ERROR: Directory does not exist"
        ALL_GOOD=false
        echo ""
        continue
    fi

    MISSING=()

    # Check required files
    for file in "${REQUIRED_FILES[@]}" "${REQUIRED_SCRIPTS[@]}"; do
        if [ ! -f "$TARGET/$file" ]; then
            MISSING+=("$file")
        fi
    done

    # Check executability of scripts
    for script in "${REQUIRED_SCRIPTS[@]}"; do
        if [ -f "$TARGET/$script" ] && [ ! -x "$TARGET/$script" ]; then
            MISSING+=("$script (not executable)")
        fi
    done

    if [ ${#MISSING[@]} -eq 0 ]; then
        echo "   ✅ All required files present and executable"
    else
        echo "   ❌ MISSING FILES:"
        for file in "${MISSING[@]}"; do
            echo "      - $file"
        done
        ALL_GOOD=false
    fi
    echo ""
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ "$ALL_GOOD" = true ]; then
    echo "✅ VERIFICATION PASSED: All files copied successfully"
    exit 0
else
    echo "❌ VERIFICATION FAILED: Missing files detected"
    echo ""
    echo "Run: ./scripts/copy-to-projects.sh to fix"
    exit 1
fi
