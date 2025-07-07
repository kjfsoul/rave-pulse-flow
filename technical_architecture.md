# EDM Shuffle – Technical Architecture

## Frontend

- **React + TypeScript** (Vite)
- **Tailwind CSS** for rapid UI styling
- **Component-driven architecture:** `/src/components/` contains all modular UI blocks (Decks, HUD, CrowdFX, Modals, etc.)
- **State Management:** React context/hooks for audio engine, user/session, and UI overlays
- **Web Audio API:** Deep integration for multi-deck playback, FX, and visualization

## Backend (Planned)

- **Supabase:** Auth, user data, and real-time backend (future)
- **Serverless endpoints:** For voting, event logs, submissions (future)
- **Marketplace/E-commerce:** Stripe or similar integration (future)
- **Cloud Storage:** For audio uploads, avatars, and track previews

## AI Agent Collaboration

- **Claude Code:** Handles TypeScript, component composition, and incremental refactors
- **Gemini CLI:** Handles file validation, formatting, dependency management, and build checks
- **Roo Code:** Steps in for task handoff or recovery if blocked

## DevOps

- **ESLint + Prettier** for linting/formatting
- **Jest/Playwright** for automated testing
- **Netlify/Vercel** for CI/CD and preview deploys

## Directory Structure

- `/src/` – Application source (components, pages, lib)
- `/public/` – Static files (audio, images, icons)
- `/docs/` – (optional) Additional documentation
- Root directory – All key .md files and project configs

## Security & Integrity

- **No API keys in client code**
- **All mock/placeholder code labeled**
- **Code review via microtasks and integrity rules**
