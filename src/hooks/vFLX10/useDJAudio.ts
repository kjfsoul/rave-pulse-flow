import { useEffect, useRef, useState } from 'react';
import * as Tone from 'tone';
import { useProStationStore } from '@/hooks/useProStationStore';

/**
 * Centralized DJ audio routing hook
 * Manages audio context, mixer routing, and master EQ for DJ Station
 *
 * This hook reads from global Zustand store (useProStationStore) and applies changes to Tone.js audio nodes.
 * This enables two-way synchronization: Hardware MIDI → Global Store → Audio Engine
 *
 * TODO: Initialize Tone.Recorder connected to master output
 * TODO: Replace recording save logic with Supabase storage
 * TODO: Connect to tracks table
 * TODO: Initialize Tone.Recorder connected to master output
 */
export function useDJAudio() {
  const [isInitialized, setIsInitialized] = useState(false);

  // Audio nodes
  const deckAGainRef = useRef<Tone.Gain | null>(null);
  const deckBGainRef = useRef<Tone.Gain | null>(null);
  const masterGainRef = useRef<Tone.Gain | null>(null);
  const eqNodesRef = useRef<Tone.EQ3[]>([]);
  const masterEQRef = useRef<Tone.Filter[]>([]);

  // Read from global store
  const {
    deckAVolume,
    deckBVolume,
    crossfader,
    masterVolume,
  } = useProStationStore();

  // Initialize audio nodes
  useEffect(() => {
    const deckAGain = new Tone.Gain(0.8).toDestination();
    const deckBGain = new Tone.Gain(0.8).toDestination();
    const masterGain = new Tone.Gain(1.0).toDestination();

    deckAGainRef.current = deckAGain;
    deckBGainRef.current = deckBGain;
    masterGainRef.current = masterGain;

    setIsInitialized(true);

    return () => {
      // Cleanup - use captured values from initialization
      // eqNodesRef and masterEQRef are currently unused (reserved for future EQ features)
      // but we clean them up defensively
      // eslint-disable-next-line react-hooks/exhaustive-deps
      const eqNodes = eqNodesRef.current;
      // eslint-disable-next-line react-hooks/exhaustive-deps
      const masterEQ = masterEQRef.current;

      deckAGain.dispose();
      deckBGain.dispose();
      masterGain.dispose();
      eqNodes.forEach(eq => eq.dispose());
      masterEQ.forEach(filter => filter.dispose());
    };
  }, []);

  // Sync Deck A Volume: Global Store → Audio Engine
  useEffect(() => {
    if (isInitialized && deckAGainRef.current) {
      deckAGainRef.current.gain.rampTo(deckAVolume, 0.05);
      console.log(`[Audio Engine] Deck A Volume: ${deckAVolume.toFixed(2)}`);
    }
  }, [deckAVolume, isInitialized]);

  // Sync Deck B Volume: Global Store → Audio Engine
  useEffect(() => {
    if (isInitialized && deckBGainRef.current) {
      deckBGainRef.current.gain.rampTo(deckBVolume, 0.05);
      console.log(`[Audio Engine] Deck B Volume: ${deckBVolume.toFixed(2)}`);
    }
  }, [deckBVolume, isInitialized]);

  // Sync Crossfader: Global Store → Audio Engine
  useEffect(() => {
    if (isInitialized && deckAGainRef.current && deckBGainRef.current) {
      // Crossfader: 0 = full A, 0.5 = center, 1 = full B
      // Calculate gain curves for smooth crossfade
      const aNormalized = Math.max(0, (100 - crossfader) / 50);
      const bNormalized = Math.max(0, (crossfader - 50) / 50);

      deckAGainRef.current.gain.rampTo(aNormalized * deckAVolume, 0.05);
      deckBGainRef.current.gain.rampTo(bNormalized * deckBVolume, 0.05);

      console.log(`[Audio Engine] Crossfader: ${crossfader.toFixed(2)} (A: ${aNormalized.toFixed(2)}, B: ${bNormalized.toFixed(2)})`);
    }
  }, [crossfader, deckAVolume, deckBVolume, isInitialized]);

  // Sync Master Volume: Global Store → Audio Engine
  useEffect(() => {
    if (isInitialized && masterGainRef.current) {
      masterGainRef.current.gain.rampTo(masterVolume / 100, 0.05);
      console.log(`[Audio Engine] Master Volume: ${masterVolume}%`);
    }
  }, [masterVolume, isInitialized]);

  // Load and play track with caching and Tone.js context initialization
  const loadTrack = async (audioBuffer: AudioBuffer, url: string, deckId: string) => {
    try {
      // First ensure Tone.js context is initialized
      if (Tone.context.state !== 'running') {
        await Tone.start();
        await Tone.context.resume();
      }

      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await Tone.context.decodeAudioData(arrayBuffer);

      // Store track in deck-specific state
      const trackKey = `vflx10-deck${deckId}`;
      localStorage.setItem(trackKey, JSON.stringify({
        url,
        name: url.split('/').pop(),
        buffer: audioBuffer,
        deckId,
        isLoaded: true
      }));

      console.log(`[Audio Engine] Track loaded for deck ${deckId}:`, url);
      return audioBuffer;
    } catch (error) {
      console.error(`[Audio Engine] Failed to load track for deck ${deckId}:`, error);
      return null;
    }
  };

  return {
    isInitialized,
    deckAGain: deckAGainRef.current,
    deckBGain: deckBGainRef.current,
    masterGain: masterGainRef.current,
    // Legacy methods (deprecated)
    setChannelVolume: (deck: 'A' | 'B', volume: number) => {
      console.warn('[useDJAudio] setChannelVolume is deprecated. Use global store instead.');
      const gain = deck === 'A' ? deckAGainRef.current : deckBGainRef.current;
      if (gain) {
        gain.gain.rampTo(volume / 100, 0.05);
      }
    },
    setCrossfader: (position: number) => {
      console.warn('[useDJAudio] setCrossfader is deprecated. Use global store instead.');
      // position: 0 = full A, 50 = center, 100 = full B
      if (deckAGainRef.current && deckBGainRef.current) {
        const aNormalized = Math.max(0, (100 - position) / 50);
        const bNormalized = Math.max(0, (position - 50) / 50);

        deckAGainRef.current.gain.rampTo(aNormalized * 0.8, 0.05);
        deckBGainRef.current.gain.rampTo(bNormalized * 0.8, 0.05);
      }
    },
    setMasterVolume: (volume: number) => {
      console.warn('[useDJAudio] setMasterVolume is deprecated. Use global store instead.');
      if (masterGainRef.current) {
        masterGainRef.current.gain.rampTo(volume / 100, 0.05);
      }
    },
  };
}
