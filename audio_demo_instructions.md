# Audio Features Video Demonstration Instructions

## Overview
This document provides instructions for creating a video demonstration of the real-time, audible effects implemented in the SimpleDJStation component.

## Prerequisites
1. Ensure the application is running (`npm run dev`)
2. Have a screen recording tool ready (e.g., OBS Studio, QuickTime Player, or any screen recording software)
3. Prepare audio files for testing (or use the built-in tone generation)

## Demonstration Steps

### 1. Volume Control Demonstration
- Open the SimpleDJStation component in your browser
- Start playback on Deck A
- Adjust the volume slider for Deck A and show how the audio level changes
- Repeat for Deck B
- Show both decks playing simultaneously with different volume levels

### 2. Crossfader Demonstration
- Ensure both Deck A and Deck B are playing
- Start with the crossfader all the way to the left (100% Deck A, 0% Deck B)
- Slowly move the crossfader to the right, showing how the audio blends from Deck A to Deck B
- Move the crossfader back to the center (50/50 mix)
- Move it all the way to the right (0% Deck A, 100% Deck B)
- Return to the center position

### 3. Pitch Control Demonstration
- Select a deck (e.g., Deck A) and start playback
- Adjust the pitch slider to increase the playback rate (higher values)
- Show how the audio pitch increases (higher pitch sound)
- Adjust the pitch slider to decrease the playback rate (lower values)
- Show how the audio pitch decreases (lower pitch sound)
- Return to the normal pitch (100%)
- Repeat for the other deck

### 4. Echo FX Demonstration
- Start playback on a deck
- Set the crossfader to hear the deck clearly
- Start with the echo wet/dry mix at 0% (no echo)
- Gradually increase the wet signal to 100% (full echo)
- Show how the audio now has a clear echo effect
- Adjust the mix back to 0% to remove the echo
- Experiment with different mix levels (25%, 50%, 75%)

### 5. Combined Features Demonstration
- Play both decks simultaneously
- Adjust volumes independently
- Use the crossfader to blend between decks
- Apply pitch changes to one or both decks
- Add echo effect to the mix
- Show how all features work together in real-time

## Recording Tips
1. Use headphones to monitor audio quality during recording
2. Record in a quiet environment to avoid background noise
3. Make adjustments slowly and clearly to show the effects
4. Add voice-over commentary to explain what's happening
5. Show the UI controls being manipulated in the recording
6. Highlight the audible changes in the audio output

## File Format and Delivery
- Save the video in MP4 format with H.264 encoding
- Recommended resolution: 1080p or higher
- Include both visual demonstration and clear audio output
- Keep the video under 5 minutes in length
- Name the file: `simple_dj_station_audio_demo.mp4`

## Validation Checklist
Before finalizing the video, ensure that:
- [ ] Volume controls audibly change the audio level for each deck
- [ ] Crossfader audibly blends between Deck A and Deck B
- [ ] Pitch controls audibly change the playback rate/pitch of the audio
- [ ] Echo FX audibly adds reverb/echo effect to the audio
- [ ] All UI controls are shown being manipulated in real-time
- [ ] Audio quality is clear and demonstrates the effects properly
