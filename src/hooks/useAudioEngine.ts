
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
  isMuted: boolean;
  audioElement: HTMLAudioElement | null;
  gainNode: GainNode | null;
  echoNode: DelayNode | null;
  echoGainNode: GainNode | null;
  analyserNode: AnalyserNode | null;
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
  toggleDeckMute: (deckId: 'A' | 'B') => void;
  setCrossfade: (value: number) => void;
  setMasterBpm: (bpm: number) => void;
  playDropEffect: () => void;
  getWaveformData: (deckId: 'A' | 'B') => Float32Array;
  isAudioContextReady: boolean;
}

export const useAudioEngine = (): AudioEngineHook => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const crowdCheerRef = useRef<HTMLAudioElement | null>(null);
  const [isAudioContextReady, setIsAudioContextReady] = useState(false);

  const [deckA, setDeckA] = useState<DeckAudioState>({
    track: null,
    isPlaying: false,
    volume: 75,
    pitch: 0,
    echoFX: false,
    isMuted: false,
    audioElement: null,
    gainNode: null,
    echoNode: null,
    echoGainNode: null,
    analyserNode: null
  });

  const [deckB, setDeckB] = useState<DeckAudioState>({
    track: null,
    isPlaying: false,
    volume: 75,
    pitch: 0,
    echoFX: false,
    isMuted: false,
    audioElement: null,
    gainNode: null,
    echoNode: null,
    echoGainNode: null,
    analyserNode: null
  });

  const [crossfadeValue, setCrossfadeValue] = useState(50);
  const [masterBpm, setMasterBpm] = useState(128);

  // Initialize Audio Context
  useEffect(() => {
    const initAudio = async () => {
      try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        audioContextRef.current = new AudioContext();
        masterGainRef.current = audioContextRef.current.createGain();
        masterGainRef.current.connect(audioContextRef.current.destination);
        
        // Initialize crowd cheer audio
        crowdCheerRef.current = new Audio('/audio/crowd_cheer.mp3');
        crowdCheerRef.current.volume = 0.4;
        crowdCheerRef.current.onerror = () => {
          console.log('Crowd cheer audio not found, using silence');
        };
        
        setIsAudioContextReady(true);
        console.log('Audio Engine initialized successfully');
      } catch (error) {
        console.warn('Web Audio API not supported, using fallback:', error);
        setIsAudioContextReady(false);
      }
    };

    initAudio();

    return () => {
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, []);

  const createAudioNodes = useCallback((audioElement: HTMLAudioElement, deckId: 'A' | 'B') => {
    if (!audioContextRef.current || !masterGainRef.current) return null;

    try {
      const context = audioContextRef.current;
      const source = context.createMediaElementSource(audioElement);
      
      // Create audio processing chain
      const gainNode = context.createGain();
      const analyserNode = context.createAnalyser();
      const echoNode = context.createDelay(1);
      const echoGainNode = context.createGain();
      const echoFeedbackNode = context.createGain();
      
      // Configure analyser
      analyserNode.fftSize = 128;
      analyserNode.smoothingTimeConstant = 0.8;
      
      // Configure echo
      echoNode.delayTime.value = 0.25;
      echoGainNode.gain.value = 0;
      echoFeedbackNode.gain.value = 0.3;
      
      // Connect audio chain: source -> gain -> analyser -> master
      source.connect(gainNode);
      gainNode.connect(analyserNode);
      analyserNode.connect(masterGainRef.current);
      
      // Echo chain: gain -> echo -> echoGain -> analyser (feedback loop)
      gainNode.connect(echoNode);
      echoNode.connect(echoGainNode);
      echoGainNode.connect(echoFeedbackNode);
      echoFeedbackNode.connect(echoNode);
      echoGainNode.connect(analyserNode);

      console.log(`Audio nodes created for Deck ${deckId}`);
      return { gainNode, echoNode, echoGainNode, analyserNode };
    } catch (error) {
      console.error(`Error creating audio nodes for Deck ${deckId}:`, error);
      return null;
    }
  }, []);

  const updateCrossfadeVolumes = useCallback(() => {
    const deckAMultiplier = (100 - crossfadeValue) / 100;
    const deckBMultiplier = crossfadeValue / 100;
    
    // Update Deck A volume
    if (deckA.gainNode && !deckA.isMuted) {
      deckA.gainNode.gain.value = (deckA.volume / 100) * deckAMultiplier;
    }
    
    // Update Deck B volume
    if (deckB.gainNode && !deckB.isMuted) {
      deckB.gainNode.gain.value = (deckB.volume / 100) * deckBMultiplier;
    }
    
    console.log(`Crossfade: A=${Math.round(deckAMultiplier * 100)}%, B=${Math.round(deckBMultiplier * 100)}%`);
  }, [crossfadeValue, deckA.gainNode, deckA.volume, deckA.isMuted, deckB.gainNode, deckB.volume, deckB.isMuted]);

  const loadTrack = useCallback(async (deckId: 'A' | 'B', track: AudioTrack) => {
    const audio = new Audio();
    audio.src = track.src;
    audio.loop = true;
    audio.crossOrigin = 'anonymous';
    audio.preload = 'auto';
    
    // Handle audio loading errors gracefully
    audio.onerror = () => {
      console.warn(`Track ${track.title} not found, using silent audio`);
    };

    // Create audio nodes
    const nodes = createAudioNodes(audio, deckId);

    const deckState: DeckAudioState = {
      track,
      isPlaying: false,
      volume: deckId === 'A' ? deckA.volume : deckB.volume,
      pitch: 0,
      echoFX: false,
      isMuted: false,
      audioElement: audio,
      gainNode: nodes?.gainNode || null,
      echoNode: nodes?.echoNode || null,
      echoGainNode: nodes?.echoGainNode || null,
      analyserNode: nodes?.analyserNode || null
    };

    if (deckId === 'A') {
      setDeckA(deckState);
    } else {
      setDeckB(deckState);
    }
    
    console.log(`Track loaded: ${track.title} on Deck ${deckId}`);
  }, [deckA.volume, createAudioNodes]);

  const playDeck = useCallback(async (deckId: 'A' | 'B') => {
    const deck = deckId === 'A' ? deckA : deckB;
    if (!deck.audioElement) return;

    try {
      // Resume audio context if suspended
      if (audioContextRef.current?.state === 'suspended') {
        await audioContextRef.current.resume();
      }
      
      await deck.audioElement.play();
      
      if (deckId === 'A') {
        setDeckA(prev => ({ ...prev, isPlaying: true }));
      } else {
        setDeckB(prev => ({ ...prev, isPlaying: true }));
      }
      
      console.log(`Deck ${deckId} started playing`);
    } catch (error) {
      console.error(`Error playing Deck ${deckId}:`, error);
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
    
    console.log(`Deck ${deckId} paused`);
  }, [deckA, deckB]);

  const setDeckVolume = useCallback((deckId: 'A' | 'B', volume: number) => {
    if (deckId === 'A') {
      setDeckA(prev => ({ ...prev, volume }));
    } else {
      setDeckB(prev => ({ ...prev, volume }));
    }
    
    // Update actual audio volume via crossfade
    setTimeout(updateCrossfadeVolumes, 0);
  }, [updateCrossfadeVolumes]);

  const setDeckPitch = useCallback((deckId: 'A' | 'B', pitch: number) => {
    const deck = deckId === 'A' ? deckA : deckB;
    if (!deck.audioElement) return;

    // Apply pitch shift via playback rate (affects tempo)
    const playbackRate = 1 + (pitch / 100);
    deck.audioElement.playbackRate = Math.max(0.5, Math.min(2, playbackRate));

    if (deckId === 'A') {
      setDeckA(prev => ({ ...prev, pitch }));
    } else {
      setDeckB(prev => ({ ...prev, pitch }));
    }
    
    console.log(`Deck ${deckId} pitch: ${pitch}% (rate: ${playbackRate.toFixed(2)})`);
  }, [deckA, deckB]);

  const toggleDeckEcho = useCallback((deckId: 'A' | 'B') => {
    const deck = deckId === 'A' ? deckA : deckB;
    const newEchoState = !deck.echoFX;

    if (deck.echoGainNode) {
      deck.echoGainNode.gain.value = newEchoState ? 0.4 : 0;
    }

    if (deckId === 'A') {
      setDeckA(prev => ({ ...prev, echoFX: newEchoState }));
    } else {
      setDeckB(prev => ({ ...prev, echoFX: newEchoState }));
    }
    
    console.log(`Deck ${deckId} echo: ${newEchoState ? 'ON' : 'OFF'}`);
  }, [deckA, deckB]);

  const toggleDeckMute = useCallback((deckId: 'A' | 'B') => {
    const deck = deckId === 'A' ? deckA : deckB;
    const newMuteState = !deck.isMuted;

    if (deck.gainNode) {
      if (newMuteState) {
        deck.gainNode.gain.value = 0;
      } else {
        // Restore volume based on crossfade
        updateCrossfadeVolumes();
      }
    }

    if (deckId === 'A') {
      setDeckA(prev => ({ ...prev, isMuted: newMuteState }));
    } else {
      setDeckB(prev => ({ ...prev, isMuted: newMuteState }));
    }
    
    console.log(`Deck ${deckId} muted: ${newMuteState}`);
  }, [deckA, deckB, updateCrossfadeVolumes]);

  const setCrossfade = useCallback((value: number) => {
    setCrossfadeValue(value);
    setTimeout(updateCrossfadeVolumes, 0);
  }, [updateCrossfadeVolumes]);

  const playDropEffect = useCallback(() => {
    if (crowdCheerRef.current) {
      crowdCheerRef.current.currentTime = 0;
      crowdCheerRef.current.play().catch(() => {
        console.log('Crowd cheer playback failed (audio file missing)');
      });
    }
  }, []);

  const getWaveformData = useCallback((deckId: 'A' | 'B'): Float32Array => {
    const deck = deckId === 'A' ? deckA : deckB;
    
    if (!deck.analyserNode || !deck.isPlaying) {
      // Return simulated data when not playing
      const data = new Float32Array(64);
      for (let i = 0; i < data.length; i++) {
        data[i] = Math.random() * 0.2;
      }
      return data;
    }

    const bufferLength = deck.analyserNode.frequencyBinCount;
    const dataArray = new Float32Array(bufferLength);
    deck.analyserNode.getFloatFrequencyData(dataArray);
    
    // Convert to normalized 0-1 range for visualization
    const sampledData = new Float32Array(64);
    const samplesPerBar = Math.floor(bufferLength / 64);
    
    for (let i = 0; i < 64; i++) {
      let sum = 0;
      for (let j = 0; j < samplesPerBar; j++) {
        const index = i * samplesPerBar + j;
        if (index < dataArray.length) {
          // Convert dB to linear (dB range typically -100 to 0)
          sum += Math.max(0, (dataArray[index] + 100) / 100);
        }
      }
      sampledData[i] = Math.min(1, sum / samplesPerBar);
    }
    
    return sampledData;
  }, [deckA, deckB]);

  // Update crossfade volumes when crossfade value changes
  useEffect(() => {
    updateCrossfadeVolumes();
  }, [updateCrossfadeVolumes]);

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
    toggleDeckMute,
    setCrossfade,
    setMasterBpm,
    playDropEffect,
    getWaveformData,
    isAudioContextReady
  };
};
