# EDM Shuffle Functional Requirements Specification (FRS)

## Audio Engine
- Each deck plays independent tracks using Web Audio API (no HTML5 fallback)
- Crossfader mixes audio between decks (A/B) in real-time
- Pitch/echo/volume/mute controls alter actual sound, with instant UI feedback
- Waveform visualizer linked to live audio frequency data (AnalyserNode)
- Simulation Mode: If audio fails, show badge, simulate visuals only, and prompt to enable audio

## Visual & UI
- All claimed features must be visibly interactive and verifiable (not hidden or implied)
- Debug HUD overlays all system/engine states; toggle with ‘H’ key or HUD icon
- Crowd FX: Confetti, floating emojis, cheer sound, toast notifications on “Drop My Set”
- Subscribe CTA banner always visible; confirmation modal animated and stateful

## Workflow
- All code must have TODO comments if unfinished; all placeholder data labeled and explained
- All controls must update live (no "dead" controls)
- Gemini CLI runs lint/build/validate before any code commit by Claude
- Roo Code invoked as fallback if Claude or Gemini block on a task

## Mobile
- UI must be responsive and usable on mobile and desktop

## Honest System State
- If any feature is simulated or non-functional, show a clear UI indicator

## Integration/Testing
- Code must run without error on TypeScript check (Gemini CLI)
- All interactive features must be testable by human user in UI
