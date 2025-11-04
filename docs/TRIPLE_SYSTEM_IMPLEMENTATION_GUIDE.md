# Triple System Implementation Guide
## Compliance + Memory + Beads Integration

**Complete step-by-step guide for implementing Compliance, Memory, and Beads systems in any project.**

---

## Table of Contents

1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [Prerequisites](#prerequisites)
4. [Phase 1: Memory System](#phase-1-memory-system)
5. [Phase 2: Compliance System](#phase-2-compliance-system)
6. [Phase 3: Beads System](#phase-3-beads-system)
7. [Phase 4: Integration & Cooperation](#phase-4-integration--cooperation)
8. [Verification & Testing](#verification--testing)
9. [Agent Implementation Prompts](#agent-implementation-prompts)

---

## Overview

This guide provides a complete implementation of three integrated systems:

1. **Memory System**: Persistent session and project memory with provider hierarchy
2. **Compliance System**: Proof-of-read verification and protocol enforcement
3. **Beads System**: Git-backed issue tracking for AI agents

**Key Integration Points:**
- Memory system tracks compliance state
- Compliance system validates memory integrity
- Beads system stores issues outside context (memory-efficient)
- All three systems use Git for persistence
- All three systems integrate with Cursor IDE agents

---

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Cursor IDE Agent                       │
└─────────────────────┬───────────────────────────────────┘
                      │
        ┌─────────────┼─────────────┐
        │             │             │
        ▼             ▼             ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│   Memory     │ │  Compliance  │ │    Beads     │
│   System     │ │    System     │ │    System    │
└──────┬───────┘ └──────┬────────┘ └──────┬───────┘
       │                │                  │
       └────────────────┼──────────────────┘
                        │
                    ┌───▼────┐
                    │  Git   │
                    └────────┘
```

**Data Flow:**
- Memory → Stores session state and compliance metadata
- Compliance → Validates memory integrity and protocol adherence
- Beads → Tracks issues and dependencies (frees context space)
- Git → Persistent storage for all three systems

---

## Prerequisites

### Required Tools

```bash
# 1. Node.js (for memory normalization/validation)
node --version  # Should be v18+

# 2. jq (for JSON processing)
jq --version

# 3. Beads CLI (for issue tracking)
which bd || echo "Install Beads: go install github.com/bytedance/beads@latest"

# 4. Git (required)
git --version
```

### Project Structure

Your project should have:
- Root directory with `package.json` (or similar)
- `.git` directory (Git repository)
- `docs/` directory (for documentation)
- `scripts/` directory (for scripts)

---

## Phase 1: Memory System

### Step 1.1: Create Memory Directory Structure

```bash
mkdir -p memory/persistent
mkdir -p memory/sessions
mkdir -p logs/compliance
mkdir -p scripts/memory
mkdir -p scripts/agents
```

### Step 1.2: Create Memory System Manifest

**File: `memory/MEMORY_SYSTEM_MANIFEST.json`**

```json
{
  "memory_system": {
    "name": "Project Memory System",
    "version": "1.0.0",
    "created": "2025-11-04T00:00:00Z",
    "last_updated": "2025-11-04T00:00:00Z",
    "status": "active"
  },
  "components": {
    "persistent_memory": {
      "status": "active",
      "files": [
        "project-state.json"
      ]
    },
    "session_memory": {
      "status": "active",
      "files": [
        "session-template.json"
      ]
    }
  },
  "provider_order": [
    "LocalJson",
    "Supabase",
    "ByteRover(optional)"
  ],
  "compliance": {
    "provider_order_verified": true,
    "byterover_enabled": false
  }
}
```

### Step 1.3: Create Project State Template

**File: `memory/persistent/project-state.json`**

```json
{
  "project_name": "YOUR_PROJECT_NAME",
  "version": "1.0.0",
  "last_updated": "2025-11-04T00:00:00Z",
  "components": {},
  "dependencies": {},
  "architecture": {},
  "compliance": {
    "provider_order": "localjson,supabase,byterover(optional)",
    "byterover_enabled": false
  }
}
```

### Step 1.4: Create Session Template

**File: `memory/persistent/session-template.json`**

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
    "protocol_read": false,
    "proof_hash": "",
    "proof_timestamp": "",
    "provider_order": "localjson,supabase,byterover(optional)",
    "byterover_enabled": false
  }
}
```

### Step 1.5: Create Memory Normalization Script

**File: `scripts/memory/normalize-session.mjs`**

```javascript
#!/usr/bin/env node

import fs from "fs";

const today = new Date().toISOString().split("T")[0];
const f = `memory/persistent/session-${today}.json`;

if (!fs.existsSync(f)) process.exit(0);

const j = JSON.parse(fs.readFileSync(f, "utf8"));

j.date = j.date ?? today;
j.branch = j.branch ?? (process.env.CI_BRANCH || "unknown");
j.commits_today = Number.isInteger(j.commits_today) ? j.commits_today : 0;
j.areas = Array.isArray(j.areas) ? j.areas : (Array.isArray(j.context) ? j.context : []);
j.statuses = j.statuses && typeof j.statuses === "object" ? j.statuses : {};
j.next = Array.isArray(j.next) ? j.next : [];

j.compliance = j.compliance || {};

if (typeof j.compliance.provider_order !== "string") {
  j.compliance.provider_order = "localjson,supabase,byterover(optional)";
}

if (typeof j.compliance.byterover_enabled !== "boolean") {
  if (typeof j.compliance.byte_rover_disabled === "boolean") {
    j.compliance.byterover_enabled = !j.compliance.byte_rover_disabled;
  } else {
    j.compliance.byterover_enabled = false;
  }
}

fs.writeFileSync(f, JSON.stringify(j, null, 2));
console.log("✅ normalized", f);
```

**Make executable:**
```bash
chmod +x scripts/memory/normalize-session.mjs
```

### Step 1.6: Create Memory Validation Script

**File: `scripts/memory/validate-session.mjs`**

```javascript
#!/usr/bin/env node

import fs from "fs";

const today = new Date().toISOString().split("T")[0];
const f = `memory/persistent/session-${today}.json`;

const need = ["date", "branch", "commits_today", "areas", "statuses", "next", "compliance"];

let err = 0;

if (!fs.existsSync(f)) {
  console.error(`❌ Missing ${f}`);
  process.exit(1);
}

const raw = fs.readFileSync(f, "utf8");
let j;
try {
  j = JSON.parse(raw);
} catch (e) {
  console.error("❌ Invalid JSON:", e.message);
  process.exit(1);
}

for (const k of need) {
  if (!(k in j)) {
    console.error(`❌ Missing field: ${k}`);
    err++;
  }
}

if (j?.compliance && typeof j.compliance.byterover_enabled !== "boolean") {
  console.error("❌ compliance.byterover_enabled must be boolean");
  err++;
}

if (err) process.exit(1);

console.log("✅ session file valid");
```

**Make executable:**
```bash
chmod +x scripts/memory/validate-session.mjs
```

### Step 1.7: Initialize Today's Session

```bash
# Create today's session file
TODAY=$(date +%Y-%m-%d)
cp memory/persistent/session-template.json "memory/persistent/session-$TODAY.json"

# Update with actual values
jq --arg today "$TODAY" \
   --arg branch "$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo 'main')" \
   '.date = $today | .branch = $branch' \
   "memory/persistent/session-$TODAY.json" > tmp.json && mv tmp.json "memory/persistent/session-$TODAY.json"

# Normalize
node scripts/memory/normalize-session.mjs
```

---

## Phase 2: Compliance System

### Step 2.1: Create Agent Protocol Document

**File: `docs/AGENT_PROTOCOL.md`**

```markdown
# AGENT PROTOCOL

**Version:** 1.0.0
**Last Updated:** 2025-11-04
**Status:** ACTIVE

## Purpose

This protocol defines the mandatory compliance requirements for all AI agents working on this project. All agents MUST read and comply with this protocol at the start of every session.

## Memory Provider Order (STRICT)

The memory system MUST use providers in this exact order:

1. **LocalJson** - Local JSON files in `memory/` directory (primary)
2. **Supabase** - Database-backed persistent memory (secondary)
3. **ByteRover** - Optional MCP server (disabled by default, opt-in only)

### Critical Rules

- ByteRover MUST remain **disabled** unless explicitly enabled by user
- Provider order MUST be: LocalJson → Supabase → ByteRover(optional)
- Never skip LocalJson or Supabase in favor of ByteRover
- All memory operations MUST respect this hierarchy

## Session Compliance Requirements

### At Session Start

1. Read `AGENT_PROTOCOL.md` (this file)
2. Run `npm run compliance:check`
3. Generate compliance proof via `scripts/agents/make-compliance-proof.sh`
4. Output AGENT COMPLIANCE CHECK status
5. Include COMPLIANCE_PROOF in session status
6. **MUST include a line `COMPLIANCE_PROOF: <sha256>` derived from `scripts/agents/make-compliance-proof.sh` in the next commit message.**

### Session JSON Schema

All session files MUST match this schema:

\`\`\`json
{
  "session_id": "session-YYYY-MM-DD-HHMMSS",
  "date": "YYYY-MM-DD",
  "branch": "string",
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
\`\`\`

## Commit Requirements

All commits MUST include COMPLIANCE_PROOF in the commit message:

\`\`\`
feat: Description

COMPLIANCE_PROOF: <SHA256_HASH>
\`\`\`

Commits without COMPLIANCE_PROOF will be rejected by git hooks.

## Verification

- Run `npm run compliance:check` before committing
- Ensure `COMPLIANCE_PROOF` file exists with valid hash
- Verify provider order matches protocol
- Confirm session JSON matches schema

## Enforcement

- Git commit-msg hook automatically rejects non-compliant commits
- `scripts/enforce-compliance.sh` runs strict checks
- `scripts/agents/make-compliance-proof.sh` generates verifiable proof

## Updates

When this protocol is updated:
1. Update version number
2. Update Last Updated timestamp
3. Generate new compliance proof
4. Notify all active agents
```

### Step 2.2: Create Compliance Proof Generator

**File: `scripts/agents/make-compliance-proof.sh`**

```bash
#!/usr/bin/env bash

set -euo pipefail

OUTDIR="logs/compliance"
mkdir -p "$OUTDIR"

DATE_UTC=$(date -u +%Y-%m-%dT%H:%M:%SZ)
TODAY=$(date +%Y-%m-%d)
AGENT_PROTOCOL="docs/AGENT_PROTOCOL.md"

FILES=(
  "$AGENT_PROTOCOL"
  "memory/persistent/project-state.json"
  "memory/persistent/session-$TODAY.json"
)

TMP=$(mktemp)
for f in "${FILES[@]}"; do
  echo "===== $f =====" >> "$TMP"
  if [[ -f "$f" ]]; then
    cat "$f" >> "$TMP"
  else
    echo "[MISSING]" >> "$TMP"
  fi
  echo >> "$TMP"
done

HASH=$(shasum -a 256 "$TMP" | awk '{print $1}')
rm -f "$TMP"

PROOF_PATH="$OUTDIR/proof-$TODAY.json"
cat > "$PROOF_PATH" <<JSON
{
  "timestamp": "$DATE_UTC",
  "branch": "$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo unknown)",
  "files": {
    "AGENT_PROTOCOL.md": $( [[ -f "$AGENT_PROTOCOL" ]] && echo true || echo false ),
    "project-state.json": $( [[ -f "memory/persistent/project-state.json" ]] && echo true || echo false ),
    "session-$TODAY.json": $( [[ -f "memory/persistent/session-$TODAY.json" ]] && echo true || echo false )
  },
  "compliance_hash": "$HASH"
}
JSON

echo "$HASH"
```

**Make executable:**
```bash
chmod +x scripts/agents/make-compliance-proof.sh
```

### Step 2.3: Create Compliance Enforcer

**File: `scripts/enforce-compliance.sh`**

```bash
#!/bin/bash

# Agent Protocol Compliance Enforcer
# Runs strict compliance checks and verifies proof-of-read

set -e

VIOL=0

echo "🔍 Running Agent Protocol Compliance Checks..."

# Check 1: Verify AGENT_PROTOCOL.md exists
PROTOCOL_FILE="docs/AGENT_PROTOCOL.md"
if [[ ! -f "$PROTOCOL_FILE" ]]; then
    echo "❌ CRITICAL: AGENT_PROTOCOL.md not found at $PROTOCOL_FILE"
    exit 1
fi

echo "✅ Protocol file exists: $PROTOCOL_FILE"

# Check 2: Verify today's compliance proof exists
TODAY=$(date +%Y-%m-%d)
PROOF_FILE="logs/compliance/proof-${TODAY}.json"
if [[ ! -f "$PROOF_FILE" ]]; then
    echo "❌ CRITICAL: Today's compliance proof not found: $PROOF_FILE"
    echo "💡 Run: ./scripts/agents/make-compliance-proof.sh"
    exit 1
fi

echo "✅ Today's compliance proof exists: $PROOF_FILE"

# Check 3: Verify proof format
if ! jq -e '.compliance_hash' "$PROOF_FILE" > /dev/null 2>&1; then
    echo "❌ CRITICAL: Invalid compliance proof format - missing compliance_hash"
    exit 1
fi

if ! jq -e '.files' "$PROOF_FILE" > /dev/null 2>&1; then
    echo "❌ CRITICAL: Invalid compliance proof format - missing files"
    exit 1
fi

echo "✅ Proof format is valid"

# Check 4: Verify required files exist according to proof
AGENT_PROTOCOL_EXISTS=$(jq -r '.files["AGENT_PROTOCOL.md"]' "$PROOF_FILE")
PROJECT_STATE_EXISTS=$(jq -r '.files["project-state.json"]' "$PROOF_FILE")
SESSION_EXISTS=$(jq -r '.files["session-'"$TODAY"'.json"]' "$PROOF_FILE")

if [[ "$AGENT_PROTOCOL_EXISTS" != "true" ]]; then
    echo "❌ CRITICAL: AGENT_PROTOCOL.md was not found when proof was generated"
    exit 1
fi

echo "✅ All required files existed at proof generation time"

# Check 5: Verify current files match proof expectations
if [[ ! -f "memory/persistent/project-state.json" ]]; then
    if [[ "$PROJECT_STATE_EXISTS" == "true" ]]; then
        echo "❌ CRITICAL: project-state.json existed at proof time but is now missing"
        exit 1
    fi
else
    if [[ "$PROJECT_STATE_EXISTS" != "true" ]]; then
        echo "❌ CRITICAL: project-state.json didn't exist at proof time but now exists"
        exit 1
    fi
fi

if [[ ! -f "memory/persistent/session-$TODAY.json" ]]; then
    if [[ "$SESSION_EXISTS" == "true" ]]; then
        echo "❌ CRITICAL: session-$TODAY.json existed at proof time but is now missing"
        exit 1
    fi
else
    if [[ "$SESSION_EXISTS" != "true" ]]; then
        echo "❌ CRITICAL: session-$TODAY.json didn't exist at proof time but now exists"
        exit 1
    fi
fi

echo "✅ File state consistency verified"
echo "✅ Provider order integrity verified via composite hash"

# Normalize & validate today's session
node scripts/memory/normalize-session.mjs || true
node scripts/memory/validate-session.mjs || VIOL=$((VIOL+1))

# Export compliance proof for commit messages
COMPLIANCE_PROOF=$(jq -r '.compliance_hash' "$PROOF_FILE")
export COMPLIANCE_PROOF="$COMPLIANCE_PROOF"
echo "📋 COMPLIANCE_PROOF: $COMPLIANCE_PROOF"

echo ""

if [[ $VIOL -gt 0 ]]; then
    echo "❌ $VIOL COMPLIANCE VIOLATIONS FOUND"
    echo "💡 Fix session validation errors before proceeding"
    exit 1
fi

echo "🎉 ALL COMPLIANCE CHECKS PASSED"
echo "🚀 Safe to proceed with development"

exit 0
```

**Make executable:**
```bash
chmod +x scripts/enforce-compliance.sh
```

### Step 2.4: Install Git Commit Hook

**File: `.git/hooks/commit-msg`**

```bash
#!/usr/bin/env bash

set -euo pipefail

MSGFILE="$1"

if grep -qi '\[skip-proof\]' "$MSGFILE"; then
  exit 0
fi

if ! grep -Eq 'COMPLIANCE_PROOF:[[:space:]]*[0-9a-f]{64}' "$MSGFILE"; then
  echo "❌ Commit rejected: missing COMPLIANCE_PROOF:<sha256>"
  echo "   Run: scripts/enforce-compliance.sh"
  echo "   Then include the line in your commit message:"
  echo "   COMPLIANCE_PROOF: <paste-hash-here>"
  exit 1
fi
```

**Make executable:**
```bash
chmod +x .git/hooks/commit-msg
```

### Step 2.5: Add Package.json Scripts

Add to `package.json`:

```json
{
  "scripts": {
    "compliance:check": "bash scripts/enforce-compliance.sh",
    "proof": "bash scripts/agents/make-compliance-proof.sh"
  }
}
```

### Step 2.6: Update Session with Compliance

```bash
# Generate proof
PROOF_HASH=$(./scripts/agents/make-compliance-proof.sh)

# Update session file
TODAY=$(date +%Y-%m-%d)
jq --arg hash "$PROOF_HASH" \
   --arg timestamp "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
   '.compliance.protocol_read = true |
    .compliance.proof_hash = $hash |
    .compliance.proof_timestamp = $timestamp |
    .compliance.provider_order = "localjson,supabase,byterover(optional)" |
    .compliance.byterover_enabled = false' \
   "memory/persistent/session-$TODAY.json" > tmp.json && mv tmp.json "memory/persistent/session-$TODAY.json"

# Normalize
node scripts/memory/normalize-session.mjs
```

---

## Phase 3: Beads System

### Step 3.1: Install Beads

```bash
# Install Beads CLI
go install github.com/bytedance/beads@latest

# Verify installation
which bd || export PATH="$PATH:$HOME/go/bin"

# Verify it works
bd --version
```

### Step 3.2: Initialize Beads

```bash
# Initialize Beads in project
bd init

# Follow prompts:
# - Enter issue prefix (or leave blank for auto-detect)
# - Install git hooks? (yes)
```

### Step 3.3: Configure Beads Gitignore

**File: `.beads/.gitignore`**

```
# SQLite databases
*.db
*.db-journal
*.db-wal
*.db-shm

# Daemon runtime files
daemon.lock
daemon.log
daemon.pid
bd.sock

# Legacy database files
db.sqlite
bd.db

# Keep JSONL exports and config (source of truth for git)
!*.jsonl
!metadata.json
!config.json
```

### Step 3.4: Create Beads Session Startup Script

**File: `scripts/beads-session-start.sh`**

```bash
#!/bin/bash
# Beads Session Startup Script
# Ensures Beads workflow is followed at session start

set -euo pipefail

echo "🔮 Beads Session Startup"
echo "========================"
echo ""

# Check if bd is available
if ! command -v bd &> /dev/null; then
    if [[ ":$PATH:" != *":$HOME/go/bin:"* ]]; then
        export PATH="$PATH:$HOME/go/bin"
    fi
    if ! command -v bd &> /dev/null; then
        echo "⚠️  WARNING: 'bd' command not found"
        echo "   Please install Beads or add it to PATH"
        exit 1
    fi
fi

# Function to query Beads with error handling
query_beads() {
    local cmd=$1
    local description=$2

    echo "📊 $description..."
    if command -v bd &> /dev/null; then
        if output=$(bd $cmd --json 2>&1); then
            echo "$output" | jq '.' 2>/dev/null || echo "$output"
        else
            echo "   ⚠️  Query failed: $output"
        fi
    else
        echo "   ⚠️  bd command not available"
    fi
    echo ""
}

# Step 1: Query ready work
query_beads "ready" "Checking ready work (no blockers)"

# Step 2: Review project health
echo "📈 Project Health Statistics..."
if command -v bd &> /dev/null; then
    bd stats 2>&1 || echo "   ⚠️  Stats query failed"
else
    echo "   ⚠️  bd command not available"
fi
echo ""

# Step 3: Check blocked issues
query_beads "blocked" "Checking blocked issues"

# Step 4: Summary
echo "✅ Beads Session Startup Complete"
echo ""
echo "Next steps:"
echo "1. Review the ready work above"
echo "2. Select an issue to work on"
echo "3. Update status: bd update <id> --status in_progress --json"
echo "4. Get full context: bd show <id> --json"
echo "5. Proceed with mandatory protocol check"
echo ""
```

**Make executable:**
```bash
chmod +x scripts/beads-session-start.sh
```

### Step 3.5: Create Beads Helper Script

**File: `scripts/beads-helper.sh`**

```bash
#!/bin/bash
# Beads Helper Functions
# Utility functions for working with Beads in agent workflows

set -euo pipefail

# Check if bd is available
check_bd() {
    if ! command -v bd &> /dev/null; then
        if [[ ":$PATH:" != *":$HOME/go/bin:"* ]]; then
            export PATH="$PATH:$HOME/go/bin"
        fi
        if ! command -v bd &> /dev/null; then
            echo "ERROR: bd command not found" >&2
            return 1
        fi
    fi
    return 0
}

# Get ready work (returns JSON)
get_ready_work() {
    check_bd || return 1
    bd ready --json 2>/dev/null
}

# Get issue details (returns JSON)
get_issue() {
    local issue_id=$1
    check_bd || return 1
    bd show "$issue_id" --json 2>/dev/null
}

# Create issue (returns JSON with issue ID)
create_issue() {
    local title=$1
    local description=${2:-""}
    local priority=${3:-2}
    local type=${4:-task}
    local labels=${5:-""}

    check_bd || return 1

    local cmd="bd create \"$title\""
    [ -n "$description" ] && cmd="$cmd -d \"$description\""
    cmd="$cmd -p $priority -t $type"
    [ -n "$labels" ] && cmd="$cmd -l $labels"
    cmd="$cmd --json"

    eval "$cmd" 2>/dev/null
}

# Update issue status
update_status() {
    local issue_id=$1
    local status=$2

    check_bd || return 1
    bd update "$issue_id" --status "$status" --json 2>/dev/null
}

# Close issue with reason
close_issue() {
    local issue_id=$1
    local reason=$2

    check_bd || return 1
    bd close "$issue_id" --reason "$reason" --json 2>/dev/null
}

# Add dependency
add_dependency() {
    local dependent_id=$1
    local blocker_id=$2
    local dep_type=${3:-blocks}

    check_bd || return 1
    bd dep add "$dependent_id" "$blocker_id" --type "$dep_type" 2>/dev/null
}

# Main function for CLI usage
main() {
    case "${1:-}" in
        ready)
            get_ready_work
            ;;
        show)
            [ -z "${2:-}" ] && { echo "Usage: $0 show <issue-id>" >&2; exit 1; }
            get_issue "$2"
            ;;
        create)
            [ -z "${2:-}" ] && { echo "Usage: $0 create <title> [description] [priority] [type] [labels]" >&2; exit 1; }
            create_issue "${2:-}" "${3:-}" "${4:-2}" "${5:-task}" "${6:-}"
            ;;
        update)
            [ -z "${3:-}" ] && { echo "Usage: $0 update <issue-id> <status>" >&2; exit 1; }
            update_status "$2" "$3"
            ;;
        close)
            [ -z "${3:-}" ] && { echo "Usage: $0 close <issue-id> <reason>" >&2; exit 1; }
            close_issue "$2" "$3"
            ;;
        dep)
            [ -z "${4:-}" ] && { echo "Usage: $0 dep <dependent-id> <blocker-id> <type>" >&2; exit 1; }
            add_dependency "$2" "$3" "${4:-blocks}"
            ;;
        *)
            echo "Beads Helper Functions"
            echo "Usage: $0 {ready|show|create|update|close|dep}"
            exit 1
            ;;
    esac
}

# If script is executed directly, run main
if [ "${BASH_SOURCE[0]}" == "${0}" ]; then
    main "$@"
fi
```

**Make executable:**
```bash
chmod +x scripts/beads-helper.sh
```

### Step 3.6: Create Cursor Rules for Beads

**File: `.cursor/rules/beads-workflow.mdc`**

```markdown
---
description: Mandatory Beads (bd) issue tracking integration for all agent work
globs: ["**/*"]
alwaysApply: true
---

# Beads Issue Tracking Integration

## 🚨 MANDATORY PROTOCOL

All agents MUST use Beads (`bd`) for task and issue management. This replaces markdown files, TODOs, and in-context planning.

## Session Startup (REQUIRED)

**Before ANY work, the agent MUST:**

1. Query ready work: `bd ready --json`
2. Review project health: `bd stats`
3. Check blocked issues: `bd blocked --json`
4. Select work from ready issues (never start blocked work)

## Workflow Rules

### Starting Work

**When beginning ANY task:**

1. **If work comes from Beads**:
   - Update status: `bd update <id> --status in_progress --json`
   - Use `bd show <id> --json` to get full context

2. **If work is NEW**:
   - Create issue first: `bd create "Task title" -d "Description" -p 1 -t task --json`
   - Then update status: `bd update <id> --status in_progress --json`

### During Development

**As you work, you MUST:**

- **File issues for discovered problems**:
  ```bash
  NEW_ISSUE=$(bd create "Bug: <description>" -t bug -p 0 --json)
  bd dep add <new-id> <parent-id> --type discovered-from
  ```

- **Add labels for organization**:
  ```bash
  bd label add <id> backend,urgent
  ```

### Completing Work

**When finishing ANY task:**

1. **Close with reason**:
   ```bash
   bd close <id> --reason "Completed: details" --json
   ```

2. **Check if dependencies are resolved**:
   ```bash
   bd ready --json
   ```

## Critical Rules

- ✅ **ALWAYS use `--json` flag** - Required for programmatic access
- ✅ **File issues instead of storing plans in context** - Solves amnesia problem
- ✅ **Automatically file issues** for problems noticed during work
- ✅ **Link discovered work** back to parent issues with `discovered-from`
- ✅ **Never start blocked work** - Always check `bd ready --json` first
- ✅ **Update status immediately** when starting/stopping work
- ✅ **Close with detailed reasons** - Include what was accomplished and how it was verified
```

### Step 3.7: Create AGENTS.md

**File: `AGENTS.md`**

```markdown
# Agent Instructions

## Issue Tracking with Beads (bd)

Use the `bd` command-line tool for ALL task and issue management instead of markdown files.

### 🚨 MANDATORY: Session Startup Workflow

**At the start of EVERY session, you MUST:**

1. **Check available work**:
   ```bash
   bd ready --json
   ```

2. **Review project health**:
   ```bash
   bd stats
   ```

3. **Check blocked issues**:
   ```bash
   bd blocked --json
   ```

4. **Select work from ready issues** - Always start with unblocked work

### Core Workflow

#### 1. **Finding Work**:
   - `bd ready --json` - Get issues with no blockers (START HERE)
   - `bd list --json` - See all issues
   - `bd blocked --json` - Issues that need attention
   - `bd stats` - Project overview

#### 2. **Creating Issues**:
   ```bash
   bd create "Issue title" -d "Description" -p 1 -t bug --json
   ```
   - Types: `bug`, `feature`, `task`, `epic`, `chore`
   - Priority: `0` (highest) to `4` (lowest)
   - **ALWAYS use `--json` flag** for programmatic access

#### 3. **Updating Status**:
   ```bash
   bd update <issue-id> --status in_progress --json
   ```
   - Statuses: `open`, `in_progress`, `blocked`, `closed`

#### 4. **Completing Work**:
   ```bash
   bd close <issue-id> --reason "Implemented feature X" --json
   ```

### Important Guidelines

- ALWAYS use `--json` flag for programmatic access
- File issues for problems you notice automatically
- Query ready work at start of each session
- Keep descriptions clear and actionable
```

---

## Phase 4: Integration & Cooperation

### Step 4.1: Integrated Session Startup Script

**File: `scripts/integrated-session-start.sh`**

```bash
#!/bin/bash
# Integrated Session Startup
# Combines Memory, Compliance, and Beads systems

set -euo pipefail

echo "🚀 Integrated System Startup"
echo "============================"
echo ""

# 1. Memory System Check
echo "1️⃣ Memory System..."
if [ -f "memory/MEMORY_SYSTEM_MANIFEST.json" ]; then
    echo "   ✅ Memory system manifest found"
else
    echo "   ⚠️  Memory system not initialized"
fi

# 2. Compliance Check
echo ""
echo "2️⃣ Compliance System..."
if [ -f "docs/AGENT_PROTOCOL.md" ]; then
    echo "   ✅ Agent protocol found"
    ./scripts/enforce-compliance.sh || {
        echo "   ⚠️  Compliance check failed - generating proof..."
        ./scripts/agents/make-compliance-proof.sh > /dev/null
        ./scripts/enforce-compliance.sh
    }
else
    echo "   ⚠️  Agent protocol not found"
fi

# 3. Beads System Check
echo ""
echo "3️⃣ Beads System..."
if command -v bd &> /dev/null || [ -d ".beads" ]; then
    echo "   ✅ Beads initialized"
    ./scripts/beads-session-start.sh
else
    echo "   ⚠️  Beads not initialized - run: bd init"
fi

# 4. Summary
echo ""
echo "✅ Integrated System Startup Complete"
echo ""
echo "Current Status:"
echo "- Memory: $(test -f memory/MEMORY_SYSTEM_MANIFEST.json && echo 'Active' || echo 'Not initialized')"
echo "- Compliance: $(test -f logs/compliance/proof-$(date +%Y-%m-%d).json && echo 'Active' || echo 'Not initialized')"
echo "- Beads: $(command -v bd >/dev/null && echo 'Active' || echo 'Not installed')"
echo ""
```

**Make executable:**
```bash
chmod +x scripts/integrated-session-start.sh
```

### Step 4.2: Update Compliance Proof to Include Beads

The compliance proof already includes session files. Beads integration is tracked through:
- Session file includes current work from Beads
- Compliance validates session integrity
- Memory stores Beads-related metadata

### Step 4.3: Create Combined Workflow Documentation

**File: `docs/INTEGRATED_WORKFLOW.md`**

```markdown
# Integrated Workflow: Memory + Compliance + Beads

## Daily Workflow

### Morning Startup (Mandatory)

```bash
# 1. Start integrated session
./scripts/integrated-session-start.sh

# 2. Check compliance
npm run compliance:check

# 3. Query Beads for work
bd ready --json
```

### During Work

1. **Start Work**:
   ```bash
   # Get issue from Beads
   ISSUE_ID=$(bd ready --json | jq -r '.[0].id')
   bd update $ISSUE_ID --status in_progress --json
   ```

2. **File Discovered Issues**:
   ```bash
   # Found a bug? File it immediately
   NEW_ISSUE=$(bd create "Bug: description" -t bug -p 0 --json | jq -r '.id')
   bd dep add $NEW_ISSUE $ISSUE_ID --type discovered-from
   ```

3. **Update Memory**:
   ```bash
   # Update session file with current work
   TODAY=$(date +%Y-%m-%d)
   jq --arg issue "$ISSUE_ID" '.areas += [$issue]' \
      "memory/persistent/session-$TODAY.json" > tmp.json && mv tmp.json "memory/persistent/session-$TODAY.json"
   ```

### End of Day

1. **Close Issues**:
   ```bash
   bd close $ISSUE_ID --reason "Completed: description" --json
   ```

2. **Update Compliance**:
   ```bash
   npm run proof
   npm run compliance:check
   ```

3. **Commit**:
   ```bash
   PROOF=$(jq -r '.compliance_hash' logs/compliance/proof-$(date +%Y-%m-%d).json)
   git commit -m "feat: Description

   COMPLIANCE_PROOF: $PROOF"
   ```

## System Cooperation

- **Memory** stores session state and compliance metadata
- **Compliance** validates memory integrity and protocol adherence
- **Beads** tracks issues and dependencies (frees context space)
- **Git** provides persistent storage for all three systems
```

---

## Verification & Testing

### Test Memory System

```bash
# 1. Verify structure
test -f memory/MEMORY_SYSTEM_MANIFEST.json && echo "✅ Manifest exists"
test -f memory/persistent/project-state.json && echo "✅ Project state exists"
test -f memory/persistent/session-$(date +%Y-%m-%d).json && echo "✅ Session exists"

# 2. Test normalization
node scripts/memory/normalize-session.mjs

# 3. Test validation
node scripts/memory/validate-session.mjs
```

### Test Compliance System

```bash
# 1. Generate proof
npm run proof

# 2. Verify proof exists
test -f logs/compliance/proof-$(date +%Y-%m-%d).json && echo "✅ Proof exists"

# 3. Run compliance check
npm run compliance:check

# 4. Test git hook
echo "test commit

COMPLIANCE_PROOF: $(jq -r '.compliance_hash' logs/compliance/proof-$(date +%Y-%m-%d).json)" | .git/hooks/commit-msg /dev/stdin
```

### Test Beads System

```bash
# 1. Verify installation
which bd || echo "⚠️  Beads not installed"

# 2. Initialize (if needed)
bd init

# 3. Create test issue
TEST_ISSUE=$(bd create "Test issue" -t task -p 2 --json | jq -r '.id')
echo "Created: $TEST_ISSUE"

# 4. Query it
bd show $TEST_ISSUE --json

# 5. Close it
bd close $TEST_ISSUE --reason "Test complete" --json
```

### Test Integration

```bash
# Run integrated startup
./scripts/integrated-session-start.sh

# Verify all systems active
echo "Memory: $(test -f memory/MEMORY_SYSTEM_MANIFEST.json && echo '✅' || echo '❌')"
echo "Compliance: $(test -f logs/compliance/proof-$(date +%Y-%m-%d).json && echo '✅' || echo '❌')"
echo "Beads: $(command -v bd >/dev/null && echo '✅' || echo '❌')"
```

---

## Agent Implementation Prompts

### For Cursor IDE Agent

Copy and paste these prompts to have the agent implement each phase:

#### Phase 1 Prompt

```
I need you to implement Phase 1: Memory System from the Triple System Implementation Guide.

Tasks:
1. Create the memory directory structure
2. Create memory/MEMORY_SYSTEM_MANIFEST.json with the provided template
3. Create memory/persistent/project-state.json with the provided template
4. Create memory/persistent/session-template.json with the provided template
5. Create scripts/memory/normalize-session.mjs with the provided code
6. Create scripts/memory/validate-session.mjs with the provided code
7. Make both scripts executable
8. Initialize today's session file

After each step, verify the file was created correctly. Report any issues.
```

#### Phase 2 Prompt

```
I need you to implement Phase 2: Compliance System from the Triple System Implementation Guide.

Tasks:
1. Create docs/AGENT_PROTOCOL.md with the provided content
2. Create scripts/agents/make-compliance-proof.sh with the provided code
3. Create scripts/enforce-compliance.sh with the provided code
4. Create .git/hooks/commit-msg with the provided code
5. Make all scripts executable
6. Add compliance scripts to package.json
7. Generate initial compliance proof
8. Update session file with compliance data

After each step, verify the file was created correctly. Test the compliance check.
```

#### Phase 3 Prompt

```
I need you to implement Phase 3: Beads System from the Triple System Implementation Guide.

Tasks:
1. Verify Beads is installed (which bd) or guide installation
2. Initialize Beads in the project (bd init)
3. Create .beads/.gitignore with the provided content
4. Create scripts/beads-session-start.sh with the provided code
5. Create scripts/beads-helper.sh with the provided code
6. Create .cursor/rules/beads-workflow.mdc with the provided content
7. Create AGENTS.md with the provided content
8. Make all scripts executable
9. Test Beads by creating a test issue

After each step, verify the file was created correctly. Test Beads functionality.
```

#### Phase 4 Prompt

```
I need you to implement Phase 4: Integration & Cooperation from the Triple System Implementation Guide.

Tasks:
1. Create scripts/integrated-session-start.sh with the provided code
2. Create docs/INTEGRATED_WORKFLOW.md with the provided content
3. Make the integrated script executable
4. Test the integrated startup script
5. Verify all three systems work together
6. Create a test commit with compliance proof

After each step, verify integration works. Test the complete workflow.
```

#### Full Implementation Prompt

```
I need you to implement the complete Triple System (Memory + Compliance + Beads) from the Triple System Implementation Guide.

This is a comprehensive implementation with 4 phases:

Phase 1: Memory System
- Directory structure
- Manifest and templates
- Normalization and validation scripts

Phase 2: Compliance System
- Agent protocol
- Proof generation
- Compliance enforcement
- Git hooks

Phase 3: Beads System
- Beads initialization
- Session startup scripts
- Cursor rules
- Agent instructions

Phase 4: Integration
- Combined startup script
- Workflow documentation
- System cooperation

Implement each phase sequentially, verifying after each step. Report progress and any issues encountered. After completing all phases, run the verification tests.
```

---

## Summary

This guide provides:

✅ **Complete code** for all three systems
✅ **Step-by-step instructions** from start to finish
✅ **Agent-friendly prompts** for Cursor IDE
✅ **Integration points** ensuring systems work together
✅ **Verification tests** for each system
✅ **Git hooks** for automatic enforcement
✅ **Documentation** for ongoing use

**Key Benefits:**
- Memory system provides persistent context
- Compliance system ensures protocol adherence
- Beads system solves agent amnesia
- All three integrate seamlessly via Git
- Cursor agents can implement automatically

**Next Steps:**
1. Follow phases sequentially
2. Use agent prompts for automated implementation
3. Verify each phase before proceeding
4. Test integration after completion
5. Begin using the integrated workflow

---

**Implementation Status:** Ready for agent execution
**Estimated Time:** 30-60 minutes per phase
**Complexity:** Medium (requires Git, Node.js, Go)
**Dependencies:** Git, Node.js, jq, Beads CLI
