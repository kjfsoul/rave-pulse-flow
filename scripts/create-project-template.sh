#!/bin/bash
# Create a new project with all Triple System files
# Usage: ./scripts/create-project-template.sh <project-name> [target-directory]

set -euo pipefail

PROJECT_NAME="${1:-}"
TARGET_DIR="${2:-}"

if [ -z "$PROJECT_NAME" ]; then
    echo "❌ Error: Project name required"
    echo "Usage: ./scripts/create-project-template.sh <project-name> [target-directory]"
    exit 1
fi

if [ -z "$TARGET_DIR" ]; then
    TARGET_DIR="$HOME/$PROJECT_NAME"
fi

SOURCE_DIR="/Users/kfitz/mystic-arcana-v1000"

echo "🚀 Creating Project Template: $PROJECT_NAME"
echo "Target: $TARGET_DIR"
echo ""

# Check if target exists
if [ -d "$TARGET_DIR" ]; then
    echo "⚠️  Directory already exists: $TARGET_DIR"
    read -p "Continue? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    mkdir -p "$TARGET_DIR" || { echo "❌ Cannot create directory"; exit 1; }
fi

cd "$TARGET_DIR" || { echo "❌ Cannot cd to $TARGET_DIR"; exit 1; }

# Initialize git if not already
if [ ! -d ".git" ]; then
    echo "📦 Initializing git..."
    git init || true
fi

# Create directory structure
echo "📁 Creating directory structure..."
mkdir -p memory/persistent
mkdir -p scripts/memory
mkdir -p scripts/agents
mkdir -p logs/compliance
mkdir -p docs
mkdir -p .beads
mkdir -p .cursor/rules
mkdir -p .git/hooks

# Copy required files
echo "📋 Copying required files..."

REQUIRED_FILES=(
    "scripts/integrated-session-start.sh"
    "scripts/recover-context.sh"
    "scripts/beads-session-start.sh"
    "scripts/beads-helper.sh"
    "scripts/tasklist-to-beads.sh"
    "scripts/analyze-project-goals.sh"
    "scripts/verify-tasks.sh"
    "scripts/cleanup-repo.sh"
    "scripts/check-updates.sh"
    "scripts/project-setup.sh"
    "scripts/check-code-quality.sh"
    "scripts/fix-code-quality.sh"
    "scripts/verify-copy.sh"
    ".cursor/rules/beads-workflow.mdc"
    "startup.md"
    "recover.md"
    "setup.md"
    "tasklist.md"
    "MID_DEVELOPMENT.md"
    "HOW_IT_WORKS.md"
    "AGENTS.md"
)

for file in "${REQUIRED_FILES[@]}"; do
    SOURCE_FILE="$SOURCE_DIR/$file"
    TARGET_FILE="$file"
    
    if [ -f "$SOURCE_FILE" ]; then
        mkdir -p "$(dirname "$TARGET_FILE")"
        cp "$SOURCE_FILE" "$TARGET_FILE"
        echo "   ✅ $file"
    else
        echo "   ⚠️  Missing source: $file"
    fi
done

# Copy optional files
echo ""
echo "📋 Copying optional files..."

OPTIONAL_FILES=(
    "memory/MEMORY_SYSTEM_MANIFEST.json"
    "memory/persistent/project-state.json"
    "memory/persistent/session-template.json"
    "scripts/memory/normalize-session.mjs"
    "scripts/memory/validate-session.mjs"
    "docs/AGENT_PROTOCOL.md"
    "scripts/agents/make-compliance-proof.sh"
    "scripts/enforce-compliance.sh"
    ".beads/.gitignore"
    ".git/hooks/commit-msg"
)

for file in "${OPTIONAL_FILES[@]}"; do
    SOURCE_FILE="$SOURCE_DIR/$file"
    TARGET_FILE="$file"
    
    if [ -f "$SOURCE_FILE" ]; then
        mkdir -p "$(dirname "$TARGET_FILE")"
        cp "$SOURCE_FILE" "$TARGET_FILE"
        echo "   ✅ $file"
    fi
done

# Make scripts executable
echo ""
echo "🔧 Making scripts executable..."
find scripts -type f \( -name "*.sh" -o -name "*.mjs" \) -exec chmod +x {} \; 2>/dev/null || true
chmod +x .git/hooks/commit-msg 2>/dev/null || true

# Create package.json if doesn't exist
if [ ! -f "package.json" ]; then
    echo ""
    echo "📦 Creating package.json..."
    cat > package.json << 'PKGJSON'
{
  "name": "PROJECT_NAME",
  "version": "1.0.0",
  "scripts": {
    "typecheck": "tsc --noEmit",
    "lint": "eslint . --ext .ts,.tsx",
    "compliance:check": "bash scripts/enforce-compliance.sh",
    "proof": "bash scripts/agents/make-compliance-proof.sh",
    "quality:check": "bash scripts/check-code-quality.sh",
    "quality:fix": "bash scripts/fix-code-quality.sh"
  }
}
PKGJSON
    sed -i '' "s/PROJECT_NAME/$PROJECT_NAME/g" package.json
    echo "   ✅ Created package.json"
fi

# Create README
if [ ! -f "README.md" ]; then
    echo ""
    echo "📝 Creating README.md..."
    cat > README.md << 'README'
# PROJECT_NAME

## Quick Start

1. **Session startup:** `./scripts/integrated-session-start.sh` or tell Cursor "read startup.md"
2. **Recover context:** `./scripts/recover-context.sh` or tell Cursor "read recover.md"
3. **Project setup:** `./scripts/project-setup.sh` or tell Cursor "read setup.md"

## Development Workflow

- **Start work:** Tell Cursor "read startup.md"
- **Mid-development:** Tell Cursor "read MID_DEVELOPMENT.md"
- **Check quality:** `./scripts/check-code-quality.sh`
- **Fix issues:** `./scripts/fix-code-quality.sh`

## Systems

- **Beads:** Issue tracking (`bd` CLI)
- **Memory:** Session persistence
- **Compliance:** Protocol enforcement

See `HOW_IT_WORKS.md` for details.
README
    sed -i '' "s/PROJECT_NAME/$PROJECT_NAME/g" README.md
    echo "   ✅ Created README.md"
fi

# Initialize Beads if available
if command -v bd &> /dev/null; then
    echo ""
    echo "📋 Initializing Beads..."
    bd init 2>/dev/null || echo "   ⚠️  Beads init skipped (may already exist)"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ Project template created: $TARGET_DIR"
echo ""
echo "Next steps:"
echo "1. cd $TARGET_DIR"
echo "2. Review and edit files as needed"
echo "3. Run: ./scripts/integrated-session-start.sh"
echo "4. Tell Cursor: 'read startup.md'"
echo ""
echo "For mid-development: Tell Cursor 'read MID_DEVELOPMENT.md'"

