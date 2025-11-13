#!/usr/bin/env bash
# Break down P3.2 Agentic Tooling Integration epic into specific tasks

set -eo pipefail

EPIC_ID="rave-pulse-flow-qpm"

echo "🔧 Breaking down Agentic Tooling Integration Epic"
echo "================================================="
echo "Epic ID: $EPIC_ID"
echo ""

# Check if bd is available
if ! command -v bd &> /dev/null; then
    if [[ ":$PATH:" != *":$HOME/go/bin:"* ]]; then
        export PATH="$PATH:$HOME/go/bin"
    fi
    if ! command -v bd &> /dev/null; then
        echo "❌ ERROR: 'bd' command not found"
        exit 1
    fi
fi

# Function to create task if it doesn't exist
create_task() {
    local title="$1"
    local description="$2"
    local priority="$3"
    local labels="$4"

    EXISTING=$(bd list --json 2>/dev/null | jq -r --arg title "$title" '.[] | select(.title == $title) | .id' | head -1 || echo "")

    if [ -n "$EXISTING" ]; then
        echo "  ⏭️  Exists: $title [$EXISTING]"
        echo "$EXISTING"
        return
    fi

    RESULT=$(bd create "$title" -d "$description" -p "$priority" -t task -l "$labels" --json 2>&1) || {
        echo "  ❌ Failed: $title"
        return
    }

    NEW_ID=$(echo "$RESULT" | jq -r '.id // empty' || echo "")
    if [ -z "$NEW_ID" ] || [ "$NEW_ID" = "null" ]; then
        echo "  ❌ Failed to parse ID: $title"
        return
    fi

    # Link to epic
    bd dep add "$NEW_ID" "$EPIC_ID" --type parent-child 2>/dev/null || true

    echo "  ✅ Created: $title [$NEW_ID]"
    echo "$NEW_ID"
}

echo "📋 Creating Agentic Tooling Tasks"
echo "----------------------------------"

# Task 1: CrewAI Integration
TASK1=$(create_task \
    "Integrate CrewAI Agents into Application Workflows" \
    "Connect the 10 CrewAI agents (Festival Scouter, Beat Mixer, Lineup Curator, etc.) to actual application features.

**Acceptance Criteria**:
- Festival Scouter automatically discovers and adds events via RSS feeds
- Beat Mixer generates audio content for DJ Station
- Lineup Curator provides AI-powered artist recommendations
- Agents trigger automatically based on user actions or scheduled tasks
- Agent results are stored in Supabase and displayed in UI

**Implementation Steps**:
1. Create Supabase Edge Functions for each agent workflow
2. Set up agent orchestration in crew.py
3. Add API endpoints for agent-triggered actions
4. Integrate agent outputs into frontend components
5. Add error handling and retry logic

**Est. Effort**: 1 week" \
    2 \
    "p3,agents,crewai,integration,automation")

# Task 2: Claude Code Implementer Integration
TASK2=$(create_task \
    "Integrate Claude Code Implementer for Automated Development" \
    "Set up automated code generation and implementation workflows using Claude Code Implementer.

**Acceptance Criteria**:
- Work orders from Beads/GitHub automatically trigger code generation
- Generated code is validated before deployment
- Tests are auto-generated for new features
- Pull requests are created automatically
- Human approval required for production changes

**Implementation Steps**:
1. Connect agent/main.ts to Beads issue tracking
2. Set up work order parsing from YAML
3. Implement code validation pipeline
4. Create PR automation via GitHub API
5. Add approval workflow and notifications

**Est. Effort**: 1 week" \
    2 \
    "p3,agents,claude,automation,code-generation")

# Task 3: Manus.ai Orchestrator Setup
TASK3=$(create_task \
    "Set up Manus.ai Orchestrator for Workflow Management" \
    "Configure Manus.ai orchestrator to manage agent workflows, ticket monitoring, and PR management.

**Acceptance Criteria**:
- Automatic ticket monitoring from GitHub/Beads
- Work order generation from tickets
- Agent assignment based on task type
- Progress tracking and status updates
- PR management and quality gates

**Implementation Steps**:
1. Configure Manus.ai API integration
2. Set up ticket monitoring webhooks
3. Create work order templates
4. Implement agent routing logic
5. Add progress tracking dashboard

**Est. Effort**: 3-5 days" \
    2 \
    "p3,agents,manus-ai,orchestration,workflow")

# Task 4: Agent Registry and Tool Integration
TASK4=$(create_task \
    "Complete Agent Registry and Tool Integration" \
    "Finish implementing all tools defined in agents/registry.json and ensure they're properly integrated.

**Acceptance Criteria**:
- Code Search Tool fully functional
- Test Generator creates comprehensive test suites
- Security Auditor runs automatically on PRs
- All tools accessible via unified API
- Tool usage tracked and logged

**Implementation Steps**:
1. Complete code_search_tool implementation
2. Enhance test_generator with coverage analysis
3. Integrate security_auditor into CI/CD
4. Create unified agent API gateway
5. Add tool usage analytics

**Est. Effort**: 1 week" \
    2 \
    "p3,agents,tools,registry,integration")

# Task 5: Automated Content Generation Workflows
TASK5=$(create_task \
    "Implement Automated Content Generation Workflows" \
    "Set up agents to automatically generate content for the platform (lineups, challenges, marketplace items).

**Acceptance Criteria**:
- Lineup Curator generates event lineups automatically
- Challenge content created by Engagement Alchemist
- Marketplace descriptions generated by Fashion Futurist
- Content quality validated before publishing
- Human review workflow for generated content

**Implementation Steps**:
1. Create content generation triggers
2. Set up quality validation pipeline
3. Implement human review queue
4. Add content approval workflow
5. Track content performance metrics

**Est. Effort**: 1 week" \
    2 \
    "p3,agents,content-generation,automation")

# Task 6: Agent Monitoring and Observability
TASK6=$(create_task \
    "Add Agent Monitoring and Observability" \
    "Implement monitoring, logging, and observability for all agent activities.

**Acceptance Criteria**:
- Agent execution logs stored in Supabase
- Performance metrics tracked (execution time, success rate)
- Error tracking and alerting
- Agent usage dashboard
- Cost tracking for API usage

**Implementation Steps**:
1. Set up agent execution logging
2. Create metrics collection system
3. Implement error tracking and alerts
4. Build agent dashboard UI
5. Add cost tracking and optimization

**Est. Effort**: 3-5 days" \
    2 \
    "p3,agents,monitoring,observability,analytics")

echo ""
echo "===================================="
echo "✅ Epic Breakdown Complete"
echo ""
echo "Created tasks under epic: $EPIC_ID"
echo ""
echo "View epic with tasks:"
echo "  bd dep tree $EPIC_ID"
echo ""
