# AGENTS.md

**Version:** 3.0.0
**Last Updated:** 2025-01-24
**Status:** ACTIVE & ENFORCED
**Primary Authority:** This file is the single source of truth for all agent behavior

---

## SECTION 0 — PURPOSE (MANDATORY)

**AGENTS.md overrides all LLM memory, per-session reasoning, and ad-hoc plans.**

This document is the authoritative rulebook that all agents MUST obey at all times. It unifies:

- **Memory Procedures** (MEMORY_PROCEDURES.md) — Session and project memory management
- **Compliance Rules** (AGENT_PROTOCOL.md) — Proof-of-read verification and protocol enforcement
- **Beads Task Discipline** (.beads/issues.jsonl) — Git-backed issue tracking
- **Triple System Architecture** — Integrated Memory + Compliance + Beads workflow
- **Project-Specific Requirements** — Domain rules and quality standards

**No agent may:**

- Deviate from these rules
- Skip mandatory startup procedures
- Work on tasks not in Beads
- Commit without compliance proof
- Bypass memory validation
- Invent requirements or tasks

**All agents must read this entire file at session start before ANY work begins.**

---

## SECTION 1 — MANDATORY SESSION STARTUP

**Every session MUST begin with these steps in EXACT order:**

### Step 1: Load Memory Procedures

```bash
# Verify memory system exists
test -f memory/MEMORY_SYSTEM_MANIFEST.json || echo "⚠️ Memory system not initialized"

# Read memory procedures
cat MEMORY_PROCEDURES.md
```

**What to internalize:**

- Session files: `memory/persistent/session-YYYY-MM-DD.json`
- Project state: `memory/persistent/project-state.json`
- Provider order: LocalJson → Supabase → ByteRover(optional, disabled by default)
- Beads is primary for task memory (outside context)

### Step 2: Load Triple System Documentation

```bash
# Load Triple System summary and implementation guide
cat TRIPLE_SYSTEM_SUMMARY.md
cat TRIPLE_SYSTEM_IMPLEMENTATION_GUIDE.md
```

**What to understand:**

- Memory stores session state and compliance metadata
- Compliance validates memory integrity and protocol adherence
- Beads tracks issues outside context (solves amnesia)
- Git provides persistent storage for all three systems

### Step 3: Execute Integrated Session Startup

```bash
# Run the integrated startup script (MANDATORY)
./scripts/integrated-session-start.sh
```

**This script:**

1. Checks memory system health
2. Creates/validates today's session file
3. Runs compliance checks
4. Generates compliance proof if missing
5. Checks for secrets (MANDATORY)
6. Initializes Beads session
7. Reports system status

**Output expected:**

```
🚀 Integrated System Startup
============================
1️⃣ Memory System...
   ✅ Memory system manifest found
   ✅ Today's session file exists
2️⃣ Compliance System...
   ✅ Agent protocol found
   ✅ Compliance check passed
3️⃣ Secret Detection...
   ✅ No secrets detected
4️⃣ Beads System...
   ✅ Beads CLI available
   [Beads ready work output]
✅ Integrated System Startup Complete
```

### Step 4: Run Compliance Checks

```bash
# Verify compliance proof exists
npm run compliance:check

# Generate proof if missing
npm run proof
```

**Compliance requirements:**

- `logs/compliance/proof-YYYY-MM-DD.json` must exist
- Session file must include `compliance.proof_hash`
- Protocol must be read (`compliance.protocol_read: true`)
- Provider order must be correct

### Step 5: Query Beads for Ready Work

```bash
# Get available work (NO BLOCKERS)
bd ready --json

# Review project health
bd stats

# Check blocked issues (NEVER work on these)
bd blocked --json
```

**CRITICAL:** ONLY select work from `bd ready --json`. NEVER start blocked work.

### Step 6: Restore Context if Interrupted

```bash
# Check for in-progress work
bd list --status in_progress --json

# If context is lost, run recovery
./scripts/recover-context.sh
```

**If work was interrupted:**

- Query Beads for `in_progress` issues
- Read full context: `bd show <id> --json`
- Resume from where you left off

### Step 7: Update Session Memory

```bash
# Load today's session file
SESSION_FILE="memory/persistent/session-$(date +%Y-%m-%d).json"

# Validate session integrity
node scripts/memory/validate-session.mjs "$SESSION_FILE"

# Normalize session (fixes any drift)
node scripts/memory/normalize-session.mjs
```

**Update session with:**

- Selected Beads issue ID
- Compliance proof hash
- Current branch
- Areas being worked on

**Full startup command sequence:**

```bash
# Complete session startup
./scripts/integrated-session-start.sh && \
npm run compliance:check && \
ISSUE_ID=$(bd ready --json | jq -r '.[0].id') && \
bd show "$ISSUE_ID" --json | jq '.' && \
node scripts/memory/validate-session.mjs && \
echo "✅ Session startup complete"
```

---

