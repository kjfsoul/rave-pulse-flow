# Project Architecture Rules (Non-Obvious Only)

## Hidden Coupling Between Components

- Audio routing goes through Zustand global store - components indirectly coupled through state
- DJ station requires specific provider wrapping order for audio context to work
- Festival voting system depends on edge functions for abuse prevention

## Undocumented Architectural Decisions

- Global AudioContext pattern prevents browser audio conflicts but creates single point of failure
- Tone.js and Web Audio API operate independently - requires careful feature selection
- Component state persists to localStorage with specific key patterns (`vflx10-deckA/B`)

## Non-Standard Patterns That Must Be Followed

- Context providers must wrap in order: QueryClient → AuthProvider → VotingProvider → AudioProvider → TooltipProvider
- Audio features controlled by feature flags - check `src/config/features.ts` before architectural changes
- Database types auto-generated from Supabase - manual interfaces will break sync

## Performance Bottlenecks Discovered Through Investigation

- Audio buffer loading includes caching but still causes network requests on first load
- Crossfader calculations run on every state change - may impact performance at high frequencies
- Zustand store updates trigger Tone.js node changes - potential audio glitches

## Architectural Constraints

- Mobile audio requires explicit user gesture before any AudioContext operations
- Browser autoplay policy prevents automatic audio initialization
- Tone.js nodes must be properly disposed to prevent memory leaks in DJ station

## System Integration Requirements

- Development server uses IPv6 binding for network accessibility
- Port configuration mismatched between dev (8081) and tests (5173)
- Path aliases require consistent configuration across Vite, Vitest, and TypeScript

## Data Flow Architecture

- Festival voting uses real-time PostgreSQL queries with 24-hour anti-spam protection
- User authentication flows through Supabase with session persistence
- DJ station state synchronized between multiple components via global store

## Critical Dependencies

- Audio engine features depend on `VITE_FF_AUDIO_ENGINE` environment variable
- Component rendering conditional based on feature flags
- Supabase client validates project ID to prevent wrong instance connections

## Legacy System Integration

- Deprecated methods in useDJAudio log warnings but remain for backward compatibility
- Audio buffer caching handles legacy URL patterns
- Component state management supports both old and new patterns during transition

## Scalability Considerations

- Web Audio API limited to one context per page - constrains multi-track scenarios
- Tone.js node disposal critical for professional DJ station scalability
- Real-time voting system requires efficient database query patterns
