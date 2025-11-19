import { useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { useGlobalStore } from './useGlobalStore';

/**
 * Hook to initialize and sync Tone.js Transport with global state.
 * This ensures the entire application (synths, sequencers, effects) runs on one master clock.
 * 
 * Usage: Call once at the app root level to initialize the audio context.
 */
export function useToneTransport() {
  const { masterBPM, isPlaying, masterVolume } = useGlobalStore();
  const initialized = useRef(false);

  // Initialize Tone.js once
  useEffect(() => {
    if (!initialized.current) {
      // Set initial BPM
      Tone.Transport.bpm.value = masterBPM;
      
      // Set initial volume
      Tone.Destination.volume.value = Tone.gainToDb(masterVolume / 100);
      
      initialized.current = true;
      
      console.log('[Tone.js] Transport initialized');
    }
  }, []);

  // Sync BPM changes
  useEffect(() => {
    if (initialized.current) {
      Tone.Transport.bpm.value = masterBPM;
      console.log('[Tone.js] BPM updated to', masterBPM);
    }
  }, [masterBPM]);

  // Sync play/stop state
  useEffect(() => {
    if (!initialized.current) return;

    const startAudioContext = async () => {
      // Ensure audio context is started (required for user interaction)
      if (Tone.context.state !== 'running') {
        await Tone.start();
        console.log('[Tone.js] Audio context started');
      }

      if (isPlaying) {
        if (Tone.Transport.state !== 'started') {
          Tone.Transport.start();
          console.log('[Tone.js] Transport started');
        }
      } else {
        if (Tone.Transport.state === 'started') {
          Tone.Transport.pause();
          console.log('[Tone.js] Transport paused');
        }
      }
    };

    startAudioContext();
  }, [isPlaying]);

  // Sync master volume
  useEffect(() => {
    if (initialized.current) {
      // Convert 0-100 range to decibels
      const volumeDb = masterVolume === 0 ? -Infinity : Tone.gainToDb(masterVolume / 100);
      Tone.Destination.volume.value = volumeDb;
      console.log('[Tone.js] Master volume updated to', masterVolume);
    }
  }, [masterVolume]);

  return {
    transport: Tone.Transport,
    context: Tone.context,
    destination: Tone.Destination,
  };
}

/**
 * Helper function to ensure audio context is started.
 * Call this on user interaction (button click, etc.) to unlock audio on mobile/web.
 */
export async function startAudioContext() {
  if (Tone.context.state !== 'running') {
    await Tone.start();
    console.log('[Tone.js] Audio context started by user interaction');
  }
}
