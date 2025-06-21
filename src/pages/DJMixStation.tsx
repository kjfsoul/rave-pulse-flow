
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Settings, Headphones, Zap, Volume2 } from 'lucide-react';
import { useAudioContext } from '@/contexts/AudioContext';
import BpmAura from '@/components/audio-ui/BpmAura';
import TrackSelectModal from '@/components/audio-ui/TrackSelectModal';
import DJDeck from '@/components/audio-ui/DJDeck';
import ConfettiBurst from '@/components/audio-ui/ConfettiBurst';
import { Slider } from '@/components/ui/slider';

const mockTracks = [
  { id: '1', title: 'Festival Mix', bpm: 128, src: '/audio/festival_mix.mp3' },
  { id: '2', title: 'Deep House Vibes', bpm: 124, src: '/audio/deep_house.mp3' },
  { id: '3', title: 'Techno Storm', bpm: 132, src: '/audio/techno_storm.mp3' },
  { id: '4', title: 'Trance Odyssey', bpm: 136, src: '/audio/trance_odyssey.mp3' },
];

const DJMixStation: React.FC = () => {
  const { isPlaying, bpm } = useAudioContext();
  const [crossfade, setCrossfade] = useState([50]);
  const [bpmSync, setBpmSync] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);
  const [activeDeck, setActiveDeck] = useState<'A' | 'B'>('A');

  const handleDropSet = () => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  };

  const openTrackModal = (deck: 'A' | 'B') => {
    setActiveDeck(deck);
    setIsTrackModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-bass-dark relative overflow-hidden">
      {/* Background Aura */}
      <BpmAura className="fixed inset-0 -z-10" />
      
      {/* Animated Background */}
      <div className="fixed inset-0 -z-20">
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-neon-purple/10 via-transparent to-neon-cyan/10"
          animate={{ 
            background: isPlaying 
              ? ['radial-gradient(circle at 20% 80%, rgba(191,90,242,0.1) 0%, transparent 50%)', 
                 'radial-gradient(circle at 80% 20%, rgba(6,255,165,0.1) 0%, transparent 50%)',
                 'radial-gradient(circle at 20% 80%, rgba(191,90,242,0.1) 0%, transparent 50%)']
              : 'radial-gradient(circle at 50% 50%, transparent 0%, transparent 100%)'
          }}
          transition={{ duration: 60/bpm, repeat: Infinity }}
        />
      </div>

      {/* Archetype Badge */}
      <motion.div
        className="fixed top-4 right-4 z-30 bg-bass-medium/80 backdrop-blur-md border border-neon-purple/30 rounded-lg p-3"
        whileHover={{ scale: 1.05 }}
        title="🔥 Firestorm gives you more reverb punch. PLUR level: 92%"
      >
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-neon-purple" />
          <span className="text-neon-cyan font-bold text-sm">Firestorm</span>
        </div>
      </motion.div>

      {/* Main DJ Interface */}
      <div className="container mx-auto px-4 py-8">
        <motion.h1
          className="text-4xl md:text-6xl font-bold text-center mb-8 bg-gradient-to-r from-neon-purple to-neon-cyan bg-clip-text text-transparent"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          🎧 DJ MIX STATION
        </motion.h1>

        {/* Deck Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Deck A */}
          <DJDeck
            deckId="A"
            onTrackSelect={() => openTrackModal('A')}
            crossfadeValue={crossfade[0]}
            bpmSync={bpmSync}
          />

          {/* Center Mixer */}
          <div className="bg-bass-medium/80 backdrop-blur-md border border-neon-purple/30 rounded-lg p-6">
            <div className="space-y-6">
              {/* Crossfade */}
              <div className="text-center">
                <label className="block text-neon-cyan text-sm font-medium mb-2">CROSSFADE</label>
                <div className="relative">
                  <Slider
                    value={crossfade}
                    onValueChange={setCrossfade}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-slate-400 mt-1">
                    <span>A</span>
                    <span>B</span>
                  </div>
                </div>
              </div>

              {/* BPM Sync */}
              <motion.button
                onClick={() => setBpmSync(!bpmSync)}
                className={`w-full p-3 rounded-lg border transition-all ${
                  bpmSync
                    ? 'bg-neon-purple/30 border-neon-purple text-neon-purple'
                    : 'bg-bass-dark border-slate-600 text-slate-400 hover:border-neon-purple/50'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center justify-center gap-2">
                  <Headphones className="w-4 h-4" />
                  <span className="font-medium">BPM SYNC</span>
                </div>
                {bpmSync && (
                  <motion.div
                    className="text-xs mt-1"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    LOCKED
                  </motion.div>
                )}
              </motion.button>

              {/* Drop Set Button */}
              <motion.button
                onClick={handleDropSet}
                className="w-full bg-gradient-to-r from-neon-purple to-neon-cyan p-4 rounded-lg font-bold text-bass-dark text-lg relative overflow-hidden"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                animate={isPlaying ? { 
                  boxShadow: [
                    '0 0 20px rgba(191,90,242,0.5)',
                    '0 0 40px rgba(191,90,242,0.8)',
                    '0 0 20px rgba(191,90,242,0.5)'
                  ]
                } : {}}
                transition={{ duration: 60/bpm/1000, repeat: Infinity }}
              >
                🔥 DROP MY SET
                <motion.div
                  className="absolute inset-0 bg-white/20"
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                />
              </motion.button>
            </div>
          </div>

          {/* Deck B */}
          <DJDeck
            deckId="B"
            onTrackSelect={() => openTrackModal('B')}
            crossfadeValue={100 - crossfade[0]}
            bpmSync={bpmSync}
          />
        </div>
      </div>

      {/* Bottom CTA Banner */}
      <motion.div
        className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-neon-purple/20 to-neon-cyan/20 backdrop-blur-md border-t border-neon-purple/30 p-4 z-20"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ delay: 1, type: 'spring', damping: 25 }}
      >
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <motion.div
            className="text-center md:text-left"
            animate={{ y: [0, -2, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <p className="text-white font-medium">
              🌟 Feeling your flow? Submit your mix & headline the Virtual Festival
            </p>
          </motion.div>
          <motion.button
            className="bg-neon-cyan text-bass-dark px-6 py-2 rounded-lg font-bold hover:bg-neon-cyan/90 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Subscribe
          </motion.button>
        </div>
      </motion.div>

      {/* Modals */}
      <TrackSelectModal
        tracks={mockTracks}
        isOpen={isTrackModalOpen}
        onClose={() => setIsTrackModalOpen(false)}
      />

      {/* Confetti */}
      {showConfetti && <ConfettiBurst />}
    </div>
  );
};

export default DJMixStation;
