#!/bin/bash
# Analyze project goals/features and generate tasklist.md
# Usage: ./scripts/analyze-project-goals.sh [goals-file-or-dir] [features-file-or-dir]

set -euo pipefail

GOALS_INPUT="${1:-}"
FEATURES_INPUT="${2:-}"
OUTPUT_FILE="${3:-tasklist.md}"

echo "🔍 Project Goals & Features Analysis"
echo "===================================="
echo ""

# Collect goal/feature files
GOAL_FILES=()
FEATURE_FILES=()

if [ -n "$GOALS_INPUT" ]; then
    if [ -f "$GOALS_INPUT" ]; then
        GOAL_FILES=("$GOALS_INPUT")
    elif [ -d "$GOALS_INPUT" ]; then
        GOAL_FILES=($(find "$GOALS_INPUT" -type f \( -name "*.md" -o -name "*.txt" -o -name "*.json" \) 2>/dev/null | head -20))
    fi
fi

if [ -n "$FEATURES_INPUT" ]; then
    if [ -f "$FEATURES_INPUT" ]; then
        FEATURE_FILES=("$FEATURES_INPUT")
    elif [ -d "$FEATURES_INPUT" ]; then
        FEATURE_FILES=($(find "$FEATURES_INPUT" -type f \( -name "*.md" -o -name "*.txt" -o -name "*.json" \) 2>/dev/null | head -20))
    fi
fi

# Auto-detect common goal/feature files if not provided
if [ ${#GOAL_FILES[@]} -eq 0 ]; then
    for file in README.md CURRENT_GOALS.txt GOALS.md FEATURES.md PRD.md docs/GOALS.md docs/FEATURES.md; do
        if [ -f "$file" ]; then
            GOAL_FILES+=("$file")
        fi
    done
fi

if [ ${#FEATURE_FILES[@]} -eq 0 ]; then
    for file in FEATURES.md FEATURE_LIST.md docs/FEATURES.md package.json; do
        if [ -f "$file" ]; then
            FEATURE_FILES+=("$file")
        fi
    done
fi

echo "📋 Analyzing Goals:"
for file in "${GOAL_FILES[@]}"; do
    echo "   - $file"
done
echo ""

echo "🎯 Analyzing Features:"
for file in "${FEATURE_FILES[@]}"; do
    echo "   - $file"
done
echo ""

# Extract goals/features (simple pattern matching)
TEMP_GOALS=$(mktemp)
TEMP_FEATURES=$(mktemp)

for file in "${GOAL_FILES[@]}"; do
    # Extract goals (lines with TODO, FIXME, goal, objective, etc.)
    grep -iE "(goal|objective|target|todo|fixme|need|required|must)" "$file" 2>/dev/null | head -50 >> "$TEMP_GOALS" || true
done

for file in "${FEATURE_FILES[@]}"; do
    # Extract features (lines with feature, functionality, capability, etc.)
    grep -iE "(feature|functionality|capability|implement|support|enable)" "$file" 2>/dev/null | head -50 >> "$TEMP_FEATURES" || true
done

# Generate tasklist.md template
cat > "$OUTPUT_FILE" << 'TASKLIST_HEADER'
# Project Tasks - Auto-Generated

**Generated:** $(date +%Y-%m-%d)
**Source:** Goals and Features Analysis

## 📋 Implementation Tasks

TASKLIST_HEADER

# Simple extraction - create tasks from key phrases
echo "- [ ] Analyze current project state" >> "$OUTPUT_FILE"
echo "- [ ] Compare goals vs current implementation" >> "$OUTPUT_FILE"
echo "- [ ] Identify missing features" >> "$OUTPUT_FILE"
echo "- [ ] Create implementation plan" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

# Add extracted goals as tasks
if [ -s "$TEMP_GOALS" ]; then
    echo "## 🎯 Goals to Implement" >> "$OUTPUT_FILE"
    echo "" >> "$OUTPUT_FILE"
    # Extract first 20 unique goal-like statements
    grep -oE "[A-Z][^.!?]*" "$TEMP_GOALS" 2>/dev/null | head -20 | while read -r line; do
        if [ ${#line} -gt 20 ] && [ ${#line} -lt 200 ]; then
            echo "- [ ] ${line:0:150}" >> "$OUTPUT_FILE"
        fi
    done
    echo "" >> "$OUTPUT_FILE"
fi

# Add extracted features as tasks
if [ -s "$TEMP_FEATURES" ]; then
    echo "## 🚀 Features to Implement" >> "$OUTPUT_FILE"
    echo "" >> "$OUTPUT_FILE"
    grep -oE "[A-Z][^.!?]*" "$TEMP_FEATURES" 2>/dev/null | head -20 | while read -r line; do
        if [ ${#line} -gt 20 ] && [ ${#line} -lt 200 ]; then
            echo "- [ ] ${line:0:150}" >> "$OUTPUT_FILE"
        fi
    done
fi

rm -f "$TEMP_GOALS" "$TEMP_FEATURES"

echo "✅ Generated: $OUTPUT_FILE"
echo ""
echo "📝 Next steps:"
echo "   1. Review and edit $OUTPUT_FILE"
echo "   2. Verify tasks with: ./scripts/verify-tasks.sh $OUTPUT_FILE"
echo "   3. Convert to Beads: ./scripts/tasklist-to-beads.sh $OUTPUT_FILE"

