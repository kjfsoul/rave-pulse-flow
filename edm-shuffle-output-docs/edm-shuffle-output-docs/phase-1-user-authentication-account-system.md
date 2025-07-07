<!-- LLM/Claude Context: Section = PHASE 1: User Authentication & Account System -->

1.1 User Registration & Login (Supabase)
Task: Implement user registration, email/password login, and persistent session using Supabase. All screens must be branded for EDM Shuffle, responsive, and return real user data.
Optimized Prompt for Claude Code: "Implement a secure, Supabase-backed user registration and login flow for EDM Shuffle.
Registration (/register): Collect email and password (with client-side validation for format and strength). On success, create user in Supabase and auto-login.
Login (/login): Authenticate against Supabase.
Session Management: Persist user session across browser refreshes.
UI: Use neon aesthetic (Tailwind CSS, Framer Motion for subtle animations). Responsive for mobile/desktop.
Error Handling: Display clear, user-friendly error messages for invalid inputs, existing emails, incorrect credentials, or network issues.
No Placeholders: All user creation and authentication must be real, tied to Supabase.
Files: AuthRegister.tsx, AuthLogin.tsx, useAuth.ts (hook for Supabase integration).
Validation Steps:
Screenshot/Video 1: Successful new user registration and redirection to /dashboard.
Screenshot/Video 2: Successful login of an existing user.
Console Logs: Show Supabase auth.signUp and auth.signInWithPassword calls succeeding.
Error Test: Demonstrate invalid email, short password, and existing email errors.
Refresh Test: Log in, refresh browser, ensure user session persists."
1.2 Email Password Reset (Supabase)
Task: Implement user password reset functionality via email.
Optimized Prompt for Claude Code: "Build the password reset initiation and confirmation flow for EDM Shuffle.
Request Form (/forgot-password): User enters email to receive a password reset link.
Backend: Integrate with Supabase's auth.resetPasswordForEmail method. This should trigger a real email from Supabase's configured email service.
Confirmation UI: Display a clear message instructing the user to check their email.
Reset Form (/reset-password): After clicking the email link, user enters and confirms new password. This must use Supabase's auth.updateUser method.
Error Handling: Handle cases like invalid email, expired token, or network issues gracefully.
No Mocking: Prove that Supabase is genuinely sending the reset email (e.g., via Supabase logs or a test email inbox if possible).
Files: PasswordResetRequest.tsx, PasswordResetForm.tsx.
Validation Steps:
Screenshot/Video 1: User submits email on /forgot-password, sees confirmation message.
Supabase Logs: Provide log snippets confirming the auth.resetPasswordForEmail call and (if available) email sending event.
Screenshot/Video 2: User successfully resets password via the link and new form.
Functional Test: Attempt to log in with the old password (must fail) and then with the new password (must succeed)."
1.3 User Profile Management (View & Update)
Task: Create a profile page where authenticated users can view and update their personal information (username, avatar, bio, archetype).
Optimized Prompt for Claude Code: "Develop a fully functional user profile management page (/profile).
Display: Show current user's username, avatar, bio, and chosen archetype. Data must come directly from the Supabase profiles table.
Edit Functionality: Allow users to update their username, upload a new avatar (to Supabase Storage), and edit their bio.
Archetype Display: Show the selected archetype. DO NOT make it editable via this page yet, but ensure the UI element is ready for future integration.
Persistence: All changes must be written back to the Supabase profiles table.
Loading/Feedback: Show loading indicators during data fetch/save. Provide success/error notifications.
Files: UserProfile.tsx, useProfile.ts (hook for data fetch/update), optional AvatarUpload.tsx.
Validation Steps:
Screenshot/Video 1: User viewing their profile.
Screenshot/Video 2: User successfully updating their username and bio.
Screenshot/Video 3: User successfully uploading a new avatar.
Supabase Logs: Show supabase.from('profiles').update() calls with new data.
Persistence Test: Refresh the page after updates; verify data remains changed."
