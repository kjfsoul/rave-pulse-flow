# EDM Shuffle

Welcome to **EDM Shuffle** — the next-gen community-driven digital rave and festival platform.
This project is an open, transparent, and rigorously documented codebase, built with a focus on trust, verifiability, and collaboration across leading AI coding assistants (Claude Code, Gemini CLI, Roo Code, and more).

## 🚀 What is EDM Shuffle?

EDM Shuffle is a festival-inspired, interactive audio/visual experience for DJs, shufflers, and festival fans. The platform includes:

- Real-time DJ Mix Station with dual decks and authentic Web Audio API features
- Live Festival Voting Stage for audience-driven lineups
- Crowd engagement: Confetti bursts, emoji reactions, and interactive challenges
- Dynamic Rave Marketplace (fashion, gear, and more)
- Community leaderboard, PLUR power, and archetype-based game mechanics
- Extensible for virtual events, merch drops, and user submissions

## 🔍 Repository Structure

- **All documentation is located in the root directory of this repo.**
- Major source code lives under `/src/`, with components, pages, and hooks logically organized.

## 📂 Documentation Index

See [`DOCUMENTATION_INDEX.md`](./DOCUMENTATION_INDEX.md) for a full, clickable list with descriptions.

**Key Docs in Root Directory:**

- `README.md` (this file)
- `CLAUDE_INTEGRITY_RULES.md`
- `IMPLEMENTATION_MICROTASKS.md`
- `PRD.md` (Product Requirements)
- `FRS.md` (Functional Requirements)
- `MASTERPLAN.md` (Strategic Project Roadmap)
- `AUDIO_UI_COMPONENTS.md`
- `claudeupdate.md`
- _...plus other live docs as they are created (see index)_

## 🛠️ Contributing

- **Strictly adhere to** `CLAUDE_INTEGRITY_RULES.md` (no placeholder code, no fabricated claims).
- **Work on one microtask at a time, in order, as defined in `IMPLEMENTATION_MICROTASKS.md`.**
- Use `claudeupdate.md` for reporting progress and issues.
- If blocked, escalate to human or next AI assistant as noted in the rules.

## 🧰 Tech Stack

- React + TypeScript (Vite)
- Tailwind CSS
- Web Audio API
- Supabase (planned)
- Open, extensible for cloud/AI integrations (Gemini CLI, Claude Code, Roo Code, Kimi Dev, etc.)

## 💻 Development

### Enabling the Web Audio Engine

The new Web Audio-based engine is currently behind a feature flag. To enable it for local development:

1.  Create a file named `.env.local` in the root of the project.
2.  Add the following line to the file:

    ```
    NEXT_PUBLIC_FF_AUDIO_ENGINE=true
    ```

3.  Start the development server (`pnpm dev`). The audio engine will now be active.

By default, this feature is turned **off**.

## 🎯 Core Principles

- **Transparency:** Every commit, feature, and claim must be verifiable.
- **Modularity:** Components and features are built independently and composably.
- **Community-Driven:** Prioritizing user engagement, feedback, and collective energy.

## 🛒 Printify Merch Pipeline

The homepage Gear Drops carousel and marketplace merch grid are powered by the EDM Shuffle Printify store (`storeId: 24437349`). To refresh the catalog or download the latest images:

1. Add the following variables to your local environment:

   ```bash
   export PRINTIFY_API_KEY=sk_live_or_test_key
   # optional override; otherwise the tooling auto-detects the single shop whose title contains "edm"
   # export PRINTIFY_STORE_ID=24437349
   ```

2. Run the sync script to regenerate the static catalog and cache images in `public/images/printify`:

   ```bash
   npm run sync:printify
   ```

   > The EDM Shuffle sync only persists products that are both visible and published (have an external Printify ID), so the site always reflects live storefront merch.

3. Deploy the Supabase Edge Function `printify-products` with the secret `PRINTIFY_API_TOKEN` (same as the API key). The function will reuse `PRINTIFY_STORE_ID` if set; otherwise it auto-detects the single shop whose title contains "edm". The frontend calls this function at runtime to merge live product data with the auto-generated catalog.

If the live API is unreachable, the UI gracefully falls back to the bundled catalog produced by the sync script.

---

## 📄 See [`DOCUMENTATION_INDEX.md`](./DOCUMENTATION_INDEX.md) for full details on every doc and process

Let the digital rave begin. ✨
