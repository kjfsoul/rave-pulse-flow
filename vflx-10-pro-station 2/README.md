# vFLX-10 Pro Station

A comprehensive, production-ready audio creation and DJ mixing platform for the EDM Shuffle community. Built with React, TypeScript, Tone.js, and Wavesurfer.js.

## 🎵 Features

### Core Audio Engine
- **Global State Management**: Zustand-powered state for master BPM, play state, volume, and scene selection
- **Tone.js Transport**: Unified master clock synchronizing all audio components
- **Real-time Audio Processing**: Professional-grade audio engine with low latency

### Sound Library (Three Audio Sources)
1. **My Tracks**: Upload your own audio files
   - Client-side BPM detection using web-audio-beat-detector
   - Pro Analyze option for high-accuracy BPM and key detection (Tonn API ready)
   - Broadcast rights confirmation checkbox for legal compliance

2. **Sample Packs**: Browse royalty-free samples
   - Freesound API integration (ready for implementation)
   - Filtered to CC0 (Public Domain) and CC-BY (Attribution) licenses only
   - Automatic attribution credit tracking for CC-BY samples

3. **AI Generation**: Create audio with AI
   - Loudly API integration (ready for implementation)
   - Credit-based system (10 free generations per user)
   - 100% royalty-free, copyright-safe audio

### Production Station
- **Synth Station**: 16-step × 8-row piano roll sequencer
  - Tone.PolySynth with customizable waveforms
  - Real-time note programming
  - Synced to global transport

- **Drum Machine**: 16-step × 8-row drum sequencer
  - Tone.Players with CR78 drum samples
  - Classic 808/909 style interface
  - Synced to global transport

### DJ Station (FLX-10 Style Interface)
- **Dual Decks (A/B)**: Professional waveform rendering with Wavesurfer.js
  - Interactive waveform visualization
  - Hot Cue points using Wavesurfer.regions
  - Loop controls with visual feedback
  - Pitch slider (0.5x - 2.0x playback rate)
  - 3-band EQ per deck (Low, Mid, High)

- **Mixer**: Central mixing console
  - Master transport controls (Play/Pause, BPM)
  - Channel faders for each deck
  - Crossfader (A ↔ B)
  - Master volume control

- **Live Equalizer**: 10-band graphic EQ
  - Frequencies: 32Hz, 64Hz, 125Hz, 250Hz, 500Hz, 1kHz, 2kHz, 4kHz, 8kHz, 16kHz
  - ±12dB range per band
  - Applied to master output

### Platform Features
- **Festival Scenery**: Five themed environments
  - Deep Forest (mystical woodland)
  - Neon City (cyberpunk energy)
  - Desert Sunset (warm chill vibes)
  - Ocean Waves (liquid rhythms)
  - Cosmic Space (interstellar soundscapes)

- **Submission System**: Competition entry workflow
  - Terms of Service acceptance
  - Automatic attribution credit attachment
  - Festival leaderboard with voting
  - Track status tracking

## 🏗️ Architecture

### Tech Stack
- **Frontend**: React 19, TypeScript, TailwindCSS 4, shadcn/ui
- **Backend**: Express 4, tRPC 11, Drizzle ORM
- **Audio**: Tone.js 15, Wavesurfer.js 7
- **State**: Zustand 5
- **Animation**: Framer Motion
- **Database**: MySQL/TiDB
- **Auth**: Manus OAuth

### Database Schema
- **users**: User profiles with AI generation credits and active scene
- **tracks**: User-uploaded/generated audio with BPM and attribution data
- **submissions**: Festival competition entries with votes
- **challenges**: User achievements and gamification (ready for implementation)

### Audio Routing
```
User Input → Tone.js Transport (Master Clock)
                    ↓
    ┌───────────────┼───────────────┐
    ↓               ↓               ↓
SynthStation   DrumMachine    Wavesurfer Decks
    ↓               ↓               ↓
    └───────────────┼───────────────┘
                    ↓
          Live Equalizer (10-band)
                    ↓
            Master Volume
                    ↓
              Speakers
```

## 🚀 Getting Started

### Prerequisites
- Node.js 22+
- pnpm 10+
- MySQL/TiDB database

### Installation
```bash
# Install dependencies
pnpm install

# Push database schema
pnpm db:push

# Start development server
pnpm dev
```

