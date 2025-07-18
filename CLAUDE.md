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

*(The rest of your `claude.md` file, including the Session Log and Changelog, would follow here.)*
