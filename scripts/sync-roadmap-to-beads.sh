#!/usr/bin/env bash
# Sync Prioritized Roadmap and Project Applications to Beads
# Ensures all tasks from PRIORITIZED_ROADMAP.md and PROJECT_APPLICATIONS.md are in Beads

set -eo pipefail

echo "🔄 Syncing Roadmap to Beads"
echo "=========================="
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

# Function to check if issue exists by title
issue_exists() {
    local title="$1"
    bd list --json 2>/dev/null | jq -r --arg title "$title" '.[] | select(.title == $title) | .id' | head -1 || echo ""
}

# Function to create issue if it doesn't exist
create_if_missing() {
    local title="$1"
    local description="$2"
    local priority="$3"
    local type="$4"
    local labels="$5"
    local parent_id="${6:-}"

    EXISTING=$(issue_exists "$title")
    if [ -n "$EXISTING" ]; then
        echo "  ⏭️  Exists: $title [$EXISTING]"
        echo "$EXISTING"
        return
    fi

    # Build command
    CMD="bd create \"$title\" -d \"$description\" -p $priority -t $type -l \"$labels\" --json"

    RESULT=$(eval "$CMD" 2>&1) || {
        echo "  ❌ Failed: $title"
        echo "  Error: $RESULT"
        echo ""
        return
    }

    NEW_ID=$(echo "$RESULT" | jq -r '.id // empty' || echo "")
    if [ -z "$NEW_ID" ] || [ "$NEW_ID" = "null" ]; then
        echo "  ❌ Failed to parse ID: $title"
        echo ""
        return
    fi

    # Link to parent if provided
    if [ -n "$parent_id" ] && [ -n "$NEW_ID" ]; then
        bd dep add "$NEW_ID" "$parent_id" --type parent-child 2>/dev/null || true
    fi

    echo "  ✅ Created: $title [$NEW_ID]"
    echo "$NEW_ID"
}

echo "📋 P1 (NOW) - Critical Path Epics"
echo "-----------------------------------"

