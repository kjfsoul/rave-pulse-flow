import React, { createContext, useContext, useRef, useEffect, ReactNode } from 'react';
import { AudioEngine } from '../engine/AudioEngine';

interface AudioEngineContextType {
  audioEngine: AudioEngine | null;
}

const AudioEngineContext = createContext<AudioEngineContextType>({
  audioEngine: null,
});

export const useAudioEngine = () => {
  const context = useContext(AudioEngineContext);
  if (!context) {
    throw new Error('useAudioEngine must be used within an AudioEngineProvider');
  }
  return context;
};

interface AudioEngineProviderProps {
  children: ReactNode;
}

export const AudioEngineProvider: React.FC<AudioEngineProviderProps> = ({ children }) => {
  const audioEngineRef = useRef<AudioEngine | null>(null);

  if (!audioEngineRef.current) {
    audioEngineRef.current = new AudioEngine();
  }

  useEffect(() => {
    const engine = audioEngineRef.current;
    if (engine) {
      engine.connect();
    }

    return () => {
      if (engine) {
        engine.disconnect();
      }
    };
  }, []);

  return (
    <AudioEngineContext.Provider value={{ audioEngine: audioEngineRef.current }}>
      {children}
    </AudioEngineContext.Provider>
  );
};