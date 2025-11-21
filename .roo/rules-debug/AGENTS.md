# Project Debug Rules (Non-Obvious Only)

## Audio Debugging

- Web Audio API state changes logged to console - check for context suspension/resumption
- Tone.js nodes must be properly disposed in cleanup to prevent memory leaks
- Mobile audio unlock failures often require user gesture - check silent buffer playback

## Testing Debug

- Vitest mocks complete Web Audio API - check `src/__tests__/setup.ts` for mock behavior
- Playwright runs on port 5173, dev server on 8081 - port conflicts cause test failures
- Test files in wrong directory fail path resolution due to Vite alias resolution

## Development Server Issues

- IPv6 binding (`::`) enabled but some systems prefer IPv4 - check network accessibility
- Development server headers disable caching - can mask stale resource issues in dev
- Hot reload may not work with AudioContext - requires manual page refresh

## Database Debug

- Supabase project ID validation warnings indicate wrong instance configuration
- Local development expects specific environment variables - check `.env.local` setup
- RLS policy violations appear as permission errors in browser console

## Component Debug

- Missing context providers throw specific errors - check provider wrapping order
- Zustand store state changes may not sync to Tone.js nodes - verify useEffect dependencies
- LocalStorage persistence failures indicate quota exceeded or private browsing mode

## Build Debug

- TypeScript compilation errors may appear after audio-related changes - check Web Audio API types
- Vite build fails on missing environment variables - verify `.env` setup
- Production build audio issues often related to autoplay policy restrictions

## Performance Debug

- Audio buffer loading failures indicate CORS or network issues - check sound file URLs
- Tone.js node disposal failures cause memory leaks - verify cleanup in useEffect
- Crossfader audio dropouts suggest gain curve timing issues - adjust rampTo duration

## Browser Compatibility

- WebKit browsers require `webkitAudioContext` fallback - check polyfill in useTrueAudio
- Mobile Safari audio context suspension requires explicit user interaction
- Chrome autoplay policy stricter than Firefox - test across browsers

## Console Log Patterns

- Audio Engine logs prefixed with `[Audio Engine]` - filter for audio-related issues
- Zustand store changes logged during development - check for state sync issues
- Supabase connection logs include project ID validation - verify correct instance
