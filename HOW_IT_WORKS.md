# How This Actually Works

## What's Automatic

**`.cursor/rules/beads-workflow.mdc`** - Cursor loads this automatically. It tells the agent to use Beads at session start. The agent sees these rules automatically.

**Git hooks** - Commit hook enforces compliance automatically.

## What You Do

**Session start:** Tell Cursor "read startup.md" or "run startup script"

**Memory fades:** Tell Cursor "read recover.md" or "run recovery"

That's it.

## Why It Works

The `.mdc` file is loaded automatically by Cursor. When you say "read startup.md", Cursor runs the script which queries Beads. The `.mdc` file already told the agent to use Beads, so it should follow the workflow.

## If Agent Ignores Rules

Remind it: "Use Beads workflow" or "Query bd ready --json first"

The rules are there, but agents can ignore them. A gentle reminder usually works.

## Essential Files Only

- `.cursor/rules/beads-workflow.mdc` - Automatic rules (Cursor loads it)
- `startup.md` - Simple trigger
- `recover.md` - Simple trigger  
- `scripts/integrated-session-start.sh` - Does the work
- `scripts/recover-context.sh` - Does the work
- `AGENTS.md` - Has Beads section

Everything else is already set up (Memory, Compliance, Beads).

