# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## CRITICAL: Read These First

1. **ALWAYS** read `CLAUDE_INTEGRITY_RULES.md` before any work
2. **ALWAYS** check current task in `IMPLEMENTATION_MICROTASKS.md`
3. **NEVER** fabricate features, data, or progress
4. **ASK** for clarification if context is missing

## 🎉 **CURRENT PROJECT STATUS: MVP COMPLETE**

**All 10 core authentication and persistence tasks completed (Jan 10, 2025)**

- Full Supabase integration with user authentication
- Complete database schema with all core features
- All major routes protected and integrated with user data
- Ready for beta testing and production deployment

## Essential Development Commands

**Primary Development:**

```bash
# Start development server (runs on port 8080 with IPv6 binding)
npm run dev

# Build for production
npm run build

# Build in development mode  
npm run build:dev

# Run linting (ESLint)
npm run lint

# Preview production build
npm run preview
```

**Alternative with Bun:**

```bash
# Uses bun.lockb for faster performance
bun run dev
bun run build
```

## Environment Setup

1. **Node.js**: Use latest LTS
2. **Package Manager**: npm or bun (both lockfiles present)
3. **Environment Variables**: Stored in `.env` (Supabase, Stripe, OpenAI keys)
   - **CRITICAL**: Never commit `.env` - contains sensitive API keys
   - Variables documented in individual service files (`src/lib/`)
4. **Port**: Development server runs on port 8080 (vite.config.ts)
5. **Host**: Uses IPv6 `::` binding for network accessibility

## Critical Development Rules

**MANDATORY INTEGRITY RULES** (from `CLAUDE_INTEGRITY_RULES.md`):

- NO fabricated or exaggerated progress claims
- NO placeholder/mock data without explicit `// PLACEHOLDER` or `/** TODO */` comments
- Test and verify ALL code before claiming completion
- Work on ONE microtask at a time, in order from `IMPLEMENTATION_MICROTASKS.md`
- If blocked, immediately disclose and suggest alternatives
- Cross-reference documentation at EVERY step
- **(NEW)** **Log all development actions to the `a_mem` store.** This is a non-negotiable background task for building agentic memory.
  - **Shell Commands:** All terminal commands (`npm`, `git`, etc.) MUST be prefixed with the `memlog-edm` alias.
  - **Python Code:** This project does not currently have Python services. If any are added, they MUST use the `@log_invocation` decorator.
- If violation occurs, document and correct immediately

## Architecture Overview

### Tech Stack

- **Frontend**: React 18.3.1 + TypeScript + Vite 5.4.1 (SWC for fast compilation)
- **UI Framework**: Tailwind CSS with custom EDM/neon theme
- **Component Library**: shadcn/ui + Radix UI primitives
- **State Management**: TanStack Query + React Context (AudioContext, AuthContext)
- **Routing**: React Router DOM 6.26.2
- **Animations**: Framer Motion 12.18.1
- **Web Audio**: Web Audio API for DJ Mix Station
- **Backend**: Supabase (authentication, database)
- **Payment**: Stripe integration
- **Forms**: React Hook Form + Zod validation
- **Core Routes & Features**: `/`, `/archetype-quiz`, `/shuffle-feed`, `/marketplace`, `/festival`, `/dj-mix`
- **Web Audio Architecture (Critical Feature)**: The centerpiece feature implementing sophisticated Web Audio.
  - Dual Deck System: Independent audio chains for each deck
  - Audio Chain Flow: Source → Gain → Effects → Analyser → Destination
  - Real-time Effects: Echo/delay with feedback control
  - Crossfading: Smooth transitions between decks
  - Waveform Visualization: Real-time frequency analysis with canvas rendering
- **TypeScript Configuration**:
  - Path alias: `@/` maps to `./src/`
  - **Relaxed checking**: noImplicitAny: false, strictNullChecks: false
- **Testing**: No test framework currently configured.
- **Key Documentation (Root Directory)**: `CLAUDE_INTEGRITY_RULES.md`, `IMPLEMENTATION_MICROTASKS.md`, `claudeupdate.md`, `PRD.md`, `DOCUMENTATION_INDEX.md`
- **EDM/Neon Theme System**: Uses custom Tailwind theme with neon colors, bass colors, and custom animations.
- **Development Best Practices**: Follow existing patterns, use neon theme, leverage shadcn/ui, audio-first, cross-reference docs, update progress in `claudeupdate.md`.
- **Multi-Agent Workflow**: Supports multiple AI assistants (Claude Code, Gemini CLI, Roo Code).

## Session Log

### Session: January 26, 2025 - Initial Session & Onboarding Compliance
- **Time**: Started new session
- **Agent**: Claude Code (claude-opus-4-20250514)
- **Status**: Session initiation and onboarding compliance verification
- **Summary**: 
  - Read and acknowledged all mandatory files:
    - ✅ `CLAUDE_INTEGRITY_RULES.md` - Understood no fabrication, brutal honesty requirements
    - ✅ `claude.md` - Reviewed project status (MVP Complete)
    - ✅ `claudeupdate.md` - Confirmed Phase 1 authentication & persistence completed
    - ✅ `IMPLEMENTATION_MICROTASKS.md` - Phase 1 complete, Phase 2 testing next
    - ✅ `README.md` - Project overview understood
    - ✅ `gemini.md` - Multi-agent workflow acknowledged
    - ✅ `PRD.md` - Product requirements reviewed
  - **Key Project State**:
    - MVP Complete with full Supabase authentication
    - All 10 core auth/persistence tasks finished (Jan 10, 2025)
    - Database schema ready for production deployment
    - Next phase: Testing & Production Readiness
  - **Mandatory Logging**: Acknowledged requirement to use `memlog-edm` alias for all shell commands
  - **Working Directory**: `/Users/kfitz/EDM Shuffle/rave-pulse-flow`
  - **Git Status**: Clean on main branch

