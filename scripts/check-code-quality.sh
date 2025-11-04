#!/bin/bash
# Check TypeScript, linting, and detect hardcoded/mock/stubbed data
# Usage: ./scripts/check-code-quality.sh

set -euo pipefail

echo "🔍 Code Quality Check"
echo "===================="
echo ""

FAILURES=0

# Check TypeScript errors
echo "1️⃣ TypeScript Check..."
if command -v npm &> /dev/null && [ -f "package.json" ]; then
    if npm run typecheck 2>&1 | grep -qE "(error|Error)"; then
        echo "   ❌ TypeScript errors found"
        npm run typecheck 2>&1 | grep -E "(error|Error)" | head -10
        FAILURES=$((FAILURES + 1))
    else
        echo "   ✅ No TypeScript errors"
    fi
else
    echo "   ⚠️  npm/package.json not found, skipping TypeScript check"
fi
echo ""

# Check linting errors
echo "2️⃣ Linting Check..."
if command -v npm &> /dev/null && [ -f "package.json" ]; then
    if npm run lint 2>&1 | grep -qE "(error|Error|warning)"; then
        echo "   ❌ Linting errors/warnings found"
        npm run lint 2>&1 | grep -E "(error|Error|warning)" | head -10
        FAILURES=$((FAILURES + 1))
    else
        echo "   ✅ No linting errors"
    fi
else
    echo "   ⚠️  npm/package.json not found, skipping lint check"
fi
echo ""

# Detect hardcoded/mock/fake/stubbed data
echo "3️⃣ Hardcoded/Mock Data Detection..."
echo ""

MOCK_PATTERNS=(
    "TODO"
    "FIXME"
    "placeholder"
    "mock"
    "fake"
    "stub"
    "hardcoded"
    "temporary"
    "temp"
    "example"
    "sample"
    "dummy"
    "test data"
    "random.*3"
    "Math\.floor.*Math\.random"
)

MOCK_FOUND=false
CODE_FILES=$(find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) ! -path "*/node_modules/*" ! -path "*/.next/*" ! -path "*/dist/*" ! -path "*/build/*" ! -path "*/test/*" ! -path "*/tests/*" 2>/dev/null || true)

for pattern in "${MOCK_PATTERNS[@]}"; do
    MATCHES=$(echo "$CODE_FILES" | xargs grep -l -iE "$pattern" 2>/dev/null || true)
    if [ -n "$MATCHES" ]; then
        MOCK_FOUND=true
        echo "   ⚠️  Found potential mock/hardcoded data: $pattern"
        echo "$MATCHES" | head -5 | while read -r file; do
            echo "      - $file"
            grep -n -iE "$pattern" "$file" 2>/dev/null | head -2 | sed 's/^/         /' || true
        done
        echo ""
    fi
done

# Check for specific problematic patterns
echo "   Checking for problematic patterns..."
echo ""

# Random placeholder functions
RANDOM_PLACEHOLDERS=$(grep -r -n -E "(Math\.floor.*Math\.random|return.*\[.*Math\.random|guidanceOptions\[Math\.floor)" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" . --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=dist --exclude-dir=build --exclude-dir=test --exclude-dir=tests 2>/dev/null || true)
if [ -n "$RANDOM_PLACEHOLDERS" ]; then
    MOCK_FOUND=true
    echo "   ❌ Found random placeholder logic:"
    echo "$RANDOM_PLACEHOLDERS" | head -5 | sed 's/^/      /'
    FAILURES=$((FAILURES + 1))
    echo ""
fi

# Hardcoded arrays with generic content
HARDCODED_ARRAYS=$(grep -r -n -A 3 -E "(const.*=.*\[|guidanceOptions|placeholderMessages)" --include="*.ts" --include="*.tsx" . --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=dist --exclude-dir=build --exclude-dir=test --exclude-dir=tests 2>/dev/null | grep -E '"(Channel|Honor|Practice|Trust|patience|creative spark)"' || true)
if [ -n "$HARDCODED_ARRAYS" ]; then
    MOCK_FOUND=true
    echo "   ❌ Found hardcoded generic messages:"
    echo "$HARDCODED_ARRAYS" | head -5 | sed 's/^/      /'
    FAILURES=$((FAILURES + 1))
    echo ""
fi

# Stubbed functions (return empty/placeholder)
STUBBED=$(grep -r -n -E "(function.*\{.*return.*\['\"].*['\"];.*\}|//.*stub|//.*TODO.*implement)" --include="*.ts" --include="*.tsx" . --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=dist --exclude-dir=build --exclude-dir=test --exclude-dir=tests 2>/dev/null | head -10 || true)
if [ -n "$STUBBED" ]; then
    MOCK_FOUND=true
    echo "   ⚠️  Found stubbed functions:"
    echo "$STUBBED" | head -5 | sed 's/^/      /'
    echo ""
fi

if [ "$MOCK_FOUND" = false ]; then
    echo "   ✅ No obvious mock/hardcoded data detected"
fi
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
if [ $FAILURES -eq 0 ]; then
    echo "✅ Code quality check passed"
    exit 0
else
    echo "❌ Code quality check failed ($FAILURES issue(s))"
    echo ""
    echo "Issues found that must be addressed before marking tasks complete."
    exit 1
fi

