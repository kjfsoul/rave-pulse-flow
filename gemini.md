# GEMINI.md - Project Brief & Mandates: EDM Shuffle

This document provides the foundational context and rules for working on the EDM Shuffle project.

## 1. Project Brief

* **Project Name:** EDM Shuffle
* **Core Objective:** An immersive performer showcase platform designed to feel like a night festival. It is **not** a functional DJ tool for users, but a platform to discover and listen to up-and-coming artists.
* **Current Status:** Production Ready. The initial MVP is complete, and a major redesign of the core "Festival" page has been implemented, fixing 12 critical issues.
* **Key Feature:** The `/festival` page, which allows users to interact with performer cards, listen to their tracks, and engage via a real-time chat system.

## 2. Technology Stack

* **Framework:** Next.js 15.3.3 / React 18.3.1 with Vite (SWC)
* **UI:** Tailwind CSS with a custom EDM/Neon theme, shadcn/ui, Framer Motion
* **Audio:** Web Audio API
* **Backend:** Supabase (Auth & Database)
* **State Management:** TanStack Query & React Context

## 3. Agent Mandates & Workflow

**A. Core Integrity Rules (See `CLAUDE_INTEGRITY_RULES.md` for full details)**

* NEVER fabricate progress. All work must be verified.
* Work on ONE microtask at a time from `IMPLEMENTATION_MICROTASKS.md`.
* Pause for human review after each task.

**B. Agentic Memory Logging (MANDATORY)**
This is a non-negotiable background task for building agentic memory.

* **Shell Commands:** All terminal commands (`npm`, `git`, `bun`, etc.) **MUST** be prefixed with the `memlog-edm` alias.
  * **Example:** `memlog-edm npm run build`
* **Python Code:** This project does not currently require Python. If it is added, all key functions must be instrumented with the `@log_invocation` decorator.

**C. Multi-Agent Synchronization**

* This project is a multi-agent environment (Claude, Gemini, Roo Code).
* All progress, blockers, and session notes must be tracked in `claudeupdate.md` to ensure seamless handoffs between agents.

## 4. Primary Development Commands

* `npm run dev`: Start the development server on port 8080.
* `npm run build`: Build the application for production.
* `npm run lint`: Run the code linter.

## Recent Progress (Aug 14, 2025)

### Enhanced RSS Feed System (Aug 24, 2025)

- **Objective**: Complete overhaul with AI-powered content analysis, real-time updates, and mobile optimization
- **Backend Enhancements**:
  - Enhanced `supabase/functions/fetch-rss-feeds/index.ts` with 8+ RSS sources
  - AI-powered content analysis (sentiment, tags, priority scoring)
  - Database migration `supabase/migrations/20250824_enhance_live_feed_table.sql`
- **Frontend Components**:
  - `EnhancedFeedCard.tsx`: Advanced card with animations and interactions
  - `MobileSwipeFeed.tsx`: Touch-optimized mobile interface
  - `RSSWebSocketManager.tsx`: Real-time WebSocket integration
  - `EnhancedRSSFeed.tsx`: Advanced filtering and search capabilities
  - `RSSTestComponent.tsx`: Comprehensive testing suite
- **Real-Time Features**:
  - Live WebSocket updates with automatic reconnection
  - Real-time notifications for new content
  - Connection health monitoring and error recovery
- **Mobile Optimization**:
  - Swipe gestures for navigation
  - Touch-optimized interface
  - Responsive design for all screen sizes
- **Visual Enhancements**:
  - Consistent rave aesthetic with neon colors
  - Framer Motion animations throughout
  - Progressive image loading
  - Enhanced hover effects and micro-interactions
- **Status**: Fully implemented and tested, ready for production deployment

### Audio Engine Hook (WO-002.1)

- **Deliverables**: Created `src/hooks/useTrueAudio.ts` with single global AudioContext management, audio buffer loading/caching, and mobile audio unlocking on first user gesture
* **Features**: Comprehensive state management for AudioContext (suspended/running/closed), buffer loading with caching, play buffer functionality, and test tone generation
* **Validation Component**: Created `src/components/audio-ui/AudioTestComponent.tsx` for demonstrating and validating the hook functionality

### Testing Environment Fix

- **Blocker Resolved**: Fixed jsdom dependency issues preventing tests from running
* **Specific Fixes**:
  * Installed missing `jsdom`, `@testing-library/react`, and `@testing-library/jest-dom` dependencies
  * Updated `vitest.config.ts` to properly handle path aliases for `@/*` imports
  * Fixed duplicate closing tags in `src/App.tsx`
  * Properly initialized `queryClient` in `src/App.tsx`
  * Tests now run successfully in development environment, confirming testing infrastructure is properly configured

### DJ Station Audio Integration (WO-002.2)

- **Deliverables**: Refactored `src/components/SimpleDJStation.tsx` to integrate `useTrueAudio` hook for functional audio controls
* **Features**: Replaced simulated audio logic with two instances of `useTrueAudio` hook (one for each deck), connected Play/Pause buttons to hook instances, enabled both decks to play separate audio tracks audibly and simultaneously
* **Validation**: Component now uses functional audio controls instead of simulated logic, with both decks capable of playing audio simultaneously

### Festival Voting System (Aug 12, 2025)

- **Deliverables**: Implemented secure, real-time, abuse-resistant voting system for festival page
* **Edge Function**: Created `supabase/functions/submit-vote/index.ts` with full authentication, 24-hour anti-spam protection, and PostgreSQL integration
* **Database Migration**: Created `supabase/migrations/20250812_festival_votes_update.sql` to update festival_votes table schema (renamed artist_id to dj_id, removed unique constraint, added performance indexes)
* **Security Features**: JWT authentication required, user-specific RLS policies, vote weight validation (1-10), comprehensive error handling with proper HTTP status codes
* **Anti-Spam Protection**: Enforces 24-hour cooldown per user-DJ combination using PostgreSQL time-based queries with optimized partial indexes
77 | * **Testing**: Comprehensive test suite in `tests/submit-vote.test.ts` covering authentication, validation, anti-spam, database operations, and CORS
78 | * **Documentation**: Visual schema documentation with RLS policies and security features (`schema-documentation.html`)
79 | * **Real-time Integration**: Activity logging for user feeds, structured JSON responses for client consumption, CORS support for web integration
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

## 🎧 Audio Implementation Progress

- [x] **Phase 1**: Basic Web Audio API integration with useTrueAudio hook
- [x] **Phase 2**: Real-time, audible effects for all DJ controls
  - [x] Volume: Use a GainNode for each deck
  - [x] Crossfader: Use two GainNodes to audibly blend between Deck A and Deck B
  - [x] Pitch: Modify the playbackRate property of the AudioBufferSourceNode
  - [x] Echo FX: Implement a DelayNode and GainNode feedback loop
- [ ] **Phase 3**: Advanced audio features and optimizations
