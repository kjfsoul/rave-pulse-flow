# Quick Start: Triple System Implementation

**Fast implementation guide for Cursor IDE agents**

## One-Command Setup

```bash
# Copy this entire prompt to Cursor IDE agent:

"I need you to implement the complete Triple System (Memory + Compliance + Beads) integration.

Read docs/TRIPLE_SYSTEM_IMPLEMENTATION_GUIDE.md and implement all 4 phases:

Phase 1: Memory System
- Create memory/ directory structure
- Create manifest, templates, and scripts
- Initialize today's session

Phase 2: Compliance System
- Create AGENT_PROTOCOL.md
- Create compliance scripts and git hooks
- Generate initial proof

Phase 3: Beads System
- Install/verify Beads CLI
- Initialize Beads in project
- Create Beads scripts and Cursor rules

Phase 4: Integration
- Create integrated startup script
- Test all systems together

After each phase, verify files exist and run tests. Report progress after each phase."
```

## Prerequisites Check

```bash
# Run these checks first:
node --version    # Need v18+
jq --version      # Need jq installed
which bd          # Need Beads CLI (or will install)
git --version     # Need Git
```

## Phase Checklist

- [ ] Phase 1: Memory System (30 min)
- [ ] Phase 2: Compliance System (20 min)
- [ ] Phase 3: Beads System (15 min)
- [ ] Phase 4: Integration (10 min)
- [ ] Verification Tests (5 min)

## Quick Verification

```bash
# After implementation, run:
./scripts/integrated-session-start.sh

# Should see:
# ✅ Memory: Active
# ✅ Compliance: Active
# ✅ Beads: Active
```

## Troubleshooting

**If compliance check fails:**
```bash
npm run proof
npm run compliance:check
```

**If Beads not found:**
```bash
export PATH="$PATH:$HOME/go/bin"
which bd || go install github.com/bytedance/beads@latest
```

**If git hook not working:**
```bash
chmod +x .git/hooks/commit-msg
```

## Full Documentation

See `docs/TRIPLE_SYSTEM_IMPLEMENTATION_GUIDE.md` for complete details.
