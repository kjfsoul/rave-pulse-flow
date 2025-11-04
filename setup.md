# Project Setup

Tell Cursor: "Run project setup" or run `./scripts/project-setup.sh`

This will:
1. Clean up redundancies and bloat (with verification)
2. Check recent updates sorted by date
3. Analyze goals/features and generate tasklist.md
4. Verify tasks with you before converting to Beads

Or run step-by-step:
- `./scripts/cleanup-repo.sh --dry-run` - Review cleanup
- `./scripts/check-updates.sh` - Check what needs doing
- `./scripts/analyze-project-goals.sh [goals] [features]` - Generate tasks
- `./scripts/verify-tasks.sh tasklist.md` - Verify before Beads
