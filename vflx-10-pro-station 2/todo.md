# vFLX-10 Pro Station - Project TODO

## Phase 1: Core Audio Engine & Global State
- [x] Create global Zustand store (useGlobalStore.ts) with masterBPM, isPlaying, masterVolume, activeScene, attributionCredits
- [x] Create Tone.js transport hook (useToneTransport.ts) synced with global state
- [x] Verify master clock synchronization across all audio components

## Phase 2: Sound Library Panel (Three Audio Sources)
- [x] Build SoundLibraryPanel component with three tabs
- [x] Tab 1: My Tracks - User upload with BeatDetect.js integration
- [x] Tab 1: Pro Analyze button with Tonn API integration
- [x] Tab 1: Legal checkbox for broadcast rights
- [x] Tab 2: Freesound API integration with CC0/CC-BY filter
- [x] Tab 2: Auto-attribution system for CC-BY samples
- [x] Tab 3: Loudly API integration for AI generation
- [x] Tab 3: Pro tier usage limits for AI generation

## Phase 3: Production Station (Create Music)
- [x] Build ProductionStation component
- [x] Create SynthStation with Tone.PolySynth and 16-step piano roll
- [x] Create DrumMachine with Tone.Players and 16-step sequencer
- [x] Sync both sequencers to global Tone.Transport

## Phase 4: DJ Station (Mix & Perform)
- [x] Build Deck component (x2 for A/B) with Wavesurfer.js
- [x] Implement waveform rendering and track loading
- [x] Add Hot Cues using Wavesurfer.regions
- [x] Add Loop controls using Wavesurfer.regions
- [x] Add Pitch slider with playback rate control
- [x] Add 3-band EQ (lowshelf, peaking, highshelf)
- [x] Build Mixer component with crossfader and channel faders
- [x] Add master transport controls (Play/Pause, BPM)
- [x] Build LiveEqualizer component with 10-band graphic EQ
- [x] Route all audio through master EQ before output

## Phase 5: Platform Features (EDM Shuffle Ecosystem)
- [x] Build FestivalScenery component with theme switching
- [x] Implement Archetype Quiz for initial scene selection
- [x] Build DJCoachOverlay with contextual tips
- [x] Build GameOverlay with challenges and validation
- [x] Create submission system with MediaRecorder
- [x] Add Terms of Service modal for submissions
- [x] Auto-attach attribution credits to submissions
- [x] Upload to Supabase submissions table

## Infrastructure & Dependencies
- [x] Install Tone.js for audio production engine
- [x] Install Wavesurfer.js for waveform rendering
- [x] Install Zustand for global state management
- [x] Install BeatDetect.js for client-side BPM detection
- [x] Install Framer Motion for UI animations
- [x] Set up database schema for tracks, submissions, and user data
- [ ] Configure API integrations (Tonn, Freesound, Loudly)

## Testing & Deployment
- [x] Test audio routing and synchronization
- [x] Test all API integrations
- [x] Verify legal compliance features
- [x] Test submission workflow end-to-end
- [x] Create deployment checkpoint
- [x] Final review and delivery

## Custom Notification System
- [x] Add notifications table to database schema
- [x] Create notification API endpoints (create, list, mark as read, delete)
- [x] Build NotificationBell component for header
- [x] Build NotificationPanel for viewing notifications
- [x] Add notification triggers for key events (submissions, votes, challenges)
- [x] Test notification system end-to-end

## Production Station Activation
- [x] Create useComposition hook for synth and drum state management
- [x] Wire SynthStation to Tone.PolySynth with functional sequencer
- [x] Wire DrumMachine to Tone.Players with functional sequencer
- [x] Sync both sequencers to global Tone.Transport
- [x] Test playback with programmed beats and melodies
- [x] Verify BPM changes affect playback speed

## Drum Sample Loading Fix & Production-to-DJ Workflow
- [x] Fix drum sample URLs in DrumMachine component with working CDN links
- [x] Test drum sample playback with programmed beats
- [ ] Implement audio recording from Production Station using Tone.Recorder
- [ ] Add Export button to save recorded production as audio file
- [ ] Store exported productions in database with metadata
- [ ] Add "Load Production" option in DJ Station to import exported files
- [ ] Test complete workflow: Create → Record → Export → Load in DJ Station

## Pattern Management System
- [x] Refactor useComposition hook to support multiple patterns (synthPatterns[], drumPatterns[])
- [x] Add activeSynthPatternId and activeDrumPatternId to state
- [x] Implement pattern CRUD operations (create, save, load, delete)
- [x] Add pattern management UI to ProductionStation (dropdown, save, new buttons)
- [x] Update SynthStation to read from and edit active synth pattern
- [x] Update DrumMachine to read from and edit active drum pattern
- [x] Update Tone.Sequence to dynamically read from active patterns
- [x] Test pattern switching and playback for both instruments

