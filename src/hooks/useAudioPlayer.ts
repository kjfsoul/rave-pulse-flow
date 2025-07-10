
import { useState, useRef, useEffect, useCallback } from 'react';

interface AudioPlayerState {
  isPlaying: boolean;
  isMuted: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  bpm: number;
}

interface AudioPlayerControls {
  play: () => Promise<void>;
  pause: () => void;
  toggleMute: () => void;
  setVolume: (volume: number) => void;
  seek: (time: number) => void;
  setBpm: (bpm: number) => void;
}

export type AudioPlayerHook = AudioPlayerState & AudioPlayerControls;

export const useAudioPlayer = (audioSrc: string = '/audio/festival_mix.mp3'): AudioPlayerHook => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [state, setState] = useState<AudioPlayerState>({
    isPlaying: false,
    isMuted: false,
    volume: 0.7,
    currentTime: 0,
    duration: 0,
    bpm: 128, // Hard-coded for now, can be made dynamic later
  });

  // Initialize audio element
  useEffect(() => {
    const audio = new Audio(audioSrc);
    audio.loop = true;
    audio.volume = state.volume;
    audio.preload = 'auto';
    
    // Fallback: Handle missing audio files gracefully
    audio.addEventListener('error', async () => {
      console.warn(`Audio file ${audioSrc} not found, using generated audio`);
      try {
        // Import and use the audio generator
        const { generateTestTrack } = await import('@/utils/audioGenerator');
        const generatedTrack = await generateTestTrack(state.bpm, 30, 'sine');
        
        // Replace the audio source with generated audio
        audio.src = generatedTrack.url;
        audio.load();
      } catch (error) {
        console.warn('Could not generate audio, using silent mode');
        // Create minimal silent buffer as ultimate fallback
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const buffer = audioContext.createBuffer(1, 44100, 44100);
        const source = audioContext.createBufferSource();
        source.buffer = buffer;
        source.loop = true;
      }
    });

    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, [audioSrc]);

  // Update audio properties when state changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = state.isMuted ? 0 : state.volume;
    }
  }, [state.volume, state.isMuted]);

  // Audio event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => {
      setState(prev => ({
        ...prev,
        currentTime: audio.currentTime,
        duration: audio.duration || 0,
      }));
    };

    const handleLoadedMetadata = () => {
      setState(prev => ({
        ...prev,
        duration: audio.duration,
      }));
    };

    const handleEnded = () => {
      setState(prev => ({
        ...prev,
        isPlaying: false,
      }));
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const play = useCallback(async () => {
    if (audioRef.current) {
      try {
        await audioRef.current.play();
        setState(prev => ({ ...prev, isPlaying: true }));
      } catch (error) {
        console.error('Error playing audio:', error);
      }
    }
  }, []);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setState(prev => ({ ...prev, isPlaying: false }));
    }
  }, []);

  const toggleMute = useCallback(() => {
    setState(prev => ({ ...prev, isMuted: !prev.isMuted }));
  }, []);

  const setVolume = useCallback((volume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    setState(prev => ({ ...prev, volume: clampedVolume }));
  }, []);

  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, Math.min(time, audioRef.current.duration));
    }
  }, []);

  const setBpm = useCallback((bpm: number) => {
    setState(prev => ({ ...prev, bpm }));
  }, []);

  return {
    ...state,
    play,
    pause,
    toggleMute,
    setVolume,
    seek,
    setBpm,
  };
};
