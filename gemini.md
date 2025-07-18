# GEMINI.md - Project Brief & Mandates: EDM Shuffle

This document provides the foundational context and rules for working on the EDM Shuffle project.

## 1. Project Brief

* **Project Name:** EDM Shuffle
* **Core Objective:** An immersive performer showcase platform designed to feel like a night festival. It is **not** a functional DJ tool for users, but a platform to discover and listen to up-and-coming artists.
* **Current Status:** Production Ready. The initial MVP is complete, and a major redesign of the core "Festival" page has been implemented, fixing 12 critical issues.
* **Key Feature:** The `/festival` page, which allows users to interact with performer cards, listen to their tracks, and engage via a real-time chat system.

## 2. Technology Stack

* **Framework:** Next.js 15.3.3 / React 18.3.1 with Vite (SWC)
* **UI:** Tailwind CSS with a custom EDM/Neon theme, shadcn/ui, Framer Motion
* **Audio:** Web Audio API
* **Backend:** Supabase (Auth & Database)
* **State Management:** TanStack Query & React Context

## 3. Agent Mandates & Workflow

**A. Core Integrity Rules (See `CLAUDE_INTEGRITY_RULES.md` for full details)**

* NEVER fabricate progress. All work must be verified.
* Work on ONE microtask at a time from `IMPLEMENTATION_MICROTASKS.md`.
* Pause for human review after each task.

**B. Agentic Memory Logging (MANDATORY)**
This is a non-negotiable background task for building agentic memory.

* **Shell Commands:** All terminal commands (`npm`, `git`, `bun`, etc.) **MUST** be prefixed with the `memlog-edm` alias.
  * **Example:** `memlog-edm npm run build`
* **Python Code:** This project does not currently require Python. If it is added, all key functions must be instrumented with the `@log_invocation` decorator.

**C. Multi-Agent Synchronization**

* This project is a multi-agent environment (Claude, Gemini, Roo Code).
* All progress, blockers, and session notes must be tracked in `claudeupdate.md` to ensure seamless handoffs between agents.

## 4. Primary Development Commands

* `npm run dev`: Start the development server on port 8080.
* `npm run build`: Build the application for production.
* `npm run lint`: Run the code linter.
