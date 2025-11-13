# Project Setup

## 🚀 What to Do

**Tell Cursor:**
```
"read setup.md"
```
or
```
"Run project setup"
```

**Or run:**
```bash
./scripts/project-setup.sh [goals-file] [features-file]
```

## ✅ What Happens

1. **Secret Check** - Scans for hardcoded secrets (MANDATORY FIRST)
2. **Cleanup** - Removes redundancies and bloat (with verification)
3. **Check Updates** - Shows recent changes sorted by date
4. **Analyze Goals** - Extracts goals/features and generates tasklist.md
5. **Verify Tasks** - Shows tasks for review before converting to Beads

## 🔐 After Setup

**Tell Cursor:**
```
"Check for secrets"
```

**This MUST pass before proceeding.**

## 📋 Natural Language Commands

**After setup, you can:**
- `"Verify tasks"` - Review generated tasklist.md
- `"Convert tasklist to Beads"` - Create Beads issues from tasklist
- `"Analyze project goals"` - Run analysis again (if you have new goals)

## 📋 Step-by-Step (Optional)

**Tell Cursor:**
- `"Clean up repository"` → `./scripts/cleanup-repo.sh --dry-run`
- `"Check what needs updating"` → `./scripts/check-updates.sh`
- `"Analyze goals"` → `./scripts/analyze-project-goals.sh [goals] [features]`
- `"Verify tasks"` → `./scripts/verify-tasks.sh tasklist.md`
- `"Convert to Beads"` → `./scripts/tasklist-to-beads.sh tasklist.md`
