# How to Talk to Cursor - Complete Guide

## 🚀 Starting a New Session

**Tell Cursor:**
```
"read startup.md"
```
or
```
"Run the startup script"
```

**What happens:**
- Checks Memory, Compliance, Beads systems
- Shows ready work from Beads
- Sets up session

## 🔄 Mid-Development (Critical)

**Tell Cursor:**
```
"read MID_DEVELOPMENT.md"
```

**Or specific commands:**
- `"Check code quality"` - Runs TypeScript/lint/mock checks
- `"Fix code quality issues"` - Auto-fixes what it can
- `"What am I working on?"` - Shows current Beads issue
- `"File this bug to Beads: [description]"` - Creates issue

**Before completing ANY task:**
```
"Run code quality check and complete current task if it passes"
```

## 🧠 When Memory Fades

**Tell Cursor:**
```
"read recover.md"
```
or
```
"Run recovery"
```

**What happens:**
- Shows current work from Beads
- Displays full context
- Restores memory

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
- Cleans up redundancies (with verification)
- Checks recent updates
- Analyzes goals/features
- Generates tasklist.md

## 📋 Working with Tasks

**Convert tasklist to Beads:**
```
"Process tasklist.md" or "Convert tasklist to Beads issues"
```

**Analyze goals/features:**
```
"Analyze goals from [file] and features from [file]"
```

**Verify tasks:**
```
"Verify tasks in tasklist.md"
```

## ✅ Quality Gates (MANDATORY)

**Before marking ANY task complete:**

1. **Tell Cursor:**
   ```
   "Run code quality check"
   ```

2. **If fails, tell Cursor:**
   ```
   "Fix code quality issues"
   ```

3. **Verify fix:**
   ```
   "Run code quality check again"
   ```

4. **Only if passes:**
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
| Recover context | `"read recover.md"` |
| Setup project | `"read setup.md"` |
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

