# Cursor Commands Cheatsheet - Complete Reference

## 🚀 Session Management

| What You Want | Tell Cursor |
|---------------|-------------|
| **Start session** | `"read startup.md"` |
| **Check secrets** | `"Check for secrets"` ← **ALWAYS FIRST** |
| **What am I working on?** | `"What am I working on?"` |
| **Forgot context** | `"I forgot what I was doing"` or `"Recover memory"` |
| **Mid-development workflow** | `"read MID_DEVELOPMENT.md"` |

## 🔐 Security & Quality

| What You Want | Tell Cursor |
|---------------|-------------|
| **Check for secrets** | `"Check for secrets"` |
| **Fix secrets** | `"Fix secrets"` |
| **Run code quality check** | `"Run code quality check"` |
| **Fix code quality** | `"Fix code quality issues"` |
| **Complete task (with checks)** | `"Run quality check, then complete if passes"` |

## 🧹 Repository Management

| What You Want | Tell Cursor |
|---------------|-------------|
| **Clean up repository** | `"Clean up repository"` or `"Remove bloat"` |
| **Cleanup with preview** | `"Cleanup repo with dry-run first"` |
| **Remove unused files** | `"Remove unused files"` |

## 📋 Tasklist Workflow (Conception → Execution)

### Step 1: Discover Features (Conception)

**Tell Cursor:**
- `"Analyze project goals"`
- `"Analyze goals from [file] and features from [file]"`
- `"Read through docs and identify all features"`
- `"Analyze project features from [directory]"`
- `"Generate task list from goals"`

**What happens:**
1. Reads specified files/directories OR auto-detects common files (README.md, CURRENT_GOALS.txt, FEATURES.md, PRD.md, docs/, src/)
2. Scans codebase for implemented features
3. Compares documented goals vs implemented features
4. Identifies gaps (features documented but not implemented)
5. Generates tasklist.md with:
   - Current features (implemented)
   - Missing features (documented but not implemented)
   - Suggested features (based on codebase patterns)

### Step 2: Verify Features with User

**Tell Cursor:**
- `"Verify tasks"`
- `"Show me the task list"`
- `"Review tasks before converting"`
- `"Are these features correct?"`

**What happens:**
1. Displays all features found (current + missing)
2. Shows tasklist.md
3. **WAITS for your confirmation**
4. You can approve/modify the list

### Step 3: Update Tasklist

**Tell Cursor:**
- `"Update tasklist with [feature name]"`
- `"Add [feature] to tasklist"`
- `"Remove [feature] from tasklist"`

**What happens:**
- Updates tasklist.md based on your input

### Step 4: Convert to Beads (Execution)

**Tell Cursor:**
- `"Convert tasklist to Beads"`
- `"Process tasklist.md"`
- `"Create Beads issues from tasklist"`
- `"Convert tasks to Beads issues"`

**What happens:**
1. Converts unchecked items in tasklist.md to Beads issues
2. Creates parent-child dependencies
3. Links related tasks
4. Verifies issues created

## 🎯 Project Setup

| What You Want | Tell Cursor |
|---------------|-------------|
| **Complete setup** | `"Run project setup"` or `"read setup.md"` |
| **Setup new project** | `"read NEW_PROJECT.md"` |

## 🐛 Issue Management

| What You Want | Tell Cursor |
|---------------|-------------|
| **File a bug** | `"File this bug to Beads: [description]"` |
| **Current issues** | `"What am I working on?"` |
| **Blocked issues** | `"Show blocked issues"` |

## 📝 Complete Tasklist Workflow Example

**Full workflow from conception to execution:**

1. **Discover features:**
   ```
   "Analyze project goals from docs/ and README.md and identify all features"
   ```

2. **Verify with user:**
   ```
   "Verify tasks"
   ```
   (Review the tasklist.md, approve/modify)

3. **Convert to Beads:**
   ```
   "Convert tasklist to Beads"
   ```

4. **Start working:**
   ```
   "What am I working on?"
   ```

## ✅ Quality Gates (Before Completing Tasks)

**MANDATORY sequence:**

1. `"Check for secrets"` (must pass)
2. `"Run code quality check"` (must pass)
3. `"Complete current task"` (only if both pass)

## 🔧 Compliance

**All projects have compliance hooks** - Commits require `COMPLIANCE_PROOF` hash.

**How it works:**
- Auto-generated daily via `scripts/agents/make-compliance-proof.sh`
- Validated by `.git/hooks/commit-msg`
- Stored in `logs/compliance/proof-YYYY-MM-DD.json`

**Status:** ✅ All 4 projects have compliance hooks installed

## 📚 Additional Commands

| What You Want | Tell Cursor |
|---------------|-------------|
| **How system works** | `"read HOW_IT_WORKS.md"` |
| **For new projects** | `"read NEW_PROJECT.md"` |
| **Complete guide** | `"read CURSOR_INSTRUCTIONS.md"` |

---

## 🎯 Quick Start Workflow

**Every session:**
1. `"read startup.md"`
2. `"Check for secrets"`
3. `"What am I working on?"`

**Before completing:**
1. `"Check for secrets"`
2. `"Run code quality check"`
3. `"Complete current task"`

**That's it.**

