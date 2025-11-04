#!/bin/bash
# Clean up repository: remove redundancies, bloat, unused files
# Usage: ./scripts/cleanup-repo.sh [--dry-run] [--interactive]

set -euo pipefail

DRY_RUN=false
INTERACTIVE=false

for arg in "$@"; do
    case $arg in
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --interactive)
            INTERACTIVE=true
            shift
            ;;
        *)
            shift
            ;;
    esac
done

echo "🧹 Repository Cleanup"
echo "===================="
echo ""

if [ "$DRY_RUN" = true ]; then
    echo "⚠️  DRY RUN MODE - No files will be deleted"
    echo ""
fi

# Find duplicate files (by content hash)
echo "🔍 Finding duplicate files..."
DUPLICATES=$(find . -type f ! -path "*/node_modules/*" ! -path "*/.git/*" ! -path "*/dist/*" ! -path "*/build/*" -exec md5 -r {} \; 2>/dev/null | sort | uniq -d -w 32 | cut -d' ' -f2- || true)

if [ -n "$DUPLICATES" ]; then
    echo "   Found duplicate files:"
    echo "$DUPLICATES" | while read -r file; do
        echo "   - $file"
        if [ "$DRY_RUN" = false ] && [ "$INTERACTIVE" = false ]; then
            # Keep first, remove others (or keep shortest path)
            echo "     ⚠️  Review manually for duplicates"
        fi
    done
else
    echo "   ✅ No duplicates found"
fi
echo ""

# Find unused TypeScript/JavaScript files (no imports)
echo "🔍 Finding potentially unused code files..."
CODE_FILES=$(find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) ! -path "*/node_modules/*" ! -path "*/.next/*" ! -path "*/dist/*" ! -path "*/build/*" 2>/dev/null | head -50 || true)

if [ -n "$CODE_FILES" ]; then
    UNUSED_COUNT=0
    echo "$CODE_FILES" | while read -r file; do
        # Check if file is imported anywhere (simple grep)
        BASENAME=$(basename "$file" | sed 's/\.[^.]*$//')
        if ! grep -r --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" -l "$BASENAME" . --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=dist --exclude-dir=build 2>/dev/null | grep -v "^$file$" | head -1 > /dev/null; then
            if [ "$file" != "./*.ts" ]; then
                echo "   ⚠️  Potentially unused: $file"
                UNUSED_COUNT=$((UNUSED_COUNT + 1))
                if [ "$DRY_RUN" = false ] && [ "$INTERACTIVE" = true ]; then
                    read -p "   Delete $file? (y/N): " -n 1 -r
                    echo
                    if [[ $REPLY =~ ^[Yy]$ ]]; then
                        rm -f "$file"
                        echo "   ✅ Deleted"
                    fi
                fi
            fi
        fi
    done
else
    echo "   ✅ No unused files detected (analysis limited)"
fi
echo ""

# Find large files (>1MB) that might be bloat
echo "🔍 Finding large files (>1MB)..."
LARGE_FILES=$(find . -type f -size +1M ! -path "*/node_modules/*" ! -path "*/.git/*" ! -path "*/dist/*" ! -path "*/build/*" 2>/dev/null | head -20 || true)

if [ -n "$LARGE_FILES" ]; then
    echo "   Large files found:"
    echo "$LARGE_FILES" | while read -r file; do
        SIZE=$(du -h "$file" | cut -f1)
        echo "   - $file ($SIZE)"
    done
else
    echo "   ✅ No large files found"
fi
echo ""

# Find empty directories
echo "🔍 Finding empty directories..."
EMPTY_DIRS=$(find . -type d -empty ! -path "*/node_modules/*" ! -path "*/.git/*" 2>/dev/null || true)

if [ -n "$EMPTY_DIRS" ]; then
    echo "   Empty directories:"
    echo "$EMPTY_DIRS" | while read -r dir; do
        echo "   - $dir"
        if [ "$DRY_RUN" = false ] && [ "$INTERACTIVE" = true ]; then
            read -p "   Remove $dir? (y/N): " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                rmdir "$dir" 2>/dev/null && echo "   ✅ Removed" || echo "   ⚠️  Could not remove"
            fi
        fi
    done
else
    echo "   ✅ No empty directories"
fi
echo ""

# Find common bloat patterns
echo "🔍 Finding common bloat patterns..."
BLOAT_PATTERNS=(
    "*.log"
    "*.tmp"
    "*.bak"
    "*.swp"
    "*~"
    ".DS_Store"
    "Thumbs.db"
)

BLOAT_FOUND=false
for pattern in "${BLOAT_PATTERNS[@]}"; do
    FILES=$(find . -name "$pattern" ! -path "*/node_modules/*" ! -path "*/.git/*" 2>/dev/null | head -10 || true)
    if [ -n "$FILES" ]; then
        BLOAT_FOUND=true
        echo "   Found $pattern files:"
        echo "$FILES" | while read -r file; do
            echo "   - $file"
            if [ "$DRY_RUN" = false ]; then
                rm -f "$file" && echo "     ✅ Deleted"
            fi
        done
    fi
done

if [ "$BLOAT_FOUND" = false ]; then
    echo "   ✅ No common bloat files found"
fi
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
if [ "$DRY_RUN" = true ]; then
    echo "✅ Dry run complete. Review above and run without --dry-run to clean."
else
    echo "✅ Cleanup complete!"
fi
echo ""
echo "💡 Tip: Run with --interactive for guided cleanup"

