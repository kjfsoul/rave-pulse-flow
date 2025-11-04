#!/bin/bash
# Attempt to fix TypeScript and linting errors automatically
# Usage: ./scripts/fix-code-quality.sh

set -euo pipefail

echo "🔧 Fixing Code Quality Issues"
echo "============================="
echo ""

# Fix linting (auto-fixable)
if command -v npm &> /dev/null && [ -f "package.json" ]; then
    echo "1️⃣ Running lint fix..."
    npm run lint -- --fix 2>&1 | tail -5 || echo "   ⚠️  Lint fix completed (may have unfixable issues)"
    echo ""
fi

# TypeScript check (can't auto-fix, but shows what needs fixing)
if command -v npm &> /dev/null && [ -f "package.json" ]; then
    echo "2️⃣ TypeScript check (manual fixes required)..."
    npm run typecheck 2>&1 | grep -E "(error|Error)" | head -10 || echo "   ✅ No TypeScript errors"
    echo ""
fi

echo "✅ Fix attempt complete"
echo ""
echo "Note: Some issues may require manual fixes."
echo "Run: ./scripts/check-code-quality.sh to verify"

