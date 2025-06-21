import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crosshair, Shuffle, Headphones } from 'lucide-react';
import { useAudioContext } from '@/contexts/AudioContext';
import BottomNavigation from '@/components/BottomNavigation';
import DJDeck from '@/components/audio-ui/DJDeck';
import TrackSelectModal from '@/components/audio-ui/TrackSelectModal';
import BpmAura from '@/components/audio-ui/BpmAura';
import ConfettiBurst from '@/components/audio-ui/ConfettiBurst';
import FestivalStageBackground from '@/components/VisualFX/FestivalStageBackground';
import ArchetypeAuraSprite from '@/components/VisualFX/ArchetypeAuraSprite';
import ShuffleDancers from '@/components/VisualFX/ShuffleDancers';
import LightSyncPulse from '@/components/VisualFX/LightSyncPulse';
import { Slider } from '@/components/ui/slider';

// demo data – replace with real track list
const mockTracks = [
  { id: '1', title: 'Festival Mix', bpm: 128, src: '/audio/festival_mix.mp3' },
  { id: '2', title: 'Deep House Vibes', bpm: 124, src: '/audio/deep_house.mp3' },
  { id: '3', title: 'Techno Storm', bpm: 132, src: '/audio/techno_storm.mp3' }
];

const DJMixStation = () => {
  const { bpm } = useAudioContext();
  const [crossfade, setCrossfade] = useState([50]);
  const [bpmSync, setBpmSync] = useState(true);
  const [selectedDeck, setSelectedDeck] = useState<'A' | 'B' | null>(null);
  const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [archetype] = useState<'Firestorm' | 'FrostPulse' | 'MoonWaver'>('Firestorm');
  const [lightBurst, setLightBurst] = useState(false);

  const handleTrackSelect = (deck: 'A' | 'B') => {
    setSelectedDeck(deck);
    setIsTrackModalOpen(true);
  };

  const handleDropSet = () => {
    setShowConfetti(true);
    setLightBurst(true);
    setTimeout(() => {
      setShowConfetti(false);
      setLightBurst(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-bass-dark relative pb-20 overflow-hidden">
      {/* Visual FX Layers */}
      <FestivalStageBackground 
        archetype={archetype} 
        useAudioBpm={true} 
        intensity="high" 
      />
      <LightSyncPulse 
        useAudioBpm={true} 
        intensity="medium" 
        triggerBurst={lightBurst} 
      />
      <ShuffleDancers 
        useAudioBpm={true} 
        dancerCount={4} 
        intensity="medium" 
      />
      <ArchetypeAuraSprite 
        archetype={archetype} 
        useAudioBpm={true} 
        intensity={85} 
        position="top-right" 
      />

      {/* Main DJ Interface */}
      <div className="relative z-30 p-4 pt-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-2">
            <span className="text-transparent bg-gradient-to-r from-neon-purple via-neon-cyan to-neon-purple bg-clip-text">
              🎛️ DJ MIX STATION
            </span>
          </h1>
          <p className="text-neon-cyan text-lg">Master the Decks • Create Your Flow</p>
        </motion.div>

        {/* Deck Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto mb-8">
          {/* Deck A */}
          <DJDeck
            deckId="A"
            onTrackSelect={() => handleTrackSelect('A')}
            crossfadeValue={100 - crossfade[0]}
            bpmSync={bpmSync}
          />

          {/* Deck B */}
          <DJDeck
            deckId="B"
            onTrackSelect={() => handleTrackSelect('B')}
            crossfadeValue={crossfade[0]}
            bpmSync={bpmSync}
          />
        </div>

        {/* Center Controls */}
        <motion.div
          className="max-w-md mx-auto bg-bass-medium/80 backdrop-blur-md border border-neon-purple/30 rounded-lg p-6 mb-8"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {/* BPM Display */}
          <div className="text-center mb-6">
            <div className="text-neon-cyan text-sm font-medium mb-2">MASTER BPM</div>
            <div className="text-3xl font-bold text-white">{bpm}</div>
          </div>

          {/* Crossfader */}
          <div className="mb-6">
            <label className="block text-neon-cyan text-sm font-medium mb-3 text-center">
              <Crosshair className="w-4 h-4 inline mr-2" />
              CROSSFADER
            </label>
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-400">A</span>
              <Slider
                value={crossfade}
                onValueChange={setCrossfade}
                max={100}
                step={1}
                className="flex-1"
              />
              <span className="text-sm text-slate-400">B</span>
            </div>
          </div>

          {/* BPM Sync Toggle */}
          <motion.button
            onClick={() => setBpmSync(!bpmSync)}
            className={`w-full p-3 rounded-lg font-medium transition-all mb-4 ${
              bpmSync
                ? 'bg-neon-cyan text-bass-dark'
                : 'bg-bass-dark border border-neon-purple/50 text-neon-purple hover:bg-neon-purple/10'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Shuffle className="w-4 h-4 mr-2 inline" />
            BPM SYNC {bpmSync ? 'ON' : 'OFF'}
          </motion.button>

          {/* Drop Set Button */}
          <motion.button
            onClick={handleDropSet}
            className="w-full p-4 rounded-lg font-bold text-lg bg-gradient-to-r from-neon-purple to-neon-cyan text-white hover:from-neon-purple/80 hover:to-neon-cyan/80 transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            🔥 DROP MY SET 🔥
          </motion.button>
        </motion.div>

        {/* Subscribe Banner */}
        <motion.div
          className="fixed bottom-24 left-4 right-4 bg-gradient-to-r from-neon-purple/20 via-neon-cyan/20 to-neon-purple/20 backdrop-blur-md border border-neon-purple/30 rounded-lg p-4 text-center z-20"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          whileHover={{ y: -5 }}
        >
          <div className="flex items-center justify-center gap-3">
            <Headphones className="w-5 h-5 text-neon-cyan" />
            <span className="text-white font-medium">
              🌟 Feeling your flow? Submit your mix & headline the Virtual Festival
            </span>
            <motion.button
              className="bg-neon-purple hover:bg-neon-purple/80 text-white px-4 py-2 rounded-full font-medium transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Subscribe
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* Background Aura */}
      <BpmAura className="fixed inset-0 -z-10" />

      {/* Modals and Effects */}
      <TrackSelectModal
        tracks={mockTracks}
        isOpen={isTrackModalOpen}
        onClose={() => {
          setIsTrackModalOpen(false);
          setSelectedDeck(null);
        }}
      />

      <AnimatePresence>
        {showConfetti && <ConfettiBurst />}
      </AnimatePresence>

      <BottomNavigation />
    </div>
  );
};

export default DJMixStation;
