# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## CRITICAL: Read These First
1. **ALWAYS** read `CLAUDE_INTEGRITY_RULES.md` before any work
2. **ALWAYS** check current task in `IMPLEMENTATION_MICROTASKS.md`
3. **NEVER** fabricate features, data, or progress
4. **ASK** for clarification if context is missing

## Essential Development Commands

```bash
# Start development server (runs on port 8080)
npm run dev

# Build for production
npm run build

# Build in development mode
npm run build:dev

# Run linting
npm run lint

# Preview production build
npm run preview
```

## Critical Development Rules

**MANDATORY INTEGRITY RULES** (from `CLAUDE_INTEGRITY_RULES.md`):
- NO fabricated or exaggerated progress claims
- NO placeholder/mock data without explicit `// PLACEHOLDER` or `/** TODO */` comments
- Test and verify ALL code before claiming completion
- Work on ONE microtask at a time, in order from `IMPLEMENTATION_MICROTASKS.md`
- If blocked, immediately disclose and suggest alternatives
- Cross-reference documentation at EVERY step
- If violation occurs, document and correct immediately

## Architecture Overview

### Tech Stack
- **Frontend**: React 18.3.1 + TypeScript + Vite 5.4.1
- **UI Framework**: Tailwind CSS with custom EDM/neon theme
- **Component Library**: shadcn/ui + Radix UI primitives
- **State Management**: TanStack Query + React Context (AudioContext)
- **Routing**: React Router DOM 6.26.2
- **Animations**: Framer Motion 12.18.1
- **Web Audio**: Web Audio API for DJ Mix Station
- **Backend (Planned)**: Supabase

### Project Structure
```
src/
├── components/       # All UI components
│   ├── ui/          # shadcn/ui base components
│   ├── audio-ui/    # Audio-specific components
│   └── VisualFX/    # Visual effects components
├── contexts/        # React contexts (AudioContext)
├── hooks/           # Custom React hooks
├── pages/           # Route components
└── lib/             # Utilities and helpers
```

### Core Routes
- `/` - Landing page
- `/archetype-quiz` - User personality quiz
- `/shuffle-feed` - Social feed
- `/marketplace` - Virtual marketplace
- `/festival` - Festival voting stage
- `/dj-mix` - DJ Mix Station with Web Audio API

### Key Features to Understand
1. **DJ Mix Station**: Real-time audio mixing with dual decks using Web Audio API
2. **Festival Voting**: Community-driven lineup voting system
3. **PLUR System**: Gamification mechanics throughout the platform
4. **Archetype System**: User personality/avatar framework
5. **Visual FX**: Neon-themed animations and effects using Tailwind + Framer Motion
6. **Crowd Engagement**: Confetti, emoji reactions, interactive challenges

### TypeScript Configuration
- Path alias: `@/` maps to `./src/`
- Relaxed type checking enabled (noImplicitAny: false, strictNullChecks: false)
- Use existing type patterns when possible
- Gemini CLI should be used for TypeScript validation where feasible

### Testing
Currently no test framework is configured. When implementing tests:
- Ask user for preferred testing framework before proceeding
- Do not assume Jest, Vitest, or any specific framework

### Important Documentation (Root Directory)
**Core Rules & Process:**
- `CLAUDE_INTEGRITY_RULES.md` - Mandatory rules for all contributors
- `IMPLEMENTATION_MICROTASKS.md` - Exhaustive task roadmap (work in order!)
- `claudeupdate.md` - Progress tracking (update after completing tasks)

**Product & Technical Specs:**
- `PRD.md` - Product Requirements Document
- `FRS.md` - Functional Requirements Specification
- `MASTERPLAN.md` - Strategic project roadmap
- `technical_architecture.md` - Technical architecture details
- `UI_UX_STRUCTURE.md` - Component layout and navigation flows

**Feature Documentation:**
- `AUDIO_UI_COMPONENTS.md` - Audio component specifications
- `CrowdFXLayer.md` - Crowd effects documentation
- `SubscribeModal.md` - Subscribe CTA documentation

**Additional Docs:**
- `README.md` - Project overview and setup
- `project_overview.md` - Quick onboarding summary

**Pending Documentation:**
- `DOCUMENTATION_INDEX.md` - Will contain full doc index
- `FEATURE_REALITY_MATRIX.md` - Feature status tracking
- `USER_JOURNEY_MAP.md` - User journey documentation
- `MVP_DEFINITION.md` - MVP boundary definition

### Development Best Practices
1. Follow existing code patterns and conventions
2. Use Tailwind classes following the EDM theme (neon colors: purple, cyan, pink, green)
3. Leverage existing UI components from `src/components/ui/`
4. Maintain the custom animations defined in tailwind.config.ts
5. Cross-reference documentation before implementing features
6. Update `claudeupdate.md` when completing significant tasks
7. Use inline TODO comments for areas needing completion
8. Collaborate with Gemini CLI for TypeScript validation and dependency management

### Working with Other LLMs
- This project uses multiple AI assistants (Claude Code, Gemini CLI, Roo Code, etc.)
- Maintain clear handoff documentation in `claudeupdate.md`
- Be explicit about blockers and needed handoffs
- Follow the established microtask sequence unless explicitly approved to deviate