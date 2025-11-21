# Project Coding Rules (Non-Obvious Only)

## Audio Engine Architecture

- Always use `useTrueAudio` hook for basic audio playback (single global AudioContext)
- Use `useDJAudio` hook for professional DJ features (Tone.js integration)
- Never create multiple AudioContext instances - use the global pattern
- Mobile audio requires explicit unlock via user gesture with silent buffer

## Component Patterns

- Context providers must wrap in order: QueryClient → AuthProvider → VotingProvider → AudioProvider → TooltipProvider
- DJ station state persists to localStorage using keys: `vflx10-deckA`, `vflx10-deckB`
- Audio routing goes through Zustand global store - deprecated methods log warnings

## Database Integration

- Use auto-generated types from `src/lib/supabase.ts` - never manual interfaces
- Supabase client validates project ID `uzudveyglwouuofiaapq` - local dev shows warnings
- Festival voting uses 24-hour anti-spam protection via PostgreSQL queries

## Testing Requirements

- Test files must be in same directory as source (Vite path resolution)
- All Web Audio API nodes are mocked in `src/__tests__/setup.ts`
- Playwright tests run on port 5173, Vite dev on 8081 - ensure consistency

## Feature Flags

- Check `src/config/features.ts` for `VITE_FF_AUDIO_ENGINE` status
- Audio engine features are conditionally rendered based on flags
- Some components may not render if flags are disabled

## State Management

- DJ station uses Zustand global store for audio state synchronization
- Global store reads from useDJAudio hook and applies to Tone.js nodes
- Crossfader calculations use specific gain curves (0-0.5-1 normalization)

## Import Patterns

- `@/*` aliases resolve to `src/*` in all config files
- TypeScript path matching required in vite.config.ts, vitest.config.ts, tsconfig.json
- Use `cn()` utility from `src/lib/utils.ts` for className merging

## Audio Implementation

- Buffer caching handled automatically in useTrueAudio hook
- Crossfading uses mathematical curves for smooth audio transitions
- AudioContext state management prevents browser autoplay policy violations

## Error Handling

- Deprecated methods in useDJAudio log console warnings
- Missing context providers throw specific error messages
- Supabase connection errors show validation warnings in development

## Performance Considerations

- Use `bun` package manager for faster installs when available
- Tone.js nodes must be properly disposed in cleanup functions
- Audio buffer loading includes caching to prevent redundant network requests
