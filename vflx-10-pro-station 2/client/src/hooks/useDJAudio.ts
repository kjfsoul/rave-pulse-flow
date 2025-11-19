import { useEffect, useRef, useState } from 'react';
import * as Tone from 'tone';
import { useGlobalStore } from './useGlobalStore';

/**
 * Centralized DJ audio routing hook
 * Manages audio context, mixer routing, and master EQ for DJ Station
 * 
 * This hook reads from the global Zustand store and applies changes to Tone.js audio nodes.
 * This enables two-way synchronization: Hardware MIDI → Global Store → Audio Engine
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
  } = useGlobalStore();

  // Initialize audio nodes
  useEffect(() => {
    deckAGainRef.current = new Tone.Gain(0.8).toDestination();
    deckBGainRef.current = new Tone.Gain(0.8).toDestination();
    masterGainRef.current = new Tone.Gain(1.0).toDestination();
    
    setIsInitialized(true);

    return () => {
      // Cleanup
      deckAGainRef.current?.dispose();
      deckBGainRef.current?.dispose();
      masterGainRef.current?.dispose();
      eqNodesRef.current.forEach(eq => eq.dispose());
      masterEQRef.current.forEach(filter => filter.dispose());
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
      const aNormalized = Math.max(0, 1 - (crossfader * 2)); // 1 → 0 as crossfader goes 0 → 0.5
      const bNormalized = Math.max(0, (crossfader - 0.5) * 2); // 0 → 1 as crossfader goes 0.5 → 1
      
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

  // Legacy methods for backward compatibility (now deprecated, use global store instead)
  const setChannelVolume = (deck: 'A' | 'B', volume: number) => {
    console.warn('[useDJAudio] setChannelVolume is deprecated. Use global store instead.');
    const gain = deck === 'A' ? deckAGainRef.current : deckBGainRef.current;
    if (gain) {
      gain.gain.rampTo(volume / 100, 0.05);
    }
  };

  const setCrossfader = (position: number) => {
    console.warn('[useDJAudio] setCrossfader is deprecated. Use global store instead.');
    // position: 0 = full A, 50 = center, 100 = full B
    if (deckAGainRef.current && deckBGainRef.current) {
      const aNormalized = Math.max(0, (100 - position) / 50);
      const bNormalized = Math.max(0, (position - 50) / 50);
      
      deckAGainRef.current.gain.rampTo(aNormalized * 0.8, 0.05);
      deckBGainRef.current.gain.rampTo(bNormalized * 0.8, 0.05);
    }
  };

  const setMasterVolume = (volume: number) => {
    console.warn('[useDJAudio] setMasterVolume is deprecated. Use global store instead.');
    if (masterGainRef.current) {
      masterGainRef.current.gain.rampTo(volume / 100, 0.05);
    }
  };

  return {
    isInitialized,
    deckAGain: deckAGainRef.current,
    deckBGain: deckBGainRef.current,
    masterGain: masterGainRef.current,
    // Legacy methods (deprecated)
    setChannelVolume,
    setCrossfader,
    setMasterVolume,
  };
}
