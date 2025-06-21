import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAudioContext } from '@/contexts/AudioContext';

interface Track {
  id: string;
  title: string;
  bpm: number;
  src: string;
}

interface TrackSelectModalProps {
  tracks: Track[];
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Keyboard‑navigable modal for choosing a track.
 * ↑ / ↓ to move, Enter to select, Esc to dismiss.
 */
const TrackSelectModal: React.FC<TrackSelectModalProps> = ({ tracks, isOpen, onClose }) => {
  const { play, setBpm } = useAudioContext();
  const [focusedIndex, setFocusedIndex] = useState(0);

  const handleTrackSelect = async (track: Track) => {
    await play();
    setBpm(track.bpm);
    onClose();
  };

  // keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowUp':
          e.preventDefault();
          setFocusedIndex(prev => (prev > 0 ? prev - 1 : tracks.length - 1));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setFocusedIndex(prev => (prev < tracks.length - 1 ? prev + 1 : 0));
          break;
        case 'Enter':
          e.preventDefault();
          handleTrackSelect(tracks[focusedIndex]);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, focusedIndex, tracks, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-bass-medium border border-neon-purple/30 rounded-lg p-6 w-full max-w-md max-h-[70vh] overflow-y-auto"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-neon-cyan mb-4">Select Track</h2>

            <div className="space-y-2">
              {tracks.map((track, index) => {
                const isFocused = index === focusedIndex;
                return (
                  <motion.button
                    key={track.id}
                    className={`w-full p-3 rounded-lg text-left transition-colors ${
                      isFocused
                        ? 'bg-bass-light border border-neon-cyan/50'
                        : 'bg-bass-light hover:bg-bass-light/80'
                    }`}
                    onClick={() => handleTrackSelect(track)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-white truncate max-w-[60%]">{track.title}</span>
                      <span className="bg-neon-cyan/20 text-neon-cyan px-2 py-1 rounded text-sm shrink-0">
                        {track.bpm} BPM
                      </span>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TrackSelectModal;
