<!-- LLM/Claude Context: Section = 3. PRD (Product Requirements Document) -->

This Product Requirements Document (PRD) defines the high-level product vision, business goals, target audience, and the scope for the Minimum Viable Product (MVP) and beyond, with a strict focus on functional, verifiable features.
1. Introduction
Product Name: EDM Shuffle
Vision: To be the web’s most engaging digital rave experience, empowering talent, celebrating diversity, and fostering genuine connection through EDM, shuffle dance, and festival culture.
Problem: Existing platforms are either static, lack deep interaction, or fail to combine music, dance, and community in an authentic, high-energy, and transparent way. Prior attempts at EDM Shuffle suffered from simulated/fake features.
Solution: An AI-powered, multi-agent (Claude Code, Gemini CLI, Roo Code) platform that delivers real-time interactive DJ experiences, personalized archetype journeys, a peer-driven fashion marketplace, and a vibrant, authentic community hub.
2. Goals
Core Goal: Deliver tangible, verifiable functionality over elaborate, simulated features.
MVP Goal: Establish a fully functional user journey for core experiences (login, music playback, basic interaction/voting) that proves the core value proposition.
Monetization Goal: Lay the foundation for future revenue streams (marketplace, premium features) based on real user engagement.
Integrity Goal: Maintain absolute transparency regarding feature status (real vs. simulated/placeholder) throughout development.
3. Target Audience
Primary: Gen Z EDM enthusiasts, shuffle dancers, aspiring DJs, festival-goers, ravewear creators/sellers.
Secondary: Music producers, event organizers, dance instructors, fashion brands.
4. Core Features
User Authentication & Profiles: Secure registration, login, profile management, archetype selection.
DJ Mix Station: Interactive dual decks, real-time audio playback, crossfading, pitch control, echo FX, dynamic waveform visualization.
Festival Voting Stage: Live DJ competitions, user voting, dynamic leaderboards, headliner selection.
Shuffle Feed & Challenges: Dynamic feed of user-submitted dance content, archetype-specific challenges, gamified progression.
Community & Crews: Live chat, private squad/fam groups, commenting, avatar/crew management, user-to-user interaction.
Fashion Marketplace: Peer-to-peer resale for ravewear, affiliate listings, AI style matching, secure payment processing.
Autonomous Agent System: AI-driven content curation, personalization, moderation, and operational automation.
Admin Dashboard: Comprehensive tools for content, user, event, and product management.
Built-in Marketing Framework: In-app campaign creation, content generation, and automation handoff to external platforms.
5. Non-Functional Requirements
Performance: Fast load times, smooth animations (60 FPS target), responsive UI.
Scalability: Designed for high concurrency (e.g., live festival events, thousands of users).
Security: Robust user authentication (Supabase), secure API endpoints, protection against common web vulnerabilities.
Maintainability: Modular component architecture, clean code, comprehensive documentation.
Accessibility: WCAG 2.1 AA compliance where applicable (keyboard navigation, screen reader support, clear contrasts).
Truthfulness: NO FAKED LOGIC OR SIMULATED FEATURES WILL BE PRESENTED AS REAL. Any placeholder or non-functional element must be explicitly labeled in the UI and code.
6. Release Phases (High-Level)
MVP (Initial Launch): Focus on core user auth, basic real audio playback, archetype selection, and visible (but not necessarily fully backend-integrated) core loops.
Phase 2: Core Platform Enhancement: Deepen audio features, integrate voting, begin real content agents.
Phase 3: Community & Monetization: Implement social features, activate marketplace, advanced AI personalization.
7. Testing & Validation Protocols
Automated Testing: Unit, integration, and end-to-end tests (Jest/Playwright).
Manual QA: User flow tests, visual regression checks, cross-browser compatibility.
LLM Validation: Require LLMs (Claude Code, Gemini CLI, Roo Code) to provide console logs, screenshots, and explicit confirmation of functionality before marking tasks complete.
Truth Audits: Regular human review to compare claimed progress against actual, visible, and functional outputs.
8. Future Considerations
Mobile native apps
Advanced AI music generation
VR/AR integrations for festivals
Deeper blockchain/NFT integration
