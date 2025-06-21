
import React from 'react';
import { motion } from 'framer-motion';
import { useAudioContext } from '@/contexts/AudioContext';
import EqualizerLive from './EqualizerLive';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';

const AudioEqualizerDemo = () => {
  const { 
    isPlaying, 
    isMuted, 
    bpm, 
    play, 
    pause, 
    toggleMute, 
    setBpm 
  } = useAudioContext();

  const handleTogglePlay = () => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  };

  const handleBpmChange = (newBpm: number) => {
    setBpm(newBpm);
  };

  return (
    <div className="bg-bass-medium/50 rounded-2xl p-6 text-center">
      <h3 className="text-xl font-bold text-neon-cyan mb-4">🎧 Audio Equalizer Demo</h3>
      
      {/* Audio Controls */}
      <div className="flex items-center justify-center gap-4 mb-6">
        <motion.button
          onClick={handleTogglePlay}
          className="bg-neon-purple hover:bg-neon-purple/80 text-white p-3 rounded-full transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
        </motion.button>
        
        <motion.button
          onClick={toggleMute}
          className="bg-bass-medium hover:bg-bass-light text-white p-3 rounded-full transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </motion.button>
        
        <div className="text-neon-cyan font-mono">
          {bpm} BPM
        </div>
      </div>

      {/* BPM Controls */}
      <div className="flex items-center justify-center gap-2 mb-6">
        <span className="text-sm text-slate-400">BPM:</span>
        {[96, 120, 128, 140, 160].map((testBpm) => (
          <button
            key={testBpm}
            onClick={() => handleBpmChange(testBpm)}
            className={`px-3 py-1 rounded text-sm transition-colors ${
              bpm === testBpm 
                ? 'bg-neon-purple text-white' 
                : 'bg-bass-medium text-slate-400 hover:text-white'
            }`}
          >
            {testBpm}
          </button>
        ))}
      </div>

      {/* Audio-Synced Equalizer */}
      <div className="mb-4">
        <div className="text-sm text-slate-400 mb-2">Audio-Synced Equalizer:</div>
        <EqualizerLive useAudioBpm={true} bars={20} height={80} className="h-20" />
      </div>

      {/* Static BPM Comparison */}
      <div className="grid grid-cols-3 gap-4 mt-6">
        <div>
          <div className="text-xs text-slate-400 mb-2">Static 90 BPM</div>
          <EqualizerLive bpm={90} bars={8} height={40} className="h-10" />
        </div>
        <div>
          <div className="text-xs text-slate-400 mb-2">Static 120 BPM</div>
          <EqualizerLive bpm={120} bars={8} height={40} className="h-10" />
        </div>
        <div>
          <div className="text-xs text-slate-400 mb-2">Static 150 BPM</div>
          <EqualizerLive bpm={150} bars={8} height={40} className="h-10" />
        </div>
      </div>

      <div className="text-xs text-slate-500 mt-4">
        * Audio file: /public/audio/festival_mix.mp3 (falls back to silent buffer if not found)
      </div>
    </div>
  );
};

export default AudioEqualizerDemo;