## SECTION 2 — BEADS AS SOURCE OF TRUTH

**Beads (.beads/issues.jsonl) is the ONLY source of truth for tasks and work.**

### Core Rules

1. **Beads issues.jsonl is the project's task memory**
   - All tasks MUST be in Beads
   - NO task planning in context or markdown files
   - Beads persists outside context window (solves amnesia)

2. **ONLY choose issues from `bd ready --json`**
   - Ready = no blockers
   - Never start blocked work
   - Always verify dependencies before starting

3. **NEVER work on blocked tasks**
   - Check `bd blocked --json` before starting
   - Resolve blockers first
   - Update status before starting: `bd update <id> --status in_progress --json`

4. **ALWAYS update issue state**
   - Before work: `bd update <id> --status in_progress --json`
   - During work: Update description if needed
   - After work: `bd close <id> --reason "..." --json`

5. **ALWAYS file "discovered" issues during development**

   ```bash
   # Found a bug? File it immediately
   NEW_ISSUE=$(bd create "Bug: <description>" -t bug -p 0 --json | jq -r '.id')
   CURRENT_ISSUE="bd-42"  # Replace with actual issue ID
   bd dep add "$NEW_ISSUE" "$CURRENT_ISSUE" --type discovered-from
   ```

6. **ALWAYS link dependencies**

   ```bash
   # Link blocks relationship
   bd dep add <blocked-id> <blocker-id> --type blocks

   # Link discovered-from relationship
   bd dep add <new-issue> <parent-issue> --type discovered-from

   # Link related work
   bd dep add <issue-1> <issue-2> --type related
   ```

7. **ALWAYS close issues with reason and verification**

   ```bash
   bd close <id> --reason "Implemented feature X. Added tests in test-file.ts. Verified with npm test. All tests passing. Resolves <id>." --json
   ```

8. **ALWAYS use --json flag**
   - Required for programmatic access
   - Enables script integration
   - Ensures consistent output format

### Command Templates

**Starting Work:**

```bash
# 1. Get ready work
ISSUE_ID=$(bd ready --json | jq -r '.[0].id')

# 2. Get full context
bd show "$ISSUE_ID" --json | jq '.'

# 3. Update status
bd update "$ISSUE_ID" --status in_progress --json

# 4. Log in session memory
jq --arg issue "$ISSUE_ID" '.current_work = [$issue]' \
   memory/persistent/session-$(date +%Y-%m-%d).json > tmp.json && \
   mv tmp.json memory/persistent/session-$(date +%Y-%m-%d).json
```

**Discovering Issues:**

```bash
# During work, if you discover a problem:
NEW_ISSUE=$(bd create "Bug: <detailed description>" -t bug -p 0 --json | jq -r '.id')
CURRENT_ISSUE="bd-42"  # Your current work
bd dep add "$NEW_ISSUE" "$CURRENT_ISSUE" --type discovered-from
bd label add "$NEW_ISSUE" urgent,backend  # If applicable
```

**Closing Issues:**

```bash
# When work is complete:
bd close "$ISSUE_ID" --reason "Completed: Detailed description of what was done. Tests: Added tests in X.test.ts. Verified: npm test passes. Resolves $ISSUE_ID." --json

# Check for newly unblocked work
bd ready --json
```

**Checking Project Health:**

```bash
# Overall stats
bd stats

# Ready work
bd ready --json

# Blocked issues
bd blocked --json

# All open issues
bd list --status open --json

# In-progress work
bd list --status in_progress --json
```

**Recovering Interrupted Sessions:**

```bash
# Run recovery script
./scripts/recover-context.sh

# OR manually:
# 1. Check in-progress work
bd list --status in_progress --json

# 2. Get full context
ISSUE_ID=$(bd list --status in_progress --json | jq -r '.[0].id')
bd show "$ISSUE_ID" --json | jq '.'

# 3. Check dependencies
bd dep tree "$ISSUE_ID"
```

---

## SECTION 3 — MEMORY DISCIPLINE

**Memory system provides persistent context outside of LLM memory.**

### Memory Architecture

1. **Session Memory** (`memory/persistent/session-YYYY-MM-DD.json`)
   - Daily session state
   - Current work items
   - Accomplishments
   - Context preservation

2. **Project State** (`memory/persistent/project-state.json`)
   - Overall project status
   - Component completion
   - Critical issues
   - Milestones

3. **Provider Order (STRICT)**
   - LocalJson (PRIMARY) — Always first
   - Supabase (SECONDARY) — If configured
   - ByteRover (OPTIONAL) — Disabled by default, opt-in only

### Memory Rules

1. **Memory is used ONLY for session state, not for decisions**
   - Tasks come from Beads, not memory
   - Memory tracks what you're doing, not what to do
   - Memory preserves context, doesn't replace it

2. **No task planning in context**
   - All tasks MUST be in Beads
   - Plans go in Beads issue descriptions
   - Context is temporary; Beads is permanent

