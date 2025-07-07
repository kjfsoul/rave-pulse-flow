<!-- LLM/Claude Context: Section = 7. Admin + Docs -->

7.1 Admin Dashboard for Event/Product/Content Management
Objective: Provide a secure, centralized web interface for administrators to manage all platform content and users.
Tasks:
Backend: Implement role-based access control (admin, moderator, content manager) using Supabase RLS. API endpoints for:
CRUD operations on FestivalEvents, Products, Challenges, Users, Crews, Comments, Reports.
View live activity feed and audit logs of every admin action.
Frontend (/admin): Secure login (with 2FA option; do not store credentials in code). Dashboard UI with clear navigation for managing different entities. Data tables with sort, filter, search, and pagination.
Validation & Failsafe:
Attempt to access dashboard as regular user: must be blocked with clear message, and the attempt logged.
Create, edit, delete entities via the dashboard: verify data updates in Supabase and that audit trail is updated.
Simulate 2+ admins making changes simultaneously: test for data consistency and no race conditions.
Try malicious actions (e.g., privilege escalation, XSS): system must block and log.
Optimized Prompt for Claude Code: "Develop a full-featured admin dashboard for EDM Shuffle. Implement role-based access (admin, moderator, content manager) using Supabase RLS. Dashboard must allow management of: Festival schedule and event data (create, edit, publish, delete), Users (view, ban, promote/demote, reset password), Crew/squad approval, Challenges (approve, remove, flag, pin), Product listings (add/edit/remove, inventory), Comments and abuse reports. Include a live activity feed and audit logs for every admin action. Ensure secure login (no hardcoded credentials) and mobile-friendly UI. No dummy dashboards."
Expected Output/Validation:
Supabase RLS policies and API for admin operations.
AdminDashboard.tsx and relevant sub-components (e.g., EventManagement.tsx, UserManagement.tsx).
Video demonstrating admin login and performing CRUD operations on test data (e.g., creating a new festival event, banning a user).
Logs confirming audit trail entries for admin actions.
7.2 Documentation Pipeline: Root Directory + Microtask Enforcement
Objective: Ensure all major project documentation (PRD.md, FRS.md, etc.) is always up-to-date, versioned, and mandatory for all development workflows.
Tasks:
File Structure Enforcement: Ensure all project docs (PRD.md, FRS.md, MASTERPLAN.md, CLAUDE_INTEGRITY_RULES.md, etc.) live in the project root.
Central Index: Implement DOCUMENTATION_INDEX.md as a living table of contents and version history for all primary docs.
CI/CD Integration: Configure CI/CD (e.g., GitHub Actions) to enforce documentation updates. On each PR/merge, run a checklist: "Were all docs touched by this feature updated? Is a new microtask/checklist present for ongoing features? If any doc is not updated, CI fails and merge is blocked."
Tooling: Encourage use of Markdown linting/formatting tools (e.g., remark-lint).
Validation & Failsafe:
Try deploying a build with a deliberately stale doc: CI should fail.
Create a feature PR without a corresponding doc update: system should block and provide checklist feedback.
Change a doc, merge: verify version history in DOCUMENTATION_INDEX.md is complete, searchable, and accurate.
Optimized Prompt for Claude Code: "Implement an automated documentation pipeline. All project docs (PRD.md, FRS.md, MASTERPLAN.md, CLAUDE_INTEGRITY_RULES.md, etc.) must reside in the project root. Create DOCUMENTATION_INDEX.md as a central TOC and version tracker. Configure CI/CD to enforce document updates: if a feature PR touches a module, relevant docs MUST be updated, or the PR is blocked. Use linting for Markdown quality. Document the CI setup in a new docs/CI_DOC_ENFORCEMENT.md."
Expected Output/Validation:
DOCUMENTATION_INDEX.md with structured links and placeholder for versioning.
CI/CD configuration snippets demonstrating doc enforcement.
Documentation of the process in docs/CI_DOC_ENFORCEMENT.md.
7.3 Integrity & Compliance Automation
Objective: Continuously check platform logic and codebase for compliance with CLAUDE_INTEGRITY_RULES.md, privacy policies (e.g., GDPR), and ethical guidelines.
Tasks:
Automated Scans: Implement pre-deploy hooks or CI jobs to scan for:
Undeclared placeholder code (e.g., // TODO:, // MOCK: without explicit Simulation Mode UI).
Exposed API keys or sensitive credentials in client-side code.
Violations of user consent/privacy policies (e.g., improper cookie handling).
Legal Compliance: Integrate basic checks for GDPR/CCPA compliance (e.g., cookie consent, data export requests).
Reporting: All failures must produce actionable errors in the CI/CD pipeline, not just warnings, halting deployment.
Validation & Failsafe:
Intentionally introduce a mock data leak (e.g., hardcoded API key) or undeclared placeholder: CI should block deploy with a specific error message.
Remove a critical privacy consent feature: automated test should catch and fail.
Run compliance script with no intentional errors: confirm a clean pass and clear logs.
Optimized Prompt for Claude Code: "Set up automated integrity/compliance checks. Configure CI/CD pre-deploy hooks to scan for: undeclared placeholder code (any // TODO: or // MOCK: without associated UI Simulation Mode badge), exposed API keys, and basic privacy policy violations (e.g., missing cookie consent integration). Implement a custom script or use an existing OSS tool for this scan. All failures must halt deployment and provide actionable error messages. Document this process in docs/INTEGRITY_COMPLIANCE.md."
Expected Output/Validation:
CI/CD configuration for integrity checks.
Code for custom integrity scripts (if applicable).
docs/INTEGRITY_COMPLIANCE.md detailing the checks.
Video demonstrating a failed deploy due to an integrity violation.
7.4 Periodic Masterplan & FRS Review
Objective: Establish a recurring process to ensure the FRS and MASTERPLAN remain aligned with the live code and evolving user feedback, preventing "documentation drift."
Tasks:
Automated Checklist Trigger: Implement a monthly or milestone-based trigger (e.g., a cron job or CI/CD stage) that creates a review task for project leaders.
Review Checklist (as code/Markdown):
"Every live feature accounted for in FRS?"
"All known bugs or gaps logged and tracked?"
"User feedback from recent sprints integrated into future phases?"
"MASTERPLAN reflects current project priorities and timelines?"
Versioned Doc Tracking: Ensure DOCUMENTATION_INDEX.md is updated with review dates and outcomes.
Remediation: If discrepancies found, update docs or backlog, assign new microtasks to address.
Validation & Failsafe:
Compare FRS/Masterplan to live code and feature set: verify no undocumented features exist.
Simulate a review: identify a known gap, document it, verify a new microtask is assigned to address it.
Pull a random doc section: it should accurately match the current application state and user experience.
Optimized Prompt for Claude Code: "Implement a system to enforce periodic review of FRS and MASTERPLAN. Add a feature to DOCUMENTATION_INDEX.md for version tracking and review dates of these core docs. Outline a process (e.g., a README section or an internal tool stub) to facilitate comparing current live features against FRS/MASTERPLAN, logging discrepancies as new microtasks in IMPLEMENTATION_MICROTASKS.md. Ensure this process prevents 'drift' between docs and production. Document this review process in docs/DOC_REVIEW_PROCESS.md."
Expected Output/Validation:
Updated DOCUMENTATION_INDEX.md with new review fields.
A Markdown template for conducting the review and logging outcomes.
docs/DOC_REVIEW_PROCESS.md explaining the workflow.
Demonstration of a documented discrepancy leading to a new microtask entry.
