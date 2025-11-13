# AGENT PROTOCOL

**Version:** 1.0.0
**Last Updated:** 2025-11-12
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

```json
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
```

## Commit Requirements

All commits MUST include COMPLIANCE_PROOF in the commit message:

```
feat: Description

COMPLIANCE_PROOF: <SHA256_HASH>
```

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
