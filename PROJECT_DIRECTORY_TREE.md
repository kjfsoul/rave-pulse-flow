# Rave Pulse Flow - Project Directory Structure

**Last Updated:** 2025-11-19
**Purpose:** Complete directory tree and visualization for project navigation

---

## Text Directory Tree

```
rave-pulse-flow/
├── .beads/                          # Beads issue tracker (Git-backed memory)
│   ├── issues.jsonl                 # Issue database (Git-tracked)
│   ├── beads.db                     # Local SQLite cache
│   └── config.yaml                  # Beads configuration
│
├── .cursor/                         # Cursor IDE configuration
│   └── rules/                       # IDE rules and protocols
│       ├── agent-usage.mdc
│       ├── beads-workflow.mdc
│       ├── byterover-rules.mdc
│       └── MANDATORY_SESSION_INIT.mdc
│
├── .github/                         # GitHub configuration
│   ├── workflows/                   # CI/CD workflows
│   └── instructions/
│
├── agent/                           # Claude Code Implementer agent
│   ├── main.ts                      # Agent entry point
│   ├── config.ts                    # Agent configuration
│   ├── deploy.ts                    # Deployment logic
│   ├── types.ts                     # Type definitions
│   └── validation.ts                # Validation logic
│
├── agents/                          # Agent registry and configs
│   ├── config.yaml                  # Agent configuration
│   └── registry.json                # Agent tool registry
│
├── api/                             # API routes
│   └── auth/                        # Authentication endpoints
│       └── freesound/               # Freesound OAuth callback
│
├── assets/                          # Static assets
│   └── fonts/                       # Custom fonts
│
├── docs/                            # Project documentation
│   ├── AGENT_PROTOCOL.md
│   ├── BEADS_ROADMAP_SYNC.md
│   ├── INTEGRATED_WORKFLOW.md
│   ├── TRIPLE_SYSTEM_*.md          # Triple system docs
│   └── WORK_ORDER.schema.yaml
│
├── memory/                          # Memory system files
│   ├── persistent/                  # Persistent session files
│   │   ├── project-state.json
│   │   └── session-YYYY-MM-DD.json
│   └── rave-pulse-flow/             # Project-specific memory
│
├── public/                          # Public static assets
│   ├── audio/                       # Audio files
│   ├── challenges/                  # Challenge data
│   ├── data/                        # JSON data files
│   │   ├── edm-news.json           # RSS feed cache
│   │   └── edm-news-backup.json
│   ├── images/                      # Image assets
│   │   └── printify/               # Printify product images
│   └── soundpacks/                  # Sound pack data
│
├── scripts/                         # Utility scripts
│   ├── agents/                      # Agent scripts
│   ├── memory/                      # Memory management scripts
│   ├── sync-printify.ts            # Printify sync script
│   └── generate-feed.js            # RSS feed generator
│
├── src/                             # Source code (main application)
│   ├── __tests__/                   # Test setup
│   │   ├── App.test.tsx
│   │   └── setup.ts
│   │
│   ├── audio/                       # Audio engine system
│   │   ├── __tests__/
│   │   ├── engine/                  # Audio engine core
│   │   │   ├── Analyser.ts
│   │   │   ├── AudioEngine.ts
│   │   │   └── Deck.ts
│   │   ├── hooks/                   # Audio hooks
│   │   │   └── useAudioEngine.tsx
│   │   └── recording/               # Recording functionality
│   │       └── Recorder.ts
│   │
│   ├── components/                  # React components
│   │   ├── __tests__/               # Component tests
│   │   │
│   │   ├── audio-ui/                # Audio UI components
│   │   │   ├── AudioTestComponent.tsx
│   │   │   ├── BpmAura.tsx
│   │   │   ├── Crossfader.tsx
│   │   │   ├── DJDeck.tsx
│   │   │   ├── EnhancedDJDeck.tsx
│   │   │   ├── RecordingControls.tsx
│   │   │   ├── WaveformVisualizer.tsx
│   │   │   └── ... (17 total)
│   │   │
│   │   ├── auth/                    # Authentication components
│   │   │   ├── AuthForm.tsx
│   │   │   ├── ProtectedRoute.tsx
│   │   │   └── UserProfile.tsx
│   │   │
│   │   ├── ui/                      # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── input.tsx
│   │   │   └── ... (49 total)
│   │   │
│   │   ├── vFLX10/                  # vFLX-10 Pro Station components
│   │   │   ├── Deck.tsx             # DJ Deck component
│   │   │   ├── DJStation.tsx        # Main DJ Station
│   │   │   ├── DrumMachine.tsx      # Drum sequencer
│   │   │   ├── FestivalScenery.tsx  # Scene selector
│   │   │   ├── Mixer.tsx            # Audio mixer
│   │   │   ├── ProductionStation.tsx # Music production station
│   │   │   ├── SoundLibraryPanel.tsx # Track library
│   │   │   └── SynthStation.tsx     # Synth sequencer
│   │   │
│   │   ├── VisualFX/                # Visual effects components
│   │   │   ├── ArchetypeAuraSprite.tsx
│   │   │   ├── DroneFormations.tsx
│   │   │   ├── FestivalEnvironment.tsx
│   │   │   ├── FestivalStageBackground.tsx
│   │   │   ├── LightSyncPulse.tsx
│   │   │   └── ShuffleDancers.tsx
│   │   │
│   │   ├── EnhancedRSSFeed.tsx      # RSS feed component
│   │   ├── EnhancedFeedCard.tsx     # Feed card component
│   │   ├── FLX10Deck.tsx            # FLX10 deck component
│   │   ├── FLX10DeckPro.tsx         # Professional FLX10 deck
│   │   ├── LiveLeaderboard.tsx      # Live voting leaderboard
│   │   ├── PLURcrewSidebar.tsx      # PLUR crew sidebar
│   │   ├── ProfessionalDJStation.tsx # Professional DJ Station
│   │   ├── ShuffleChallenge.tsx     # Challenge component
│   │   ├── VotingInterface.tsx      # Voting UI
│   │   └── ... (40+ components)
│   │
│   ├── config/                      # Configuration files
│   │   ├── audio.ts                 # Audio configuration
│   │   └── features.ts              # Feature flags
│   │
│   ├── contexts/                    # React contexts
│   │   ├── AudioContext.tsx         # Audio context provider
│   │   ├── AuthContext.tsx          # Authentication context
│   │   └── VotingContext.tsx        # Voting context
│   │
│   ├── hooks/                       # Custom React hooks
│   │   ├── vFLX10/                  # vFLX-10 audio hooks
│   │   │   ├── useDJAudio.ts        # DJ audio routing
│   │   │   ├── useSequenceState.ts  # Sequence state management
│   │   │   └── useToneTransport.ts  # Tone.js transport
│   │   │
│   │   ├── useAudioEngine.ts        # Audio engine hook
│   │   ├── useAudioPlayer.ts        # Audio player hook
│   │   ├── usePrintifyProducts.ts   # Printify products hook
│   │   ├── useProStationStore.ts    # Pro Station Zustand store
│   │   ├── useRealAudioEngine.ts    # Real audio engine hook
│   │   ├── useTrueAudio.ts          # True audio hook
│   │   ├── useTTS.ts                # Text-to-speech hook
│   │   ├── useVoiceCommands.ts      # Voice commands hook
│   │   ├── use-mobile.tsx           # Mobile detection hook
│   │   └── use-toast.ts             # Toast notification hook
│   │
│   ├── lib/                         # Library and utility code
│   │   ├── printify/                # Printify integration
│   │   │   ├── client.ts            # Printify API client
│   │   │   ├── index.ts             # Public API
│   │   │   ├── products.ts          # Static product catalog
│   │   │   └── types.ts             # Printify types
│   │   │
│   │   ├── challengeSystem.ts       # Challenge system logic
│   │   ├── database.ts              # Database utilities
│   │   ├── existsIntegration.ts     # Exists.com integration
│   │   ├── professionalAudioEngine.ts # Professional audio engine
│   │   ├── stripe.ts                # Stripe integration
│   │   ├── supabase.ts              # Supabase client & types
│   │   ├── utils.ts                 # General utilities
│   │   └── votingSystem.ts          # Voting system logic
│   │
│   ├── pages/                       # Page components
│   │   ├── ArchetypeQuiz.tsx        # Archetype quiz page
│   │   ├── DJMixStation.tsx         # DJ Mix Station page
│   │   ├── FestivalVotingStage.tsx  # Festival voting page
│   │   ├── Index.tsx                # Homepage
│   │   ├── MarketplaceGrid.tsx      # Marketplace page
│   │   ├── News.tsx                 # News/RSS feed page
│   │   ├── NotFound.tsx             # 404 page
│   │   ├── PrivacyPolicy.tsx        # Privacy policy page
│   │   ├── ProfessionalDJStationPage.tsx # Pro DJ Station page
│   │   ├── Profile.tsx              # User profile page
│   │   ├── ProStationTest.tsx       # vFLX-10 test page
│   │   ├── ShuffleChallengePage.tsx # Challenge page
│   │   ├── ShuffleFeed.tsx          # Shuffle feed page
│   │   └── VotingPage.tsx           # Voting page
│   │
│   ├── test/                        # Test components
│   │   └── QuizFlowTest.tsx
│   │
│   ├── utils/                       # Utility functions
│   │   └── audioGenerator.ts        # Audio generation utilities
│   │
│   ├── App.tsx                      # Main app component
│   ├── App.css                      # App styles
│   ├── index.css                    # Global styles
│   ├── main.tsx                     # Entry point
│   └── vite-env.d.ts                # Vite type definitions
│
├── supabase/                        # Supabase configuration
│   ├── config.toml                  # Supabase local config
│   │
│   ├── functions/                   # Supabase Edge Functions
│   │   ├── _shared/                 # Shared utilities
│   │   │   └── cors.ts              # CORS headers
│   │   │
│   │   ├── crew-status/             # Crew status function
│   │   │   └── index.ts
│   │   │
│   │   ├── plan-festival/           # Festival planning function
│   │   │   └── index.ts
│   │   │
│   │   ├── printify-products/       # Printify products proxy
│   │   │   └── index.ts
│   │   │
│   │   ├── rss-proxy/               # RSS feed proxy (CORS bypass)
│   │   │   └── index.ts
│   │   │
│   │   ├── submit-vote/             # Vote submission function
│   │   │   └── index.ts
│   │   │
│   │   └── deno.json                # Deno configuration
│   │
│   ├── migrations/                  # Database migrations
│   │   ├── 20250126_shuffle_challenges.sql
│   │   └── 20250812_festival_votes_update.sql
│   │
│   └── cron-jobs/                   # Scheduled jobs
│
├── tests/                           # Test files
│   └── *.ts                         # Test configurations
│
├── vflx-10-pro-station 2/           # vFLX-10 Pro Station reference code
│   ├── client/                      # Client-side code
│   │   ├── public/
│   │   └── src/                     # React components (reference)
│   ├── server/                      # Server-side code
│   │   ├── _core/                   # Core server logic
│   │   └── routers/                 # API routers
│   ├── shared/                      # Shared code
│   │   └── _core/                   # Core shared logic
│   └── drizzle/                     # Drizzle ORM migrations
│       ├── meta/
│       └── migrations/
│
├── .cursorignore                    # Cursor ignore patterns
├── .gitignore                       # Git ignore patterns
├── components.json                  # shadcn/ui component config
├── eslint.config.js                 # ESLint configuration
├── index.html                       # HTML entry point
├── MEMORY_PROCEDURES.md             # Memory system documentation
├── package.json                     # Node.js dependencies
├── playwright.config.ts             # Playwright test config
├── postcss.config.js                # PostCSS configuration
├── README.md                        # Project README
├── tailwind.config.ts               # Tailwind CSS configuration
├── tsconfig.json                    # TypeScript configuration
├── tsconfig.app.json                # App TypeScript config
├── tsconfig.node.json               # Node TypeScript config
├── vercel.json                      # Vercel deployment config
├── vite.config.ts                   # Vite build configuration
└── vitest.config.ts                 # Vitest test configuration
```

