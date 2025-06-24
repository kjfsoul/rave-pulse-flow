
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crosshair, Shuffle, Headphones, Volume2, VolumeX, Settings, Eye, EyeOff } from 'lucide-react';
import { useAudioContext } from '@/contexts/AudioContext';
import { useAudioEngine } from '@/hooks/useAudioEngine';
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
import { Button } from '@/components/ui/button';

// Mock track data
const mockTracks = [
  { id: '1', title: 'Festival Mix', bpm: 128, src: '/audio/festival_mix.mp3' },
  { id: '2', title: 'Deep House Vibes', bpm: 124, src: '/audio/deep_house.mp3' },
  { id: '3', title: 'Techno Storm', bpm: 132, src: '/audio/techno_storm.mp3' }
];

const DJMixStation = () => {
  const { bpm } = useAudioContext();
  const audioEngine = useAudioEngine();
  const { toast } = useToast();
  
  const [selectedDeck, setSelectedDeck] = useState<'A' | 'B' | null>(null);
  const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [archetype] = useState<'Firestorm' | 'FrostPulse' | 'MoonWaver'>('Firestorm');
  const [lightBurst, setLightBurst] = useState(false);
  const [showSubscribeModal, setShowSubscribeModal] = useState(false);
  const [showFloatingEmojis, setShowFloatingEmojis] = useState(false);
  const [showDebugHUD, setShowDebugHUD] = useState(true); // Make visible by default
  const [bpmSync, setBpmSync] = useState(true);
  const [isCrowdMuted, setIsCrowdMuted] = useState(false);
  const [showSubscribeBanner, setShowSubscribeBanner] = useState(true); // Make banner visible

  // Crossfade state synchronized with audio engine
  const [crossfade, setCrossfade] = useState([audioEngine.crossfadeValue]);

  // Update crossfade in audio engine when slider changes
  useEffect(() => {
    audioEngine.setCrossfade(crossfade[0]);
  }, [crossfade, audioEngine]);

  // Load default tracks on mount
  useEffect(() => {
    audioEngine.loadTrack('A', mockTracks[0]);
    audioEngine.loadTrack('B', mockTracks[1]);
  }, [audioEngine]);

  // Get waveform data for visualization
  const waveformDataA = audioEngine.getWaveformData('A');
  const waveformDataB = audioEngine.getWaveformData('B');

  const handleTrackSelect = (deck: 'A' | 'B') => {
    setSelectedDeck(deck);
    setIsTrackModalOpen(true);
  };

  const handleTrackSelectConfirm = async (track: typeof mockTracks[0]) => {
    if (selectedDeck) {
      await audioEngine.loadTrack(selectedDeck, track);
      toast({
        title: `Track loaded on Deck ${selectedDeck}`,
        description: `${track.title} (${track.bpm} BPM)`,
        duration: 2000,
      });
    }
    setIsTrackModalOpen(false);
    setSelectedDeck(null);
  };

  const handleDropSet = () => {
    console.log('Drop My Set clicked - triggering all effects');
    
    // Play crowd cheer if not muted
    if (!isCrowdMuted) {
      audioEngine.playDropEffect();
    }

    // Trigger all visual effects
    setShowConfetti(true);
    setLightBurst(true);
    setShowFloatingEmojis(true);
    
    // Toast notification
    toast({
      title: "🔥 EPIC DROP!",
      description: "Your set is absolutely fire! The crowd is going wild!",
      duration: 3000,
    });

    // Reset effects after animation
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
    setTimeout(() => setShowSubscribeModal(false), 3000);
  };

  // Determine active deck based on crossfade position
  const activeDeck = crossfade[0] < 40 ? 'A' : crossfade[0] > 60 ? 'B' : null;

  return (
    <div className="min-h-screen bg-bass-dark relative pb-20 overflow-hidden">
      {/* Visual FX Layers - Always visible */}
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
        dancerCount={6} 
        intensity="medium" 
      />
      <ArchetypeAuraSprite 
        archetype={archetype} 
        useAudioBpm={true} 
        intensity={85} 
        position="top-right" 
      />

      {/* Audio Context Status - Always visible */}
      <div className="fixed top-4 left-4 bg-slate-800 text-white p-2 rounded text-xs z-50">
        Audio Context: {audioEngine.isAudioContextReady ? '✅ READY' : '❌ SUSPENDED (Click to enable)'}
      </div>

      {/* Debug HUD - Toggleable */}
      <div className="fixed top-4 right-32 z-50">
        <Button
          onClick={() => setShowDebugHUD(!showDebugHUD)}
          size="sm"
          variant="outline"
          className="mb-2"
        >
          {showDebugHUD ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          Debug
        </Button>
      </div>

      {showDebugHUD && (
        <div className="fixed top-16 right-4 bg-black/90 text-white p-4 rounded-lg text-xs font-mono z-50 max-w-sm">
          <h3 className="text-neon-cyan mb-2 font-bold">🧪 DEBUG HUD</h3>
          <div className="space-y-1">
            <div className="text-yellow-400">Audio Engine Status:</div>
            <div>• Context: {audioEngine.isAudioContextReady ? 'READY' : 'SUSPENDED'}</div>
            
            <div className="text-yellow-400 mt-2">Deck A:</div>
            <div>• Track: {audioEngine.deckA.track?.title || 'None'}</div>
            <div>• BPM: {audioEngine.deckA.track?.bpm || 0}</div>
            <div>• Playing: {audioEngine.deckA.isPlaying ? '▶️' : '⏸️'}</div>
            <div>• Volume: {audioEngine.deckA.volume}% {audioEngine.deckA.isMuted ? '(MUTED)' : ''}</div>
            <div>• Pitch: {audioEngine.deckA.pitch > 0 ? '+' : ''}{audioEngine.deckA.pitch}%</div>
            <div>• Echo: {audioEngine.deckA.echoFX ? 'ON' : 'OFF'}</div>
            
            <div className="text-yellow-400 mt-2">Deck B:</div>
            <div>• Track: {audioEngine.deckB.track?.title || 'None'}</div>
            <div>• BPM: {audioEngine.deckB.track?.bpm || 0}</div>
            <div>• Playing: {audioEngine.deckB.isPlaying ? '▶️' : '⏸️'}</div>
            <div>• Volume: {audioEngine.deckB.volume}% {audioEngine.deckB.isMuted ? '(MUTED)' : ''}</div>
            <div>• Pitch: {audioEngine.deckB.pitch > 0 ? '+' : ''}{audioEngine.deckB.pitch}%</div>
            <div>• Echo: {audioEngine.deckB.echoFX ? 'ON' : 'OFF'}</div>
            
            <div className="text-yellow-400 mt-2">Master:</div>
            <div>• Crossfade: {crossfade[0]}%</div>
            <div>• Active Deck: {activeDeck || 'CENTER MIX'}</div>
            <div>• BPM Sync: {bpmSync ? 'ON' : 'OFF'}</div>
            <div>• Master BPM: {bpm}</div>
            <div>• Crowd Audio: {isCrowdMuted ? 'MUTED' : 'ENABLED'}</div>
          </div>
        </div>
      )}

      {/* Crowd Sound Toggle */}
      <button
        onClick={() => setIsCrowdMuted(!isCrowdMuted)}
        className="fixed top-4 right-4 bg-slate-700 text-white p-2 rounded-lg text-xs z-50 flex items-center gap-1"
        title={isCrowdMuted ? "Enable crowd effects" : "Mute crowd effects"}
      >
        {isCrowdMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        Crowd
      </button>

      {/* Floating Emoji Reactions - Always visible when triggered */}
      <AnimatePresence>
        {showFloatingEmojis && (
          <div className="fixed inset-0 pointer-events-none z-40">
            {['👏', '🔥', '❤️', '🙌', '💯', '🎉', '🚀', '⚡'].map((emoji, i) => (
              <motion.div
                key={i}
                className="absolute text-4xl"
                style={{
                  left: `${Math.random() * 80 + 10}%`,
                  top: `${Math.random() * 20 + 70}%` // Start from bottom
                }}
                initial={{ y: 0, opacity: 1, scale: 1 }}
                animate={{ 
                  y: [-100, -300], // Float upward
                  opacity: [1, 1, 0], 
                  scale: [1, 1.5, 0.5],
                  x: [0, (Math.random() - 0.5) * 400], // Random horizontal drift
                  rotate: [0, Math.random() * 720 - 360]
                }}
                exit={{ opacity: 0 }}
                transition={{ 
                  duration: 3,
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
      <div className="relative z-30 p-4 pt-20">
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
            deckState={{
              track: audioEngine.deckA.track || mockTracks[0],
              isPlaying: audioEngine.deckA.isPlaying,
              volume: audioEngine.deckA.volume,
              pitch: audioEngine.deckA.pitch,
              echoFX: audioEngine.deckA.echoFX,
              isMuted: audioEngine.deckA.isMuted
            }}
            audioEngine={audioEngine}
            waveformData={waveformDataA}
            isActive={activeDeck === 'A'}
          />

          {/* Deck B */}
          <DJDeck
            deckId="B"
            onTrackSelect={() => handleTrackSelect('B')}
            crossfadeValue={crossfade[0]}
            bpmSync={bpmSync}
            deckState={{
              track: audioEngine.deckB.track || mockTracks[1],
              isPlaying: audioEngine.deckB.isPlaying,
              volume: audioEngine.deckB.volume,
              pitch: audioEngine.deckB.pitch,
              echoFX: audioEngine.deckB.echoFX,
              isMuted: audioEngine.deckB.isMuted
            }}
            audioEngine={audioEngine}
            waveformData={waveformDataB}
            isActive={activeDeck === 'B'}
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
              CROSSFADER ({crossfade[0]}%)
            </label>
            <div className="flex items-center gap-4">
              <span className={`text-sm font-medium ${activeDeck === 'A' ? 'text-neon-cyan' : 'text-slate-400'}`}>A</span>
              <Slider
                value={crossfade}
                onValueChange={setCrossfade}
                max={100}
                step={1}
                className="flex-1"
              />
              <span className={`text-sm font-medium ${activeDeck === 'B' ? 'text-neon-cyan' : 'text-slate-400'}`}>B</span>
            </div>
            <div className="text-center text-xs text-slate-400 mt-1">
              {activeDeck ? `Deck ${activeDeck} Active (${activeDeck === 'A' ? 100 - crossfade[0] : crossfade[0]}%)` : 'Center Mix (50/50)'}
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

          {/* Drop Set Button - Always visible and functional */}
          <motion.button
            onClick={handleDropSet}
            className="w-full p-4 rounded-lg font-bold text-lg bg-gradient-to-r from-neon-purple to-neon-cyan text-white hover:from-neon-purple/80 hover:to-neon-cyan/80 transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            🔥 DROP MY SET 🔥
          </motion.button>
        </motion.div>
      </div>

      {/* Subscribe Banner - Always visible */}
      {showSubscribeBanner && (
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
              Subscribe Now
            </motion.button>
          </div>
        </motion.div>
      )}

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

      {/* Confetti Effect */}
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
              className="bg-gradient-to-br from-neon-purple to-neon-cyan p-8 rounded-lg text-center text-white max-w-md mx-4"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <motion.div 
                className="text-6xl mb-4"
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                🎉
              </motion.div>
              <h2 className="text-2xl font-bold mb-4">Submission Received!</h2>
              <p className="text-lg mb-4">Your mix is now in consideration for the Virtual Festival headline slot!</p>
              <motion.div
                className="flex justify-center gap-2"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <span className="text-2xl">🌟</span>
                <span className="text-2xl">🎛️</span>
                <span className="text-2xl">🔥</span>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNavigation />
    </div>
  );
};

export default DJMixStation;