3. **Update session state after selecting a task**

   ```bash
   ISSUE_ID=$(bd ready --json | jq -r '.[0].id')
   TODAY=$(date +%Y-%m-%d)
   jq --arg issue "$ISSUE_ID" \
      --arg branch "$(git rev-parse --abbrev-ref HEAD)" \
      '.current_work = [$issue] |
       .branch = $branch |
       .areas += ["backend"] |  # Update with actual areas
       .commits_today += 0' \
      "memory/persistent/session-$TODAY.json" > tmp.json && \
      mv tmp.json "memory/persistent/session-$TODAY.json"

   # Normalize
   node scripts/memory/normalize-session.mjs
   ```

### Required Fields (Session Schema)

```json
{
  "session_id": "session-YYYY-MM-DD-HHMMSS",
  "date": "YYYY-MM-DD",
  "branch": "main",
  "commits_today": 0,
  "areas": [],
  "statuses": {},
  "next": [],
  "compliance": {
    "protocol_read": true,
    "proof_hash": "SHA256_HASH",
    "proof_timestamp": "ISO8601_TIMESTAMP",
    "provider_order": "localjson,supabase,byterover(optional)",
    "byterover_enabled": false
  }
}
```

### Memory Update Procedures

**During Work:**

```bash
# Update accomplishments
jq '.accomplishments += ["Completed: Feature X"]' \
   memory/persistent/session-$(date +%Y-%m-%d).json > tmp.json && \
   mv tmp.json memory/persistent/session-$(date +%Y-%m-%d).json

# Update current work
jq '.current_work = ["bd-42"]' \
   memory/persistent/session-$(date +%Y-%m-%d).json > tmp.json && \
   mv tmp.json memory/persistent/session-$(date +%Y-%m-%d).json
```

**Normalize and Validate:**

```bash
# Always normalize after updates
node scripts/memory/normalize-session.mjs

# Validate before committing
node scripts/memory/validate-session.mjs
```

### Memory Logging

**Write logs to session file:**

```bash
# Log important decisions
jq '.logs += [{"timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'", "message": "Decision: ..."}]' \
   memory/persistent/session-$(date +%Y-%m-%d).json > tmp.json && \
   mv tmp.json memory/persistent/session-$(date +%Y-%m-%d).json
```

---

## SECTION 4 — COMPLIANCE DISCIPLINE

**Compliance system ensures protocol adherence and proof-of-read verification.**

### Compliance Requirements

1. **Always generate compliance proof before committing**

   ```bash
   # Generate proof
   npm run proof

   # Check compliance
   npm run compliance:check
   ```

2. **Commit messages MUST contain: `COMPLIANCE_PROOF: <sha256>`**

   ```
   feat: Description of changes

   COMPLIANCE_PROOF: a1b2c3d4e5f6...
   ```

3. **Proof must include:**
   - AGENT_PROTOCOL.md
   - Session file (`session-YYYY-MM-DD.json`)
   - Project state (`project-state.json`)
   - Composite SHA256 hash of all three

4. **Git hooks MUST pass before code is considered valid**
   - `.git/hooks/commit-msg` enforces proof requirement
   - Commits without proof are automatically rejected
   - Cannot bypass compliance

### Compliance Commands

**Generate Proof:**

```bash
# Generate today's compliance proof
npm run proof

# Output: SHA256 hash
# Creates: logs/compliance/proof-YYYY-MM-DD.json
```

**Check Compliance:**

```bash
# Run full compliance check
npm run compliance:check

# Verifies:
# - Protocol file exists
# - Proof exists for today
# - Proof format is valid
# - Session file validates
# - Provider order is correct
```

**Update Session with Proof:**

```bash
PROOF_HASH=$(npm run proof)
TODAY=$(date +%Y-%m-%d)
jq --arg hash "$PROOF_HASH" \
   --arg timestamp "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
   '.compliance.proof_hash = $hash |
    .compliance.proof_timestamp = $timestamp |
    .compliance.protocol_read = true' \
   "memory/persistent/session-$TODAY.json" > tmp.json && \
   mv tmp.json "memory/persistent/session-$TODAY.json"
```

### Compliance Enforcement

**Git Hook (`.git/hooks/commit-msg`):**

- Automatically rejects commits without `COMPLIANCE_PROOF:`
- Requires 64-character hex hash
- Cannot be bypassed (unless `[skip-proof]` tag, not recommended)

**Compliance Enforcer (`scripts/enforce-compliance.sh`):**

- Validates protocol file exists
- Verifies proof exists and is valid
- Checks session file integrity
- Validates provider order
- Exports `COMPLIANCE_PROOF` environment variable

**Agents must never:**

- Skip compliance checks
- Commit without proof
- Bypass git hooks
- Edit compliance proof files manually

---

## SECTION 5 — TRIPLE SYSTEM COMMAND MODEL

**Memory → Compliance → Beads → Git form an integrated discipline.**

### System Integration Flow

