
import { useState, useRef, useEffect, useCallback } from 'react';

interface AudioTrack {
  id: string;
  title: string;
  bpm: number;
  src: string;
}

interface DeckAudioState {
  track: AudioTrack | null;
  isPlaying: boolean;
  volume: number;
  pitch: number;
  echoFX: boolean;
  audioElement: HTMLAudioElement | null;
  gainNode: GainNode | null;
  echoNode: DelayNode | null;
  pitchShiftBuffer: AudioBuffer | null;
}

export interface AudioEngineHook {
  deckA: DeckAudioState;
  deckB: DeckAudioState;
  crossfadeValue: number;
  masterBpm: number;
  loadTrack: (deckId: 'A' | 'B', track: AudioTrack) => Promise<void>;
  playDeck: (deckId: 'A' | 'B') => Promise<void>;
  pauseDeck: (deckId: 'A' | 'B') => void;
  setDeckVolume: (deckId: 'A' | 'B', volume: number) => void;
  setDeckPitch: (deckId: 'A' | 'B', pitch: number) => void;
  toggleDeckEcho: (deckId: 'A' | 'B') => void;
  setCrossfade: (value: number) => void;
  setMasterBpm: (bpm: number) => void;
  playDropEffect: () => void;
  getWaveformData: (deckId: 'A' | 'B') => Float32Array;
}

