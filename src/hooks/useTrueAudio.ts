import { useState, useEffect, useRef, useCallback } from 'react';

// Global AudioContext instance
let globalAudioContext: AudioContext | null = null;

// Track if we've already attempted to unlock audio
let isUnlockAttempted = false;

interface AudioBufferMap {
  [key: string]: AudioBuffer;
}

interface TrueAudioHook {
  audioContext: AudioContext | null;
  audioContextState: AudioContextState;
  isUnlocked: boolean;
  loadedBuffers: AudioBufferMap;
  loadAudioBuffer: (url: string, key: string) => Promise<AudioBuffer | null>;
  playBuffer: (key: string, volume?: number) => Promise<void>;
  unlockAudio: () => Promise<void>;
  createAndPlayTone: (frequency?: number, duration?: number) => Promise<void>;
}

type AudioContextState = 'suspended' | 'running' | 'closed' | 'interrupted';

export const useTrueAudio = (): TrueAudioHook => {
  const [audioContextState, setAudioContextState] = useState<AudioContextState>('suspended');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [loadedBuffers, setLoadedBuffers] = useState<AudioBufferMap>({});
  
  const audioBuffersRef = useRef<AudioBufferMap>({});
  const isUnlockingRef = useRef(false);

  // Initialize AudioContext
  useEffect(() => {
    const initAudioContext = () => {
      try {
        const AudioContext = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!AudioContext) {
          console.warn('Web Audio API is not supported in this browser');
          return;
        }

        // Create global AudioContext if it doesn't exist
        if (!globalAudioContext) {
          globalAudioContext = new AudioContext();
          console.log('AudioContext created with state:', globalAudioContext.state);
        }

        setAudioContextState(globalAudioContext.state as AudioContextState);
        
        // Listen for state changes
        globalAudioContext.onstatechange = () => {
          if (globalAudioContext) {
            console.log('AudioContext state changed to:', globalAudioContext.state);
            setAudioContextState(globalAudioContext.state as AudioContextState);
          }
        };
      } catch (error) {
        console.error('Failed to initialize AudioContext:', error);
      }
    };

    initAudioContext();

    return () => {
      if (globalAudioContext && globalAudioContext.state !== 'closed') {
        globalAudioContext.close().then(() => {
          console.log('AudioContext closed');
        }).catch((error) => {
          console.error('Error closing AudioContext:', error);
        });
        globalAudioContext = null;
      }
    };
  }, []);

  // Load audio buffer from URL
  const loadAudioBuffer = useCallback(async (url: string, key: string): Promise<AudioBuffer | null> => {
    if (!globalAudioContext) {
      console.warn('AudioContext not initialized');
      return null;
    }

    // Return cached buffer if it exists
    if (audioBuffersRef.current[key]) {
      console.log(`Buffer ${key} already loaded`);
      return audioBuffersRef.current[key];
    }

    try {
      console.log(`Loading audio buffer: ${url}`);
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await globalAudioContext.decodeAudioData(arrayBuffer);
      
      // Cache the buffer
      audioBuffersRef.current[key] = audioBuffer;
      setLoadedBuffers(prev => ({ ...prev, [key]: audioBuffer }));
      
      console.log(`Audio buffer loaded: ${key}`);
      return audioBuffer;
    } catch (error) {
      console.error(`Error loading audio buffer ${key}:`, error);
      return null;
    }
  }, []);

  // Play a loaded buffer
  const playBuffer = useCallback(async (key: string, volume: number = 1): Promise<void> => {
    if (!globalAudioContext) {
      console.warn('AudioContext not initialized');
      return;
    }

    const buffer = audioBuffersRef.current[key];
    if (!buffer) {
      console.warn(`Buffer ${key} not found`);
      return;
    }

    try {
      // Resume context if suspended (required for mobile)
      if (globalAudioContext.state === 'suspended') {
        await globalAudioContext.resume();
        setAudioContextState('running');
        console.log('AudioContext resumed for playback');
      }

      const source = globalAudioContext.createBufferSource();
      const gainNode = globalAudioContext.createGain();
      
      source.buffer = buffer;
      gainNode.gain.value = volume;
      
      source.connect(gainNode);
      gainNode.connect(globalAudioContext.destination);
      
      source.start();
      console.log(`Playing buffer: ${key} at volume: ${volume}`);
    } catch (error) {
      console.error(`Error playing buffer ${key}:`, error);
    }
  }, []);

  // Unlock audio for mobile devices
  const unlockAudio = useCallback(async (): Promise<void> => {
    if (!globalAudioContext || isUnlockAttempted || isUnlockingRef.current) {
      return;
    }

    isUnlockingRef.current = true;
    console.log('Attempting to unlock audio for mobile playback');

    try {
      // Resume the AudioContext (required for mobile)
      if (globalAudioContext.state === 'suspended') {
        await globalAudioContext.resume();
        setAudioContextState('running');
        console.log('AudioContext resumed');
      }

      // Play a short silent buffer to fully unlock audio
      const silentBuffer = globalAudioContext.createBuffer(1, 1, 22050);
      const source = globalAudioContext.createBufferSource();
      source.buffer = silentBuffer;
      source.connect(globalAudioContext.destination);
      source.start();
      
      setIsUnlocked(true);
      isUnlockAttempted = true;
      console.log('Audio unlocked for mobile playback');
    } catch (error) {
      console.error('Error unlocking audio:', error);
    } finally {
      isUnlockingRef.current = false;
    }
  }, []);

  // Create and play a test tone
  const createAndPlayTone = useCallback(async (
    frequency: number = 440, 
    duration: number = 0.5
  ): Promise<void> => {
    if (!globalAudioContext) {
      console.warn('AudioContext not initialized');
      return;
    }

    try {
      // Resume context if suspended
      if (globalAudioContext.state === 'suspended') {
        await globalAudioContext.resume();
        setAudioContextState('running');
        console.log('AudioContext resumed for tone playback');
      }

      const oscillator = globalAudioContext.createOscillator();
      const gainNode = globalAudioContext.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.value = frequency;
      gainNode.gain.value = 0.1;
      
      oscillator.connect(gainNode);
      gainNode.connect(globalAudioContext.destination);
      
      oscillator.start();
      oscillator.stop(globalAudioContext.currentTime + duration);
      
      console.log(`Playing ${frequency}Hz tone for ${duration}s`);
    } catch (error) {
      console.error('Error playing tone:', error);
    }
  }, []);

  // Add event listeners for user interaction to unlock audio
  useEffect(() => {
    if (!globalAudioContext || isUnlockAttempted) {
      return;
    }

    const unlockEvents = ['touchstart', 'touchend', 'mousedown', 'keydown'];
    const unlockHandler = () => {
      unlockAudio();
      // Remove event listeners after first successful unlock
      unlockEvents.forEach(event => {
        document.removeEventListener(event, unlockHandler);
      });
    };

    unlockEvents.forEach(event => {
      document.addEventListener(event, unlockHandler, { once: true });
    });

    return () => {
      unlockEvents.forEach(event => {
        document.removeEventListener(event, unlockHandler);
      });
    };
  }, [unlockAudio]);

  return {
    audioContext: globalAudioContext,
    audioContextState,
    isUnlocked,
    loadedBuffers,
    loadAudioBuffer,
    playBuffer,
    unlockAudio,
    createAndPlayTone
  };
};