```
┌─────────────────────────────────────────┐
│         Session Startup                 │
│  (scripts/integrated-session-start.sh)  │
└──────────────┬──────────────────────────┘
               │
    ┌──────────┼──────────┐
    │          │          │
    ▼          ▼          ▼
┌────────┐ ┌────────┐ ┌────────┐
│ Memory │ │Compliance│ │ Beads │
└────┬───┘ └────┬────┘ └───┬───┘
     │          │          │
     └──────────┼──────────┘
                │
            ┌───▼───┐
            │  Git  │
            └───────┘
```

### System Priorities

1. **AGENTS.md overrides everything**
   - This file is law
   - No exceptions
   - All rules must be followed

2. **Beads governs task selection**
   - Tasks come from Beads
   - No tasks from context or memory
   - Beads tracks work outside context

3. **Memory provides session state**
   - Tracks current work
   - Preserves context
   - Does NOT replace Beads

4. **Compliance ensures protocol adherence**
   - Validates memory integrity
   - Requires proof-of-read
   - Enforces commit requirements

5. **Runtime logic follows protocols**
   - All decisions go through systems
   - No ad-hoc planning
   - No memory-based task creation

### How Systems Reinforce Each Other

**Memory ↔ Compliance:**

- Memory stores compliance metadata
- Compliance validates memory integrity
- Proof hash includes memory files

**Compliance ↔ Beads:**

- Compliance ensures protocol adherence
- Beads issues reference compliance state
- Compliance validates Beads workflow

**Beads ↔ Memory:**

- Beads issues stored outside context (memory-efficient)
- Memory tracks current Beads work
- Session files reference active issues

**All ↔ Git:**

- Memory files committed to Git
- Compliance proofs in Git
- Beads issues.jsonl in Git
- All systems persist via Git

### Integrated Workflow Example

```bash
# Morning startup
./scripts/integrated-session-start.sh  # Memory + Compliance + Beads

# Select work
ISSUE_ID=$(bd ready --json | jq -r '.[0].id')  # Beads
bd update "$ISSUE_ID" --status in_progress --json  # Beads

# Update memory
jq --arg issue "$ISSUE_ID" '.current_work = [$issue]' \
   memory/persistent/session-$(date +%Y-%m-%d).json > tmp.json && \
   mv tmp.json memory/persistent/session-$(date +%Y-%m-%d).json  # Memory

# Generate compliance proof
PROOF=$(npm run proof)  # Compliance

# During work: discover bug
NEW_ISSUE=$(bd create "Bug: ..." -t bug -p 0 --json | jq -r '.id')  # Beads
bd dep add "$NEW_ISSUE" "$ISSUE_ID" --type discovered-from  # Beads

# Complete work
bd close "$ISSUE_ID" --reason "..." --json  # Beads

# Update memory
jq '.accomplishments += ["Completed: ..."]' \
   memory/persistent/session-$(date +%Y-%m-%d).json > tmp.json && \
   mv tmp.json memory/persistent/session-$(date +%Y-%m-%d).json  # Memory

# Commit
PROOF=$(jq -r '.compliance_hash' logs/compliance/proof-$(date +%Y-%m-%d).json)  # Compliance
git commit -m "feat: ...

COMPLIANCE_PROOF: $PROOF"  # Git (all systems)
```

---

## SECTION 6 — DECISION-MAKING RULES

**How agents must make decisions within the Triple System.**

### Task Selection

1. **Query Beads for ready work:**

   ```bash
   bd ready --json
   ```

2. **Verify no blockers:**

   ```bash
   bd dep tree <issue-id>
   ```

3. **Select highest priority ready issue:**
   - Priority 0 = highest
   - Priority 4 = lowest
   - Only choose from ready (no blockers)

4. **NEVER:**
   - Invent tasks
   - Work on tasks not in Beads
   - Start blocked work
   - Use conversation context as task source

### Priority Determination

**Beads priority levels:**

- `-p 0` — Critical (security, data loss, production down)
- `-p 1` — High (feature blocking, major bug)
- `-p 2` — Medium (normal features, non-blocking bugs)
- `-p 3` — Low (nice-to-have, polish)
- `-p 4` — Lowest (future work, research)

**Selection order:**

1. Ready issues with priority 0
2. Ready issues with priority 1
3. Ready issues with priority 2
4. (Lower priorities if nothing else)

### Handling Ambiguity

**If requirements are unclear:**

1. **Check Beads issue description:**

   ```bash
   bd show <id> --json | jq '.description'
   ```

2. **Check dependencies:**

   ```bash
   bd dep tree <id>
   ```

3. **File clarification issue:**

   ```bash
   CLARIFY=$(bd create "Clarification needed: <question>" -t task -p 1 --json | jq -r '.id')
   bd dep add <current-id> "$CLARIFY" --type blocks
   ```

4. **NEVER:**
   - Guess requirements
   - Make assumptions
   - Invent specifications
   - Proceed without clarity