---

## Mermaid Diagram

\`\`\`mermaid
graph TB
    Root[rave-pulse-flow/]

    %% Configuration & Tools
    Root --> Beads[.beads/<br/>Issue Tracker]
    Root --> Cursor[.cursor/<br/>IDE Config]
    Root --> GitHub[.github/<br/>CI/CD]

    %% Agent System
    Root --> Agent[agent/<br/>Claude Implementer]
    Root --> Agents[agents/<br/>Agent Registry]

    %% Documentation
    Root --> Docs[docs/<br/>Documentation]

    %% Memory System
    Root --> Memory[memory/<br/>Memory System]
    Memory --> Persistent[persistent/<br/>Session Files]

    %% Public Assets
    Root --> Public[public/<br/>Static Assets]
    Public --> Images[images/<br/>Product Images]
    Public --> Data[data/<br/>JSON Data]
    Public --> Audio[audio/<br/>Audio Files]

    %% Scripts
    Root --> Scripts[scripts/<br/>Utility Scripts]
    Scripts --> AgentScripts[agents/<br/>Agent Scripts]
    Scripts --> MemoryScripts[memory/<br/>Memory Scripts]

    %% Main Source Code
    Root --> Src[src/<br/>Source Code]

    %% Source: Components
    Src --> Components[components/<br/>React Components]
    Components --> AudioUI[audio-ui/<br/>Audio UI]
    Components --> Auth[auth/<br/>Auth Components]
    Components --> UI[ui/<br/>shadcn/ui]
    Components --> VFLX10[vFLX10/<br/>Pro Station]
    Components --> VisualFX[VisualFX/<br/>Visual Effects]

    %% Source: Core Logic
    Src --> Pages[pages/<br/>Page Components]
    Src --> Contexts[contexts/<br/>React Contexts]
    Src --> Hooks[hooks/<br/>Custom Hooks]
    Src --> Lib[lib/<br/>Library Code]
    Src --> Config[config/<br/>Configuration]
    Src --> AudioEngine[audio/<br/>Audio Engine]

    %% Hooks Detail
    Hooks --> VFLX10Hooks[vFLX10/<br/>Audio Hooks]

    %% Library Detail
    Lib --> Printify[printify/<br/>Printify Integration]

    %% Supabase
    Root --> Supabase[supabase/<br/>Supabase Config]
    Supabase --> Functions[functions/<br/>Edge Functions]
    Supabase --> Migrations[migrations/<br/>Database Migrations]

    %% Functions Detail
    Functions --> Shared[_shared/<br/>Shared Utils]
    Functions --> PrintifyProxy[printify-products/<br/>Products Proxy]
    Functions --> RSSProxy[rss-proxy/<br/>RSS Proxy]
    Functions --> CrewStatus[crew-status/<br/>Crew API]
    Functions --> PlanFestival[plan-festival/<br/>Festival API]
    Functions --> SubmitVote[submit-vote/<br/>Vote API]

    %% Reference Code
    Root --> VFLX10Ref[vflx-10-pro-station 2/<br/>Reference Code]
    VFLX10Ref --> VFLX10Client[client/<br/>Client Code]
    VFLX10Ref --> VFLX10Server[server/<br/>Server Code]

    %% Styling
    classDef config fill:#e1f5ff,stroke:#01579b,stroke-width:2px
    classDef src fill:#f3e5f5,stroke:#4a148c,stroke-width:2px
    classDef supabase fill:#3ecf8e,stroke:#166534,stroke-width:2px
    classDef public fill:#fff3e0,stroke:#e65100,stroke-width:2px

    class Beads,Cursor,GitHub config
    class Components,Pages,Contexts,Hooks,Lib,Config,AudioEngine src
    class Supabase,Functions,Migrations supabase
    class Public,Images,Data,Audio public
\`\`\`

---

## Key Directories Explained

### `.beads/` - Issue Tracking Memory
- **Purpose:** Git-backed issue tracker solving agent amnesia
- **Files:** `issues.jsonl` (Git-tracked), `beads.db` (local cache)
- **Usage:** `bd` command-line tool

### `src/components/` - React Components
- **`audio-ui/`**: Audio visualization and control components
- **`vFLX10/`**: Professional DJ station components (ported from vFLX-10)
- **`ui/`**: shadcn/ui base components (buttons, cards, dialogs, etc.)
- **`VisualFX/`**: Visual effects and animations

### `src/hooks/` - Custom React Hooks
- **`vFLX10/`**: Audio hooks for DJ station (Tone.js, Wavesurfer)
- **Other hooks**: Audio engine, player, Printify, voice commands

### `src/lib/` - Library Code
- **`printify/`**: Printify product integration (API client, types, static catalog)
- **Core libraries**: Database, voting, challenge systems

### `supabase/functions/` - Edge Functions
- **`_shared/cors.ts`**: Shared CORS headers
- **`printify-products/`**: Printify API proxy
- **`rss-proxy/`**: RSS feed CORS proxy
- **Other functions**: Crew status, festival planning, voting

### `public/` - Static Assets
- **`images/printify/`**: Cached Printify product images
- **`data/`**: JSON data files (RSS feed cache)

### `scripts/` - Utility Scripts
- **`sync-printify.ts`**: Sync Printify products script
- **`generate-feed.js`**: RSS feed aggregation script

---

**Created:** 2025-11-19
**Maintained By:** AI Agents
**Purpose:** Project navigation and architecture reference
