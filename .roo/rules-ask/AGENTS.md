# Project Documentation Rules (Non-Obvious Only)

## Architecture Context

- Audio system has dual engines: `useTrueAudio` (basic) and `useDJAudio` (professional DJ)
- Database types auto-generated in `src/lib/supabase.ts` - don't use manual interfaces
- Component state managed through specific provider hierarchy - check context hooks for requirements

## Hidden or Misnamed Documentation

- "src/" contains main application code, not source for web apps (standard React structure)
- Audio engine features controlled by `src/config/features.ts` - check before documentation
- DJ station localStorage uses specific keys: `vflx10-deckA`, `vflx10-deckB`

## Counterintuitive Code Organization

- Provider examples in `src/contexts/` are canonical reference (docs may be outdated)
- Audio routing goes through Zustand global store, not direct component state
- Testing setup in `src/__tests__/setup.ts` has comprehensive Web Audio API mocks

## Misleading Folder Names or Structures

- `supabase/functions/` contains edge functions, not server-side code
- `public/audio/` contains static audio files, not processed sounds
- `memory/` directory contains session/project state, not application memory management

## Important Context Not Evident from File Structure

- Festival voting system uses 24-hour anti-spam protection via PostgreSQL
- Professional DJ station requires Tone.js initialization via user interaction
- Development server uses IPv6 binding (`::`) for network accessibility

## Feature Flag Dependencies

- Audio engine features require `VITE_FF_AUDIO_ENGINE=true` environment variable
- Some components render conditionally based on feature flags
- Check `src/config/features.ts` before documenting audio features

## Database Integration Nuances

- Supabase client validates project ID: `uzudveyglwouuofiaapq`
- Local development shows warnings for wrong instance configuration
- Real-time voting uses edge functions for abuse prevention

## Testing Framework Specifics

- Vitest requires test files in source directories for path resolution
- Playwright tests expect different port than development server (5173 vs 8081)
- Complete Web Audio API mocking in setup - audio tests work without actual sound

## Development Environment Gotchas

- Port conflicts between dev server (8081) and Playwright (5173)
- Environment variables in `.env.local` not committed to repository
- Dual package managers supported (npm + bun) - prefer bun for performance

## Audio Implementation Context

- Global AudioContext prevents browser conflicts - don't create multiple instances
- Mobile audio requires explicit user gesture for playback
- Tone.js nodes must be properly disposed to prevent memory leaks

## Component Interaction Patterns

- Context providers wrap in specific order for proper data flow
- Zustand store synchronizes audio state between components
- Deprecated methods log warnings - prefer global store patterns
