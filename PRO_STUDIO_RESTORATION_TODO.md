# Pro Studio Aesthetic Restoration - Task List

## 🎯 TASK 1: "Pro Studio" Visual Overhaul (Dark Mode Enforce)

### Primary Files to Fix:
- [ ] **DJStation.tsx** - Layout & Styling
  - [ ] Ensure entire DJStation container has forced dark background: `bg-slate-950 text-white`
  - [ ] Fix wrapper styling and container classes
  - [ ] Verify dark mode context integration

- [ ] **Deck.tsx** - Visual Polish & Button Styling
  - [ ] Find all `<Button>` components with `variant="outline"`
  - [ ] Force `border-slate-700 bg-slate-800 text-white hover:bg-slate-700`
  - [ ] Fix "Back" navigation buttons for proper contrast
  - [ ] Style sliders/knobs for "Pro" look
  - [ ] Replace white-on-white elements

- [ ] **Mixer.tsx** - Visual Polish & Button Styling
  - [ ] Find all `<Button>` components with `variant="outline"`
  - [ ] Force `border-slate-700 bg-slate-800 text-white hover:bg-slate-700`
  - [ ] Fix "Back" navigation buttons for proper contrast
  - [ ] Style sliders/knobs for "Pro" look
  - [ ] Replace white-on-white elements

### Secondary Files:
- [ ] **BottomNavigation.tsx** - Desktop Adjustments
  - [ ] Hide navigation on desktop/tablet viewports
  - [ ] Ensure proper responsive behavior
  - [ ] Fix mobile-only display logic

- [ ] **votingSystem.ts** - Fix 400 Error
  - [ ] Debug and fix the leaderboard API call
  - [ ] Ensure proper query structure
  - [ ] Fix any malformed requests

- [ ] **LiveLeaderboard.tsx** - Verify Query
  - [ ] Review and fix API query structure
  - [ ] Ensure proper data fetching
  - [ ] Fix display formatting

## 🎨 Styling Requirements:
- [ ] Force dark theme across all components
- [ ] Ensure proper neon accent colors
- [ ] Fix all illegible UI elements (white on white)
- [ ] Restore "Pro Studio" aesthetic
- [ ] Maintain responsive design

## 🔧 Technical Fixes:
- [ ] Resolve leaderboard 400 error
- [ ] Verify all API calls work correctly
- [ ] Test navigation behavior
- [ ] Validate dark mode styling consistency

## ✅ Testing & Verification:
- [ ] Test all components in dark mode
- [ ] Verify button interactions and hover states
- [ ] Check leaderboard functionality
- [ ] Test responsive behavior
- [ ] Confirm "Pro Studio" aesthetic is restored
