
import React from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Settings, Volume2, VolumeX } from 'lucide-react';
import { useAudioContext } from '@/contexts/AudioContext';
import WaveformVisualizer from '@/components/audio-ui/WaveformVisualizer';
import { Slider } from '@/components/ui/slider';

interface Track {
  id: string;
  title: string;
  bpm: number;
  src: string;
}

interface DeckState {
  track: Track;
  isPlaying: boolean;
  volume: number;
  pitch: number;
  echoFX: boolean;
  isMuted: boolean;
}

interface DJDeckProps {
  deckId: 'A' | 'B';
  onTrackSelect: () => void;
  crossfadeValue: number;
  bpmSync: boolean;
  deckState?: DeckState;
  onStateChange?: (state: DeckState) => void;
  audioEngine?: any;
  waveformData?: Float32Array;
  isActive?: boolean;
}

const DJDeck: React.FC<DJDeckProps> = ({ 
  deckId, 
  onTrackSelect, 
  crossfadeValue, 
  bpmSync,
  deckState,
  onStateChange,
  audioEngine,
  waveformData,
  isActive = false
}) => {
  const { bpm } = useAudioContext();

  // Use passed state or fallback to default
  const currentState = deckState || {
    track: { id: '1', title: 'Festival Mix', bpm: 128, src: '/audio/festival_mix.mp3' },
    isPlaying: false,
    volume: 75,
    pitch: 0,
    echoFX: false,
    isMuted: false
  };

  const effectiveBpm = bpmSync ? bpm : currentState.track.bpm + (currentState.pitch * 0.2);
  const deckVolume = (crossfadeValue / 100) * (currentState.volume / 100);

  const handlePlayPause = async () => {
    console.log(`Deck ${deckId} play/pause clicked`);
    if (audioEngine) {
      if (currentState.isPlaying) {
        audioEngine.pauseDeck(deckId);
      } else {
        await audioEngine.playDeck(deckId);
      }
    } else {
      console.warn('No audio engine available');
    }
    
    if (onStateChange) {
      onStateChange({
        ...currentState,
        isPlaying: !currentState.isPlaying
      });
    }
  };

  const handlePitchChange = (newPitch: number[]) => {
    const pitchValue = newPitch[0];
    console.log(`Deck ${deckId} pitch changed to ${pitchValue}%`);
    
    if (audioEngine) {
      audioEngine.setDeckPitch(deckId, pitchValue);
    }

    if (onStateChange) {
      onStateChange({
        ...currentState,
        pitch: pitchValue
      });
    }
  };

  const handleVolumeChange = (newVolume: number[]) => {
    const volumeValue = newVolume[0];
    console.log(`Deck ${deckId} volume changed to ${volumeValue}%`);
    
    if (audioEngine) {
      audioEngine.setDeckVolume(deckId, volumeValue);
    }

    if (onStateChange) {
      onStateChange({
        ...currentState,
        volume: volumeValue
      });
    }
  };

  const handleEchoToggle = () => {
    console.log(`Deck ${deckId} echo toggled`);
    if (audioEngine) {
      audioEngine.toggleDeckEcho(deckId);
    }

    if (onStateChange) {
      onStateChange({
        ...currentState,
        echoFX: !currentState.echoFX
      });
    }
  };

  const handleMuteToggle = () => {
    console.log(`Deck ${deckId} mute toggled`);
    if (audioEngine) {
      audioEngine.toggleDeckMute(deckId);
    }

    if (onStateChange) {
      onStateChange({
        ...currentState,
        isMuted: !currentState.isMuted
      });
    }
  };

  return (
    <motion.div
      className={`bg-bass-medium/80 backdrop-blur-md border rounded-lg p-6 relative overflow-hidden ${
        isActive 
          ? 'border-neon-purple border-2 shadow-lg shadow-neon-purple/20' 
          : 'border-neon-purple/30'
      }`}
      whileHover={{ borderColor: 'rgba(191,90,242,0.6)' }}
      animate={currentState.isPlaying ? {
        boxShadow: [
          '0 0 20px rgba(191,90,242,0.2)',
          '0 0 30px rgba(191,90,242,0.4)',
          '0 0 20px rgba(191,90,242,0.2)'
        ]
      } : {}}
      transition={{ duration: 60/effectiveBpm/1000, repeat: Infinity }}
    >
      {/* Deck Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <motion.div 
            className="w-8 h-8 bg-neon-purple rounded-full flex items-center justify-center font-bold text-bass-dark"
            animate={currentState.isPlaying ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 60/effectiveBpm/1000, repeat: Infinity }}
          >
            {deckId}
          </motion.div>
          <span className="text-neon-cyan font-medium">DECK {deckId}</span>
        </div>
        
        {/* Status Indicators - Always visible */}
        <div className="flex items-center gap-2">
          <div className="text-xs text-neon-cyan bg-bass-dark px-2 py-1 rounded">
            {Math.round(effectiveBpm)} BPM
          </div>
          <div className="text-xs text-neon-cyan bg-bass-dark px-2 py-1 rounded">
            {currentState.isMuted ? 'MUTED' : `${Math.round(deckVolume * 100)}%`}
          </div>
          {currentState.echoFX && (
            <div className="text-xs text-neon-purple bg-bass-dark px-2 py-1 rounded animate-pulse">
              ECHO
            </div>
          )}
          <motion.button
            onClick={onTrackSelect}
            className="text-slate-400 hover:text-neon-cyan p-1"
            whileHover={{ scale: 1.1, color: '#06ffa5' }}
            whileTap={{ scale: 0.9 }}
            title="Select Track"
          >
            <Settings className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      {/* Track Info - Always visible */}
      <div className="mb-4">
        <h3 className="text-white font-medium truncate">{currentState.track.title}</h3>
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <motion.span
            animate={bpmSync ? { color: ['#06ffa5', '#bf5af2', '#06ffa5'] } : {}}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {Math.round(effectiveBpm)} BPM
          </motion.span>
          <span>•</span>
          <span>{Math.round(deckVolume * 100)}% VOL</span>
          {currentState.pitch !== 0 && (
            <>
              <span>•</span>
              <span className="text-neon-cyan">
                PITCH {currentState.pitch > 0 ? '+' : ''}{currentState.pitch}%
              </span>
            </>
          )}
        </div>
      </div>

      {/* Waveform Visualization - Always visible */}
      <div className="mb-4">
        <WaveformVisualizer
          waveformData={waveformData || new Float32Array(32).fill(0.3)} // Show some data even when no audio
          isPlaying={currentState.isPlaying && !currentState.isMuted}
          color={deckId === 'A' ? '#06ffa5' : '#bf5af2'}
          height={48}
          bars={32}
        />
      </div>

      {/* Controls - All always visible and functional */}
      <div className="space-y-4">
        {/* Play/Pause & Mute */}
        <div className="flex gap-2">
          <motion.button
            onClick={handlePlayPause}
            className={`flex-1 p-3 rounded-lg font-medium transition-all ${
              currentState.isPlaying
                ? 'bg-neon-cyan text-bass-dark'
                : 'bg-bass-dark border border-neon-purple/50 text-neon-purple hover:bg-neon-purple/10'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center justify-center gap-2">
              {currentState.isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{currentState.isPlaying ? 'PAUSE' : 'PLAY'}</span>
            </div>
          </motion.button>
          
          <motion.button
            onClick={handleMuteToggle}
            className={`p-3 rounded-lg font-medium transition-all ${
              currentState.isMuted
                ? 'bg-red-500 text-white'
                : 'bg-bass-dark border border-slate-600 text-slate-400 hover:border-neon-purple/50'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            title={currentState.isMuted ? "Unmute" : "Mute"}
          >
            {currentState.isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </motion.button>
        </div>

        {/* Pitch Control - Always functional */}
        <div>
          <label className="block text-neon-cyan text-sm font-medium mb-2">
            PITCH {currentState.pitch > 0 ? '+' : ''}{currentState.pitch}%
            {!audioEngine && <span className="text-red-400 ml-2">(No Audio Engine)</span>}
          </label>
          <Slider
            value={[currentState.pitch]}
            onValueChange={handlePitchChange}
            min={-20}
            max={20}
            step={1}
            className="w-full"
          />
        </div>

        {/* Volume Control - Always functional */}
        <div>
          <label className="block text-neon-cyan text-sm font-medium mb-2 flex items-center gap-2">
            <Volume2 className="w-4 h-4" />
            VOLUME {currentState.volume}%
            {currentState.isMuted && <span className="text-red-400">(MUTED)</span>}
          </label>
          <Slider
            value={[currentState.volume]}
            onValueChange={handleVolumeChange}
            max={100}
            step={1}
            className="w-full"
            disabled={currentState.isMuted}
          />
        </div>

        {/* Echo FX - Always functional */}
        <motion.button
          onClick={handleEchoToggle}
          className={`w-full p-2 rounded-lg text-sm font-medium transition-all ${
            currentState.echoFX
              ? 'bg-neon-purple/30 border border-neon-purple text-neon-purple'
              : 'bg-bass-dark border border-slate-600 text-slate-400 hover:border-neon-purple/50'
          }`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          animate={currentState.echoFX ? {
            textShadow: [
              '0 0 5px rgba(191,90,242,0.5)',
              '0 0 10px rgba(191,90,242,0.8)',
              '0 0 5px rgba(191,90,242,0.5)'
            ]
          } : {}}
          transition={{ duration: 0.5, repeat: Infinity }}
        >
          ECHO FX {currentState.echoFX ? 'ON' : 'OFF'}
          {!audioEngine && <span className="text-red-400 ml-2">(Simulated)</span>}
        </motion.button>
      </div>

      {/* Volume Indicator - Always visible */}
      <div className="absolute right-2 top-2">
        <div className="flex flex-col-reverse gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <motion.div
              key={i}
              className={`w-2 h-3 rounded-sm ${
                currentState.isMuted 
                  ? 'bg-red-500' 
                  : deckVolume > i * 0.2 
                    ? 'bg-neon-cyan' 
                    : 'bg-slate-700'
              }`}
              animate={currentState.isPlaying && deckVolume > i * 0.2 && !currentState.isMuted ? {
                opacity: [0.5, 1, 0.5]
              } : {}}
              transition={{ 
                duration: 0.2 + (i * 0.05), 
                repeat: Infinity,
                delay: i * 0.1 
              }}
            />
          ))}
        </div>
      </div>

      {/* Audio Engine Status Indicator */}
      {!audioEngine && (
        <div className="absolute bottom-2 left-2 bg-red-500/20 border border-red-500 text-red-300 px-2 py-1 rounded text-xs">
          No Audio Engine
        </div>
      )}
    </motion.div>
  );
};

export default DJDeck;
