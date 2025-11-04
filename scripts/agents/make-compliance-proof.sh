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
