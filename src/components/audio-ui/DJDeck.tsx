
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Settings, Volume2 } from 'lucide-react';
import { useAudioContext } from '@/contexts/AudioContext';
import EqualizerLive from '@/components/EqualizerLive';
import { Slider } from '@/components/ui/slider';

interface DJDeckProps {
  deckId: 'A' | 'B';
  onTrackSelect: () => void;
  crossfadeValue: number;
  bpmSync: boolean;
}

const DJDeck: React.FC<DJDeckProps> = ({ deckId, onTrackSelect, crossfadeValue, bpmSync }) => {
  const { isPlaying, play, pause, bpm } = useAudioContext();
  const [pitch, setPitch] = useState([0]);
  const [volume, setVolume] = useState([75]);
  const [echoFX, setEchoFX] = useState(false);

  const effectiveBpm = bpmSync ? bpm : bpm + (pitch[0] * 0.2);
  const deckVolume = (crossfadeValue / 100) * (volume[0] / 100);

  const handlePlayPause = () => {
    isPlaying ? pause() : play();
  };

  return (
    <motion.div
      className="bg-bass-medium/80 backdrop-blur-md border border-neon-purple/30 rounded-lg p-6 relative overflow-hidden"
      whileHover={{ borderColor: 'rgba(191,90,242,0.6)' }}
      animate={isPlaying ? {
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
          <div className="w-8 h-8 bg-neon-purple rounded-full flex items-center justify-center font-bold text-bass-dark">
            {deckId}
          </div>
          <span className="text-neon-cyan font-medium">DECK {deckId}</span>
        </div>
        <motion.button
          onClick={onTrackSelect}
          className="text-slate-400 hover:text-neon-cyan p-1"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Settings className="w-4 h-4" />
        </motion.button>
      </div>

      {/* Track Info */}
      <div className="mb-4">
        <h3 className="text-white font-medium truncate">Festival Mix</h3>
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <span>{Math.round(effectiveBpm)} BPM</span>
          <span>•</span>
          <span>{Math.round(deckVolume * 100)}% VOL</span>
        </div>
      </div>

      {/* Waveform Visualization */}
      <div className="mb-4 h-16 bg-bass-dark rounded-lg p-2 flex items-end">
        <EqualizerLive
          bpm={effectiveBpm}
          bars={20}
          height={48}
          className="w-full"
          useAudioBpm={false}
        />
      </div>

      {/* Controls */}
      <div className="space-y-4">
        {/* Play/Pause */}
        <motion.button
          onClick={handlePlayPause}
          className={`w-full p-3 rounded-lg font-medium transition-all ${
            isPlaying
              ? 'bg-neon-cyan text-bass-dark'
              : 'bg-bass-dark border border-neon-purple/50 text-neon-purple hover:bg-neon-purple/10'
          }`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center justify-center gap-2">
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isPlaying ? 'PAUSE' : 'PLAY'}</span>
          </div>
        </motion.button>

        {/* Pitch Control */}
        <div>
          <label className="block text-neon-cyan text-sm font-medium mb-2">
            PITCH {pitch[0] > 0 ? '+' : ''}{pitch[0]}%
          </label>
          <Slider
            value={pitch}
            onValueChange={setPitch}
            min={-20}
            max={20}
            step={1}
            className="w-full"
          />
        </div>

        {/* Volume Control */}
        <div>
          <label className="block text-neon-cyan text-sm font-medium mb-2 flex items-center gap-2">
            <Volume2 className="w-4 h-4" />
            VOLUME {volume[0]}%
          </label>
          <Slider
            value={volume}
            onValueChange={setVolume}
            max={100}
            step={1}
            className="w-full"
          />
        </div>

        {/* Echo FX */}
        <motion.button
          onClick={() => setEchoFX(!echoFX)}
          className={`w-full p-2 rounded-lg text-sm font-medium transition-all ${
            echoFX
              ? 'bg-neon-purple/30 border border-neon-purple text-neon-purple'
              : 'bg-bass-dark border border-slate-600 text-slate-400 hover:border-neon-purple/50'
          }`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          animate={echoFX ? {
            textShadow: [
              '0 0 5px rgba(191,90,242,0.5)',
              '0 0 10px rgba(191,90,242,0.8)',
              '0 0 5px rgba(191,90,242,0.5)'
            ]
          } : {}}
          transition={{ duration: 0.5, repeat: Infinity }}
        >
          ECHO FX {echoFX ? 'ON' : 'OFF'}
        </motion.button>
      </div>

      {/* Volume Indicator */}
      <div className="absolute right-2 top-2">
        <div className="flex flex-col-reverse gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <motion.div
              key={i}
              className={`w-2 h-3 rounded-sm ${
                deckVolume > i * 0.2 ? 'bg-neon-cyan' : 'bg-slate-700'
              }`}
              animate={isPlaying && deckVolume > i * 0.2 ? {
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
    </motion.div>
  );
};

export default DJDeck;
