# AGENTS.md

This file provides guidance to agents when working with code in this repository.

## Project Overview

Rave Pulse Flow (EDM Shuffle) is a React/TypeScript audio application with DJ mixing capabilities, built with Vite and styled with Tailwind CSS. The project features professional DJ stations, festival voting, and audio production tools.

## Critical Non-Obvious Information

### Audio System Architecture (DISCOVERED PATTERN)

**Global AudioContext Management:**
- `useTrueAudio` hook manages a SINGLE global AudioContext instance (prevents browser audio conflicts)
- AudioContext is created lazily on first user interaction to avoid autoplay policy warnings
- Mobile audio unlocking requires specific gesture handling with silent buffer playback

**Dual Audio Engines:**
- `useTrueAudio` (Web Audio API) for basic audio playback and buffer management
- `useDJAudio` (Tone.js) for professional DJ station features with crossfading
- These systems operate independently - choose based on feature requirements

**Tone.js Integration:**
- Professional DJ station uses Tone.js for real-time audio effects and crossfading
- Audio routing goes through Zustand global store for state synchronization
- Deprecated methods in `useDJAudio` log warnings - use global store instead

### Feature Flags (NON-STANDARD)

- Audio engine features controlled by `VITE_FF_AUDIO_ENGINE` environment variable
- Check `src/config/features.ts` for current feature flag status
- Some components render conditionally based on these flags

### Database Patterns (SUPABASE-SPECIFIC)

**Project ID Validation:**
- Supabase client validates against expected project ID: `uzudveyglwouuofiaapq`
- Local development shows warnings if using wrong instance
- Database types are auto-generated in `src/lib/supabase.ts`

**Real-time Voting System:**
- Festival voting uses 24-hour anti-spam protection via PostgreSQL queries
- Vote weights range 1-10 with user-specific rate limiting
- Edge functions handle authentication and abuse prevention

### Testing Setup (PROJECT-SPECIFIC)

**Comprehensive Web Audio API Mocking:**
- Vitest setup includes complete AudioContext, GainNode, OscillatorNode mocks
- Test files must be in same directory as source (Vite path resolution requirement)
- Playwright tests run against localhost:5173 (not default Vite port 8081)

**Mock Requirements:**
- All Web Audio API nodes are mocked in `src/__tests__/setup.ts`
- IntersectionObserver and matchMedia pre-mocked for consistent test environment
- MediaRecorder mocked with blob URL generation

### Development Server Configuration (NON-STANDARD)

**Port Configuration:**
- Development server runs on port 8081 (vite.config.ts)
- Playwright expects port 5173 (playwright.config.ts) - ensure consistency
- IPv6 binding (`::`) enabled for network accessibility

**Path Aliases:**
- `@/*` imports resolve to `src/*` in both Vite and Vitest
- TypeScript path matching required in multiple config files

### Component Architecture (DISCOVERED PATTERN)

**Context Providers Pattern:**
- App wraps in specific order: QueryClient → AuthProvider → VotingProvider → AudioProvider → TooltipProvider
- Missing providers cause specific error messages (check context hooks for requirements)

**LocalStorage Usage:**
- DJ station deck state persists to localStorage with keys: `vflx10-deckA`, `vflx10-deckB`
- Track metadata includes BPM, source (upload/freesound/loudly), and broadcast rights

### Style System (TAILWIND-SPECIFIC)

**Custom Animations:**
- EDM-themed animations: `glow-pulse`, `float`, `equalizer`, `shimmer`
- Neon color palette: `neon-purple`, `neon-cyan`, `neon-blue`, etc.
- Custom fonts: `orbitron`, `rajdhani`, `audiowide` for electronic music aesthetic

**Dark Mode:**
- Uses class-based dark mode: `darkMode: ["class"]`
- Custom CSS variables for theming (check tailwind.config.ts for color system)

### Package Management (NON-OBVIOUS)

**Dual Lock Files:**
- Both `package-lock.json` and `bun.lockb` present - project supports npm and bun
- Bun preferred for performance but npm fully supported
- Install commands work with either package manager

### Edge Functions (SUPABASE-SPECIFIC)

**Freesound Integration:**
- `supabase/functions/freesound-search/index.ts` provides audio search API
- Requires attribution credits for downloaded sounds
- Broadcast rights confirmation required for track uploads

## Essential Commands

```bash
# Development
npm run dev              # Start dev server (port 8081)
npm run build            # Production build
npm run build:dev        # Development build

# Testing
npm run test             # Run Vitest unit tests
npm run test:watch       # Watch mode
npm run test:e2e         # Playwright end-to-end tests
npm run test:e2e:ui      # Playwright UI mode

# Utilities
npm run generate-feed     # Update EDM news from RSS
npm run sync:printify     # Sync Printify products
```

## Critical Gotchas

1. **Port Mismatch:** Vite dev (8081) vs Playwright (5173) - update configs consistently
2. **Audio Context:** Always use `useTrueAudio` for basic playback, `useDJAudio` for DJ features
3. **Feature Flags:** Check `src/config/features.ts` before implementing new audio features
4. **Database Types:** Use auto-generated types from `src/lib/supabase.ts`, not manual interfaces
5. **Test Location:** Vitest requires test files in source directories for path resolution
6. **LocalStorage:** DJ station uses specific keys - check `vflx10-deckA/B` patterns

## Beads Integration (MANDATORY)

This project uses Beads for issue tracking and memory management. All agents MUST:

- Query `bd ready --json` at session start
- File issues for discovered problems immediately
- Use `--json` flag for all programmatic access
- Link discovered work back to parent issues

See existing AGENTS.md for complete Beads workflow documentation.
