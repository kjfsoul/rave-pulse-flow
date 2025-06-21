
import React, { createContext, useContext, ReactNode } from 'react';
import { useAudioPlayer, AudioPlayerHook } from '@/hooks/useAudioPlayer';

const AudioContext = createContext<AudioPlayerHook | null>(null);

interface AudioProviderProps {
  children: ReactNode;
}

export const AudioProvider: React.FC<AudioProviderProps> = ({ children }) => {
  const audioPlayer = useAudioPlayer();

  return (
    <AudioContext.Provider value={audioPlayer}>
      {children}
    </AudioContext.Provider>
  );
};

export const useAudioContext = (): AudioPlayerHook => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudioContext must be used within an AudioProvider');
  }
  return context;
};
