import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { useAudioContext } from '@/contexts/AudioContext';
import BpmAura from './BpmAura';
import TrackSelectModal from './TrackSelectModal';

// demo data – replace with real track list
after build
const mockTracks = [
  { id: '1', title: 'Festival Mix', bpm: 128, src: '/audio/festival_mix.mp3' },
  { id: '2', title: 'Deep House Vibes', bpm: 124, src: '/audio/deep_house.mp3' },
  { id: '3', title: 'Techno Storm', bpm: 132, src: '/audio/techno_storm.mp3' }
];

/**
 * Docked mini‑player with BPM badge, progress bar and an aura backdrop.
 */
const MiniPlayer: React.FC = () => {
  const {
    isPlaying,
    currentTime,
    duration,
    bpm,
    isMuted,
    play,
    pause,
    seek,
    toggleMute
  } = useAudioContext();

  const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);

  const handlePlayPause = () => {
    isPlaying ? pause() : play();
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    seek(pct * duration);
  };

  const format = (t: number) => `${Math.floor(t / 60)}:${Math.floor(t % 60).toString().padStart(2, '0')}`;
  const progress = duration ? (currentTime / duration) * 100 : 0;

  return (
    <>
      {/* docked bar */}
      <motion.div
        className="fixed bottom-0 inset-x-0 md:bottom-4 md:left-4 md:w-[320px] md:inset-x-auto z-40"
        initial={{ y: 80 }}
        animate={{ y: 0 }}
        exit={{ y: 80 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      >
        <div className="bg-bass-medium/70 backdrop-blur-md border-t border-neon-purple/30 md:border md:border-neon-purple/30 rounded-t-lg md:rounded-lg p-4 relative overflow-hidden">
          {/* animated aura behind everything */}
          <BpmAura className="absolute inset-0 -z-10" />

          {/* controls */}
          <div className="flex items-center gap-3 mb-3">
            <motion.button
              onClick={handlePlayPause}
              className="bg-neon-purple hover:bg-neon-purple/80 p-2 rounded-full"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </motion.button>

            {/* track meta */}
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-white truncate">Festival Mix</div>
              <div className="text-xs text-slate-400">{format(currentTime)} / {format(duration)}</div>
            </div>

            {/* bpm badge */}
            <div className="bg-neon-cyan/20 text-neon-cyan px-2 py-1 rounded text-xs font-mono">{bpm} BPM</div>

            {/* mute */}
            <motion.button
              onClick={toggleMute}
              className="text-slate-400 hover:text-white p-1"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </motion.button>

            {/* track list */}
            <motion.button
              onClick={() => setIsTrackModalOpen(true)}
              className="text-slate-400 hover:text-white p-1"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </motion.button>
          </div>

          {/* progress */}
          <div className="w-full h-1 bg-slate-600 rounded-full cursor-pointer" onClick={handleSeek}>
            <motion.div
              className="h-full bg-gradient-to-r from-neon-purple to-neon-cyan rounded-full"
              style={{ width: `${progress}%` }}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>
        </div>
      </motion.div>

      {/* modal */}
      <TrackSelectModal tracks={mockTracks} isOpen={isTrackModalOpen} onClose={() => setIsTrackModalOpen(false)} />
    </>
  );
};

export default MiniPlayer;
