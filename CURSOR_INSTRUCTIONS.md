# How to Talk to Cursor - Complete Guide

## 🚀 Starting a New Session

**Tell Cursor:**
```
"read startup.md"
```

**What happens automatically:**
1. Checks Memory, Compliance, Beads systems
2. **Checks for secrets (MANDATORY)**
3. Shows ready work from Beads
4. Sets up session

**After startup, tell Cursor:**
```
"Check for secrets"
```

**This MUST pass before starting work.**

## 🔄 Mid-Development (Critical)

**Tell Cursor:**
```
"read MID_DEVELOPMENT.md"
```

**FIRST THING - Check secrets:**
```
"Check for secrets"
```
**This MUST pass before doing anything else.**

**Then:**
- `"What am I working on?"` - Shows current Beads issue
- `"Run code quality check"` - Checks TypeScript/lint/mock/secrets
- `"Fix code quality issues"` - Auto-fixes what it can
- `"File this bug to Beads: [description]"` - Creates issue

**Before completing ANY task:**
```
"Run code quality check and complete current task if it passes"
```

## 🧠 When Memory Fades

**Tell Cursor any of these:**
- `"I forgot what I was doing"`
- `"Recover memory"`
- `"Restore context"`
- `"What was I working on?"`
- `"Show me my current work"`
- `"I lost context"`
- `"read recover.md"`

**What happens automatically:**
- Runs recovery script
- Shows current work from Beads
- Displays full context
- Restores memory
- Shows dependencies and recent work

## 🧹 Repository Cleanup

**Tell Cursor any of these:**
- `"Clean up repository"`
- `"Remove bloat"`
- `"Clean up the repo"`
- `"Remove unused files"`
- `"Cleanup repo with dry-run first"`

**What happens:**
1. **Dry-run first (always):** Shows what would be deleted
2. **Interactive cleanup:** Asks before deleting each item
3. **Removes:** Duplicates, unused files, large files, empty dirs, bloat (.log, .tmp, .bak, etc.)

**Step-by-step:**
```
"Clean up repository" → Shows dry-run preview
```

Then review and approve deletions.

**Or run directly:**
```bash
./scripts/cleanup-repo.sh --dry-run        # Preview
./scripts/cleanup-repo.sh --interactive    # Ask before each deletion
```

## 🎯 Project Setup

**Tell Cursor:**
```
"read setup.md"
```
or
```
"Run project setup"
```

**What happens:**
- Checks secrets (MANDATORY FIRST)
- Cleans up redundancies (with verification)
- Checks recent updates
- Analyzes goals/features
- Generates tasklist.md
- Verifies tasks with you

## 📋 Working with Tasks

**Natural language commands:**

**Analyze goals/features and generate tasklist (COMPLETE WORKFLOW):**

**Step 1 - Discovery:**
- `"Analyze project goals"`
- `"Analyze goals from [file] and features from [file]"`
- `"Read through docs and identify all features"`
- `"Analyze project features from [directory]"`
- `"Generate task list from goals"`

**What happens:**
1. Reads specified files/directories OR auto-detects (README.md, CURRENT_GOALS.txt, FEATURES.md, PRD.md, docs/, src/)
2. Scans codebase for implemented features
3. Compares documented goals vs implemented features
4. Identifies gaps (documented but not implemented)
5. Generates tasklist.md with current + missing + suggested features

**Step 2 - Verification:**
- `"Verify tasks"`
- `"Show me the task list"`
- `"Review tasks before converting"`
- `"Are these features correct?"`

**What happens:**
- Shows all features found
- **WAITS for your confirmation**
- You can approve/modify

**Step 3 - Update (if needed):**
- `"Update tasklist with [feature name]"`
- `"Add [feature] to tasklist"`
- `"Remove [feature] from tasklist"`

**Convert tasklist to Beads:**
- `"Convert tasklist to Beads"`
- `"Process tasklist.md"`
- `"Create Beads issues from tasklist"`
- `"Convert tasks to Beads issues"`

**Verify tasks before converting:**
- `"Verify tasks"`
- `"Show me the task list"`
- `"Review tasks before converting"`

## ✅ Quality Gates (MANDATORY)

**Before marking ANY task complete:**

1. **Tell Cursor:**
   ```
   "Check for secrets"
   ```
   **Must pass first.**

2. **Tell Cursor:**
   ```
   "Run code quality check"
   ```
   **Must pass.**

3. **If fails, tell Cursor:**
   ```
   "Fix code quality issues"
   ```

4. **Verify fix:**
   ```
   "Run code quality check again"
   ```

5. **Only if both pass:**
   ```
   "Complete current Beads issue"
   ```

## 🚫 What NOT to Do

- ❌ Don't close Beads issues without quality check
- ❌ Don't ignore TypeScript/lint errors
- ❌ Don't accept mock/hardcoded data as "complete"
- ❌ Don't skip verification steps

## 📝 Quick Reference

| Action | Tell Cursor |
|--------|-------------|
| Start session | `"read startup.md"` |
| **Check secrets** | `"Check for secrets"` ← **DO THIS FIRST** |
| Recover context | `"I forgot what I was doing"` or `"Recover memory"` |
| **Cleanup repo** | `"Clean up repository"` or `"Remove bloat"` |
| Setup project | `"Run project setup"` or `"read setup.md"` |
| Analyze goals | `"Analyze project goals"` |
| Convert tasklist | `"Convert tasklist to Beads"` |
| Verify tasks | `"Verify tasks"` |
| Mid-development | `"read MID_DEVELOPMENT.md"` |
| Check quality | `"Run code quality check"` |
| Fix quality | `"Fix code quality issues"` |
| Current work | `"What am I working on?"` |
| File bug | `"File this bug to Beads: [desc]"` |
| Complete task | `"Run quality check, then complete if passes"` |

## 🎓 Understanding the System

**Tell Cursor:**
```
"read HOW_IT_WORKS.md"
```

This explains:
- What's automatic (Cursor rules)
- What you need to trigger (scripts)
- How Beads integrates
- Why it works

## 🔧 For New Projects

**Tell Cursor:**
```
"read NEW_PROJECT.md"
```

Shows how to create a new project with all systems.
