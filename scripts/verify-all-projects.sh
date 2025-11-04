#!/bin/bash
# Verify all files and code quality across all 4 projects
# Usage: ./scripts/verify-all-projects.sh

set -euo pipefail

SOURCE_DIR="/Users/kfitz/mystic-arcana-v1000"
TARGETS=(
    "/Users/kfitz/3dsolardeepagent"
    "/Users/kfitz/3iatlas"
    "/Users/kfitz/rave-pulse-flow"
    "/Users/kfitz/birthdaygen.com"
)

echo "🔍 Verifying All Projects"
echo "=========================="
echo ""

ALL_GOOD=true

for TARGET in "${TARGETS[@]}"; do
    echo "📦 Project: $(basename "$TARGET")"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    if [ ! -d "$TARGET" ]; then
        echo "   ❌ ERROR: Directory does not exist"
        ALL_GOOD=false
        echo ""
        continue
    fi

    # Verify files
    echo "1️⃣ File Verification..."
    cd "$TARGET" || { echo "   ❌ Cannot cd to $TARGET"; ALL_GOOD=false; continue; }
    
    if [ -f "scripts/verify-copy.sh" ]; then
        if ./scripts/verify-copy.sh 2>&1 | grep -q "VERIFICATION FAILED"; then
            echo "   ❌ File verification failed"
            ALL_GOOD=false
        else
            echo "   ✅ Files verified"
        fi
    else
        echo "   ⚠️  verify-copy.sh not found (run copy-to-projects.sh first)"
    fi
    echo ""

    # Check code quality
    echo "2️⃣ Code Quality Check..."
    if [ -f "scripts/check-code-quality.sh" ]; then
        if ./scripts/check-code-quality.sh 2>&1 | grep -q "Code quality check failed"; then
            echo "   ❌ Code quality issues found"
            ALL_GOOD=false
        else
            echo "   ✅ Code quality passed"
        fi
    else
        echo "   ⚠️  check-code-quality.sh not found"
    fi
    echo ""

    cd "$SOURCE_DIR" || exit 1
    echo ""
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
if [ "$ALL_GOOD" = true ]; then
    echo "✅ All projects verified successfully"
    exit 0
else
    echo "❌ Some projects have issues - review above"
    exit 1
fi

