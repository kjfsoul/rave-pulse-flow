# Festival Submission System - User Guide

## Overview

The vFLX-10 Pro Station includes a complete **Festival Submission System** that allows users to submit their tracks to community competitions, vote for their favorite submissions, and compete on the leaderboard.

---

## Features

### 1. Track Submission
- Select from your uploaded or production-recorded tracks
- Enter your artist name (defaults to your account name)
- Preview track details before submission (BPM, duration, source)
- View attribution credits for CC-BY samples
- Accept Terms of Service for broadcast rights
- Automatic notification on successful submission

### 2. Festival Leaderboard
- View all submissions ordered by vote count
- See top 3 submissions highlighted with special badges
- Vote for your favorite tracks (except your own)
- Real-time vote count updates
- Artist names and festival scenes displayed

### 3. My Submissions
- View your own submitted tracks
- See vote counts and submission status (pending/approved/rejected)
- Track submission history

---

## How to Submit a Track

### Step 1: Prepare Your Track

Before submitting, you need to have a track ready. You can:

**Option A: Upload a Track**
1. Go to **Sound Library** tab
2. Click **My Tracks** sub-tab
3. Click **"Click to upload audio file"**
4. Select your audio file (MP3, WAV, OGG, M4A, FLAC)
5. Check **"I own 100% of the rights to this audio..."** checkbox
6. Upload completes and track appears in your library

**Option B: Record from Production Station**
1. Go to **Production Station** tab
2. Program a beat on the **Drum Machine**
3. Program a melody on the **Synth Station**
4. Click **Record** button to start recording
5. Click **Stop** button to finish recording
6. Enter a name for your recording
7. Track is saved to your library

### Step 2: Submit to Festival

1. Go to **Submit** tab
2. In the **"Submit to Festival"** card:
   - Click the **"Select Track"** dropdown
   - Choose one of your uploaded or recorded tracks
   - Enter your **Artist Name** (defaults to your account name)
   - Review the **Selected Track Preview** section
   - Check the **Terms of Service** checkbox
3. Click **"Review & Submit"** button
4. In the confirmation dialog:
   - Review your track details
   - Read the Terms of Service
   - Click **"Confirm Submission"**
5. Wait for the submission to complete
6. You'll see a success notification: **"Submission Complete! 🎉"**

### Step 3: Track Your Submission

After submitting, your track will appear in two places:

1. **My Submissions** section (on the Submit tab)
   - Shows your track title, artist name, and vote count
   - Displays submission status (pending/approved/rejected)

2. **Festival Leaderboard** (on the Submit tab)
   - Your track appears with a **"Your Track"** badge
   - You cannot vote for your own track
   - Vote count updates in real-time as others vote

---

## How to Vote

### Voting for Other Tracks

1. Go to **Submit** tab
2. Scroll to the **"Festival Leaderboard"** section
3. Find a track you like (not your own)
4. Click the **"Vote"** button next to the track
5. The vote count updates immediately
6. You'll see a success notification: **"Vote Recorded! 👍"**

### Voting Rules

- ✅ You can vote for any track except your own
- ✅ You can vote multiple times for the same track
- ✅ Votes are recorded immediately
- ❌ You cannot vote for your own submissions (button is disabled)

---

## Leaderboard Rankings

The **Festival Leaderboard** displays all submissions ordered by vote count (highest to lowest).

### Rank Badges

- **1st Place** - Gold badge (🥇)
- **2nd Place** - Silver badge (🥈)
- **3rd Place** - Bronze badge (🥉)
- **4th+ Place** - Gray badge

### Visual Highlights

- **Top 3 submissions** have a special gradient background
- **Your own tracks** display a "Your Track" badge
- **Vote counts** are prominently displayed next to each track

---

## Track Requirements

### Eligible Tracks

Only tracks from these sources can be submitted:

- ✅ **Uploaded tracks** (source: `upload`)
  - Tracks you uploaded in the Sound Library
  - Must have broadcast rights confirmed

- ✅ **Production recordings** (source: `loudly`)
  - Tracks recorded from the Production Station
  - Automatically have broadcast rights

### Ineligible Tracks

These tracks **cannot** be submitted:

- ❌ **Freesound samples** (source: `freesound`)
  - These are individual samples, not complete tracks
  - Use them in your production, then record the result

---

## Submission Data

When you submit a track, the following data is sent to the festival:

- **Title** - Your track name
- **Artist Name** - Your artist/DJ name
- **File Key** - S3 storage key for the audio file
- **URL** - Public URL to stream the audio
- **Attribution Credits** - CC-BY sample credits (if applicable)
- **Festival Scene** - Your selected festival theme (e.g., "Deep Forest")

---

## Notifications

The submission system automatically creates notifications for:

### Submission Success
- **Title:** "Submission Successful! 🎉"
- **Message:** "Your track '[Track Name]' has been submitted to the [Scene] competition. Good luck!"
- **Type:** Success (green)

