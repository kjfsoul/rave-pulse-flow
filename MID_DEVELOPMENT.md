# Mid-Development Instructions for Cursor

**Use this when working on tasks mid-development.**

## 🚨 CRITICAL: Before Starting Work

**Tell Cursor:**
```
"Check for secrets"
```

**This MUST pass before doing anything else.**

## 🚨 Critical Checks Before Marking Tasks Complete

Before closing any Beads issue, you MUST run:

**Tell Cursor:**
```
"Run code quality check"
```

**Or run:**
```bash
./scripts/check-code-quality.sh
```

This checks:
- ✅ TypeScript errors
- ✅ Linting errors
- ✅ Hardcoded/mock/stubbed data
- ✅ Secrets (MANDATORY)

**Tasks with these issues CANNOT be marked complete.**

## 🔄 Mid-Development Workflow

### 1. **Check Current Work**

**Tell Cursor:**
```
"What am I working on?"
```
or
```
"I forgot what I was doing"
```

**Or run:**
```bash
# See what you're working on
bd list --status in_progress --json

# Get full context
ISSUE_ID=$(bd list --status in_progress --json | jq -r '.[0].id')
bd show $ISSUE_ID --json
```

**Or use recovery script:**
```bash
./scripts/recover-context.sh
```

### 2. **Before Making Changes**
```bash
# Check code quality first
./scripts/check-code-quality.sh

# Fix auto-fixable issues
./scripts/fix-code-quality.sh
```

### 3. **While Working**
- **File discovered bugs:** `bd create "Bug: description" -t bug -p 0 --json`
- **Update status:** `bd update <id> --status in_progress --json`
- **Add labels:** `bd label add <id> backend,urgent`

### 4. **Before Completing**
```bash
# Must pass all checks
./scripts/check-code-quality.sh

# If fails, fix issues, then:
./scripts/fix-code-quality.sh
./scripts/check-code-quality.sh  # Verify fix
```

### 5. **Completing Work**
```bash
# Only after quality checks pass
bd close <id> --reason "Implemented feature X. TypeScript: ✅ Lint: ✅ No mocks: ✅" --json
```

## 📋 Quality Gate Rules

**A task CANNOT be marked complete if:**
- ❌ TypeScript errors exist
- ❌ Linting errors exist (warnings OK if documented)
- ❌ Hardcoded/mock/stubbed data is used
- ❌ Random placeholder logic exists (e.g., `Math.floor(Math.random() * 3)`)
- ❌ Generic placeholder messages are returned

**A task CAN be marked complete when:**
- ✅ All TypeScript errors resolved
- ✅ All linting errors resolved
- ✅ No mock/hardcoded data detected
- ✅ Implementation is real, not stubbed
- ✅ Code quality check passes

## 💬 How to Tell Cursor Mid-Development

**Start working:**
```
"Check current work status" or "What am I working on?"
```

**Before changes:**
```
"Run code quality check" or "Check for TypeScript and lint errors"
```

**Fix issues:**
```
"Fix code quality issues" or "Run fix-code-quality script"
```

**Ready to complete:**
```
"Verify code quality and complete current task" or
"Run quality check, then close current Beads issue if it passes"
```

**Found a bug:**
```
"File this bug to Beads: [description]"
```

## 🎯 Quick Commands

```bash
# Check what you're working on
bd list --status in_progress --json

# Quality check (required before closing)
./scripts/check-code-quality.sh

# Fix auto-fixable issues
./scripts/fix-code-quality.sh

# Complete work (only after quality passes)
ISSUE_ID=$(bd list --status in_progress --json | jq -r '.[0].id')
bd close $ISSUE_ID --reason "Done. Quality checks passed." --json
```

## ⚠️ Important

**Never mark a task complete without running `check-code-quality.sh` first.**

The script will fail if:
- TypeScript errors exist
- Linting errors exist
- Mock/hardcoded data is detected

Fix these issues before closing any Beads issue.