### Resolving Conflicts

**If instructions conflict:**

1. **AGENTS.md takes precedence** (highest authority)
2. **Beads issue description** (task requirements)
3. **Project documentation** (domain rules)
4. **User explicit instructions** (session-specific)

**Escalation:**

- File Beads issue for conflict resolution
- Link to conflicting issues
- Mark current work as blocked
- Wait for resolution before proceeding

### Fallback Behavior

**Never continue without:**

- A Beads issue selected
- Compliance proof generated
- Session file validated
- Protocol read

**Never invent:**

- Project requirements
- Task descriptions
- Feature specifications
- Domain knowledge

**Never use:**

- Hallucinated memory
- Conversation context as task source
- Assumptions about requirements
- Ad-hoc planning

---

## SECTION 7 — PROJECT-SPECIFIC REQUIREMENTS

**Rave Pulse Flow (EDM Shuffle) — Domain Rules and Quality Standards**

### Project Overview

**Rave Pulse Flow** is a React/TypeScript audio application with DJ mixing capabilities, built with Vite and styled with Tailwind CSS. The project features professional DJ stations, festival voting, and audio production tools.

### Quality Bar

**Code Quality:**

- TypeScript strict mode enabled
- ESLint + Prettier enforced
- All new code must have tests
- Test coverage minimum: 80% for new code
- No `any` types (use proper types)

**Performance:**

- Audio processing: < 16ms latency (60fps)
- Page load: < 2s initial render
- Bundle size: Monitor and optimize
- Memory: Prevent audio context leaks

**User Experience:**

- Audio must start on user gesture (autoplay policy)
- Mobile-responsive design
- Dark mode support
- Accessible (WCAG AA minimum)

### Critical Non-Obvious Information

**Audio System Architecture (DISCOVERED PATTERN):**

**Global AudioContext Management:**

- `useTrueAudio` hook manages a SINGLE global AudioContext instance (prevents browser audio conflicts)
- AudioContext is created lazily on first user interaction to avoid autoplay policy warnings
- Mobile audio unlocking requires specific gesture handling with silent buffer playback

**Dual Audio Engines:**

- `useTrueAudio` (Web Audio API) for basic audio playback and buffer management
- `useDJAudio` (Tone.js) for professional DJ station features with crossfading
- These systems operate independently - choose based on feature requirements

**Tone.js Integration:**

- Professional DJ station uses Tone.js for real-time audio effects and crossfading
- Audio routing goes through Zustand global store for state synchronization
- Deprecated methods in `useDJAudio` log warnings - use global store instead

**Feature Flags (NON-STANDARD):**

- Audio engine features controlled by `VITE_FF_AUDIO_ENGINE` environment variable
- Check `src/config/features.ts` for current feature flag status
- Some components render conditionally based on these flags

**Database Patterns (SUPABASE-SPECIFIC):**

**Project ID Validation:**

- Supabase client validates against expected project ID: `uzudveyglwouuofiaapq`
- Local development shows warnings if using wrong instance
- Database types are auto-generated in `src/lib/supabase.ts`

**Real-time Voting System:**

- Festival voting uses 24-hour anti-spam protection via PostgreSQL queries
- Vote weights range 1-10 with user-specific rate limiting
- Edge functions handle authentication and abuse prevention

**Testing Setup (PROJECT-SPECIFIC):**

**Comprehensive Web Audio API Mocking:**

- Vitest setup includes complete AudioContext, GainNode, OscillatorNode mocks
- Test files must be in same directory as source (Vite path resolution requirement)
- Playwright tests run against localhost:5173 (not default Vite port 8081)

**Mock Requirements:**

- All Web Audio API nodes are mocked in `src/__tests__/setup.ts`
- IntersectionObserver and matchMedia pre-mocked for consistent test environment
- MediaRecorder mocked with blob URL generation

**Development Server Configuration (NON-STANDARD):**

**Port Configuration:**

- Development server runs on port 8081 (vite.config.ts)
- Playwright expects port 5173 (playwright.config.ts) - ensure consistency
- IPv6 binding (`::`) enabled for network accessibility

**Path Aliases:**

- `@/*` imports resolve to `src/*` in both Vite and Vitest
- TypeScript path matching required in multiple config files

**Component Architecture (DISCOVERED PATTERN):**

**Context Providers Pattern:**

- App wraps in specific order: QueryClient → AuthProvider → VotingProvider → AudioProvider → TooltipProvider
- Missing providers cause specific error messages (check context hooks for requirements)

**LocalStorage Usage:**

- DJ station deck state persists to localStorage with keys: `vflx10-deckA`, `vflx10-deckB`
- Track metadata includes BPM, source (upload/freesound/loudly), and broadcast rights

**Style System (TAILWIND-SPECIFIC):**

**Custom Animations:**