### New Vote Received
- **Title:** "New Vote! 👍"
- **Message:** "Someone voted for your track '[Track Name]'! You now have [X] votes."
- **Type:** Success (green)

You can view these notifications by clicking the **bell icon** in the top-right corner of the app.

---

## Troubleshooting

### Issue: "No tracks available for submission"

**Cause:** You don't have any uploaded or production-recorded tracks yet.

**Solution:**
1. Upload a track in the Sound Library, OR
2. Record a track in the Production Station

---

### Issue: "Track Required" error when submitting

**Cause:** You didn't select a track from the dropdown.

**Solution:**
1. Click the **"Select Track"** dropdown
2. Choose one of your tracks
3. Try submitting again

---

### Issue: "Artist Name Required" error

**Cause:** The artist name field is empty.

**Solution:**
1. Enter your artist name in the **"Artist Name"** input field
2. Try submitting again

---

### Issue: "Terms Required" error

**Cause:** You didn't check the Terms of Service checkbox.

**Solution:**
1. Read the Terms of Service
2. Check the checkbox if you agree
3. Try submitting again

---

### Issue: Vote button is disabled

**Cause:** You're trying to vote for your own track.

**Solution:**
- You cannot vote for your own submissions
- Vote for other users' tracks instead

---

### Issue: Submission appears as "pending"

**Explanation:** All submissions start with a "pending" status and require admin approval.

**What to do:**
- Wait for an admin to review your submission
- Status will change to "approved" or "rejected"
- You'll receive a notification when the status changes

---

## Technical Details

### Database Schema

Submissions are stored in the `submissions` table:

```typescript
{
  id: number;                    // Auto-increment primary key
  userId: number;                // User who submitted
  title: string;                 // Track title
  artistName: string;            // Artist name
  fileKey: string;               // S3 file key
  url: string;                   // Public URL
  attributionCredits?: string;   // JSON array of CC-BY credits
  festivalScene?: string;        // Festival theme
  votes: number;                 // Vote count (default: 0)
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;               // Submission timestamp
  updatedAt: Date;               // Last update timestamp
}
```

### tRPC API Routes

The submission system uses these tRPC routes:

**Fetch user's tracks:**
```typescript
trpc.tracks.list.useQuery()
// Returns: Track[]
```

**Create submission:**
```typescript
trpc.submissions.create.useMutation({
  title: string;
  artistName: string;
  fileKey: string;
  url: string;
  attributionCredits?: string;
  festivalScene?: string;
})
```

**Fetch all submissions (leaderboard):**
```typescript
trpc.submissions.listAll.useQuery()
// Returns: Submission[] (ordered by votes DESC)
```

**Vote for submission:**
```typescript
trpc.submissions.vote.useMutation({
  submissionId: number;
})
```

**Fetch user's own submissions:**
```typescript
trpc.submissions.list.useQuery()
// Returns: Submission[] (user's own submissions)
```

---

## Best Practices

### For Submitters

1. **Choose your best work** - Only submit tracks you're proud of
2. **Use descriptive titles** - Make your track name memorable
3. **Credit your samples** - Attribution builds trust in the community
4. **Engage with others** - Vote for tracks you genuinely enjoy
5. **Be patient** - Wait for admin approval before your track goes live

### For Voters

1. **Listen before voting** - Make informed voting decisions
2. **Support variety** - Vote for different styles and artists
3. **Be genuine** - Vote for tracks you actually like
4. **Spread the love** - Don't just vote for the top tracks

---

## Community Guidelines

### Submission Rules

- ✅ You must own 100% of the rights to the audio
- ✅ You must grant EDM Shuffle a broadcast license
- ✅ Attribution credits must be accurate and complete
- ❌ No copyrighted material without permission
- ❌ No offensive or inappropriate content
- ❌ No spam or duplicate submissions

### Voting Rules

- ✅ Vote for tracks you genuinely enjoy
- ✅ Vote as many times as you want
- ❌ No vote manipulation or bots
- ❌ No vote trading or collusion

---

## Future Enhancements

Planned features for future updates:

1. **Audio Playback** - Play submissions directly in the leaderboard
2. **Comments** - Leave feedback on submissions
3. **Categories** - Separate leaderboards for different genres
4. **Time-Limited Contests** - Weekly/monthly competitions
5. **Prizes** - Rewards for top-ranked submissions
6. **Social Sharing** - Share submissions on social media
7. **Download Votes** - Track who voted for your submissions

---

## Support

For submission-related issues:
1. Check the Troubleshooting section above
2. Review the Community Guidelines
3. Contact support at https://help.manus.im

---

## References

- [Database Schema](../drizzle/schema.ts)
- [tRPC Routes](../server/routers.ts)
- [SubmissionSystem Component](../client/src/components/SubmissionSystem.tsx)
