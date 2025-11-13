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
