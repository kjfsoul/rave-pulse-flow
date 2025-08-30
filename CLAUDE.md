# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## CRITICAL: Read These First

1. **ALWAYS** read `CLAUDE_INTEGRITY_RULES.md` before any work
2. **ALWAYS** check current task in `IMPLEMENTATION_MICROTASKS.md`
3. **NEVER** fabricate features, data, or progress
4. **ASK** for clarification if context is missing

## Agent Memory System

This project now uses a stateful agent architecture. All agents leverage the `AgentMemory` class to persist and retrieve context from a shared knowledge base. When undertaking a task, first query the memory system for relevant context. Upon completion, log a summary of your work and its outcome back into memory.


## 🎉 **CURRENT PROJECT STATUS: MVP COMPLETE**

**All 10 core authentication and persistence tasks completed (Jan 10, 2025)**

- Full Supabase integration with user authentication
- Complete database schema with all core features
- All major routes protected and integrated with user data
- Ready for beta testing and production deployment

## 🧪 **TESTING FRAMEWORK STATUS: CONFIGURED (Aug 12, 2025)**

**Testing Infrastructure Completed:**
- ✅ Vitest configured for React component testing
- ✅ Playwright configured for end-to-end testing
- ✅ Test environment setup with spiritual technology mocks
- ✅ Initial test files created and validated
- ⚠️ TypeScript compilation errors being addressed

**Testing Commands:**
```bash
# Run all unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run end-to-end tests
npm run test:e2e

# Run e2e tests in UI mode
npm run test:e2e:ui
```

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
- Work on ONE microtask at a time, in order

## Recent Progress (Aug 12, 2025)

### Audio Engine Hook (WO-002.1)
- **Deliverables**: Created `src/hooks/useTrueAudio.ts` with single global AudioContext management, audio buffer loading/caching, and mobile audio unlocking on first user gesture
- **Features**: Comprehensive state management for AudioContext (suspended/running/closed), buffer loading with caching, play buffer functionality, and test tone generation
- **Validation Component**: Created `src/components/audio-ui/AudioTestComponent.tsx` for demonstrating and validating the hook functionality

### Testing Environment Fix
- **Blocker Resolved**: Fixed jsdom dependency issues preventing tests from running
- **Specific Fixes**:
  - Installed missing `jsdom`, `@testing-library/react`, and `@testing-library/jest-dom` dependencies
  - Updated `vitest.config.ts` to properly handle path aliases for `@/*` imports
  - Fixed duplicate closing tags in `src/App.tsx`
  - Properly initialized `queryClient` in `src/App.tsx`
  - Tests now run successfully in development environment, confirming testing infrastructure is properly configured

### DJ Station Audio Integration (WO-002.2)
- **Deliverables**: Refactored `src/components/SimpleDJStation.tsx` to integrate `useTrueAudio` hook for functional audio controls
- **Features**: Replaced simulated audio logic with two instances of `useTrueAudio` hook (one for each deck), connected Play/Pause buttons to hook instances, enabled both decks to play separate audio tracks audibly and simultaneously
- **Validation**: Component now uses functional audio controls instead of simulated logic, with both decks capable of playing audio simultaneously

### Festival Voting System (Aug 12, 2025)

- **Deliverables**: Implemented secure, real-time, abuse-resistant voting system for festival page
- **Edge Function**: Created `supabase/functions/submit-vote/index.ts` with full authentication, 24-hour anti-spam protection, and PostgreSQL integration
- **Database Migration**: Created `supabase/migrations/20250812_festival_votes_update.sql` to update festival_votes table schema (renamed artist_id to dj_id, removed unique constraint, added performance indexes)
- **Security Features**: JWT authentication required, user-specific RLS policies, vote weight validation (1-10), comprehensive error handling with proper HTTP status codes
- **Anti-Spam Protection**: Enforces 24-hour cooldown per user-DJ combination using PostgreSQL time-based queries with optimized partial indexes
121 | - **Testing**: Comprehensive test suite in `tests/submit-vote.test.ts` covering authentication, validation, anti-spam, database operations, and CORS
122 | - **Documentation**: Visual schema documentation with RLS policies and security features (`schema-documentation.html`)
123 | - **Real-time Integration**: Activity logging for user feeds, structured JSON responses for client consumption, CORS support for web integration
### Festival Stage Audio Bug Fixes (Aug 24, 2025)

- **Deliverables**: Comprehensive audio state management fixes for `/festival` page
- **Audio Overlap Fix**: Completely refactored `handleDJPreview` function to prevent overlapping tracks
  - Always stops current track before starting new one
  - Proper toggle behavior for same DJ (play/pause)
  - Enhanced error handling and cleanup
- **Global Stop Control**: Enhanced "Stop All Audio" functionality
  - Stops current track, clears turntable intervals, resets BPM
  - Comprehensive resource cleanup (source, gainNode, intervals)
  - Improved error handling with try-catch blocks
- **Resource Management**: Added robust cleanup in useEffect
  - Proper disconnection of AudioBufferSourceNode and GainNode
  - AudioContext cleanup on component unmount
  - Memory leak prevention
- **TypeScript Fixes**: Resolved all compilation errors
  - Fixed `webkitAudioContext` type issues
  - Corrected `artist_id` to `dj_id` mapping
  - Fixed event handler type signatures
- **Validation**: Build completed successfully with no errors
  - Audio controls now work without overlap
  - Global stop button functions correctly
  - Proper cleanup prevents memory leaks

### EDM Live Feed System (Aug 14, 2025)

- **Deliverables**: Replaced static news items with dynamic RSS feed system fetching current EDM news
- **Database Migration**: Created `supabase/migrations/20250814_live_feed_table.sql` with comprehensive schema for storing RSS feed articles
- **Edge Function**: Implemented `supabase/functions/fetch-rss-feeds/index.ts` to fetch and parse RSS feeds from Your EDM, Dancing Astronaut, and EDM.com
- **Frontend Integration**: Updated `RSSFeedStreamer.tsx` component to fetch from live_feed table with loading states, error handling, and manual refresh
- **Features**: Auto-refresh every 4 seconds, responsive design (3 items desktop/1 mobile), real-time updates via Edge Function
- **Security**: Public read access for feed items, 7-day auto-cleanup of old items
- **Note**: Migration needs to be applied through Supabase dashboard before the system is fully functional

## 🎧 Audio Implementation Progress

- [x] **Phase 1**: Basic Web Audio API integration with useTrueAudio hook
- [x] **Phase 2**: Real-time, audible effects for all DJ controls
  - [x] Volume: Use a GainNode for each deck
  - [x] Crossfader: Use two GainNodes to audibly blend between Deck A and Deck B
  - [x] Pitch: Modify the playbackRate property of the AudioBufferSourceNode
  - [x] Echo FX: Implement a DelayNode and GainNode feedback loop
- [ ] **Phase 3**: Advanced audio features and optimizations