export const useAudioEngine = (): AudioEngineHook => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserARef = useRef<AnalyserNode | null>(null);
  const analyserBRef = useRef<AnalyserNode | null>(null);
  const crowdCheerRef = useRef<HTMLAudioElement | null>(null);

  const [deckA, setDeckA] = useState<DeckAudioState>({
    track: null,
    isPlaying: false,
    volume: 75,
    pitch: 0,
    echoFX: false,
    audioElement: null,
    gainNode: null,
    echoNode: null,
    pitchShiftBuffer: null
  });

  const [deckB, setDeckB] = useState<DeckAudioState>({
    track: null,
    isPlaying: false,
    volume: 75,
    pitch: 0,
    echoFX: false,
    audioElement: null,
    gainNode: null,
    echoNode: null,
    pitchShiftBuffer: null
  });

  const [crossfadeValue, setCrossfadeValue] = useState(50);
  const [masterBpm, setMasterBpm] = useState(128);

  // Initialize Audio Context
  useEffect(() => {
    const initAudio = async () => {
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        
        // Initialize crowd cheer audio
        crowdCheerRef.current = new Audio('/audio/crowd_cheer.mp3');
        crowdCheerRef.current.volume = 0.3;
      } catch (error) {
        console.warn('Web Audio API not supported, falling back to basic audio');
      }
    };

    initAudio();

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const createAudioNodes = useCallback((audioElement: HTMLAudioElement, deckId: 'A' | 'B') => {
    if (!audioContextRef.current) return null;

    const context = audioContextRef.current;
    const source = context.createMediaElementSource(audioElement);
    const gainNode = context.createGain();
    const echoNode = context.createDelay();
    const echoGain = context.createGain();
    const analyser = context.createAnalyser();

    // Set up audio routing
    source.connect(gainNode);
    gainNode.connect(analyser);
    analyser.connect(context.destination);

    // Echo setup
    gainNode.connect(echoNode);
    echoNode.connect(echoGain);
    echoGain.connect(analyser);
    echoNode.delayTime.value = 0.3;
    echoGain.gain.value = 0;

    // Store analyser reference
    if (deckId === 'A') {
      analyserARef.current = analyser;
    } else {
      analyserBRef.current = analyser;
    }

    return { gainNode, echoNode, echoGain };
  }, []);

  const loadTrack = useCallback(async (deckId: 'A' | 'B', track: AudioTrack) => {
    const audio = new Audio(track.src);
    audio.loop = true;
    audio.crossOrigin = 'anonymous';

    // Create audio nodes
    const nodes = createAudioNodes(audio, deckId);

    const deckState = {
      track,
      isPlaying: false,
      volume: deckId === 'A' ? deckA.volume : deckB.volume,
      pitch: 0,
      echoFX: false,
      audioElement: audio,
      gainNode: nodes?.gainNode || null,
      echoNode: nodes?.echoNode || null,
      pitchShiftBuffer: null
    };

    if (deckId === 'A') {
      setDeckA(deckState);
    } else {
      setDeckB(deckState);
    }
  }, [deckA.volume, createAudioNodes]);

  const playDeck = useCallback(async (deckId: 'A' | 'B') => {
    const deck = deckId === 'A' ? deckA : deckB;
    if (!deck.audioElement) return;

    try {
      if (audioContextRef.current?.state === 'suspended') {
        await audioContextRef.current.resume();
      }
      
      await deck.audioElement.play();
      
      if (deckId === 'A') {
        setDeckA(prev => ({ ...prev, isPlaying: true }));
      } else {
        setDeckB(prev => ({ ...prev, isPlaying: true }));
      }
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  }, [deckA, deckB]);

  const pauseDeck = useCallback((deckId: 'A' | 'B') => {
    const deck = deckId === 'A' ? deckA : deckB;
    if (!deck.audioElement) return;

    deck.audioElement.pause();
    
    if (deckId === 'A') {
      setDeckA(prev => ({ ...prev, isPlaying: false }));
    } else {
      setDeckB(prev => ({ ...prev, isPlaying: false }));
    }
  }, [deckA, deckB]);

  const setDeckVolume = useCallback((deckId: 'A' | 'B', volume: number) => {
    const deck = deckId === 'A' ? deckA : deckB;
    const crossfadeMultiplier = deckId === 'A' ? 
      (100 - crossfadeValue) / 100 : 
      crossfadeValue / 100;
    
    const finalVolume = (volume / 100) * crossfadeMultiplier;
    
    if (deck.gainNode) {
      deck.gainNode.gain.value = finalVolume;
    } else if (deck.audioElement) {
      deck.audioElement.volume = finalVolume;
    }

    if (deckId === 'A') {
      setDeckA(prev => ({ ...prev, volume }));
    } else {
      setDeckB(prev => ({ ...prev, volume }));
    }
  }, [deckA, deckB, crossfadeValue]);

  const setDeckPitch = useCallback((deckId: 'A' | 'B', pitch: number) => {
    const deck = deckId === 'A' ? deckA : deckB;
    if (!deck.audioElement) return;

    // Apply pitch shift via playback rate
    const playbackRate = 1 + (pitch / 100);
    deck.audioElement.playbackRate = Math.max(0.5, Math.min(2, playbackRate));

    if (deckId === 'A') {
      setDeckA(prev => ({ ...prev, pitch }));
    } else {
      setDeckB(prev => ({ ...prev, pitch }));
    }
  }, [deckA, deckB]);

  const toggleDeckEcho = useCallback((deckId: 'A' | 'B') => {
    const deck = deckId === 'A' ? deckA : deckB;
    const newEchoState = !deck.echoFX;

    // This would need more complex Web Audio routing for real echo
    // For now, we'll simulate with a simple filter
    if (deck.audioElement) {
      if (newEchoState) {
        // Add simple reverb simulation
        deck.audioElement.style.filter = 'brightness(1.2)';
      } else {
        deck.audioElement.style.filter = 'none';
      }
    }

    if (deckId === 'A') {
      setDeckA(prev => ({ ...prev, echoFX: newEchoState }));
    } else {
      setDeckB(prev => ({ ...prev, echoFX: newEchoState }));
    }
  }, [deckA, deckB]);

  const setCrossfade = useCallback((value: number) => {
    setCrossfadeValue(value);
    
    // Update both deck volumes based on crossfade
    setDeckVolume('A', deckA.volume);
    setDeckVolume('B', deckB.volume);
  }, [deckA.volume, deckB.volume, setDeckVolume]);

  const playDropEffect = useCallback(() => {
    if (crowdCheerRef.current) {
      crowdCheerRef.current.currentTime = 0;
      crowdCheerRef.current.play().catch(console.warn);
    }
  }, []);

  const getWaveformData = useCallback((deckId: 'A' | 'B'): Float32Array => {
    const analyser = deckId === 'A' ? analyserARef.current : analyserBRef.current;
    if (!analyser) {
      // Return simulated waveform data
      const data = new Float32Array(64);
      for (let i = 0; i < data.length; i++) {
        data[i] = Math.random() * 0.5 + 0.25;
      }
      return data;
    }

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Float32Array(bufferLength);
    analyser.getFloatFrequencyData(dataArray);
    
    // Downsample to 64 bars for visualization
    const sampledData = new Float32Array(64);
    const samplesPerBar = Math.floor(bufferLength / 64);
    
    for (let i = 0; i < 64; i++) {
      let sum = 0;
      for (let j = 0; j < samplesPerBar; j++) {
        sum += Math.abs(dataArray[i * samplesPerBar + j] + 140) / 140;
      }
      sampledData[i] = Math.max(0, Math.min(1, sum / samplesPerBar));
    }
    
    return sampledData;
  }, []);

  return {
    deckA,
    deckB,
    crossfadeValue,
    masterBpm,
    loadTrack,
    playDeck,
    pauseDeck,
    setDeckVolume,
    setDeckPitch,
    toggleDeckEcho,
    setCrossfade,
    setMasterBpm,
    playDropEffect,
    getWaveformData
  };
};
