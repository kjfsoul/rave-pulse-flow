
import React from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX, Settings, Zap } from 'lucide-react';
import { useAudioContext } from '@/contexts/AudioContext';
import EnhancedWaveformVisualizer from '@/components/audio-ui/EnhancedWaveformVisualizer';
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

interface EnhancedDJDeckProps {
  deckId: 'A' | 'B';
  onTrackSelect: () => void;
  crossfadeValue: number;
  bpmSync: boolean;
  deckState?: DeckState;
  onStateChange?: (state: DeckState) => void;
  audioEngine?: any;
  waveformData?: Float32Array;
  isActive?: boolean;
  isSimulationMode?: boolean;
}

const EnhancedDJDeck: React.FC<EnhancedDJDeckProps> = ({ 
  deckId, 
  onTrackSelect, 
  crossfadeValue, 
  bpmSync,
  deckState,
  onStateChange,
  audioEngine,
  waveformData,
  isActive = false,
  isSimulationMode = false
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
    console.log(`🎵 Deck ${deckId} play/pause clicked`);
    if (audioEngine) {
      if (currentState.isPlaying) {
        audioEngine.pauseDeck(deckId);
      } else {
        await audioEngine.playDeck(deckId);
      }
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
    console.log(`🎵 Deck ${deckId} pitch: ${pitchValue}%`);
    
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
    console.log(`🔊 Deck ${deckId} volume: ${volumeValue}%`);
    
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
    console.log(`🔊 Deck ${deckId} echo toggled`);
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
    console.log(`🔇 Deck ${deckId} mute toggled`);
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
      className={`bg-bass-medium/90 backdrop-blur-md border-2 rounded-xl p-6 relative overflow-hidden ${
        isActive 
          ? 'border-neon-purple shadow-lg shadow-neon-purple/30' 
          : 'border-neon-purple/30'
      }`}
      animate={currentState.isPlaying && isActive ? {
        borderColor: ['#bf5af2', '#06ffa5', '#bf5af2'],
        boxShadow: [
          '0 0 20px rgba(191,90,242,0.3)',
          '0 0 30px rgba(6,255,165,0.3)',
          '0 0 20px rgba(191,90,242,0.3)'
        ]
      } : {}}
      transition={{ duration: 60/effectiveBpm/1000, repeat: Infinity }}
    >
      {/* Simulation Mode Badge */}
      {isSimulationMode && (
        <div className="absolute top-2 left-2 bg-yellow-400/20 border border-yellow-400 text-yellow-300 px-2 py-1 rounded text-xs z-10">
          SIMULATION MODE
        </div>
      )}

      {/* Deck Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <motion.div 
            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-lg ${
              isActive ? 'bg-neon-cyan' : 'bg-neon-purple'
            }`}
            animate={currentState.isPlaying ? { 
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            } : {}}
            transition={{ duration: 60/effectiveBpm/1000, repeat: Infinity }}
          >
            {deckId}
          </motion.div>
          <div>
            <span className="text-neon-cyan font-bold text-lg">DECK {deckId}</span>
            <div className="text-xs text-slate-400">
              {isActive ? 'ACTIVE' : 'STANDBY'}
            </div>
          </div>
        </div>
        
        {/* Status Indicators */}
        <div className="flex items-center gap-2">
          <div className="text-xs text-neon-cyan bg-bass-dark/80 px-2 py-1 rounded font-mono">
            {Math.round(effectiveBpm)} BPM
          </div>
          <div className={`text-xs px-2 py-1 rounded font-mono ${
            currentState.isMuted 
              ? 'bg-red-500/20 text-red-300 border border-red-500/50' 
              : 'bg-bass-dark/80 text-neon-cyan'
          }`}>
            {currentState.isMuted ? 'MUTED' : `${Math.round(deckVolume * 100)}%`}
          </div>
          {currentState.echoFX && (
            <motion.div 
              className="text-xs text-neon-purple bg-neon-purple/20 border border-neon-purple px-2 py-1 rounded font-mono"
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 0.5, repeat: Infinity }}
            >
              ECHO
            </motion.div>
          )}
          <motion.button
            onClick={onTrackSelect}
            className="text-slate-400 hover:text-neon-cyan p-1 rounded"
            whileHover={{ scale: 1.1, color: '#06ffa5' }}
            whileTap={{ scale: 0.9 }}
            title="Select Track"
          >
            <Settings className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      {/* Track Info */}
      <div className="mb-4 p-3 bg-bass-dark/50 rounded-lg">
        <h3 className="text-white font-bold text-lg truncate mb-1">{currentState.track.title}</h3>
        <div className="flex items-center gap-3 text-sm">
          <motion.span
            className="flex items-center gap-1"
            animate={bpmSync ? { color: ['#06ffa5', '#bf5af2', '#06ffa5'] } : {}}
            transition={{ duration: 2, repeat: Infinity }}
          >
            🎵 {Math.round(effectiveBpm)} BPM {bpmSync && '(SYNC)'}
          </motion.span>
          <span className="text-slate-400">•</span>
          <span className="text-neon-cyan">
            VOL {Math.round(deckVolume * 100)}%
          </span>
          {currentState.pitch !== 0 && (
            <>
              <span className="text-slate-400">•</span>
              <span className="text-yellow-400">
                PITCH {currentState.pitch > 0 ? '+' : ''}{currentState.pitch}%
              </span>
            </>
          )}
        </div>
      </div>

      {/* Enhanced Waveform Visualization */}
      <div className="mb-6">
        <EnhancedWaveformVisualizer
          waveformData={waveformData || new Float32Array(32).fill(0.3)}
          isPlaying={currentState.isPlaying && !currentState.isMuted}
          color={deckId === 'A' ? '#06ffa5' : '#bf5af2'}
          height={64}
          bars={32}
          deckId={deckId}
          isSimulationMode={isSimulationMode}
        />
      </div>

      {/* Controls */}
      <div className="space-y-4">
        {/* Play/Pause & Mute */}
        <div className="flex gap-3">
          <motion.button
            onClick={handlePlayPause}
            className={`flex-1 p-4 rounded-lg font-bold text-lg transition-all ${
              currentState.isPlaying
                ? 'bg-neon-cyan text-bass-dark shadow-lg shadow-neon-cyan/30'
                : 'bg-bass-dark border-2 border-neon-purple/50 text-neon-purple hover:bg-neon-purple/10'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            animate={currentState.isPlaying ? {
              boxShadow: [
                '0 0 20px rgba(6,255,165,0.3)',
                '0 0 30px rgba(6,255,165,0.5)',
                '0 0 20px rgba(6,255,165,0.3)'
              ]
            } : {}}
            transition={{ duration: 0.5, repeat: Infinity }}
          >
            <div className="flex items-center justify-center gap-2">
              {currentState.isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              <span>{currentState.isPlaying ? 'PAUSE' : 'PLAY'}</span>
            </div>
          </motion.button>
          
          <motion.button
            onClick={handleMuteToggle}
            className={`p-4 rounded-lg font-bold transition-all ${
              currentState.isMuted
                ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
                : 'bg-bass-dark border-2 border-slate-600 text-slate-400 hover:border-neon-purple/50'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            title={currentState.isMuted ? "Unmute" : "Mute"}
          >
            {currentState.isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </motion.button>
        </div>

        {/* Pitch Control */}
        <div className="p-3 bg-bass-dark/30 rounded-lg">
          <label className="flex items-center justify-between text-neon-cyan text-sm font-bold mb-3">
            <span className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              PITCH {currentState.pitch > 0 ? '+' : ''}{currentState.pitch}%
            </span>
            {isSimulationMode && <span className="text-yellow-400 text-xs">(SIM)</span>}
          </label>
          <Slider
            value={[currentState.pitch]}
            onValueChange={handlePitchChange}
            min={-50}
            max={50}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-slate-400 mt-1">
            <span>-50%</span>
            <span>0%</span>
            <span>+50%</span>
          </div>
        </div>

        {/* Volume Control */}
        <div className="p-3 bg-bass-dark/30 rounded-lg">
          <label className="flex items-center justify-between text-neon-cyan text-sm font-bold mb-3">
            <span className="flex items-center gap-2">
              <Volume2 className="w-4 h-4" />
              VOLUME {currentState.volume}%
            </span>
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

        {/* Echo FX */}
        <motion.button
          onClick={handleEchoToggle}
          className={`w-full p-3 rounded-lg text-sm font-bold transition-all ${
            currentState.echoFX
              ? 'bg-neon-purple/30 border-2 border-neon-purple text-neon-purple shadow-lg shadow-neon-purple/20'
              : 'bg-bass-dark border-2 border-slate-600 text-slate-400 hover:border-neon-purple/50'
          }`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          animate={currentState.echoFX ? {
            textShadow: [
              '0 0 5px rgba(191,90,242,0.5)',
              '0 0 15px rgba(191,90,242,0.8)',
              '0 0 5px rgba(191,90,242,0.5)'
            ]
          } : {}}
          transition={{ duration: 0.8, repeat: Infinity }}
        >
          🔊 ECHO FX {currentState.echoFX ? 'ON' : 'OFF'}
          {isSimulationMode && <span className="text-yellow-400 ml-2">(SIM)</span>}
        </motion.button>
      </div>

      {/* Volume Level Indicator */}
      <div className="absolute right-3 top-20">
        <div className="flex flex-col-reverse gap-1">
          {Array.from({ length: 8 }).map((_, i) => (
            <motion.div
              key={i}
              className={`w-2 h-2 rounded-sm ${
                currentState.isMuted 
                  ? 'bg-red-500' 
                  : deckVolume > i * 0.125 
                    ? isActive ? 'bg-neon-cyan' : 'bg-neon-purple'
                    : 'bg-slate-700'
              }`}
              animate={currentState.isPlaying && deckVolume > i * 0.125 && !currentState.isMuted ? {
                opacity: [0.5, 1, 0.5],
                scale: [1, 1.2, 1]
              } : {}}
              transition={{ 
                duration: 0.3 + (i * 0.05), 
                repeat: Infinity,
                delay: i * 0.1 
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default EnhancedDJDeck;
