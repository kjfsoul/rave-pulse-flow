import { create } from 'zustand';

/**
 * Pro Station Global Store (Zustand)
 *
 * Manages DJ deck state, mixer controls, and production station state.
 * This is UI-only state management - Supabase persistence will be added later.
 *
 * Adapted from vFLX-10 Pro Station's useGlobalStore.
 */
interface ProStationState {
  // Master audio controls
  masterBPM: number;
  isPlaying: boolean;
  masterVolume: number;

  // Scene/theme
  activeScene: string;

  // Attribution tracking for CC-BY samples
  attributionCredits: string[];

  // DJ Station controls (for MIDI integration)
  // Deck A controls
  deckAVolume: number; // 0-1
  deckAEqLow: number; // -12 to +12 dB
  deckAEqMid: number; // -12 to +12 dB
  deckAEqHigh: number; // -12 to +12 dB
  deckAPitch: number; // 0.5-2.0x
  deckAPlayState: boolean;

  // Deck B controls
  deckBVolume: number; // 0-1
  deckBEqLow: number; // -12 to +12 dB
  deckBEqMid: number; // -12 to +12 dB
  deckBEqHigh: number; // -12 to +12 dB
  deckBPitch: number; // 0.5-2.0x
  deckBPlayState: boolean;

  // Mixer controls
  crossfader: number; // 0-1 (0 = full A, 0.5 = center, 1 = full B)
  masterEqBands: number[]; // 10-band EQ, -12 to +12 dB for each band

  // MIDI connection status
  midiConnected: boolean;
  midiDeviceName: string | null;

  // Actions
  setMasterBPM: (bpm: number) => void;
  setIsPlaying: (playing: boolean) => void;
  setMasterVolume: (volume: number) => void;
  setActiveScene: (scene: string) => void;
  addAttributionCredit: (credit: string) => void;
  clearAttributionCredits: () => void;

  // DJ Station actions
  setDeckAVolume: (volume: number) => void;
  setDeckAEqLow: (gain: number) => void;
  setDeckAEqMid: (gain: number) => void;
  setDeckAEqHigh: (gain: number) => void;
  setDeckAPitch: (pitch: number) => void;
  setDeckAPlayState: (playing: boolean) => void;

  setDeckBVolume: (volume: number) => void;
  setDeckBEqLow: (gain: number) => void;
  setDeckBEqMid: (gain: number) => void;
  setDeckBEqHigh: (gain: number) => void;
  setDeckBPitch: (pitch: number) => void;
  setDeckBPlayState: (playing: boolean) => void;

  setCrossfader: (position: number) => void;
  setMasterEqBand: (bandIndex: number, gain: number) => void;

  setMidiConnected: (connected: boolean, deviceName?: string) => void;
}

export const useProStationStore = create<ProStationState>((set) => ({
  // Initial state
  masterBPM: 120,
  isPlaying: false,
  masterVolume: 100,
  activeScene: 'deep_forest',
  attributionCredits: [],

  // DJ Station initial state
  deckAVolume: 0.8,
  deckAEqLow: 0,
  deckAEqMid: 0,
  deckAEqHigh: 0,
  deckAPitch: 1.0,
  deckAPlayState: false,

  deckBVolume: 0.8,
  deckBEqLow: 0,
  deckBEqMid: 0,
  deckBEqHigh: 0,
  deckBPitch: 1.0,
  deckBPlayState: false,

  crossfader: 0.5, // Center position
  masterEqBands: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],

  midiConnected: false,
  midiDeviceName: null,

  // Actions
  setMasterBPM: (bpm) => set({ masterBPM: Math.max(60, Math.min(200, bpm)) }),
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  setMasterVolume: (volume) => set({ masterVolume: Math.max(0, Math.min(100, volume)) }),
  setActiveScene: (scene) => set({ activeScene: scene }),
  addAttributionCredit: (credit) => set((state) => ({
    attributionCredits: [...state.attributionCredits, credit]
  })),
  clearAttributionCredits: () => set({ attributionCredits: [] }),

  // DJ Station actions
  setDeckAVolume: (volume) => set({ deckAVolume: Math.max(0, Math.min(1, volume)) }),
  setDeckAEqLow: (gain) => set({ deckAEqLow: Math.max(-12, Math.min(12, gain)) }),
  setDeckAEqMid: (gain) => set({ deckAEqMid: Math.max(-12, Math.min(12, gain)) }),
  setDeckAEqHigh: (gain) => set({ deckAEqHigh: Math.max(-12, Math.min(12, gain)) }),
  setDeckAPitch: (pitch) => set({ deckAPitch: Math.max(0.5, Math.min(2.0, pitch)) }),
  setDeckAPlayState: (playing) => set({ deckAPlayState: playing }),

  setDeckBVolume: (volume) => set({ deckBVolume: Math.max(0, Math.min(1, volume)) }),
  setDeckBEqLow: (gain) => set({ deckBEqLow: Math.max(-12, Math.min(12, gain)) }),
  setDeckBEqMid: (gain) => set({ deckBEqMid: Math.max(-12, Math.min(12, gain)) }),
  setDeckBEqHigh: (gain) => set({ deckBEqHigh: Math.max(-12, Math.min(12, gain)) }),
  setDeckBPitch: (pitch) => set({ deckBPitch: Math.max(0.5, Math.min(2.0, pitch)) }),
  setDeckBPlayState: (playing) => set({ deckBPlayState: playing }),

  setCrossfader: (position) => set({ crossfader: Math.max(0, Math.min(1, position)) }),
  setMasterEqBand: (bandIndex, gain) =>
    set((state) => {
      const newBands = [...state.masterEqBands];
      newBands[bandIndex] = Math.max(-12, Math.min(12, gain));
      return { masterEqBands: newBands };
    }),

  setMidiConnected: (connected, deviceName) =>
    set({ midiConnected: connected, midiDeviceName: deviceName || null }),
}));