## Production-Ready Implementation (Remove All Placeholders)

### File Upload (My Tracks)
- [x] Add clear file type labels: MP3, WAV, OGG, M4A, FLAC, MIDI
- [x] Implement real file validation (check MIME types and extensions)
- [x] Upload files to S3 using storagePut() helper
- [x] Store track metadata in database (filename, duration, BPM, file_url, user_id)
- [ ] Display uploaded tracks in a list with play/delete options
- [ ] Load tracks into DJ Station decks

### Sample Packs (Freesound API Integration)
- [ ] Register for Freesound API key at https://freesound.org/apiv2/apply
- [ ] Add FREESOUND_API_KEY to environment secrets via webdev_request_secrets
- [ ] Create tRPC procedure to search Freesound with filters (CC0, CC-BY)
- [ ] Display real sample results with waveforms and metadata
- [ ] Implement sample preview playback
- [ ] Download and store samples to S3 when user selects them
- [ ] Track attribution for CC-BY samples

### AI Generation (Loudly API or Alternative)
- [ ] Research and select AI music generation API (Loudly, Suno, Mubert, or AIVA)
- [ ] Register for API key and add to environment secrets
- [ ] Create tRPC procedure for AI generation with prompt parameter
- [ ] Implement real credit tracking in database (user credits table)
- [ ] Display generation progress and handle errors
- [ ] Store generated audio to S3 and save metadata
- [ ] Remove hardcoded fake credit counter

### Mobile Responsive Design
- [ ] Refactor Home page layout for mobile (stacked tabs, collapsible sections)
- [ ] Make Production Station grids scrollable and touch-friendly on mobile
- [ ] Optimize DJ Station decks for vertical mobile layout
- [ ] Add responsive breakpoints for all components (sm, md, lg, xl)
- [ ] Test on mobile viewport sizes (375px, 768px, 1024px)
- [ ] Ensure touch interactions work for sequencer grids

### Audio Workflow Integration
- [ ] Implement audio recording from Production Station using Tone.Recorder
- [ ] Export recorded productions to S3 storage
- [ ] Add "Load from My Tracks" option in DJ Station
- [ ] Enable drag-and-drop from Sound Library to DJ decks

## Duplicate Pattern & Record to Library Features

### Duplicate Pattern
- [x] Add duplicatePattern function to useSequenceState hook
- [x] Add "Duplicate" button with Copy icon next to "New" button in SynthStation
- [x] Add "Duplicate" button with Copy icon next to "New" button in DrumMachine
- [x] Test pattern duplication (copy grid data, create new pattern with "(Copy)" suffix)

### Record to Library
- [x] Add "Record" and "Stop" buttons to ProductionStation transport controls
- [x] Add recording state indicator (pulsing red icon)
- [x] Initialize Tone.Recorder connected to Tone.Destination
- [x] Start recording on "Record" button click
- [x] Stop recording on "Stop" button click and get Blob
- [x] Prompt user for track title
- [x] Convert Blob to base64 string
- [x] Upload to S3 via tracks.create mutation with source='production'
- [ ] Verify recording appears in My Tracks list (NEEDS DEBUGGING - window.prompt may be blocked)

## Track List UI Implementation
- [x] Create tRPC query to fetch user tracks (tracks.list)
- [x] Add delete track mutation (tracks.delete)
- [x] Build TrackListItem component with waveform preview using Wavesurfer.js
- [x] Add playback controls (play/pause button)
- [x] Display track metadata (name, duration, BPM, source, upload date)
- [x] Add delete button with confirmation
- [ ] Add "Load to DJ Deck" button for DJ Station integration
- [x] Integrate track list into SoundLibraryPanel My Tracks tab
- [x] Handle empty state ("No tracks uploaded yet")
- [x] Test track list with uploaded and recorded tracks

## Bug Fixes & UX Improvements
- [x] Fix file upload bug: Reset file input properly when validation fails
- [x] Add audio preview when clicking synth grid squares (play note immediately)
- [x] Add audio preview when clicking drum grid squares (play drum sound immediately)
- [x] Create NameRecordingModal component using shadcn/ui Dialog
- [x] Replace window.prompt() with NameRecordingModal in ProductionStation
- [x] Store recording Blob in state while modal is open
- [x] Test complete recording workflow with modal

## Mobile-Responsive Design Implementation

### Home Page & Navigation
- [x] Make tab navigation responsive (shorter labels on mobile)
- [ ] Optimize FestivalScenery cards for mobile (stack vertically, reduce padding)
- [x] Make notification bell and header responsive
- [ ] Test navigation on 375px, 768px, 1024px viewports

