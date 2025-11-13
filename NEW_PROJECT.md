# Create New Project with Triple System

**Use this to set up a new project with all systems.**

## Quick Create

```bash
./scripts/create-project-template.sh my-new-project
```

This creates a complete project at `~/my-new-project` with:
- ✅ All Triple System files
- ✅ Directory structure
- ✅ Executable scripts
- ✅ package.json with quality check scripts
- ✅ README.md
- ✅ Beads initialized (if available)

## Manual Setup

If you prefer to copy from an existing project:

```bash
# From mystic-arcana-v1000
./scripts/copy-to-projects.sh  # But change targets to your new project
```

## What Gets Created

### Required Files
- `startup.md` - Session startup
- `recover.md` - Context recovery
- `setup.md` - Project setup
- `MID_DEVELOPMENT.md` - Mid-dev instructions
- `HOW_IT_WORKS.md` - System explanation
- `AGENTS.md` - Agent instructions
- `tasklist.md` - Task list template

### Scripts
- `scripts/integrated-session-start.sh` - Startup orchestrator
- `scripts/recover-context.sh` - Context recovery
- `scripts/check-code-quality.sh` - Quality checks
- `scripts/fix-code-quality.sh` - Auto-fix issues
- `scripts/project-setup.sh` - Complete setup
- `scripts/tasklist-to-beads.sh` - Convert tasks
- Plus all other Triple System scripts

### Cursor Rules
- `.cursor/rules/beads-workflow.mdc` - Automatic Beads integration

## After Creation

1. **Check secrets:** `./scripts/check-secrets.sh` (MANDATORY FIRST)
2. **Review files:** Check they match your project needs
3. **Start session:** Tell Cursor `"read startup.md"`
4. **Verify secrets:** Tell Cursor `"Check for secrets"` (must pass)

## For Future Projects

Just run:
```bash
./scripts/create-project-template.sh <project-name> [target-dir]
```

Everything is set up automatically!
