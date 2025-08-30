# EDM Shuffle: Agent Work Queue
**Last Updated:** August 13, 2025, 03:06 AM EDT

**Current Project Focus:** Address critical bugs and discrepancies identified during the user's hands-on review. Our goal is to fix the broken core features before proceeding with new development.

---
## ✅ Active Tasks
*There are no tasks currently in progress. Please assign a prompt from the queue below.*

---
## ▶️ Next Up: Prompt Queue

*Copy one of the prompts below and provide it to the designated agent.*

### **1. (HIGHEST PRIORITY) Fix User Profile & Auth Flow**
* **Target Agent:** Roo Code
* **Prompt:**
    "The user profile page at `/profile` is blank and the Archetype Quiz hangs on 'saving'. This is a critical failure of a feature previously reported as complete. Your task is to debug and fix the entire user profile data flow.

    **Execution Steps:**
    1.  Investigate the `UserProfile` component and any associated hooks. Diagnose why it is not rendering data for the logged-in user from the Supabase `profiles` table.
    2.  Debug the `saveArchetype` function connected to the Archetype Quiz. Ensure it correctly updates the user's profile in the database and provides clear success or failure feedback to the UI.
    3.  Confirm that after the quiz is completed, the user's profile page correctly displays the chosen archetype and other stored data.

    **Validation Criteria:**
    * Provide a screen recording showing:
        1.  The user completing the Archetype Quiz.
        2.  The quiz successfully saving without getting stuck.
        3.  Navigating to the `/profile` page and seeing the correct user data and newly selected archetype displayed.
    * Update `claude.md` and `gemini.md` with a record of this bug fix."

### **2. (HIGH PRIORITY) Fix Festival Stage Audio Bugs**
* **Target Agent:** Claude Code
* **Prompt:**
    "The Festival Stage at `/festival` has two critical audio bugs that make it unusable, despite the underlying audio engine being functional.

    **Execution Steps:**
    1.  Implement state management so that clicking a 'Preview' button on a DJ card **stops any currently playing audio** before starting the new track. Only one audio track should be playing at any given time.
    2.  Add a global 'Stop Audio' button to the `FestivalVotingStage` component that immediately stops all audio playback originating from the DJ cards.

    **Validation Criteria:**
    * Provide a screen recording showing:
        1.  Clicking on DJ card A, hearing its audio.
        2.  Clicking on DJ card B, showing that audio A stops and audio B begins.
        3.  Clicking the new 'Stop Audio' button and showing that audio B stops completely.
    * Update `claude.md` and `gemini.md` with a record of this bug fix."
