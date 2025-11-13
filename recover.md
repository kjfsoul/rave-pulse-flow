# Recover Context / Memory

## 🧠 Natural Language Commands

**Tell Cursor any of these:**
- `"I forgot what I was doing"`
- `"Recover memory"`
- `"Restore context"`
- `"What was I working on?"`
- `"Show me my current work"`
- `"I lost context"`
- `"read recover.md"`

**Or run:**
```bash
./scripts/recover-context.sh
```

## ✅ What Happens

1. Shows current in-progress work from Beads
2. Displays full issue details and description
3. Shows dependency tree
4. Lists recent completed work
5. Displays project health

## 📋 After Recovery

The script will show you:
- Current issue ID and title
- Full issue context (description, status, priority)
- What blocks what (dependencies)
- Ready work (if nothing in progress)
- Recent completed work

**Then tell Cursor:**
```
"Work on issue [ID from recovery output]"
```

## 🔄 Quick Recovery

**Tell Cursor:**
```
"I forgot what I was doing"
```

Cursor will automatically run recovery and show your current work.
