<!-- LLM/Claude Context: Section = 4. Prompt Catalog -->

This section collates explicit LLM prompt instructions, prioritizing the final/most complete versions, along with their validation steps and integrity rules.
Initial Scaffold & Visuals (Prompt 1, HomePage):
Prompt: "Build a modern React + Tailwind + Framer Motion app scaffold... Homepage with kinetic festival visuals, CTA sections, real navigation header... Dark mode default with neon accent theme... NavBar and Hero with animated background (Framer Motion), disco ball or audio visualizer welcome block... Set up routing with modular components per page... Include archetype-switcher dropdown in Nav (placeholder).".
Validation: Verify visual styling, PLUR orbs, glowing sneakers, basic UI, and responsive design.
Archetype Quiz (Prompt 2, ArchetypeQuiz.tsx):
Prompt: "Transform the ArchetypeQuiz into an immersive cosmic portal experience with multi-step animations, dynamic aura meters, and a ceremonial reveal... Artist spotlights, matching DJs to the result... Use Tailwind gradients, Framer Motion animation, and fake music reactions.".
Validation: Quiz works, aura meter animates, DJ cards are shown. Ensure quiz is not gating overall experience.
ShuffleFeed - Remix Buttons (Prompt 3, ShuffleFeed.tsx):
Prompt: "Upgrade the ShuffleFeed.tsx from a passive grid into an interactive PLUR-based remix dojo... For each feed item, summon a RemixModal with pitch/tempo sliders. Click Generate returns a new stub .mp3 URL (call /api/remix/mock). Update feed item's audio source to remix URL and tag '🔀 Remixed'.".
Validation: Modal opens, sliders change JSON payload, after "Generate" feed item plays new URL (even if mocked). No real playback or customization, just button styling.
Festival Voting Stage - Turntables & Audio (Prompt 5, FestivalVotingStage.tsx):
Prompt: "Transform FestivalVotingStage.tsx into an interactive virtual rave stage... Add 2 glowing turntable decks (drag to scratch, click to echo/reverb, LED ring pulse). Place 'Hype the Crowd' button... Play a looping local .mp3 beat. Add mute/unmute toggle. Pulse background gradients, leaderboard bars, stage glow to beat. DJ voting cards show 'Preview Track' button (fakes switch). When vote, bar fills, DJ avatar glows, 'LIVE' label, confetti/pyro. Floating top banner 'Festival Energy'. Fake 'crowd chat' sidebar. Background: festival stage silhouette + subtle lasers. Everything sound-reactive, archetype-themed, PLUR hype.".
Validation: Stage background, DJ cards, voting counts, scratch/echo simulation work. Audio must actually play, decks animate and influence simulated music, votes should affect some state. Ensure sound, staging, and energy burst feel like a rave opening.
User Authentication (Core Task, not a single prompt):
Prompt: "Create a fully working user auth flow for EDM Shuffle using Supabase (or recommended modern backend). Must support sign up, login, email/password reset, and user profile. UI responsive, branded, linked to app's state/context. All returned data must be real; do not use mocks. Add OAuth login... Ensure user-friendly error messages.".
Validation: Successful user registration, login, profile display with real Supabase data. Functional password reset and OAuth integration.
Web Audio API Engine (Core Task, not a single prompt):
Prompt: "Build a fully functional DJ mix engine in React/TypeScript using the Web Audio API. Support two decks (A/B), play/pause, volume, crossfade, pitch, and echo controls. No HTML5 Audio fallback. All controls must be visible, interactive, and reflect actual audio state. Add a live waveform visualizer and BPM display...".
Validation: All deck controls functional and reflect actual audio state. Waveform visualizer uses real audio data and animates in sync. Cross-browser compatibility.
