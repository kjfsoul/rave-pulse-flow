
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
import { useToast } from '@/hooks/use-toast';

// demo data – replace with real track list
const mockTracks = [
  { id: '1', title: 'Festival Mix', bpm: 128, src: '/audio/festival_mix.mp3' },
  { id: '2', title: 'Deep House Vibes', bpm: 124, src: '/audio/deep_house.mp3' },
  { id: '3', title: 'Techno Storm', bpm: 132, src: '/audio/techno_storm.mp3' }
];

const DJMixStation = () => {
  const { bpm } = useAudioContext();
  const { toast } = useToast();
  const [crossfade, setCrossfade] = useState([50]);
  const [bpmSync, setBpmSync] = useState(true);
  const [selectedDeck, setSelectedDeck] = useState<'A' | 'B' | null>(null);
  const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [archetype] = useState<'Firestorm' | 'FrostPulse' | 'MoonWaver'>('Firestorm');
  const [lightBurst, setLightBurst] = useState(false);
  const [showSubscribeModal, setShowSubscribeModal] = useState(false);
  const [showFloatingEmojis, setShowFloatingEmojis] = useState(false);
  const [showDebugHUD, setShowDebugHUD] = useState(false);

  // Deck states
  const [deckAState, setDeckAState] = useState({
    track: mockTracks[0],
    isPlaying: false,
    volume: 75,
    pitch: 0,
    echoFX: false
  });

  const [deckBState, setDeckBState] = useState({
    track: mockTracks[1],
    isPlaying: false,
    volume: 75,
    pitch: 0,
    echoFX: false
  });

  const handleTrackSelect = (deck: 'A' | 'B') => {
    setSelectedDeck(deck);
    setIsTrackModalOpen(true);
  };

  const handleTrackSelectConfirm = (track: typeof mockTracks[0]) => {
    if (selectedDeck === 'A') {
      setDeckAState(prev => ({ ...prev, track }));
    } else if (selectedDeck === 'B') {
      setDeckBState(prev => ({ ...prev, track }));
    }
    setIsTrackModalOpen(false);
    setSelectedDeck(null);
  };

  const handleDropSet = () => {
    setShowConfetti(true);
    setLightBurst(true);
    setShowFloatingEmojis(true);
    
    // Toast notification
    toast({
      title: "🔥 EPIC DROP!",
      description: "Your set is absolutely fire! The crowd is going wild!",
      duration: 3000,
    });

    setTimeout(() => {
      setShowConfetti(false);
      setLightBurst(false);
      setShowFloatingEmojis(false);
    }, 3000);
  };

  const handleSubscribe = () => {
    setShowSubscribeModal(true);
    toast({
      title: "🌟 Submission Received!",
      description: "Thank you! Your mix has been submitted to headline the Virtual Festival.",
      duration: 4000,
    });
    setTimeout(() => setShowSubscribeModal(false), 2000);
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

      {/* Debug HUD (Development Only) */}
      {showDebugHUD && (
        <div className="fixed top-4 left-4 bg-black/80 text-white p-4 rounded-lg text-sm font-mono z-50">
          <h3 className="text-neon-cyan mb-2">DEBUG HUD</h3>
          <div>Deck A: {deckAState.track.title} | {deckAState.track.bpm} BPM | {deckAState.isPlaying ? 'PLAYING' : 'STOPPED'}</div>
          <div>Deck B: {deckBState.track.title} | {deckBState.track.bpm} BPM | {deckBState.isPlaying ? 'PLAYING' : 'STOPPED'}</div>
          <div>Echo A: {deckAState.echoFX ? 'ON' : 'OFF'} | Pitch A: {deckAState.pitch > 0 ? '+' : ''}{deckAState.pitch}%</div>
          <div>Echo B: {deckBState.echoFX ? 'ON' : 'OFF'} | Pitch B: {deckBState.pitch > 0 ? '+' : ''}{deckBState.pitch}%</div>
          <div>Volume A: {deckAState.volume}% | Volume B: {deckBState.volume}%</div>
          <div>Archetype: {archetype} | BPM Sync: {bpmSync ? 'ON' : 'OFF'}</div>
          <div>Crossfade: {crossfade[0]}% | Master BPM: {bpm}</div>
        </div>
      )}

      {/* Debug Toggle */}
      <button
        onClick={() => setShowDebugHUD(!showDebugHUD)}
        className="fixed top-4 right-20 bg-slate-700 text-white px-2 py-1 rounded text-xs z-50"
      >
        Debug
      </button>

      {/* Floating Emoji Reactions */}
      <AnimatePresence>
        {showFloatingEmojis && (
          <div className="fixed inset-0 pointer-events-none z-40">
            {['👏', '🔥', '❤️', '🙌', '💯'].map((emoji, i) => (
              <motion.div
                key={i}
                className="absolute text-4xl"
                style={{
                  left: `${20 + i * 15}%`,
                  top: '50%'
                }}
                initial={{ y: 0, opacity: 1, scale: 1 }}
                animate={{ 
                  y: [-100, -200], 
                  opacity: [1, 0], 
                  scale: [1, 1.5],
                  x: [0, Math.random() * 100 - 50]
                }}
                exit={{ opacity: 0 }}
                transition={{ 
                  duration: 2,
                  delay: i * 0.2,
                  ease: "easeOut"
                }}
              >
                {emoji}
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

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
            deckState={deckAState}
            onStateChange={setDeckAState}
          />

          {/* Deck B */}
          <DJDeck
            deckId="B"
            onTrackSelect={() => handleTrackSelect('B')}
            crossfadeValue={crossfade[0]}
            bpmSync={bpmSync}
            deckState={deckBState}
            onStateChange={setDeckBState}
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
            <motion.div 
              className="text-3xl font-bold text-white"
              animate={{ 
                scale: [1, 1.05, 1],
                color: ['#ffffff', '#06ffa5', '#ffffff']
              }}
              transition={{ 
                duration: 60/bpm/1000, 
                repeat: Infinity 
              }}
            >
              {bpm}
            </motion.div>
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
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Headphones className="w-5 h-5 text-neon-cyan" />
            <span className="text-white font-medium">
              🌟 Feeling your flow? Submit your mix & headline the Virtual Festival
            </span>
            <motion.button
              onClick={handleSubscribe}
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
        onTrackSelect={handleTrackSelectConfirm}
      />

      <AnimatePresence>
        {showConfetti && <ConfettiBurst />}
      </AnimatePresence>

      {/* Subscribe Success Modal */}
      <AnimatePresence>
        {showSubscribeModal && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-gradient-to-br from-neon-purple to-neon-cyan p-6 rounded-lg text-center text-white max-w-md mx-4"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <div className="text-4xl mb-4">🎉</div>
              <h2 className="text-xl font-bold mb-2">Submission Received!</h2>
              <p>Your mix is now in consideration for the Virtual Festival headline slot!</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNavigation />
    </div>
  );
};

export default DJMixStation;