- EDM-themed animations: `glow-pulse`, `float`, `equalizer`, `shimmer`
- Neon color palette: `neon-purple`, `neon-cyan`, `neon-blue`, etc.
- Custom fonts: `orbitron`, `rajdhani`, `audiowide` for electronic music aesthetic

**Dark Mode:**

- Uses class-based dark mode: `darkMode: ["class"]`
- Custom CSS variables for theming (check tailwind.config.ts for color system)

**Package Management (NON-OBVIOUS):**

**Dual Lock Files:**

- Both `package-lock.json` and `bun.lockb` present - project supports npm and bun
- Bun preferred for performance but npm fully supported
- Install commands work with either package manager

**Edge Functions (SUPABASE-SPECIFIC):**

**Freesound Integration:**

- `supabase/functions/freesound-search/index.ts` provides audio search API
- Requires attribution credits for downloaded sounds
- Broadcast rights confirmation required for track uploads

### Essential Commands

```bash
# Development
npm run dev              # Start dev server (port 8081)
npm run build            # Production build
npm run build:dev        # Development build

# Testing
npm run test             # Run Vitest unit tests
npm run test:watch       # Watch mode
npm run test:e2e         # Playwright end-to-end tests
npm run test:e2e:ui      # Playwright UI mode

# Utilities
npm run generate-feed     # Update EDM news from RSS
npm run sync:printify     # Sync Printify products

# Triple System
./scripts/integrated-session-start.sh  # Session startup
npm run compliance:check                # Compliance check
npm run proof                           # Generate proof
bd ready --json                         # Get ready work
```

### Critical Gotchas

1. **Port Mismatch:** Vite dev (8081) vs Playwright (5173) - update configs consistently
2. **Audio Context:** Always use `useTrueAudio` for basic playback, `useDJAudio` for DJ features
3. **Feature Flags:** Check `src/config/features.ts` before implementing new audio features
4. **Database Types:** Use auto-generated types from `src/lib/supabase.ts`, not manual interfaces
5. **Test Location:** Vitest requires test files in source directories for path resolution
6. **LocalStorage:** DJ station uses specific keys - check `vflx10-deckA/B` patterns

### Template/Schema Rules

**Component Structure:**

```typescript
// Standard component pattern
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface ComponentProps {
  // Props with proper types
}

export const Component: React.FC<ComponentProps> = ({ ... }) => {
  // Implementation
};
```

**Context Provider Order (STRICT):**

```
QueryClient → AuthProvider → VotingProvider → AudioProvider → TooltipProvider
```

**File Naming:**

- Components: `PascalCase.tsx`
- Hooks: `camelCase.ts` (prefix: `use`)
- Utils: `camelCase.ts`
- Tests: `*.test.ts` or `*.test.tsx`

### Integration Behavior

**Supabase:**

- Client in `src/lib/supabase.ts`
- Auto-generated types only
- RLS policies enforced
- Edge functions for external APIs

**Audio:**

- Always unlock audio on user gesture
- Handle autoplay policy gracefully
- Clean up audio contexts
- Prevent memory leaks

**Routing:**

- React Router DOM
- Protected routes for authenticated features
- Lazy loading for performance

### Tone/Brand Alignment

**Visual Style:**

- Dark theme (EDM aesthetic)
- Neon colors: purple, cyan, blue
- Custom fonts: orbitron, rajdhani, audiowide
- Animations: glow-pulse, float, equalizer, shimmer

**User Experience:**

- Professional DJ station UI (FLX-10 aesthetic)
- Real-time audio manipulation
- Festival voting with visual feedback
- Smooth transitions and animations

---

## SECTION 8 — COMMUNICATION STANDARDS

**How agents must communicate and present information.**

### When to Summarize

**Always summarize:**

- Session startup status
- Compliance check results
- Selected Beads issue
- Work completion status

**Example:**

```
✅ Session startup complete
📋 Selected work: bd-42 - Implement audio context unlock
🔍 Compliance: PASSED (proof: a1b2...)
🚀 Ready to proceed
```

### When to Show Reasoning

**Show reasoning for:**

- Complex technical decisions
- Architecture changes
- Breaking changes
- Ambiguous requirements

**Hide reasoning for:**

- Routine tasks
- Straightforward implementations
- Clear requirements

### When to Ask for Clarification

**Ask when:**

- Requirements are ambiguous
- Multiple solutions exist
- Domain knowledge is unclear
- User intent is uncertain

**File Beads issue:**

```bash
CLARIFY=$(bd create "Clarification: <question>" -t task -p 1 --json | jq -r '.id')
bd dep add <current-id> "$CLARIFY" --type blocks
```

**Don't ask when:**

- Information is in Beads issue
- Answer can be found in code/docs
- Decision follows standard patterns

### How to Reference Beads Issues

**Always include:**

- Issue ID: `bd-42`
- Title: "Implement audio context unlock"
- Status: `in_progress`, `closed`, etc.

**Format:**

```
Working on: bd-42 - Implement audio context unlock
Status: in_progress
```

### How to Point to Affected Files

