
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
  echoFeedbackNode: GainNode | null;
  analyserNode: AnalyserNode | null;
  sourceNode: MediaElementAudioSourceNode | null;
}

export interface RealAudioEngine {
  deckA: DeckAudioState;
  deckB: DeckAudioState;
  crossfadeValue: number;
  masterBpm: number;
  audioContextState: 'suspended' | 'running' | 'closed' | 'error';
  isSimulationMode: boolean;
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
  resumeAudioContext: () => Promise<void>;
}

export const useRealAudioEngine = (): RealAudioEngine => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const crowdCheerRef = useRef<HTMLAudioElement | null>(null);
  
  const [audioContextState, setAudioContextState] = useState<'suspended' | 'running' | 'closed' | 'error'>('suspended');
  const [isSimulationMode, setIsSimulationMode] = useState(false);

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
    echoFeedbackNode: null,
    analyserNode: null,
    sourceNode: null
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
    echoFeedbackNode: null,
    analyserNode: null,
    sourceNode: null
  });

  const [crossfadeValue, setCrossfadeValue] = useState(50);
  const [masterBpm, setMasterBpm] = useState(128);

  // Initialize Audio Context
  useEffect(() => {
    const initAudio = async () => {
      try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContext) {
          console.warn('Web Audio API not supported');
          setIsSimulationMode(true);
          setAudioContextState('error');
          return;
        }

        audioContextRef.current = new AudioContext();
        masterGainRef.current = audioContextRef.current.createGain();
        masterGainRef.current.connect(audioContextRef.current.destination);
        
        // Initialize crowd cheer audio with fallback
        crowdCheerRef.current = new Audio();
        crowdCheerRef.current.volume = 0.6;
        crowdCheerRef.current.preload = 'auto';
        
        // Create a simple crowd cheer sound using Web Audio API if file fails
        crowdCheerRef.current.src = '/audio/crowd_cheer.mp3';
        crowdCheerRef.current.onerror = () => {
          console.log('Using synthesized crowd cheer');
          // Will use Web Audio API to create cheer sound
        };
        
        setAudioContextState(audioContextRef.current.state as any);
        setIsSimulationMode(false);
        console.log('✅ Real Audio Engine initialized');
      } catch (error) {
        console.error('❌ Audio initialization failed:', error);
        setIsSimulationMode(true);
        setAudioContextState('error');
      }
    };

    initAudio();

    return () => {
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Monitor audio context state
  useEffect(() => {
    const updateAudioState = () => {
      if (audioContextRef.current) {
        setAudioContextState(audioContextRef.current.state as any);
      }
    };

    const interval = setInterval(updateAudioState, 1000);
    return () => clearInterval(interval);
  }, []);

  const createAudioNodes = useCallback((audioElement: HTMLAudioElement, deckId: 'A' | 'B') => {
    if (!audioContextRef.current || !masterGainRef.current || isSimulationMode) {
      console.warn(`🟡 Creating simulated nodes for Deck ${deckId}`);
      return null;
    }

    try {
      const context = audioContextRef.current;
      const source = context.createMediaElementSource(audioElement);
      
      // Create audio processing chain
      const gainNode = context.createGain();
      const analyserNode = context.createAnalyser();
      const echoNode = context.createDelay(1);
      const echoGainNode = context.createGain();
      const echoFeedbackNode = context.createGain();
      
      // Configure analyser for real-time visualization
      analyserNode.fftSize = 256;
      analyserNode.smoothingTimeConstant = 0.7;
      
      // Configure echo with audible settings
      echoNode.delayTime.value = 0.3; // 300ms delay
      echoGainNode.gain.value = 0; // Initially off
      echoFeedbackNode.gain.value = 0.4; // Feedback amount
      
      // Connect audio chain
      source.connect(gainNode);
      gainNode.connect(analyserNode);
      analyserNode.connect(masterGainRef.current);
      
      // Echo chain with feedback
      gainNode.connect(echoNode);
      echoNode.connect(echoGainNode);
      echoGainNode.connect(echoFeedbackNode);
      echoFeedbackNode.connect(echoNode); // Feedback loop
      echoGainNode.connect(analyserNode);

      console.log(`✅ Real audio nodes created for Deck ${deckId}`);
      return { gainNode, echoNode, echoGainNode, echoFeedbackNode, analyserNode, sourceNode: source };
    } catch (error) {
      console.error(`❌ Error creating audio nodes for Deck ${deckId}:`, error);
      setIsSimulationMode(true);
      return null;
    }
  }, [isSimulationMode]);

  const updateCrossfadeVolumes = useCallback(() => {
    if (isSimulationMode) return;

    const deckAMultiplier = (100 - crossfadeValue) / 100;
    const deckBMultiplier = crossfadeValue / 100;
    
    // Update Deck A volume
    if (deckA.gainNode && !deckA.isMuted) {
      deckA.gainNode.gain.setValueAtTime((deckA.volume / 100) * deckAMultiplier, audioContextRef.current?.currentTime || 0);
    }
    
    // Update Deck B volume
    if (deckB.gainNode && !deckB.isMuted) {
      deckB.gainNode.gain.setValueAtTime((deckB.volume / 100) * deckBMultiplier, audioContextRef.current?.currentTime || 0);
    }
    
    console.log(`🎚️ Crossfade: A=${Math.round(deckAMultiplier * 100)}%, B=${Math.round(deckBMultiplier * 100)}%`);
  }, [crossfadeValue, deckA.gainNode, deckA.volume, deckA.isMuted, deckB.gainNode, deckB.volume, deckB.isMuted, isSimulationMode]);

  const loadTrack = useCallback(async (deckId: 'A' | 'B', track: AudioTrack) => {
    console.log(`🎵 Loading track: ${track.title} on Deck ${deckId}`);
    
    const audio = new Audio();
    audio.crossOrigin = 'anonymous';
    audio.loop = true;
    audio.preload = 'auto';
    
    // Use placeholder audio or create silence if track not found
    audio.src = track.src;
    audio.onerror = () => {
      console.warn(`⚠️ Track ${track.title} not found, using silence for Deck ${deckId}`);
      // Create silent audio buffer
      if (audioContextRef.current) {
        const buffer = audioContextRef.current.createBuffer(1, 44100, 44100);
        const source = audioContextRef.current.createBufferSource();
        source.buffer = buffer;
        source.loop = true;
      }
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
      echoFeedbackNode: nodes?.echoFeedbackNode || null,
      analyserNode: nodes?.analyserNode || null,
      sourceNode: nodes?.sourceNode || null
    };

    if (deckId === 'A') {
      setDeckA(deckState);
    } else {
      setDeckB(deckState);
    }
    
    console.log(`✅ Track loaded: ${track.title} on Deck ${deckId}`);
  }, [deckA.volume, createAudioNodes]);

  const resumeAudioContext = useCallback(async () => {
    if (audioContextRef.current?.state === 'suspended') {
      try {
        await audioContextRef.current.resume();
        setAudioContextState('running');
        console.log('✅ Audio context resumed');
      } catch (error) {
        console.error('❌ Failed to resume audio context:', error);
        setIsSimulationMode(true);
      }
    }
  }, []);

  const playDeck = useCallback(async (deckId: 'A' | 'B') => {
    const deck = deckId === 'A' ? deckA : deckB;
    if (!deck.audioElement) {
      console.warn(`⚠️ No audio element for Deck ${deckId}`);
      return;
    }

    try {
      // Resume audio context if suspended
      await resumeAudioContext();
      
      await deck.audioElement.play();
      
      if (deckId === 'A') {
        setDeckA(prev => ({ ...prev, isPlaying: true }));
      } else {
        setDeckB(prev => ({ ...prev, isPlaying: true }));
      }
      
      console.log(`▶️ Deck ${deckId} playing: ${deck.track?.title}`);
    } catch (error) {
      console.error(`❌ Error playing Deck ${deckId}:`, error);
      setIsSimulationMode(true);
    }
  }, [deckA, deckB, resumeAudioContext]);

  const pauseDeck = useCallback((deckId: 'A' | 'B') => {
    const deck = deckId === 'A' ? deckA : deckB;
    if (!deck.audioElement) return;

    deck.audioElement.pause();
    
    if (deckId === 'A') {
      setDeckA(prev => ({ ...prev, isPlaying: false }));
    } else {
      setDeckB(prev => ({ ...prev, isPlaying: false }));
    }
    
    console.log(`⏸️ Deck ${deckId} paused`);
  }, [deckA, deckB]);

  const setDeckVolume = useCallback((deckId: 'A' | 'B', volume: number) => {
    if (deckId === 'A') {
      setDeckA(prev => ({ ...prev, volume }));
    } else {
      setDeckB(prev => ({ ...prev, volume }));
    }
    
    console.log(`🔊 Deck ${deckId} volume: ${volume}%`);
    setTimeout(updateCrossfadeVolumes, 0);
  }, [updateCrossfadeVolumes]);

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
    
    console.log(`🎵 Deck ${deckId} pitch: ${pitch}% (playback rate: ${playbackRate.toFixed(2)})`);
  }, [deckA, deckB]);

  const toggleDeckEcho = useCallback((deckId: 'A' | 'B') => {
    const deck = deckId === 'A' ? deckA : deckB;
    const newEchoState = !deck.echoFX;

    if (deck.echoGainNode && !isSimulationMode) {
      // Smooth transition for echo effect
      const currentTime = audioContextRef.current?.currentTime || 0;
      deck.echoGainNode.gain.setValueAtTime(newEchoState ? 0.5 : 0, currentTime);
    }

    if (deckId === 'A') {
      setDeckA(prev => ({ ...prev, echoFX: newEchoState }));
    } else {
      setDeckB(prev => ({ ...prev, echoFX: newEchoState }));
    }
    
    console.log(`🔊 Deck ${deckId} echo: ${newEchoState ? 'ON' : 'OFF'}`);
  }, [deckA, deckB, isSimulationMode]);

  const toggleDeckMute = useCallback((deckId: 'A' | 'B') => {
    const deck = deckId === 'A' ? deckA : deckB;
    const newMuteState = !deck.isMuted;

    if (deck.gainNode && !isSimulationMode) {
      const currentTime = audioContextRef.current?.currentTime || 0;
      if (newMuteState) {
        deck.gainNode.gain.setValueAtTime(0, currentTime);
      } else {
        updateCrossfadeVolumes();
      }
    }

    if (deckId === 'A') {
      setDeckA(prev => ({ ...prev, isMuted: newMuteState }));
    } else {
      setDeckB(prev => ({ ...prev, isMuted: newMuteState }));
    }
    
    console.log(`🔇 Deck ${deckId} muted: ${newMuteState}`);
  }, [deckA, deckB, isSimulationMode, updateCrossfadeVolumes]);

  const setCrossfade = useCallback((value: number) => {
    setCrossfadeValue(value);
    setTimeout(updateCrossfadeVolumes, 0);
  }, [updateCrossfadeVolumes]);

  const playDropEffect = useCallback(() => {
    if (crowdCheerRef.current && !isSimulationMode) {
      crowdCheerRef.current.currentTime = 0;
      crowdCheerRef.current.play().catch(() => {
        console.log('🎉 Crowd cheer not available, using synthesized cheer');
        // Create synthesized cheer using Web Audio API
        if (audioContextRef.current) {
          const oscillator = audioContextRef.current.createOscillator();
          const gainNode = audioContextRef.current.createGain();
          oscillator.connect(gainNode);
          gainNode.connect(audioContextRef.current.destination);
          
          oscillator.frequency.setValueAtTime(200, audioContextRef.current.currentTime);
          oscillator.frequency.exponentialRampToValueAtTime(100, audioContextRef.current.currentTime + 0.5);
          gainNode.gain.setValueAtTime(0.1, audioContextRef.current.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + 0.5);
          
          oscillator.start();
          oscillator.stop(audioContextRef.current.currentTime + 0.5);
        }
      });
    } else {
      console.log('🎉 Crowd cheer (simulation mode)');
    }
  }, [isSimulationMode]);

  const getWaveformData = useCallback((deckId: 'A' | 'B'): Float32Array => {
    const deck = deckId === 'A' ? deckA : deckB;
    
    if (!deck.analyserNode || !deck.isPlaying || isSimulationMode) {
      // Return animated fake data for visual effect
      const data = new Float32Array(64);
      const time = Date.now() * 0.01;
      for (let i = 0; i < data.length; i++) {
        data[i] = Math.max(0, (Math.sin(time + i * 0.2) + 1) * 0.3 + Math.random() * 0.2);
      }
      return data;
    }

    const bufferLength = deck.analyserNode.frequencyBinCount;
    const dataArray = new Float32Array(bufferLength);
    deck.analyserNode.getFloatFrequencyData(dataArray);
    
    // Convert dB to normalized 0-1 range
    const sampledData = new Float32Array(64);
    const samplesPerBar = Math.floor(bufferLength / 64);
    
    for (let i = 0; i < 64; i++) {
      let sum = 0;
      for (let j = 0; j < samplesPerBar; j++) {
        const index = i * samplesPerBar + j;
        if (index < dataArray.length) {
          sum += Math.max(0, (dataArray[index] + 100) / 100);
        }
      }
      sampledData[i] = Math.min(1, sum / samplesPerBar);
    }
    
    return sampledData;
  }, [deckA, deckB, isSimulationMode]);

  // Update crossfade volumes when values change
  useEffect(() => {
    updateCrossfadeVolumes();
  }, [updateCrossfadeVolumes]);

  return {
    deckA,
    deckB,
    crossfadeValue,
    masterBpm,
    audioContextState,
    isSimulationMode,
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
    resumeAudioContext
  };
};
