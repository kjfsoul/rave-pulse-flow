#!/bin/bash
# Check for secrets and API keys in codebase
# Usage: ./scripts/check-secrets.sh [--fix]

set -euo pipefail

FIX_MODE=false
if [[ "${1:-}" == "--fix" ]]; then
    FIX_MODE=true
fi

echo "🔐 Secret Detection & Security Check"
echo "===================================="
echo ""

SECRETS_FOUND=0

# Common secret patterns
SECRET_PATTERNS=(
    "api[_-]?key\s*[=:]\s*['\"][^'\"]+['\"]"
    "apikey\s*[=:]\s*['\"][^'\"]+['\"]"
    "secret[_-]?key\s*[=:]\s*['\"][^'\"]+['\"]"
    "access[_-]?token\s*[=:]\s*['\"][^'\"]+['\"]"
    "auth[_-]?token\s*[=:]\s*['\"][^'\"]+['\"]"
    "password\s*[=:]\s*['\"][^'\"]+['\"]"
    "apify_api_[a-zA-Z0-9]{32}"
    "apify_token\s*[=:]\s*['\"][^'\"]+['\"]"
    "notion[_-]?api[_-]?token\s*[=:]\s*['\"][^'\"]+['\"]"
    "ntn_[a-zA-Z0-9]{32}"
    "bearer\s+[a-zA-Z0-9]{20,}"
    "sk-[a-zA-Z0-9]{32,}"
    "pk_[a-zA-Z0-9]{32,}"
    "ghp_[a-zA-Z0-9]{36}"
    "gho_[a-zA-Z0-9]{36}"
    "ghu_[a-zA-Z0-9]{36}"
    "ghs_[a-zA-Z0-9]{36}"
    "ghr_[a-zA-Z0-9]{36}"
)

# Files to check (exclude build artifacts, node_modules, etc.)
SEARCH_PATHS=(
    "."
)

EXCLUDE_PATHS=(
    "node_modules"
    ".next"
    "dist"
    "dist-test"
    "build"
    ".git"
    "*.log"
    "*.tsbuildinfo"
    "package-lock.json"
    "pnpm-lock.yaml"
    "yarn.lock"
)

echo "🔍 Scanning for secrets..."
echo ""

for pattern in "${SECRET_PATTERNS[@]}"; do
    # Build exclude string
    EXCLUDE_STRING=""
    for exclude in "${EXCLUDE_PATHS[@]}"; do
        EXCLUDE_STRING="$EXCLUDE_STRING --exclude-dir=$exclude"
    done
    
    # Search for pattern
    MATCHES=$(grep -r -n -iE "$pattern" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" --include="*.json" --include="*.yaml" --include="*.yml" --include="*.env*" $EXCLUDE_STRING . 2>/dev/null | grep -v "node_modules" | grep -v ".git" | grep -v "dist-test" | grep -v "check-secrets.sh" || true)
    
    if [ -n "$MATCHES" ]; then
        SECRETS_FOUND=$((SECRETS_FOUND + 1))
        echo "   ⚠️  Found potential secret pattern: $pattern"
        echo "$MATCHES" | head -5 | while read -r line; do
            FILE=$(echo "$line" | cut -d: -f1)
            LINE_NUM=$(echo "$line" | cut -d: -f2)
            CONTENT=$(echo "$line" | cut -d: -f3- | sed 's/^[[:space:]]*//' | head -c 80)
            echo "      $FILE:$LINE_NUM - ${CONTENT}..."
            
            if [ "$FIX_MODE" = true ]; then
                # Replace with environment variable placeholder
                if [[ "$FILE" == *.json ]] || [[ "$FILE" == *.js ]] || [[ "$FILE" == *.ts ]]; then
                    # Try to replace common patterns
                    sed -i '' "s/apify_api_[a-zA-Z0-9]\{32\}/\${APIFY_TOKEN}/g" "$FILE" 2>/dev/null || true
                    sed -i '' "s/ntn_[a-zA-Z0-9]\{32\}/\${NOTION_API_TOKEN}/g" "$FILE" 2>/dev/null || true
                    sed -i '' "s/APIFY_TOKEN.*['\"][^'\"]*['\"]/APIFY_TOKEN: \"\${APIFY_TOKEN}\"/g" "$FILE" 2>/dev/null || true
                    sed -i '' "s/Authorization.*Bearer [^'\"]*/Authorization: \"Bearer \${NOTION_API_TOKEN}\"/g" "$FILE" 2>/dev/null || true
                fi
            fi
        done
        echo ""
    fi
done

# Check for common API token formats in JSON files
echo "🔍 Checking JSON files for hardcoded tokens..."
JSON_FILES=$(find . -name "*.json" ! -path "*/node_modules/*" ! -path "*/.next/*" ! -path "*/dist/*" ! -path "*/dist-test/*" ! -path "*/.git/*" ! -path "*/package-lock.json" ! -path "*/pnpm-lock.yaml" 2>/dev/null || true)

for json_file in $JSON_FILES; do
    # Check for long alphanumeric strings that look like tokens
    TOKENS=$(grep -oE '"[^"]{32,}"' "$json_file" 2>/dev/null | grep -vE "(sha256|sha512|uuid|description|name|title)" || true)
    if [ -n "$TOKENS" ]; then
        # Filter out obvious non-secrets
        SUSPICIOUS=$(echo "$TOKENS" | grep -E "(api|token|key|secret|auth)" || true)
        if [ -n "$SUSPICIOUS" ]; then
            echo "   ⚠️  Suspicious token-like string in: $json_file"
            echo "$SUSPICIOUS" | head -3 | sed 's/^/      /'
            SECRETS_FOUND=$((SECRETS_FOUND + 1))
        fi
    fi
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ $SECRETS_FOUND -eq 0 ]; then
    echo "✅ No secrets detected"
    exit 0
else
    echo "❌ Found $SECRETS_FOUND potential secret(s)"
    echo ""
    if [ "$FIX_MODE" = false ]; then
        echo "To attempt automatic fixes, run:"
        echo "  ./scripts/check-secrets.sh --fix"
        echo ""
        echo "⚠️  Review fixes carefully before committing!"
    else
        echo "✅ Attempted automatic fixes"
        echo "⚠️  Please review changes before committing!"
    fi
    exit 1
fi