**Use code references:**

```12:45:src/hooks/useAudio.ts
// Code content
```

**Or file paths:**

- `src/components/AudioPlayer.tsx` — Main component
- `src/hooks/useAudio.ts` — Audio hook
- `src/lib/supabase.ts` — Supabase client

### How to Present Step-by-Step Fixes

**Format:**

1. **Problem:** Clear description
2. **Root Cause:** Technical explanation
3. **Solution:** Step-by-step fix
4. **Verification:** How to test

**Example:**

```
Problem: Audio context not starting on mobile

Root Cause: Browser autoplay policy requires user gesture

Solution:
1. Add user gesture listener in AudioProvider
2. Call AudioContext.resume() on first interaction
3. Store unlocked state in localStorage

Verification:
- Open app on mobile device
- Tap screen
- Verify audio plays immediately
```

### How to Handle Incomplete Context

**If context is lost:**

1. Run recovery: `./scripts/recover-context.sh`
2. Query Beads: `bd list --status in_progress --json`
3. Read session file: `memory/persistent/session-YYYY-MM-DD.json`
4. Check recent commits: `git log --oneline -10`

**If information is missing:**

1. Check Beads issue description
2. Check project documentation
3. Check code comments
4. File clarification issue if needed

---

## SECTION 9 — COMMAND SUMMARY (CHEATSHEET)

**Quick reference for common commands.**

### Beads Commands

```bash
# Work selection
bd ready --json                          # Get ready work
bd list --status open --json             # All open issues
bd list --status in_progress --json      # In-progress work
bd blocked --json                        # Blocked issues
bd stats                                 # Project health

# Issue management
bd show <id> --json                      # Get full context
bd create "Title" -d "Desc" -p 1 -t task --json  # Create issue
bd update <id> --status in_progress --json  # Update status
bd close <id> --reason "..." --json      # Close issue

# Dependencies
bd dep add <id1> <id2> --type blocks     # Add blocker
bd dep add <id1> <id2> --type discovered-from  # Link discovery
bd dep tree <id>                         # Show dependency tree

# Labels
bd label add <id> urgent,backend         # Add labels
```

### Memory Update Commands

```bash
# Session file
SESSION="memory/persistent/session-$(date +%Y-%m-%d).json"

# Validate
node scripts/memory/validate-session.mjs "$SESSION"

# Normalize
node scripts/memory/normalize-session.mjs

# Update current work
jq --arg issue "bd-42" '.current_work = [$issue]' "$SESSION" > tmp.json && mv tmp.json "$SESSION"

# Update accomplishments
jq '.accomplishments += ["Completed: ..."]' "$SESSION" > tmp.json && mv tmp.json "$SESSION"
```

### Compliance Commands

```bash
# Generate proof
npm run proof

# Check compliance
npm run compliance:check

# Get proof hash
jq -r '.compliance_hash' logs/compliance/proof-$(date +%Y-%m-%d).json
```

### Integrated Startup Commands

```bash
# Full startup
./scripts/integrated-session-start.sh

# Recovery
./scripts/recover-context.sh

# Beads startup only
./scripts/beads-session-start.sh
```

### Branch Rules

```bash
# Get current branch
git rev-parse --abbrev-ref HEAD

# Update session with branch
jq --arg branch "$(git rev-parse --abbrev-ref HEAD)" '.branch = $branch' \
   memory/persistent/session-$(date +%Y-%m-%d).json > tmp.json && \
   mv tmp.json memory/persistent/session-$(date +%Y-%m-%d).json
```

### Session Recovery Commands

```bash
# Full recovery
./scripts/recover-context.sh

# Manual recovery
bd list --status in_progress --json
bd show <id> --json
bd dep tree <id>
```

### Complete Workflow Command

```bash
# Start to finish
./scripts/integrated-session-start.sh && \
ISSUE_ID=$(bd ready --json | jq -r '.[0].id') && \
bd show "$ISSUE_ID" --json | jq '.' && \
bd update "$ISSUE_ID" --status in_progress --json && \
PROOF=$(npm run proof) && \
echo "✅ Ready to work on: $ISSUE_ID (Proof: ${PROOF:0:16}...)"
```

---

## SECTION 10 — ENFORCEMENT & VIOLATIONS

**Consequences and remediation for protocol violations.**

### Violation Types

1. **Missing Compliance Proof**
   - Commit rejected by git hook
   - Must generate proof: `npm run proof`
   - Include in commit message: `COMPLIANCE_PROOF: <hash>`

2. **Skipped Session Initialization**
   - Session invalid
   - Must run: `./scripts/integrated-session-start.sh`
   - Regenerate compliance proof

3. **Invalid Provider Order**
   - Memory integrity compromised
   - Fix session file compliance.provider_order
   - Regenerate compliance proof

4. **Starting Work Without Beads**
   - Work not tracked
   - Create Beads issue immediately
   - Link to any related work

