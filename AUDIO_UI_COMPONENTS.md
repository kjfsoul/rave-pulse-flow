# EDM Shuffle Audio UI Components

## Target Components
- `DJDeck.tsx`: Dual-deck UI, play/pause, volume, pitch, echo, mute (all must affect real audio)
- `Crossfader.tsx`: Animated crossfade slider with real-time deck mix
- `WaveformVisualizer.tsx`: Live audio frequency display (AnalyserNode, no fakes)
- `DebugHUD.tsx`: Always visible or toggleable overlay for deck, engine, and audio node state
- `CrowdFXLayer.tsx`: Confetti, floating emoji, cheer SFX, toast for “Drop My Set”
- `SubscribeBanner.tsx`: Sticky CTA, modal, and confirmation flow

## Key Rules
- No component should ever be only for show; all features must be testable and visibly working or show an honest badge if simulated.
- Use explicit TODOs and comments for any placeholder logic.

## Integration
- All components must interoperate seamlessly in DJMixStation.tsx, and be validated with Gemini CLI before merging.