### Session: January 26, 2025 - Continued Session & Re-Onboarding
- **Time**: Continued session after context reset
- **Agent**: Claude Code (claude-sonnet-4-20250514)
- **Status**: Re-onboarding compliance verification completed
- **Summary**: 
  - Re-read and acknowledged all mandatory files:
    - ✅ `CLAUDE_INTEGRITY_RULES.md` - Reconfirmed no fabrication, brutal honesty requirements
    - ✅ `claude.md` - Current session documentation reviewed
    - ✅ `gemini.md` - Multi-agent workflow re-acknowledged
    - ✅ `claudeupdate.md` - Confirmed MVP completion with recent CrewAI and FLX10Deck work
    - ✅ `README.md` - Project overview reconfirmed
    - ✅ `IMPLEMENTATION_MICROTASKS.md` - Phase 1 complete, Phase 2 testing priorities understood
  - **Key Project State**:
    - MVP Complete with full Supabase authentication and persistence
    - Recent additions: CrewAI production deployment and FLX10Deck component
    - All 10 core auth/persistence tasks finished (Jan 10, 2025)
    - Ready for beta testing and production deployment
    - Next priorities: Integration testing and production readiness
  - **Mandatory Logging**: Re-acknowledged requirement to use `memlog-edm` alias for all shell commands
  - **Working Directory**: `/Users/kfitz/EDM Shuffle/rave-pulse-flow`
  - **Git Status**: Modified files including CLAUDE.md, .env files, CrewAI components

### Session: January 26, 2025 - Extended DJ Station Development
- **Time**: Extended development session 
- **Agent**: Claude Code (claude-sonnet-4-20250514)
- **Status**: Major DJ Station enhancements completed with performance optimizations
- **Key Accomplishments**:
  - ✅ **LiveEqualizer Integration**: Built and integrated 10-band real-time equalizer
    - Web Audio API BiquadFilterNodes (32Hz-16kHz)
    - Interactive sliders with -12dB to +12dB range
    - Canvas frequency visualizer with toggle
    - Seamless audio chain integration
    - Fixed audio initialization and routing issues
  - ✅ **Sound Pack Loader System**: Complete audio stem management
    - `/public/soundpacks/` directory structure with manifest.json
    - Three sound pack categories with metadata
    - Preview functionality with volume control
    - Deck A/B assignment with visual feedback
    - Supabase persistence for user selections
    - **Enhanced procedural audio generation** with realistic EDM sounds
    - Audio buffer caching and memory management
  - ✅ **DJ Expert Agent**: Complete coaching system implementation
    - Three-level tutorial system (Beginner/Intermediate/Advanced)
    - Real-time guidance bubbles and progress tracking
    - XP rewards and achievement system
    - Contextual tips based on DJ station state
  - ✅ **Performance Optimizations**: Resolved all reported issues
    - Fixed UI responsiveness and freezing problems
    - Optimized procedural audio generation (2-4s duration)
    - Throttled canvas visualizer to 30 FPS
    - Debounced EQ updates for smooth performance
    - Resolved Deck B playback failures
  - ✅ **Enhanced Audio Quality**: Upgraded procedural sound generation
    - Realistic 808-style kicks with sub-bass and click
    - Complex wobble bass with multiple oscillators and distortion
    - Professional synth leads with detuned oscillators
    - House piano with chord progressions and rich harmonics
    - Vocal chops with formant synthesis and chopping gates
    - High-quality hi-hats with proper frequency content
  - **Technical Details**:
    - Audio chain: Decks → Master Mixer → LiveEqualizer → Destination
    - Database integration: `soundPackOperations` for persistence
    - Error handling: Graceful fallbacks and user feedback
    - Build status: All components compile successfully
    - Performance: Stable 30 FPS, responsive UI, smooth audio
  - **Working Directory**: `/Users/kfitz/EDM Shuffle/rave-pulse-flow`
  - **Status**: All major components complete and optimized
  - ✅ **Shuffle Challenge System**: Complete gamified challenge module
    - JSON-based daily quest system with 10+ unique challenges
    - Advanced XP system with streak bonuses and level progression
    - Visual festival map progression (6 stages from Underground Club to EDM Hall of Fame)
    - Complete Supabase integration for user stats, quest progress, and rewards
    - Exists.ai analytics integration for advanced user behavior tracking
    - Real-time quest progress monitoring based on DJ station interactions
    - Gamified UX with animated components and achievement systems
    - Full routing integration and homepage navigation button

## Changelog

### January 26, 2025
- Claude Code session initiated with full onboarding compliance
- Acknowledged all integrity rules and project documentation
- Confirmed MVP completion status and next phase priorities