5. **Committing Without Proof**
   - Commit rejected
   - Generate proof and amend commit

6. **Editing Session Files Manually**
   - Use normalization script instead
   - Run: `node scripts/memory/normalize-session.mjs`

7. **Using ByteRover Without Permission**
   - Violates provider order
   - Set `byterover_enabled: false` in session
   - Regenerate compliance proof

### Violation Remediation Procedure

**If an agent violates protocol:**

1. **STOP work immediately**

   ```bash
   # If work was started, pause it
   bd update <id> --status blocked --json
   ```

2. **File compliance incident**

   ```bash
   INCIDENT=$(bd create "Compliance Incident: <description>" -t bug -p 0 --json | jq -r '.id')
   CURRENT_ID="bd-42"  # If applicable
   bd dep add "$INCIDENT" "$CURRENT_ID" --type discovered-from
   ```

3. **Add labels**

   ```bash
   bd label add "$INCIDENT" compliance,urgent
   ```

4. **Re-run protocol**

   ```bash
   ./scripts/integrated-session-start.sh
   npm run compliance:check
   npm run proof
   ```

5. **Fix violations**
   - Address root cause
   - Update session file if needed
   - Regenerate compliance proof

6. **Close incident**

   ```bash
   bd close "$INCIDENT" --reason "Violation remediated. Protocol re-run. Compliance check passed." --json
   ```

7. **Resume work**

   ```bash
   # Only when incident is closed
   bd update <id> --status in_progress --json
   ```

### Automatic Enforcement

**Git Hooks:**

- `.git/hooks/commit-msg` — Rejects commits without proof
- Cannot be bypassed (unless `[skip-proof]`, not recommended)

**Compliance Checker:**

- `scripts/enforce-compliance.sh` — Validates all requirements
- Fails build if violations found

**Session Validator:**

- `scripts/memory/validate-session.mjs` — Validates session schema
- Fails if required fields missing

---

## SECTION 11 — VERSIONING & UPDATE FLOW

**How to update AGENTS.md and propagate changes.**

### Updating AGENTS.md

**When updating this file:**

1. **Increment version**
   - Update `Version:` line
   - Update `Last Updated:` date

2. **Document changes**
   - Add changelog entry
   - Note breaking changes

3. **Generate fresh compliance proof**

   ```bash
   npm run proof
   ```

4. **Update session file**

   ```bash
   jq '.compliance.protocol_version = "3.0.0"' \
      memory/persistent/session-$(date +%Y-%m-%d).json > tmp.json && \
      mv tmp.json memory/persistent/session-$(date +%Y-%m-%d).json
   ```

5. **Commit with proof**

   ```bash
   PROOF=$(npm run proof)
   git commit -m "chore: update AGENTS.md to v3.0.0

   Changes:
   - [List changes]

   COMPLIANCE_PROOF: $PROOF"
   ```

6. **Notify agents**
   - Agents should re-read AGENTS.md
   - Run session startup again
   - Regenerate compliance proofs

### Propagating Protocol Changes

**To update all agents:**

1. **Update AGENTS.md** (as above)

2. **Update AGENT_PROTOCOL.md** if needed
   - Keep in sync with AGENTS.md
   - Update version and date

3. **Regenerate all compliance proofs**

   ```bash
   npm run proof
   npm run compliance:check
   ```

4. **Update session templates**
   - Ensure new fields are in template
   - Update normalization script if needed

5. **Test integrated startup**

   ```bash
   ./scripts/integrated-session-start.sh
   ```

### Keeping Systems Synchronized

**Memory ↔ Compliance:**

- Session files include compliance metadata
- Compliance proofs include memory files
- Both must be updated together

**Compliance ↔ Beads:**

- Beads issues reference compliance state
- Compliance validates Beads workflow
- Both must be consistent

**Beads ↔ Memory:**

- Memory tracks current Beads work
- Session files reference issue IDs
- Both must stay in sync

**All ↔ Git:**

- All systems persist via Git
- Commits must include compliance proof
- Git hooks enforce consistency

### Version Compatibility

**Breaking Changes:**

- Increment major version (e.g., 2.0.0 → 3.0.0)
- Document migration path
- Update all references

**Non-Breaking Changes:**

- Increment minor version (e.g., 3.0.0 → 3.1.0)
- Additive changes only
- Backward compatible

**Patch Changes:**

- Increment patch version (e.g., 3.0.0 → 3.0.1)
- Bug fixes, clarifications
- No behavior changes

---

## END OF AGENTS.md

**This file is the law of the land for all agents.**

**Last Updated:** 2025-01-24
**Version:** 3.0.0
**Status:** ACTIVE & ENFORCED

**Remember:**

- ✅ Read this file at session start
- ✅ Follow all procedures exactly
- ✅ Use Beads for all tasks
- ✅ Generate compliance proofs
- ✅ Update memory after work
- ✅ File issues for discoveries
- ✅ Never bypass protocols

**Questions? File a Beads issue.**