# P1.1 Web Audio Engine Implementation
AUDIO_EPIC=$(create_if_missing \
    "P1.1: Web Audio Engine Implementation" \
    "Core user experience cannot function without proper audio engine. Current UI components (FLX10Deck, LiveEqualizer, SoundPackLoader) exist but have no real Web Audio API integration - audio is simulated/non-functional.

**Proposed Fix**: Implement complete Web Audio API engine with dual-deck mixing, crossfading, pitch control, echo effects, real-time waveform visualization, and mobile-optimized performance.

**Acceptance Criteria**:
- Real audio playback on both decks A/B with independent controls
- Functional crossfader with smooth audio transitions
- Pitch control and echo effects that actually modify audio
- Real-time waveform visualization linked to live frequency data
- Cross-browser compatibility (Chrome, Edge, Safari, Firefox)
- Mobile touch controls and responsive design
- Simulation mode with clear UI indicators when audio fails

**Est. Effort**: 3-4 weeks (High complexity, critical path)" \
    0 \
    epic \
    "p1,critical-path,audio,web-audio-api,priority-now")

# P1.2 Automated Testing Framework
TESTING_EPIC=$(create_if_missing \
    "P1.2: Automated Testing Framework" \
    "No automated testing framework implemented. Code quality and reliability not ensured. No regression testing capability.

**Proposed Fix**: Implement comprehensive testing framework with Jest for unit tests, Playwright for E2E tests, integration tests, and test coverage reporting.

**Acceptance Criteria**:
- 90%+ test coverage for core functionality
- Unit tests for all hooks and components
- E2E tests for critical user flows
- Automated CI/CD pipeline integration
- Test coverage reporting and metrics
- No linting or TypeScript errors in tests

**Est. Effort**: 2-3 weeks (High impact, medium complexity)" \
    0 \
    epic \
    "p1,critical-path,testing,ci-cd,priority-now")

# P1.3 Security & Secrets Management
SECURITY_EPIC=$(create_if_missing \
    "P1.3: Security & Secrets Management" \
    "Secret rotation missing. Security monitoring not implemented. Compliance automation incomplete.

**Proposed Fix**: Implement secure environment handling, secret rotation, security monitoring, and compliance automation.

**Acceptance Criteria**:
- Automated secret detection and rotation
- Security scanning in CI/CD pipeline
- Environment variable validation
- Security audit logging
- Compliance with security best practices
- No hardcoded secrets in codebase

**Est. Effort**: 1-2 weeks (High impact, medium complexity)" \
    0 \
    epic \
    "p1,critical-path,security,secrets,priority-now")

echo ""
echo "📋 P2 (NEXT) - Feature Uplift Epics"
echo "-------------------------------------"

# P2.1 Real-time Festival Voting System
VOTING_EPIC=$(create_if_missing \
    "P2.1: Real-time Festival Voting System" \
    "Primary engagement feature is non-functional without real-time updates. Database framework exists but no real-time vote count updates, live leaderboard, or enhanced voting UX flow.

**Proposed Fix**: Implement real-time voting system with Supabase Realtime, live vote count updates, animated leaderboards, enhanced voting UX flow, and scheduling features.

**Acceptance Criteria**:
- Real-time vote count updates across all clients
- Live leaderboard with animations and rankings
- Enhanced voting UX with visual feedback
- Festival scheduling and event management
- Anti-abuse measures and vote integrity
- Mobile-optimized voting interface

**Est. Effort**: 2-3 weeks (High impact, medium complexity)" \
    1 \
    epic \
    "p2,feature-uplift,voting,realtime,priority-next")

# P2.2 Challenge Platform & PLUR Streaks
CHALLENGE_EPIC=$(create_if_missing \
    "P2.2: Challenge Platform & PLUR Streaks" \
    "User engagement and content creation blocked without proper challenge system. Challenge submission UI and file upload missing. Real-time challenge updates and social features not implemented.

**Proposed Fix**: Build complete challenge platform with submission UI, file upload, real-time updates, PLUR points system, streak tracking, and social sharing features.

**Acceptance Criteria**:
- Challenge submission interface with file upload
- Real-time challenge updates and notifications
- PLUR points system and streak tracking
- Social sharing features
- Cheat-prevention measures
- Mobile-optimized challenge interface

**Est. Effort**: 2-3 weeks (High impact, medium complexity)" \
    1 \
    epic \
    "p2,feature-uplift,challenges,plur,priority-next")

# P2.3 Marketplace Foundation & Stripe Integration
MARKETPLACE_EPIC=$(create_if_missing \
    "P2.3: Marketplace Foundation & Stripe Integration" \
    "Monetization blocked without payment processing. Stripe payment integration missing. Product listings and e-commerce UI not implemented.

**Proposed Fix**: Implement complete soundpacks marketplace with Stripe integration, product listings, e-commerce UI, digital downloads, inventory management, and secure checkout flow.

**Acceptance Criteria**:
- Stripe payment processing integration
- Product listings and catalog management
- Secure checkout flow
- Digital download system
- Inventory management
- Mobile-optimized marketplace interface

**Est. Effort**: 2-3 weeks (Medium impact, medium complexity)" \
    1 \
    epic \
    "p2,feature-uplift,marketplace,stripe,priority-next")

# P2.4 Mobile Optimization & Accessibility
MOBILE_EPIC=$(create_if_missing \
    "P2.4: Mobile Optimization & Accessibility" \
    "Excludes mobile users and doesn't meet accessibility standards. Touch controls for mobile missing. Accessibility features not implemented.

**Proposed Fix**: Implement full mobile optimization with touch controls, accessibility compliance (WCAG 2.1 AA), low-end device support, and responsive design improvements.

**Acceptance Criteria**:
- Touch controls for mobile devices
- WCAG 2.1 AA compliance
- Responsive design for all screen sizes
- Performance optimization for low-end devices
- Accessibility features (screen readers, keyboard navigation)
- Mobile-first user experience

**Est. Effort**: 2-3 weeks (Medium impact, medium complexity)" \
    1 \
    epic \
    "p2,feature-uplift,mobile,accessibility,priority-next")

# P2.5 Supabase Functions & API Endpoints
API_EPIC=$(create_if_missing \
    "P2.5: Supabase Functions & API Endpoints" \
    "Backend functionality incomplete. API endpoints not implemented. Migration management incomplete. Local/parity environment issues.

**Proposed Fix**: Implement complete Supabase functions with proper API endpoints, migration management, local environment parity, and production deployment.

**Acceptance Criteria**:
- Complete API endpoints for all features
- Migration management system
- Local/production environment parity
- Proper error handling and validation
- API documentation
- Performance optimization

**Est. Effort**: 1-2 weeks (Medium impact, medium complexity)" \
    1 \
    epic \
    "p2,feature-uplift,api,supabase,priority-next")

echo ""
echo "📋 P3 (LATER) - Nice-to-Haves Epics"
echo "------------------------------------"

# P3.1 Advanced Visual FX & Animations
VISUAL_EPIC=$(create_if_missing \
    "P3.1: Advanced Visual FX & Animations" \
    "Basic visual effects exist but advanced features like professional lighting, particle systems, and dynamic backgrounds not implemented.

**Proposed Fix**: Implement advanced visual effects including professional lighting systems, particle effects, dynamic backgrounds, and comprehensive analytics.

**Est. Effort**: 2-3 weeks (Low impact, high complexity)" \
    2 \
    epic \
    "p3,nice-to-have,visual-fx,animations,priority-later")

# P3.2 Agentic Tooling Integration
AGENTIC_EPIC=$(create_if_missing \
    "P3.2: Agentic Tooling Integration" \
    "AI capabilities not leveraged for automation. No integration between deployed agents and application.

**Proposed Fix**: Integrate Claude Code implementer, Manus.ai orchestrator, and automated AI tooling for development and content generation workflows.

**Est. Effort**: 2-3 weeks (Low impact, high complexity)" \
    2 \
    epic \
    "p3,nice-to-have,ai,automation,priority-later")

# P3.3 Long-tail Analytics & Observability
ANALYTICS_EPIC=$(create_if_missing \
    "P3.3: Long-tail Analytics & Observability" \
    "Unable to monitor system health or user behavior comprehensively. No production monitoring. No error tracking.

**Proposed Fix**: Implement comprehensive monitoring with basic metrics collection, error reporting, performance monitoring, and user analytics with real-time dashboards.

**Est. Effort**: 1-2 weeks (Low impact, medium complexity)" \
    2 \
    epic \
    "p3,nice-to-have,analytics,observability,priority-later")

echo ""
echo "📋 P0 MVP Features (from PROJECT_APPLICATIONS.md)"
echo "---------------------------------------------------"

# P0.1 EDM Artist Database
ARTIST_DB_EPIC=$(create_if_missing \
    "P0 MVP: EDM Artist & Event Database" \
    "Foundation: Comprehensive artist profiles, track library, venue data, event management. Timeline: 4 days.

**Features**:
- Artist profiles (name, genre, bio, socials)
- Track/mix upload system
- Venue database
- Event creation" \
    0 \
    epic \
    "p0,mvp,database,artists,events,priority-critical")

# P0.2 Lineup Curation System
LINEUP_EPIC=$(create_if_missing \
    "P0 MVP: Lineup Curation Engine (EDM Shuffle)" \
    "Core algorithm: Generate optimal event lineups based on artist compatibility, user preferences, genre balance, time constraints. AI-powered recommendations. Timeline: 6 days.

**Features**:
- EDM Shuffle algorithm (intelligent lineup generation)
- User preference learning
- Genre balancing
- Time slot optimization" \
    0 \
    epic \
    "p0,mvp,algorithm,shuffle,curation,priority-critical")

# P0.3 User Voting System
USER_VOTING_EPIC=$(create_if_missing \
    "P0 MVP: User Voting & Preferences" \
    "Democratic lineup selection: Users vote on artists, upvote/downvote lineups, track preferences. Real-time tallying. Timeline: 3 days.

**Features**:
- Vote on lineup proposals
- Artist popularity tracking
- Community-driven rankings
- Real-time vote tallies" \
    0 \
    epic \
    "p0,mvp,voting,community,priority-critical")

# P0.4 Event Discovery
DISCOVERY_EPIC=$(create_if_missing \
    "P0 MVP: Event Discovery & RSS Integration" \
    "Aggregate events from RSS, listings, user submissions. Search, filter, calendar. Timeline: 4 days.

**Features**:
- RSS feed aggregation
- Event listing pages
- Search & filter
- Calendar integration" \
    0 \
    epic \
    "p0,mvp,discovery,rss,priority-critical")

echo ""
echo "📋 Creating Key Tasks Under Epics"
echo "----------------------------------"

# Link existing GitHub issues to appropriate epics
echo "Linking existing GitHub issues to epics..."

# Voting-related issues
VOTING_ISSUES=$(bd list --json | jq -r '.[] | select(.title | contains("Vote") or contains("Leaderboard") or contains("Voting")) | .id')
for issue_id in $VOTING_ISSUES; do
    if [ -n "$issue_id" ] && [ -n "$VOTING_EPIC" ]; then
        bd dep add "$issue_id" "$VOTING_EPIC" --type parent-child 2>/dev/null || true
        echo "  🔗 Linked $issue_id to Voting Epic"
    fi
done

# Challenge-related issues
CHALLENGE_ISSUES=$(bd list --json | jq -r '.[] | select(.title | contains("Challenge") or contains("Submission") or contains("PLUR")) | .id')
for issue_id in $CHALLENGE_ISSUES; do
    if [ -n "$issue_id" ] && [ -n "$CHALLENGE_EPIC" ]; then
        bd dep add "$issue_id" "$CHALLENGE_EPIC" --type parent-child 2>/dev/null || true
        echo "  🔗 Linked $issue_id to Challenge Epic"
    fi
done

# Marketplace-related issues
MARKETPLACE_ISSUES=$(bd list --json | jq -r '.[] | select(.title | contains("Stripe") or contains("Marketplace") or contains("Checkout") or contains("Digital Delivery")) | .id')
for issue_id in $MARKETPLACE_ISSUES; do
    if [ -n "$issue_id" ] && [ -n "$MARKETPLACE_EPIC" ]; then
        bd dep add "$issue_id" "$MARKETPLACE_EPIC" --type parent-child 2>/dev/null || true
        echo "  🔗 Linked $issue_id to Marketplace Epic"
    fi
done

# Admin-related issues
ADMIN_ISSUES=$(bd list --json | jq -r '.[] | select(.title | contains("RBAC") or contains("Admin")) | .id')
for issue_id in $ADMIN_ISSUES; do
    if [ -n "$issue_id" ]; then
        # Link to Admin epic if it exists, or create relationship
        echo "  🔗 Found admin issue: $issue_id"
    fi
done

# Audio-related issues
AUDIO_ISSUES=$(bd list --json | jq -r '.[] | select(.title | contains("FX") or contains("Recording") or contains("Waveform") or contains("Stems")) | .id')
for issue_id in $AUDIO_ISSUES; do
    if [ -n "$issue_id" ] && [ -n "$AUDIO_EPIC" ]; then
        bd dep add "$issue_id" "$AUDIO_EPIC" --type parent-child 2>/dev/null || true
        echo "  🔗 Linked $issue_id to Audio Epic"
    fi
done

echo ""
echo "===================================="
echo "✅ Roadmap Sync Complete"
echo ""
echo "📊 Summary:"
bd stats
echo ""
echo "View by priority:"
echo "  P0 (Critical): bd list --label p0 --json"
echo "  P1 (Now): bd list --label p1 --json"
echo "  P2 (Next): bd list --label p2 --json"
echo "  P3 (Later): bd list --label p3 --json"
echo ""
