AGENT_PROTOCOL.md (Enhanced, Triple-System Compliant)

Version: 2.0.0
Last Updated: 2025-11-21
Status: ACTIVE & ENFORCED

🔱 PURPOSE

This protocol defines the mandatory rules every AI agent, automation script, and human contributor MUST follow when working on this project.

This file is law.
All actions must comply with:

Memory System Requirements

Compliance Proof System

Beads Task Discipline System

Failure to follow this protocol results in immediate workflow rejection, commit rejection, or session invalidation.

Agents must read this entire file at the start of every session.

🔱 MEMORY PROVIDER ORDER (STRICT)

All agents MUST use the following memory providers in this exact order:

LocalJson

Primary state files in memory/persistent/

Contains:

project-state.json

session-YYYY-MM-DD.json

Supabase

Secondary persistent provider

Stores long-term/relational data

Never overrides LocalJson

Beads

PRIMARY source of truth for tasks and issues

All work must originate from Beads

All planning must flow through Beads

.beads/issues.jsonl MUST be respected at all times

CRITICAL RULES

Provider order MUST always be:
LocalJson → Supabase

Beads governs all task selection and task memory

Agents MUST NOT invent tasks from memory or context

ByteRover is forbidden

No agent may load memory from any other provider or source

All memory operations MUST respect this hierarchy and never violate it

🔱 SESSION START REQUIREMENTS

At the beginning of every session (human or AI):

Mandatory Steps

Read AGENT_PROTOCOL.md

Load Memory Procedures from MEMORY_PROCEDURES.md

Load Triple System Summary + Implementation Guide

Run the integrated startup:

./scripts/integrated-session-start.sh


This runs:

memory normalization

compliance proof check

beads session startup

memory integrity validation

Run compliance check:

npm run compliance:check


Generate a fresh compliance proof:

scripts/agents/make-compliance-proof.sh


Record compliance proof hash in the active session file

Use ONLY Beads to select work:

bd ready --json


Log selected issue in session memory

Agents cannot begin ANY work without completing all nine steps.

🔱 SESSION JSON SCHEMA (STRICT)

Every session file MUST follow this schema exactly:

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
    "provider_order": "localjson,supabase"
  }
}


Violations immediately invalidate the session.
Validation is performed via:

node scripts/memory/validate-session.mjs

🔱 COMMIT REQUIREMENTS (NON-NEGOTIABLE)

Every commit MUST include the compliance proof hash, or the commit is automatically rejected by Git hooks.

Template:

feat: Description of changes made

COMPLIANCE_PROOF: <SHA256_HASH>

Git Hook Enforcement

Commits are blocked if:

COMPLIANCE_PROOF is missing

Proof hash is not valid length (64 hex chars)

Timestamp or proof file is missing

Memory schema does not validate

This enforcement is automatic and cannot be overridden.

🔱 BEADS WORKFLOW REQUIREMENTS

Agents MUST:

Query ready work:

bd ready --json


NEVER begin work that is “blocked”

ALWAYS update issue state before acting:

bd update <id> --status in_progress --json


When discovering bugs:

NEW=$(bd create "Bug: <desc>" -t bug -p 0 --json)
bd dep add $NEW <current-id> --type discovered-from


When finishing work:

bd close <id> --reason "Verified and completed" --json

Beads Is the ONLY Source of Truth

Agents MUST NOT:

Use conversation context as task memory

Invent tasks

Merge tasks without Beads involvement

Skip Beads when planning

Treat LLM history as authoritative

All task-based reasoning MUST go through Beads.

🔱 COMPLIANCE VERIFICATION

Before committing, agents MUST:

Run:

npm run compliance:check


Ensure:

Compliance proof exists

Provider order is correct

Memory schema is valid

No drift in session file

No missing fields

No mismatched proof timestamps

If compliance fails → AGENT MUST FIX THE VIOLATION OR STOP.

🔱 ENFORCEMENT RULES

Violations include:

Missing or incorrect compliance proof

Skipped session initialization

Invalid provider order

Starting work without Beads

Committing without proof hash

Editing session files manually

Changing provider order

Using ByteRover

Violations trigger:

Automatic commit rejection

Automatic session invalidation

Required remediation steps

Mandatory filing of a Compliance Incident Issue in Beads

🔱 VIOLATION REMEDIATION PROCEDURE

If an agent violates protocol, they must:

Immediately STOP work

File a compliance issue:

bd create "Compliance Incident: <description>" -t bug -p 0 --json


Add dependency to the issue they were working on:

bd dep add <incident-id> <current-id> --type discovered-from


Re-run:

./scripts/integrated-session-start.sh
npm run compliance:check


Regenerate compliance proof

Resume work ONLY when Beads shows the issue unblocked

🔱 UPDATES TO THIS PROTOCOL

When updating this file:

Increment version

Update Last Updated timestamp

Generate fresh compliance proof:

npm run proof


Notify all agents

Commit with:

chore: update AGENT_PROTOCOL.md

COMPLIANCE_PROOF: <new-proof-hash>


Restart the session so all agents reload the updated rules

🔱 FINAL STATEMENT

AGENT_PROTOCOL.md is the top-level enforcement document.
No agent, script, or model may bypass its rules.
No task may begin without full compliance.
No commit is allowed without proof.
No memory provider order deviation is tolerated.

This system ensures:

Zero drift

Complete traceability

Persistent context

High project integrity

Agent reliability across sessions and models

End of Protocol.
