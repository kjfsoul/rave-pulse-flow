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
    # Check today's session
    TODAY=$(date +%Y-%m-%d)
    if [ -f "memory/persistent/session-$TODAY.json" ]; then
        echo "   ✅ Today's session file exists"
        # Normalize session
        node scripts/memory/normalize-session.mjs 2>/dev/null || true
    else
        echo "   ⚠️  Today's session file missing - creating..."
        # Create from template if exists, or initialize
        if [ -f "memory/persistent/session-template.json" ]; then
            cp memory/persistent/session-template.json "memory/persistent/session-$TODAY.json"
            jq --arg today "$TODAY" \
               --arg branch "$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo 'main')" \
               '.date = $today | .branch = $branch' \
               "memory/persistent/session-$TODAY.json" > tmp.json && mv tmp.json "memory/persistent/session-$TODAY.json"
            node scripts/memory/normalize-session.mjs
        fi
    fi
else
    echo "   ⚠️  Memory system not initialized"
fi

# 2. Compliance Check
echo ""
echo "2️⃣ Compliance System..."
if [ -f "docs/AGENT_PROTOCOL.md" ]; then
    echo "   ✅ Agent protocol found"
    # Check if today's proof exists
    TODAY=$(date +%Y-%m-%d)
    if [ ! -f "logs/compliance/proof-$TODAY.json" ]; then
        echo "   ⚠️  Today's compliance proof missing - generating..."
        ./scripts/agents/make-compliance-proof.sh > /dev/null 2>&1 || {
            echo "   ❌ Failed to generate proof"
        }
    fi
    # Run compliance check
    if ./scripts/enforce-compliance.sh 2>&1 | grep -q "ALL COMPLIANCE CHECKS PASSED"; then
        echo "   ✅ Compliance check passed"
        COMPLIANCE_PROOF=$(jq -r '.compliance_hash' "logs/compliance/proof-$TODAY.json" 2>/dev/null || echo "")
        [ -n "$COMPLIANCE_PROOF" ] && echo "   📋 Proof: ${COMPLIANCE_PROOF:0:16}..."
    else
        echo "   ⚠️  Compliance check failed - generating proof..."
        ./scripts/agents/make-compliance-proof.sh > /dev/null 2>&1
        ./scripts/enforce-compliance.sh 2>&1 | tail -3 || true
    fi
else
    echo "   ⚠️  Agent protocol not found"
fi

# 3. Beads System Check
echo ""
echo "3️⃣ Beads System..."
if command -v bd &> /dev/null || [ -d ".beads" ]; then
    if command -v bd &> /dev/null; then
        echo "   ✅ Beads CLI available"
        # Run Beads session startup
        if [ -f "scripts/beads-session-start.sh" ]; then
            ./scripts/beads-session-start.sh
        else
            echo "   ⚠️  Beads session startup script not found"
            # Fallback: basic Beads check
            bd stats 2>/dev/null || echo "   ⚠️  Beads not initialized - run: bd init"
        fi
    else
        echo "   ⚠️  Beads CLI not found in PATH"
        if [ -d ".beads" ]; then
            echo "   ✅ Beads directory exists (CLI may need PATH: export PATH=\"\$PATH:\$HOME/go/bin\")"
        else
            echo "   ⚠️  Beads not initialized - run: bd init"
        fi
    fi
else
    echo "   ⚠️  Beads not initialized"
fi

# 4. Summary
echo ""
echo "=========================================="
echo "✅ Integrated System Startup Complete"
echo "=========================================="
echo ""
echo "Current Status:"
echo "- Memory: $(test -f memory/MEMORY_SYSTEM_MANIFEST.json && echo '✅ Active' || echo '❌ Not initialized')"
echo "- Compliance: $(test -f logs/compliance/proof-$(date +%Y-%m-%d).json && echo '✅ Active' || echo '❌ Not initialized')"
echo "- Beads: $(command -v bd >/dev/null && echo '✅ Active' || (test -d .beads && echo '⚠️  Directory exists (CLI not in PATH)' || echo '❌ Not installed'))"
echo ""
echo "Next Steps:"
echo "1. Review Beads ready work above"
echo "2. Select an issue: bd ready --json"
echo "3. Update status: bd update <id> --status in_progress --json"
echo "4. Get context: bd show <id> --json"
echo "5. Work on the issue"
echo ""
echo "For memory recovery, run: ./scripts/recover-context.sh"
echo ""