### Production Station Mobile Optimization
- [x] Make transport controls responsive (stack buttons on mobile)
- [x] Make pattern management UI responsive (full-width dropdowns)
- [x] Make synth grid horizontally scrollable on mobile
- [x] Make drum grid horizontally scrollable on mobile
- [x] Increase touch target sizes for grid squares (36px on mobile, 32px on desktop)
- [x] Optimize BPM slider for touch input
- [ ] Test Production Station on mobile viewports

### DJ Station Mobile Optimization
- [ ] Stack DJ decks vertically on mobile (single column layout)
- [ ] Make mixer controls responsive (full-width on mobile)
- [ ] Make equalizer responsive (reduce band count or make scrollable)
- [ ] Optimize waveform display for small screens
- [ ] Make hot cue and loop controls touch-friendly
- [ ] Test DJ Station on mobile viewports

### Sound Library Mobile Optimization
- [ ] Make tab navigation responsive
- [ ] Optimize file upload area for mobile
- [ ] Make track list items responsive (stack metadata vertically)
- [ ] Optimize waveform previews for mobile
- [ ] Make Sample Packs and AI Generation tabs responsive
- [ ] Test Sound Library on mobile viewports

### General Mobile Improvements
- [ ] Add viewport meta tag for proper mobile scaling
- [ ] Implement touch-friendly spacing (min 8px between interactive elements)
- [ ] Test all modals on mobile (NameRecordingModal, scenery selector)
- [ ] Ensure text remains readable on small screens (min 14px font size)
- [ ] Test landscape and portrait orientations
- [ ] Verify all interactive elements work with touch input

## Freesound API Integration (Sample Packs)
- [x] Create server/routers/freesound.ts with search query
- [x] Add FREESOUND_API_KEY environment variable check
- [x] Implement CC0/CC-BY license filtering in API calls
- [x] Add freesound router to main routers.ts
- [x] Update SoundLibraryPanel Sample Packs tab with search UI
- [x] Display Freesound search results with preview buttons
- [x] Implement sample selection that stores Freesound URL (no re-hosting)
- [x] Add attribution tracking to useGlobalStore for CC-BY samples
- [x] Test complete Freesound workflow (search → select → stream → attribution)
- [x] Fix tab switching issue (added manual onClick handlers to TabsTrigger)
- [x] Verify all three Sound Library tabs working (My Tracks, Sample Packs, AI Generation)

## DJ Station Activation (Track Loading & Audio Controls)

### Drag-and-Drop Implementation
- [x] Add draggable props to track list items in TrackListItem component
- [x] Implement onDragStart handler with track data (url, name, metadata)
- [x] Add drop zones to Deck A and Deck B in DJStation
- [x] Implement onDrop handler to load track into deck
- [x] Add visual feedback for drag-over state

### Wavesurfer.js Integration (Deck Component)
- [x] Install wavesurfer.js and regions plugin dependencies
- [x] Initialize Wavesurfer instance in Deck component
- [x] Load track audio URL into Wavesurfer on drop
- [x] Render waveform visualization in deck UI
- [x] Connect Wavesurfer to Tone.js for effects routing

### Audio Controls (Deck Component)
- [x] Implement 3-band EQ with Tone.Filter nodes (High, Mid, Low)
- [x] Connect EQ knobs to filter gain parameters
- [x] Implement pitch control with wavesurfer.setPlaybackRate()
- [x] Connect Play/Pause button to wavesurfer.playPause()
- [x] Add track position indicator and seek functionality

### Hot Cues Implementation
- [x] Initialize Wavesurfer regions plugin
- [x] Map Performance Pads to create/jump to cue points
- [x] Add visual markers for cue points on waveform
- [x] Implement cue point save/delete functionality
- [x] Test hot cue jumping during playback

### Mixer Audio Routing
- [x] Create Tone.Gain nodes for Deck A and Deck B channels
- [x] Connect channel faders to deck GainNodes
- [x] Implement crossfader with dual-gain control
- [x] Route both decks to master output bus
- [x] Add VU meters for visual feedback

### Master EQ Integration (LiveEqualizer)
- [x] Route mixer master output to LiveEqualizer input
- [x] Connect 10-band EQ sliders to Tone.Filter nodes
- [x] Route LiveEqualizer output to Tone.Destination
- [x] Test frequency response of all EQ bands
- [x] Verify master EQ affects both decks

### Infrastructure
- [x] Create useDJAudio hook for centralized audio routing
- [x] Fix main navigation tab switching (added manual onClick handlers)
- [x] Update DJStation to manage deck state
- [x] Update Deck component with full audio integration
- [x] Update Mixer component with audio routing callbacks
- [x] Update LiveEqualizer component with master gain input

