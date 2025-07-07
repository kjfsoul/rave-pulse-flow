<!-- LLM/Claude Context: Section = 8. Built-in Marketing Framework -->

8.1 Marketing Dashboard (Campaign Management & Automation Handoff)
Objective: Provide an in-app dashboard for building and managing marketing campaigns, generating copy, and directly integrating with external automation tools (n8n, Printify).
Tasks:
Backend (Supabase): Implement role-protected access (e.g., marketing_admin role). campaigns table (fields: id, name, status, platformsTargeted, startDate, endDate, createdBy, lastApprovedAt). Store campaign content assets (copy, image URLs, webhooks). API endpoints for campaign CRUD.
Frontend (/admin/marketing):
Campaign creation wizard: Allows users to define campaign name, target platforms (Instagram, TikTok, X, Threads, Facebook, YouTube, Printify), start/end dates.
Content generation integration: Implement API calls to LLM endpoints (Claude, Gemini, etc.) to suggest headlines, captions, hashtags, and visual prompts for the selected platforms. (LLM integration is API-driven, not direct LLM inference in the browser).
Live preview: Show how content looks on selected platforms (mockup views).
Scheduling calendar for posts, launches, and product drops.
n8n/Printify Integration: For every approved campaign, generate a webhook/JSON config for n8n to post/schedule content, and sync product descriptions/drop schedules to Printify. This must be a real, verifiable payload generation, not just simulated.
Approval workflow: Draft → Review → Approved → Scheduled/Live statuses.
Audit log: All marketing actions logged, reversible, and assignable to users/teams.
Validation & Failsafe:
Create a test campaign: verify data persistence in Supabase.
Generate a test n8n webhook: verify its structure and data correctness by sending it to a test n8n workflow.
Simulate a failed Printify sync: display a clear error message.
Test role-protected access: ensure only authorized users can create/manage campaigns.
Optimized Prompt for Claude Code: "Develop a role-protected Marketing Dashboard (/admin/marketing) within EDM Shuffle’s admin suite. Features: Campaign creation wizard (select platforms, schedule dates). Integrate with stubbed LLM API endpoints to suggest campaign copy (headlines, captions, hashtags, visual prompts). Display live preview mockups of content. Crucially, implement real n8n webhook/JSON config generation for campaign content and real Printify integration to sync product drops. Include campaign approval workflow and audit logging. No dummy campaigns or non-functional integrations."
Expected Output/Validation:
Supabase schema for campaigns table.
MarketingDashboard.tsx component, CampaignWizard.tsx.
Video demonstrating campaign creation and the generation of a valid n8n/Printify JSON payload.
Logs confirming data storage and payload generation.
Screenshot of roles/permissions preventing unauthorized access.
8.2 Content Generation & Library
Objective: Create a searchable, filterable library for all marketing content assets, with AI-driven suggestions for reuse, tightly integrated into the marketing dashboard.
Tasks:
Backend (Supabase): content_library table (fields: id, type (e.g., 'copy', 'image', 'video'), assetURL/textContent, tags, platform, campaignId, ownerId, lastUsedAt). API endpoints for CRUD and search/filter.
Frontend: Internal content library module within the marketing dashboard. Quick search, preview, and copy/paste/share tools for content assets. AI suggestion: propose “next post” or “revive successful campaign” (via LLM API calls, stubbed for now). Allow export to CSV, JSON, or direct n8n/Printify pipeline. Implement a "one-click 'inject'" feature to instantly add content to new campaigns or remix with an LLM.
Validation & Failsafe:
Create, save, and retrieve various types of content (text, image URLs) from the library.
Test search and filtering functionality.
Verify content can be successfully exported or pushed to the n8n/Printify pipeline.
Ensure content is correctly linked back to campaigns.
Optimized Prompt for Claude Code: "Build an internal content library module within the marketing dashboard. Backend: content_library Supabase table to store marketing assets (copy, image URLs, tags, platform). API for search, retrieval, and CRUD. Frontend: UI for managing the library. Users can create, save, search, and preview marketing content. Include AI suggestion (via stubbed API endpoint for LLM) to propose content reuse. Allow export to JSON and direct push to n8n/Printify pipeline via button. No hardcoded content."
Expected Output/Validation:
Supabase schema for content_library.
ContentLibrary.tsx component.
Video demonstrating creating, saving, searching, and previewing content within the library.
Video demonstrating export to JSON and successful "one-click inject" into a new campaign.
8.3 Best Practices, Failsafes, & Innovation
Rate-limited/sandbox mode for mass posting (avoids platform bans/duplication).
All campaign copy is human-editable and LLM-suggested, never forced live without approval.
Every automation connection logs all sent/received payloads for auditability.
Content library auto-suggests content blocks based on seasonality, festival schedule, and product drops.
Roles/permissions enforced for all create/edit/publish/export actions within the marketing dashboard.