### Environment Variables
All environment variables are pre-configured by the Manus platform:
- `DATABASE_URL`: MySQL connection string
- `JWT_SECRET`: Session signing secret
- `VITE_APP_ID`: OAuth application ID
- `OAUTH_SERVER_URL`: OAuth backend URL
- `VITE_OAUTH_PORTAL_URL`: Login portal URL

## 📝 API Integration Status

### Ready for Implementation
The following API integrations have placeholder implementations and are ready to connect:

1. **Tonn API** (Pro BPM/Key Analysis)
   - Location: `client/src/components/SoundLibraryPanel.tsx` → `handleProAnalyze()`
   - Purpose: High-accuracy BPM and musical key detection

2. **Freesound API** (Sample Library)
   - Location: `client/src/components/SoundLibraryPanel.tsx` → `handleSearch()`
   - Purpose: Search and download CC0/CC-BY samples
   - Filter: Must exclude ShareAlike and NonCommercial licenses

3. **Loudly API** (AI Generation)
   - Location: `client/src/components/SoundLibraryPanel.tsx` → `handleGenerate()`
   - Purpose: Generate 100% royalty-free audio from text prompts

### File Upload (S3)
Track uploads currently use temporary URLs. To implement:
- Use `storagePut()` from `server/storage.ts`
- Upload file buffer to S3
- Store returned URL in database

## 🎮 Usage Guide

### Creating Music
1. Navigate to **Production** tab
2. Choose **Synth Station** or **Drum Machine**
3. Click grid squares to program notes/beats
4. Press Play in the Mixer to hear your creation

### DJ Mixing
1. Navigate to **DJ Station** tab
2. Drag tracks onto Deck A and Deck B
3. Use pitch sliders to match BPM
4. Adjust EQ and use crossfader to blend
5. Add cue points and loops for performance

### Submitting to Festival
1. Create your track in Production or DJ Station
2. Navigate to **Submit** tab
3. Enter track title
4. Accept Terms of Service
5. Click "Review & Submit"
6. Vote on other submissions in the leaderboard

## 🔧 Development

### Project Structure
```
client/src/
  components/     # Reusable UI components
  hooks/          # Custom hooks (useGlobalStore, useToneTransport)
  pages/          # Page-level components
  lib/            # tRPC client

server/
  db.ts           # Database query helpers
  routers.ts      # tRPC API procedures
  storage.ts      # S3 file storage helpers

drizzle/
  schema.ts       # Database schema definitions
```

### Key Files
- `client/src/hooks/useGlobalStore.ts`: Global audio state
- `client/src/hooks/useToneTransport.ts`: Tone.js initialization
- `client/src/components/SoundLibraryPanel.tsx`: Three-source audio library
- `client/src/components/ProductionStation.tsx`: Music creation interface
- `client/src/components/DJStation.tsx`: Mixing interface
- `server/routers.ts`: API endpoints

## 📄 Legal Compliance

### Broadcast Rights
All user uploads require explicit confirmation:
> "I own 100% of the rights to this audio and grant EDM Shuffle a broadcast license for competition submissions."

### Attribution System
- CC-BY samples automatically add attribution credits
- Credits are attached to all submissions
- Displayed with track information

### Supported Licenses
- ✅ CC0 (Public Domain)
- ✅ CC-BY (Attribution)
- ❌ CC-BY-SA (ShareAlike) - Excluded
- ❌ CC-BY-NC (NonCommercial) - Excluded

## 🎯 Future Enhancements

### Phase 6 (Optional)
- DJ Coach Overlay: Contextual tips using LLM
- Game Overlay: Challenges with validation
- Advanced audio effects: Reverb, delay, compression
- Real-time collaboration: Multi-user sessions
- Mobile responsive design
- PWA support for offline use

## 📚 Resources

- [Tone.js Documentation](https://tonejs.github.io/)
- [Wavesurfer.js Documentation](https://wavesurfer.xyz/)
- [Zustand Documentation](https://zustand-demo.pmnd.rs/)
- [tRPC Documentation](https://trpc.io/)

## 🙏 Credits

Built with:
- Tone.js for audio synthesis and scheduling
- Wavesurfer.js for waveform visualization
- web-audio-beat-detector for BPM detection
- CR78 drum samples from Tone.js library
- shadcn/ui for component library

---

**vFLX-10 Pro Station** - A community-driven music creation and performance ecosystem for EDM Shuffle.
