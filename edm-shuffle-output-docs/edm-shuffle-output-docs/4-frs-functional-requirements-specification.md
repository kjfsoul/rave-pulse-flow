<!-- LLM/Claude Context: Section = 4. FRS (Functional Requirements Specification) -->

This Functional Requirements Specification (FRS) provides a granular breakdown of exactly what each feature must do, including inputs, outputs, component dependencies, integration points, and defined failure states. It directly guides LLM development by outlining precise, verifiable expectations.
1. User Authentication & Account System
1.1 User Registration (Email/Password)
Description: Allow new users to create an account via email and password.
Inputs: Email (string, valid format), Password (string, min 8 chars, strong), Password Confirm.
Outputs: User session token, redirect to onboarding/profile.
Dependencies: Supabase Auth, client-side validation.
Failure States: Invalid email format, password mismatch, email already exists, network error. Display specific error messages.
Truth & Validation:
Prompt for Claude Code: "Implement a secure, Supabase-backed user registration flow. Include client-side validation for email/password strength. On successful registration, log the user in and redirect to /onboarding. Handle and display specific error messages for invalid input, existing email, or network issues."
Expected Output/Validation:
Code for registration form component (AuthRegister.tsx).
Screenshots/video of successful registration and redirection.
Logs showing Supabase user creation.
Demonstration of error messages for all failure states.
No fake success messages or redirects without actual user creation.
1.2 User Login (Email/Password)
Description: Allow existing users to log into their account.
Inputs: Email (string), Password (string).
Outputs: User session token, redirect to dashboard/home.
Dependencies: Supabase Auth.
Failure States: Invalid credentials, user not found, network error.
Truth & Validation:
Prompt for Claude Code: "Implement a login form for Supabase-backed authentication. On successful login, persist the session and redirect to /dashboard. Provide clear error messages for incorrect credentials or network issues. Ensure UI is responsive and accessible."
Expected Output/Validation:
Code for login form component (AuthLogin.tsx).
Screenshots/video of successful login.
Logs showing successful Supabase session creation.
Demonstration of error messages for invalid credentials.
Verify persistent session across browser refreshes.
1.3 Password Reset (Email)
Description: Allow users to reset their password via an email link.
Inputs: Email (string).
Outputs: Confirmation message, email sent.
Dependencies: Supabase Auth (password reset functionality), email service integration (e.g., SendGrid configured via Supabase).
Failure States: Email not found, network error.
Truth & Validation:
Prompt for Claude Code: "Implement the password reset initiation flow. User enters email, receives confirmation. Supabase should send a password reset email. Do not mock email sending; verify Supabase integration for this specific feature."
Expected Output/Validation:
Code for password reset request component (PasswordResetRequest.tsx).
Confirmation message displayed in UI.
Logs confirming Supabase password reset email trigger.
Proof: If possible, confirm a test email is sent (e.g., via Supabase logs or a real test email client).
1.4 Profile Management (Placeholder-Free)
Description: Allow authenticated users to view and update their profile information.
Inputs: Username (string, unique), Avatar URL (string), Archetype (enum), Bio (text).
Outputs: Updated user profile in database.
Dependencies: Supabase Database (User Profiles table), Supabase Storage (for avatars), user session.
Failure States: Duplicate username, invalid input, database update error.
Truth & Validation:
Prompt for Claude Code: "Build a user profile view/edit component (UserProfile.tsx). User can update username, avatar, and bio. Changes must persist to Supabase database. Show loading states during update. Ensure no placeholder data is used for user info."
Expected Output/Validation:
Code for profile component.
Screenshots/video of successful profile updates.
Supabase database logs showing data changes.
Demonstration of error handling for duplicate usernames or invalid inputs.
2. Audio Engine & Mix Station
2.1 True Web Audio API Engine
Description: Implement a robust, multi-deck audio engine using the Web Audio API for real-time mixing.
Inputs: Audio file URLs, user control inputs (play, pause, volume, pitch, FX).
Outputs: Audibly mixed audio output, real-time audio visualization data.
Dependencies: Web Audio API, Howler.js (for simplified audio management, if chosen).
Failure States: Audio file 404, Web Audio API not supported, decoding errors. Display "Simulation Mode" badge if real audio fails.
Truth & Validation:
Prompt for Claude Code: "Implement a core audio context provider (useAudioEngine.ts). This must instantiate a real Web Audio API context. Create two independent audio sources (Deck A & B) that can load and play local .mp3 files. Expose play(), pause(), setTrack(url), setVolume() for each deck. Ensure cross-browser compatibility (Chrome, Edge, Safari, Firefox). Display a 'SIMULATION MODE' badge if the real Web Audio API fails to initialize or play sound. DO NOT USE PLACEHOLDER AUDIO."
Expected Output/Validation:
Core audio engine code.
Logs confirming Web Audio API context creation.
Video demonstrating actual, audible playback of independent tracks on Deck A and B.
Screenshot of "SIMULATION MODE" badge if audio fails (e.g., by intentionally blocking audio load).
2.2 Deck A/B Real Playback, Crossfade, Pitch, Echo FX
Description: Enable full interactive control over two DJ decks, including audio crossfading, pitch shifting, and echo effects.
Inputs: User interactions with sliders/buttons.
Outputs: Real-time audible changes to the mix.
Dependencies: Web Audio API nodes (GainNode, DelayNode, BiquadFilterNode), UI components (sliders, buttons).
Failure States: UI not affecting audio, effects not audible.
Truth & Validation:
Prompt for Claude Code: "Integrate UI controls (sliders for volume, pitch; buttons for echo, play/pause) with the useAudioEngine.ts from 2.1. Ensure the crossfader audibly blends between Deck A and B. Pitch controls must alter playback rate with an audible effect. Echo FX must produce a real delay/reverb sound. All controls must provide immediate visual feedback (e.g., slider position, button glow) that syncs to audible changes. No visual-only controls."
Expected Output/Validation:
Code for DJDeck.tsx and Crossfader.tsx.
Video demonstrating audible crossfading, pitch changes, and echo effects.
Video demonstrating visual feedback on controls precisely matching audio output.
Ensure no hardcoded values for effects; all should be dynamic.
2.3 Real-time Waveform + BPM Visualization
Description: Visually represent the audio waveform and synchronize animations with the track's BPM.
Inputs: Audio buffer data, BPM detection.
Outputs: Animated waveform bars, UI elements pulsing to BPM.
Dependencies: Web Audio API (AnalyserNode), BPM detection library (if possible, or mock for now with explicit labeling).
Failure States: Static visualizations, animations not synced.
Truth & Validation:
Prompt for Claude Code: "Implement a real-time waveform visualizer using AnalyserNode, displaying frequency data as animated bars. Integrate a BPM display that reacts to the audio (or mock it with a clear 'MOCKED BPM' label if real-time detection is out of scope). Ensure all visual effects (e.g., glowing equalizer, floating sneakers, PLUR orbs) pulse or animate in sync with the BPM."
Expected Output/Validation:
Code for WaveformVisualizer.tsx and BpmAura.tsx.
Video showing dynamic, real-time waveform animation.
Video demonstrating UI elements (e.g., GlowCard, NeonButton, EqualizerBars) visibly reacting to BPM.
If BPM is mocked, clear // MOCKED BPM comments in code and a visible label in the UI.
3. Voting & Festival Scheduling
3.1 Real Voting Logic (Rate-Limited, Unique per User)
Description: Implement a robust voting system for DJ competitions or other events.
Inputs: User ID, DJ/Candidate ID, Vote action.
Outputs: Vote recorded, real-time vote count update.
Dependencies: Supabase Database (Votes table), Supabase Auth (for user ID), API endpoints for voting.
Failure States: Duplicate vote, unauthorized vote, network error. Implement rate-limiting.
Truth & Validation:
Prompt for Claude Code: "Implement backend and frontend for real-time voting on the Festival Voting Stage. Votes must be unique per authenticated user (rate-limited to 1 vote/minute/user). Display real-time vote counts on DJ cards. Handle and display errors for duplicate votes or network issues. Ensure no placeholder votes."
Expected Output/Validation:
Code for voting API endpoint and VotingButton.tsx.
Logs confirming Supabase vote writes.
Video showing real-time vote count updates and rate-limiting enforcement.
Attempt to vote without auth/too frequently, verify error message.
3.2 Festival Schedule UI + Backend Data Model
Description: Display an interactive festival schedule with events, artists, and stages.
Inputs: Admin input for events.
Outputs: Festival schedule displayed, event details.
Dependencies: Supabase Database (FestivalEvents, Artists, Stages tables), API for fetching schedule.
Failure States: Empty schedule, data load error.
Truth & Validation:
Prompt for Claude Code: "Build a backend data model (Supabase tables) and API for festival schedules. Events should include: name, date, time, stage, artists, genre, link. Implement a responsive UI to display this schedule. Data must come from Supabase, not hardcoded. Show skeleton loading states and 'No events' fallback."
Expected Output/Validation:
Supabase schema and API code.
UI for FestivalSchedule.tsx displaying real data.
Screenshot of skeleton loading and empty state.
3.3 Event Creation/Joining, Headliner Logic, Live Leaderboard
Description: Allow users to RSVP/join events, crown headliners based on votes, and display a live leaderboard.
Inputs: User RSVP, vote counts.
Outputs: RSVP recorded, headliner announced, updated leaderboard.
Dependencies: Supabase (UserEvents, Leaderboard tables), voting system.
Truth & Validation:
Prompt for Claude Code: "Implement RSVP functionality for festival events. Users can join/unjoin. Based on voting data (from 3.1), implement headliner logic: when a DJ's votes exceed a threshold (e.g., 5000), they are marked as the headliner for that event. Display a live, animating leaderboard that updates in real-time with DJ vote counts. Headliner announcement should trigger confetti and a 'stinger' sound effect. No fake leaderboards or announcements."
Expected Output/Validation:
Code for RSVPButton.tsx, FestivalLeaderboard.tsx, HeadlinerConfetti.tsx, HeadlinerStinger.tsx.
Video showing RSVP flow and real-time leaderboard updates.
Video demonstrating confetti/stinger on headliner threshold met.
Confirm vote counts trigger accurate headliner selection.
4. Challenges & Social
4.1 Challenge Feed – Backend/API & Frontend Integration
Objective: Deliver a robust, dynamic challenge feed system with reliable data handling, accessibility, and bulletproof error/fallback states.
Tasks:
Backend: Create challenges table (fields: id, title, description, archetype, bpm, creatorId, type, status, mediaURL, submissionCount, start/end, etc.). Implement API endpoints for listing and retrieving challenges (paginated, filterable). Add validation for all inputs; strictly reject malformed/oversized data. Enforce rate limits for challenge creation (e.g., 3/hour/user).
Frontend: Fetch and render challenge list with skeleton loading states and paginated/infinite scroll UI. Show “No challenges available” or explicit error/fallback state if fetch fails (never blank). Accessible, mobile-first card layout. All data strictly typed; undefined/null always guarded. If in development, clearly label/test placeholder/demo data in UI and code comments. Retry/reload button and error context for failed requests. Filter/sort controls by archetype, difficulty, etc.
Validation & Failsafe: Simulate API offline or empty data: UI must show “No challenges found” + retry option. Try loading page on slow connection: must show skeleton, never unstyled blank. Code review: Confirm no placeholder/mock code ships to prod without explicit // TODO:/// NOTE: and fallback path.
Prompt for Claude Code: "Create a complete backend and API for the EDM Shuffle challenge feed, including a challenges Supabase table with validated fields. Implement API endpoints for paginated and filterable challenge lists. Frontend should fetch and render these dynamically with skeleton loading, pagination, and robust error handling (never blank screen). Ensure all data is strictly typed and mobile-first. No static data or placeholders."
Expected Output/Validation:
Supabase schema + API routes.
ChallengeFeed.tsx component code.
Screenshots/video of dynamic loading, pagination, error states.
Logs showing successful API calls to Supabase.
4.2 Challenge Submission Flow
Objective: Build a reliable, secure, and user-friendly challenge submission system for files and metadata.
Tasks:
Backend: Create submissions table (fields: id, challengeId, userId, caption, mediaUrl, tags, timestamp, status). Implement API endpoint for submission creation. File storage: secure upload to Supabase Storage. Implement robust file validation (type, size, malicious content scan), and rate-limit submissions.
Frontend: User must be authenticated. Form accepts media file (mp4/webm/jpg/png/gif, max 30MB), caption, squad tags. Client validates all fields before upload (disable submit if invalid). Show progress indicator during upload, error on fail, and success animation on confirmation. Allow user to retry after failure (don’t clear form on error).
Validation & Failsafe: Attempt large file upload (must fail gracefully). Try submitting without required fields (must show validation errors). Test network interrupt during upload (must show retry/error). Verify submitted content appears in a review queue (admin only).
Prompt for Claude Code: "Create a secure, fully validated challenge submission flow for EDM Shuffle. Frontend: User must be authenticated; form accepts media file (max 30MB, standard formats), caption, squad tags. Client validates fields before upload. Backend: Supabase submissions table, API endpoint for creation. Secure file upload to Supabase Storage with type/size validation and rate-limiting. Show accurate upload progress, success, and retryable error states. No mock flows."
Expected Output/Validation:
Supabase schema + API routes for submissions.
ChallengeSubmissionForm.tsx component code.
Video demonstrating full submission flow (upload, success, error).
Verify file upload to Supabase Storage.
4.3 PLUR Leaderboard & Gamification
Objective: Integrate a real-time leaderboard for "PLUR" points and challenge winners, driving engagement.
Tasks:
Backend: Create user_scores table (id, userId, totalPlur, challengesWon, streaks, badges). API endpoints for updating scores (triggered by challenge submission approval, voting, etc.) and fetching leaderboard data (paginated, sortable).
Frontend: Display live global and challenge-specific leaderboards. Show PLUR streak tracking (top-left counter) and PLUR meter progression with emoji. Implement animations for rank changes or new achievements.
Validation & Failsafe: Simulate score updates (verify real-time rank changes). Test edge cases (tie scores, very high scores). Ensure leaderboards degrade gracefully if backend fails.
Prompt for Claude Code: "Build a real-time PLUR leaderboard. Backend: Supabase user_scores table to track PLUR points, challenge wins, streaks. API endpoints to update scores and fetch leaderboards. Frontend: Display global and challenge-specific leaderboards. Implement a visible PLUR streak counter and a PLUR meter with emoji progression (🫂❤️🌀💥) that increases with interactions (e.g., successful challenge submissions). Animations for rank changes are crucial. No static leaderboards."
Expected Output/Validation:
Supabase schema + API routes for scores.
Leaderboard.tsx and PLURstreakMeter.tsx components.
Video demonstrating real-time score updates and animated leaderboards.
Verify PLUR streak/meter updates on simulated interactions.
5. Marketplace
5.1 Stripe/Payments Integration
Objective: Integrate Stripe (or equivalent) for secure and real payment processing.
Tasks:
Backend: Set up Stripe webhooks for payment events (success, failure, refunds). Implement API endpoints for:
Creating Stripe Checkout Sessions for products/tickets.
Handling successful payments and updating order status.
Frontend: Display "Buy Now" button. Redirect to Stripe Checkout for payment. Handle success/failure redirects from Stripe.
Validation & Failsafe: Test with Stripe test keys (success, failed, cancelled payments). Ensure error messages are clear and secure (no sensitive info). Implement retry logic for payment failures.
Prompt for Claude Code: "Integrate Stripe for product purchases. Backend: API endpoint for creating Stripe Checkout Sessions. Set up Stripe webhooks to update order status post-payment. Frontend: 'Buy Now' buttons initiate Stripe Checkout. Handle success/cancellation redirects. Use Stripe test keys; prove successful payment processing to update a mock order status in Supabase. No fake payment flows."
Expected Output/Validation:
Backend Stripe integration code.
Frontend BuyButton.tsx and payment handling logic.
Video demonstrating a full Stripe test payment flow (from click to success/failure).
Logs confirming Stripe webhook calls.
5.2 Real Product Listings (No Placeholders)
Objective: Enable dynamic, real product listings from a backend database.
Tasks:
Backend: Create products table (id, name, desc, price, image, archetype, stock, active). API endpoints: list (filter/sort), get by id, create/update/delete (admin only). Validate all data (types, prices, URLs, inventory).
Frontend: Fetch products live (never ship with static lists). Product cards: show all info, “Buy” or “Add to Cart” button (disable if out of stock). Handle fetch errors with visible fallback (“No products available. Retry.”).
Validation & Failsafe: Simulate empty product list (show fallback). Test filtering/sorting. Verify stock status affects UI. All admin/management UIs must be auth-protected. Real-time inventory check before each add-to-cart.
Prompt for Claude Code: "Build a fully dynamic, real product marketplace for EDM Shuffle. Backend: products Supabase table, API for listing (filterable/sortable) and retrieving products. Implement robust data validation. Frontend: Fetch products dynamically; display product cards with name, price, image. 'Buy'/'Add to Cart' buttons should be disabled if out of stock. Show fallback UI on fetch errors (never a blank screen). No hardcoded product lists or placeholder images in production."
Expected Output/Validation:
Supabase schema + API routes for products.
ProductCard.tsx and Marketplace.tsx components.
Video demonstrating dynamic product loading, filtering (if implemented), and out-of-stock behavior.
Verify dynamic content from Supabase.
5.3 Order Confirmation & Digital Download/Gift Flows
Objective: Provide clear order confirmation and manage digital product delivery.
Tasks:
Backend: Upon successful payment, create orders entry (userId, productId, total, status, timestamp) and digital_assets entry (userId, assetUrl, expiration). Implement API endpoint for digital asset delivery/download (secure, time-limited links).
Frontend: Display order confirmation page/modal with unique order ID and purchased items. For digital goods, provide a direct download link or access to a "My Downloads" section.
Validation & Failsafe: Simulate successful digital purchase (verify download link appears). Test invalid/expired download link (must show error). Ensure robust payment failure messaging.
Prompt for Claude Code: "Implement order confirmation and digital product delivery. Backend: orders Supabase table upon successful Stripe payment. For digital products, create a digital_assets entry with a secure, time-limited download URL. Frontend: Display a confirmation page/modal with order details. For digital goods, provide a functional (test) download link. Ensure error handling for failed downloads/access. No fake confirmations or download links."
Expected Output/Validation:
Supabase schema updates and API for orders/digital assets.
OrderConfirmation.tsx component.
Video demonstrating successful order confirmation and a test digital download.
Test secure link behavior (e.g., trying to access without purchase).
6. Community & Crews
6.1 Live Chat, Squad/Fam Features, and Commenting
Objective: Enable real-time user-to-user and group communication, supporting general chat, squad-specific chat, and commenting on content.
Tasks:
Backend: Supabase Realtime (for live chat) or similar WebSocket. messages table (senderId, receiverId/groupId, content, timestamp). comments table (userId, contentId, content, timestamp). API endpoints for sending/retrieving messages/comments, and fetching chat history.
Frontend: Real-time chat UI (global, squad-specific). Commenting section on challenge clips/artist profiles. Input validation (profanity filter, message length). Display send/read receipts (optional).
Validation & Failsafe: Test concurrent messages (no data loss). Simulate network disconnect (verify graceful reconnection/message queuing). Try sending profanity/long messages (verify filter/truncation).
Prompt for Claude Code: "Implement real-time live chat (global and squad-specific) and content commenting using Supabase Realtime. Backend: messages and comments Supabase tables with sender/receiver/content/timestamp. API endpoints for history. Frontend: Chat UI must display real messages and comments dynamically. Implement basic input validation (e.g., text length, light profanity filter). Verify real-time updates across multiple users. No static chat logs or comments."
Expected Output/Validation:
Supabase schema + API routes for chat/comments.
LiveChat.tsx and CommentsSection.tsx components.
Video demonstrating real-time message sending/receiving across multiple users.
Verify chat history persistence and content filtering.
6.2 Avatar, “Crew” Management, User-to-User Interactions
Objective: Allow users to create/manage crews (squads/fams), invite/kick members, and enhance user-to-user interaction.
Tasks:
Backend: crews table (id, name, leaderId, description, privacy, memberCount, archetype). crew_members join table (crewId, userId, role). API endpoints for:
Create/edit/delete crew.
Invite/accept/decline/kick member.
Change member role.
View crew profile/roster.
Frontend: Crew creation form. Crew dashboard (roster, invite system). User profiles display crew membership. Direct messaging/profile viewing.
Validation & Failsafe: Test inviting non-existent user. Try to join private crew without invite. Verify only leader can kick members. Simulate network errors during crew actions.
Prompt for Claude Code: "Implement crew/squad management. Backend: crews and crew_members Supabase tables to store crew data and member relationships (leader, member roles). API endpoints for create/edit/delete crew, invite/accept/kick members. Frontend: Build CrewCreator.tsx and CrewDashboard.tsx. User profiles should display crew membership. Ensure all actions (invites, kicks) are authenticated and authorized (e.g., only leaders can kick). No dummy crews or static membership."
Expected Output/Validation:
Supabase schema + API routes for crews.
CrewCreator.tsx and CrewDashboard.tsx components.
Video demonstrating crew creation, inviting a test user, and accepting/declining invites.
Verify permission enforcement (e.g., regular member cannot kick).
7. Admin + Docs
7.1 Admin Dashboard for Event/Product/Content Management
Objective: Provide a secure, centralized web interface for administrators to manage all platform content and users.
Tasks:
Backend: Implement role-based access control (admin, moderator, content manager). API endpoints for:
CRUD operations on FestivalEvents, Products, Challenges, Users, Crews, Comments, Reports.
View live activity feed and audit logs of admin actions.
Frontend: Secure login (with 2FA option). Dashboard UI with navigation for managing different entities. Data tables with sort, filter, search, pagination.
Validation & Failsafe: Attempt to access dashboard as regular user (blocked with clear message, logged attempt). Create, edit, delete entities (verify data updates and audit trail is updated). Simulate 2+ admins making changes simultaneously (test for consistency and no race conditions).
Prompt for Claude Code: "Develop a full-featured admin dashboard for EDM Shuffle. Implement role-based access (admin, moderator). Dashboard must allow management of: Festival schedule and event data (CRUD), Users (view, ban, promote/demote), Crew/squad approval, Challenges (approve, remove), Product listings (CRUD, inventory), Comments, and abuse reports. Include a live activity feed and audit logs for every admin action. Ensure secure login (no hardcoded credentials) and mobile-friendly UI. No dummy dashboards."
Expected Output/Validation:
Backend API for admin operations.
AdminDashboard.tsx and related sub-components.
Video demonstrating admin login and performing CRUD operations on test data (e.g., creating a new festival event, banning a user).
Logs confirming audit trail entries for admin actions.
7.2 Documentation Pipeline: Root Directory + Microtask Enforcement
Objective: Ensure all project documentation remains up-to-date, versioned, and is a mandatory part of the development workflow.
Tasks:
Pipeline Setup: All project docs (PRD.md, FRS.md, MASTERPLAN.md, CLAUDE_INTEGRITY_RULES.md, etc.) live in project root. Add DOCUMENTATION_INDEX.md for table of contents and version history.
CI/CD Integration: On each PR/merge/deployment, run a checklist: "Were all docs touched by this feature updated? Is a new microtask/checklist present for ongoing features? If any doc is not updated, CI fails and merge is blocked."
Tooling: Encourage use of Markdown linting/formatting tools (e.g., remark-lint).
Validation & Failsafe: Try deploying with a stale doc (CI should fail). Make a feature PR without a doc update (system should block and provide checklist feedback). Change doc, merge, and view version history (history should be complete, searchable, and accurate).
Prompt for Claude Code: "Implement an automated documentation pipeline. All project docs (PRD.md, FRS.md, MASTERPLAN.md, CLAUDE_INTEGRITY_RULES.md, etc.) must reside in the project root. Create DOCUMENTATION_INDEX.md as a central TOC and version tracker. Configure CI/CD to enforce document updates: if a feature PR touches a module, relevant docs MUST be updated, or the PR is blocked. Use linting for Markdown quality."
Expected Output/Validation:
DOCUMENTATION_INDEX.md content.
CI/CD configuration snippets (e.g., GitHub Actions, Netlify build hooks).
Demonstration of a PR failing due to missing doc updates.
7.3 Integrity & Compliance Automation
Objective: Continuously check platform logic for compliance with CLAUDE_INTEGRITY_RULES.md and legal/policy requirements (e.g., GDPR, copyright, fair use).
Tasks:
Automated Checks: Run integrity rule tests before deploy (e.g., check for placeholder code, mock data, API key exposure). Validate consent and user data handling per privacy policy. Scan codebase for legal/compliance violations (using OSS tools or custom scripts).
Reporting: All failures produce actionable errors, not warnings.
Validation & Failsafe: Intentionally add a mock data leak or bad code (CI should block deploy). Remove a privacy consent feature (test should catch and fail). Run compliance script with no errors (confirm clean pass and clear logs).
Prompt for Claude Code: "Set up automated integrity/compliance checks. Configure pre-deploy hooks to scan for: undeclared placeholder code, exposed API keys, and violations of user consent/privacy. Implement basic data validation checks. All failures must halt deployment and provide actionable error messages. No silent failures."
Expected Output/Validation:
CI/CD configuration with integrity checks.
Code for custom integrity scripts (if needed).
Video demonstrating CI/CD failing when an integrity rule is violated.
7.4 Periodic Masterplan & FRS Review
Objective: Ensure alignment between documentation, live code, and user feedback through scheduled reviews.
Tasks:
Review Checklist: After every major milestone, project leaders must review the FRS and MASTERPLAN against live code and user feedback. Checklist: "Every live feature accounted for in FRS? All known bugs or gaps logged and tracked? User feedback integrated into future phases?"
Version Control: Use versioned doc tracking in DOCUMENTATION_INDEX.md.
Remediation: If discrepancies found, update docs or backlog, assign microtasks.
Validation & Failsafe: Compare doc to code and feature set (no undocumented features). Simulate review: find gap, update doc, reassign microtask. Pull random doc section (should match app and user experience exactly).
Prompt for Claude Code: "Implement a system to enforce periodic review of FRS and MASTERPLAN. Add a feature to DOCUMENTATION_INDEX.md for version tracking of these core docs. Outline a process (e.g., a README section or an internal tool) to facilitate comparing current features against FRS/MASTERPLAN, logging discrepancies as microtasks. No 'drift' between docs and production."
Expected Output/Validation:
Updated DOCUMENTATION_INDEX.md with versioning capabilities.
A Markdown template for review notes/checklists.
Demonstration of adding a discrepancy as a microtask.
8. Built-in Marketing Framework
8.1 Marketing Dashboard (Campaign Management & Automation Handoff)
Objective: Provide an in-app dashboard for building and managing marketing campaigns, integrating with external automation tools.
Tasks:
Backend: Implement role-protected access. campaigns table (id, name, status, platforms, startDate, endDate, createdBy). Store content assets (copy, images, webhooks). API endpoints for campaign CRUD.
Frontend: Campaign creation wizard (select platforms: Instagram, TikTok, X, Threads, Facebook, YouTube, Printify, etc.). Live preview (mobile/desktop/social card view). Scheduling calendar for posts.
Integration (n8n/Printify): For every campaign, generate a webhook/JSON config for n8n to post/schedule/send content to each platform. Sync campaign assets, product descriptions, and drop schedules to Printify.
Validation & Failsafe: Create a test campaign (verify data persistence). Generate a test n8n webhook (verify structure and data). Simulate failed Printify sync (display error).
Prompt for Claude Code: "Develop a role-protected Marketing Dashboard within EDM Shuffle’s admin suite. Features: Campaign creation wizard (select platforms, define schedule). Content generation (LLM-driven copy/hashtags - initiate via API calls, don't implement full LLM). Output n8n webhooks/JSON config for automated posting. Sync with Printify for product drops. Ensure role-based access and logging of all actions. No dummy campaigns or non-functional integrations."
Expected Output/Validation:
Supabase schema + API for campaigns.
MarketingDashboard.tsx component.
Video demonstrating campaign creation and generation of n8n/Printify-compatible JSON/webhooks.
Logs confirming data storage and webhook generation.
8.2 Content Generation & Library
Objective: Create a searchable, filterable library for all marketing content assets, with AI-driven suggestions for reuse.
Tasks:
Backend: content_library table (id, type, assetUrl, textContent, tags, platform, campaignId, ownerId, lastUsed). API endpoints for CRUD and search.
Frontend: Internal content library module with quick search, preview, and copy/paste/share tools. AI suggestion: propose “next post” or “revive successful campaign” (via LLM API calls). Export to CSV, JSON, or direct n8n/Printify pipeline.
Validation & Failsafe: Create, save, and retrieve content from the library. Filter and reuse in new campaigns. Test export and direct pipeline push to n8n/Printify.
Prompt for Claude Code: "Build an internal content library module in the marketing dashboard. Backend: content_library Supabase table to store marketing assets (copy, image URLs, tags). API for search, retrieval, and CRUD. Frontend: UI for managing the library. Users can create, save, and retrieve marketing content. Include AI suggestion (via stubbed API endpoint for LLM) to propose content reuse. Allow export to JSON. No hardcoded content."
Expected Output/Validation:
Supabase schema + API for content library.
ContentLibrary.tsx component.
Video demonstrating content creation, saving, searching, and previewing.
Logs confirming data persistence in Supabase.
8.3 Best Practices, Failsafes, & Innovation
Rate-limited/sandbox mode for mass posting (avoids bans/duplication).
All campaign copy is human-editable and LLM-suggested, never forced live without approval.
Every automation connection logs all sent/received payloads.
Library auto-suggests content blocks based on seasonality, festival schedule, and product drops.
Roles/permissions enforced for all create/edit/publish/export.