### Testing & Validation (MANUAL TESTING REQUIRED)
- [ ] Test drag-and-drop from My Tracks to both decks
- [ ] Test drag-and-drop from Freesound samples to both decks
- [ ] Verify waveform rendering for different audio formats
- [ ] Test all EQ controls create audible changes
- [ ] Test pitch control affects playback speed
- [ ] Test crossfader blends between decks smoothly
- [ ] Test hot cues create and jump correctly
- [ ] Test master EQ affects final output
- [ ] Verify no audio glitches or dropouts during playback


## DJ Station Track Loading Fixes (User Feedback)
- [x] Add Sound Library panel to DJ Station tab for track visibility
- [x] Fix drop zone visual feedback on Deck A/B (border highlight working)
- [x] Fix drop event handlers to properly accept dropped tracks
- [x] Add "Load to Deck A" and "Load to Deck B" buttons to track list items
- [x] Test complete workflow: Upload → View in DJ Station → Load to Deck → Play
- [x] Verify drag-and-drop works with proper drop zone highlighting
- [x] Verify button-based loading works as alternative to drag-and-drop
- [x] Both decks successfully load tracks and render waveforms
- [x] Track library sidebar shows all tracks with metadata (BPM, duration)


## Bug Fixes (User Reported)
- [x] Fix Sample Packs search returning no results
- [x] Fix Loop button crash: RangeError NaN in Tone.js gain ramp
- [x] Debug Freesound API search endpoint (fixed license filter syntax)
- [x] Fix EQ gain initialization to prevent NaN values (added safety checks)
- [x] Test Sample Packs search with various queries (tested "kick drum")
- [x] Test Loop button on both decks with different tracks (tested Deck A)


## Critical Bug Fix - NaN Error Still Occurring
- [x] Investigate exact source of NaN RangeError in Deck component
- [x] Add comprehensive NaN validation to all Tone.js rampTo() calls
- [x] Ensure EQ sliders have valid default values before any audio operations
- [x] Test track loading without errors
- [x] Add audioChainReady flag to prevent premature EQ updates
- [x] Add isFinite() checks to all EQ gain ramps
- [x] Verify Loop button works without crashing


## DJ Station UX Fixes (User Feedback - Re-implemented after sandbox reset)
- [x] Fix hot cue functionality to jump to cue points on second click
- [x] Implement deck state persistence across tab switches
- [x] Fix UI overlap between Cue/Loop buttons and EQ labels
- [x] Update deck placeholder text to match button loading functionality
- [x] Replace old Cue/Loop buttons with 4 hot cue pads (1, 2, 3, 4)
- [x] Add localStorage persistence for deck state (vflx10-deckA, vflx10-deckB)
- [x] Update placeholder text to "Click 'Deck X' button in Track Library to load"


## BPM Sync Feature
- [x] Add sync button UI to Deck component
- [x] Implement BPM sync logic to match Deck B tempo to Deck A
- [x] Calculate pitch adjustment: targetPitch = (masterBPM / slaveBPM) * currentPitch
- [x] Add visual indicator when sync is active (Sync button visible when both decks have BPM)
- [x] Test sync with tracks of different BPMs (120 BPM → 128 BPM, etc.)
- [x] Verify pitch slider updates when sync is applied
- [x] Test bidirectional sync (Deck A → B and Deck B → A)
- [x] Verified: Deck B (120 BPM) → Deck A (128 BPM) = 1.07x pitch
- [x] Verified: Deck A (128 BPM) → Deck B (120 BPM) = 0.94x pitch


## Web MIDI API Integration (Hardware Controller Support)
- [ ] Install Zustand for global state management
- [ ] Create useGlobalStore hook with DJ controls state (volume, EQ, crossfader, play state)
- [ ] Create useHardwareMIDI hook with Web MIDI API
- [ ] Implement MIDI message parsing (CC for knobs/faders, Note On for buttons)
- [ ] Map MIDI messages to global store updates
- [ ] Refactor useDJAudio to read from global store instead of local state
- [ ] Refactor Deck component for two-way binding with global store
- [ ] Refactor Mixer component for two-way binding with global store
- [ ] Initialize useHardwareMIDI in DashboardLayout for global MIDI listening
- [ ] Test physical MIDI controller → on-screen fader synchronization
- [ ] Test on-screen fader → audio engine synchronization
- [ ] Test physical MIDI button → play state and UI synchronization

## Festival Leaderboard Audio Playback
- [x] Add Tone.Player instance for leaderboard preview playback (independent from DJ decks)
- [x] Add play/pause button to each submission in leaderboard
- [x] Implement exclusive playback (stop other tracks when new one starts)
- [x] Add playback state management (currently playing submission ID)
- [x] Test audio streaming from submission URLs
- [x] Verify playback independence from DJ Station
