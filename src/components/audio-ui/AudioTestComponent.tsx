import React, { useState, useEffect } from 'react';
import { useTrueAudio } from '../../hooks/useTrueAudio';
import { Button } from '../ui/button';

const AudioTestComponent: React.FC = () => {
  const {
    audioContext,
    audioContextState,
    isUnlocked,
    loadedBuffers,
    loadAudioBuffer,
    playBuffer,
    unlockAudio,
    createAndPlayTone
  } = useTrueAudio();
  
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // Load a test sound on component mount
  useEffect(() => {
    const loadTestSound = async () => {
      setIsLoading(true);
      try {
        // Try to load a test sound if available
        // For this demo, we'll just show the UI without loading an actual file
        console.log('AudioTestComponent mounted');
      } catch (error) {
        console.warn('Could not load test sound:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTestSound();
  }, []);

  const handleUnlockClick = async () => {
    console.log('Unlock button clicked');
    await unlockAudio();
  };

  const handlePlayTone = async () => {
    console.log('Play tone button clicked');
    setIsPlaying(true);
    await createAndPlayTone(440, 1); // A4 note for 1 second
    setIsPlaying(false);
  };

  const handlePlayHighTone = async () => {
    console.log('Play high tone button clicked');
    setIsPlaying(true);
    await createAndPlayTone(880, 0.5); // A5 note for 0.5 seconds
    setIsPlaying(false);
  };

  return (
    <div className="p-6 bg-gray-800 rounded-lg shadow-lg max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-white mb-4">Audio Engine Test</h2>
      
      <div className="space-y-4">
        <div className="bg-gray-700 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-2">Audio Context Status</h3>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${audioContextState === 'running' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
            <span className="text-white">
              State: <span className="font-mono">{audioContextState}</span>
            </span>
          </div>
          <div className="mt-2">
            <span className="text-white">
              Unlocked: <span className="font-mono">{isUnlocked ? 'Yes' : 'No'}</span>
            </span>
          </div>
        </div>

        <div className="bg-gray-700 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-2">Controls</h3>
          <div className="grid grid-cols-1 gap-3">
            <Button 
              onClick={handleUnlockClick}
              disabled={isUnlocked || audioContextState === 'running'}
              className="w-full"
            >
              {isUnlocked ? 'Audio Unlocked' : 'Unlock Audio (Click Me)'}
            </Button>
            
            <Button 
              onClick={handlePlayTone}
              disabled={!isUnlocked || isPlaying}
              className="w-full"
            >
              {isPlaying ? 'Playing...' : 'Play Test Tone (A4)'}
            </Button>
            
            <Button 
              onClick={handlePlayHighTone}
              disabled={!isUnlocked || isPlaying}
              className="w-full"
            >
              {isPlaying ? 'Playing...' : 'Play High Tone (A5)'}
            </Button>
          </div>
        </div>

        <div className="bg-gray-700 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-2">Loaded Buffers</h3>
          <p className="text-gray-300">
            Buffers loaded: {Object.keys(loadedBuffers).length}
          </p>
        </div>
      </div>

      <div className="mt-6 text-sm text-gray-400">
        <p>Instructions:</p>
        <ol className="list-decimal list-inside mt-2 space-y-1">
          <li>Click "Unlock Audio" to enable playback (required for mobile)</li>
          <li>After unlocking, use the tone buttons to test audio</li>
          <li>Check console for detailed logs of AudioContext state changes</li>
        </ol>
      </div>
    </div>
  );
};

export default AudioTestComponent;
