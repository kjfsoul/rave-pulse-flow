<!-- LLM/Claude Context: Section = PHASE 3: Voting & Festival Scheduling -->

This phase has basic visual elements, but lacks robust, real-time logic and backend integration for core functionalities.
3.1 Festival Voting Logic & Live Leaderboard
Current Status: ⚠️ Partially Implemented (Cosmetic/Spammable). The Festival Voting Stage visually displays DJ cards and vote counters, and the voting button "works" but has no limits or validation, allowing users to spam votes. The leaderboard is visual only and not based on real, live data. The headliner crowning is simulated.
What Needs to be Addressed: Implement real, rate-limited, and unique-per-user voting logic with backend support. Develop a dynamic, real-time leaderboard that accurately reflects voting outcomes.
3.2 Festival Schedule UI + Backend Data Model
Current Status: ❌ Missing/Non-functional. The current site lacks a comprehensive festival calendar; event data is static.
What Needs to be Addressed: Build a robust festival schedule UI and a backend data model for events, capable of integrating with external APIs like EDMTrain or Eventbrite for daily updates.
3.3 Event Creation/Joining & Headliner Logic
Current Status: ❌ Missing/Non-functional. There is no functionality for users to create or join events, and the headliner logic is purely simulated.
What Needs to be Addressed: Implement functional event creation/joining and a clear, impactful headliner selection logic tied to the voting system.
