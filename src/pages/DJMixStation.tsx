import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crosshair, Shuffle, Headphones, Volume2, VolumeX, Settings, Eye, EyeOff } from 'lucide-react';
import { useAudioContext } from '@/contexts/AudioContext';
import { useRealAudioEngine } from '@/hooks/useRealAudioEngine';
import BottomNavigation from '@/components/BottomNavigation';
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
import EnhancedDJDeck from '@/components/audio-ui/EnhancedDJDeck';
import DebugHUD from '@/components/audio-ui/DebugHUD';
import SubscribeModal from '@/components/audio-ui/SubscribeModal';

// Mock track data
const mockTracks = [
  { id: '1', title: 'Festival Mix', bpm: 128, src: '/audio/festival_mix.mp3' },
  { id: '2', title: 'Deep House Vibes', bpm: 124, src: '/audio/deep_house.mp3' },
  { id: '3', title: 'Techno Storm', bpm: 132, src: '/audio/techno_storm.mp3' }
];

const DJMixStation = () => {
  const { bpm } = useAudioContext();
  const audioEngine = useRealAudioEngine();
  const { toast } = useToast();
  
  const [selectedDeck, setSelectedDeck] = useState<'A' | 'B' | null>(null);
  const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [archetype] = useState<'Firestorm' | 'FrostPulse' | 'MoonWaver'>('Firestorm');
  const [lightBurst, setLightBurst] = useState(false);
  const [showSubscribeModal, setShowSubscribeModal] = useState(false);
  const [showFloatingEmojis, setShowFloatingEmojis] = useState(false);
  const [showDebugHUD, setShowDebugHUD] = useState(true);
  const [bpmSync, setBpmSync] = useState(true);
  const [isCrowdMuted, setIsCrowdMuted] = useState(false);
  const [showSubscribeBanner, setShowSubscribeBanner] = useState(true);

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

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'h' || e.key === 'H') {
        setShowDebugHUD(!showDebugHUD);
      }
      if (e.key === ' ') {
        e.preventDefault();
        // Toggle active deck
        const activeDeck = crossfade[0] < 50 ? 'A' : 'B';
        if (audioEngine[`deck${activeDeck}`].isPlaying) {
          audioEngine.pauseDeck(activeDeck);
        } else {
          audioEngine.playDeck(activeDeck);
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [showDebugHUD, crossfade, audioEngine]);

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
  };

  const handleSubscribeConfirm = () => {
    setShowSubscribeModal(false);
    toast({
      title: "🌟 Submission Received!",
      description: "Your mix has been submitted to headline the Virtual Festival!",
      duration: 4000,
    });
    setShowSubscribeBanner(false);
  };

  // Determine active deck based on crossfade position
  const activeDeck = crossfade[0] < 40 ? 'A' : crossfade[0] > 60 ? 'B' : null;

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
        dancerCount={6} 
        intensity="medium" 
      />
      <ArchetypeAuraSprite 
        archetype={archetype} 
        useAudioBpm={true} 
        intensity={85} 
        position="top-right" 
      />

      {/* Audio Context Status */}
      <motion.div
        className={`fixed top-4 left-4 px-3 py-2 rounded-lg text-sm font-mono z-50 cursor-pointer ${
          audioEngine.audioContextState === 'running' 
            ? 'bg-green-500/20 border border-green-500 text-green-300' 
            : 'bg-yellow-500/20 border border-yellow-500 text-yellow-300'
        }`}
        onClick={audioEngine.resumeAudioContext}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Audio: {audioEngine.audioContextState === 'running' ? '✅ READY' : '⚠️ CLICK TO ENABLE'}
        {audioEngine.isSimulationMode && <span className="ml-2 text-orange-300">(SIM)</span>}
      </motion.div>

      {/* Debug HUD */}
      <DebugHUD
        isVisible={showDebugHUD}
        onToggle={() => setShowDebugHUD(!showDebugHUD)}
        audioEngine={audioEngine}
        crossfadeValue={crossfade[0]}
        bpmSync={bpmSync}
        masterBpm={bpm}
        activeDeck={activeDeck}
        isSimulationMode={audioEngine.isSimulationMode}
      />

      {/* Crowd Sound Toggle */}
      <button
        onClick={() => setIsCrowdMuted(!isCrowdMuted)}
        className="fixed top-4 right-20 bg-slate-700 text-white p-2 rounded-lg text-xs z-50 flex items-center gap-1"
        title={isCrowdMuted ? "Enable crowd effects" : "Mute crowd effects"}
      >
        {isCrowdMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        Crowd
      </button>

      {/* Floating Emoji Reactions */}
      <AnimatePresence>
        {showFloatingEmojis && (
          <div className="fixed inset-0 pointer-events-none z-40">
            {['👏', '🔥', '❤️', '🙌', '💯', '🎉', '🚀', '⚡', '🎵', '🌟'].map((emoji, i) => (
              <motion.div
                key={i}
                className="absolute text-4xl"
                style={{
                  left: `${Math.random() * 80 + 10}%`,
                  top: `${Math.random() * 20 + 70}%`
                }}
                initial={{ y: 0, opacity: 1, scale: 1 }}
                animate={{ 
                  y: [-100, -400],
                  opacity: [1, 1, 0], 
                  scale: [1, 1.5, 0.5],
                  x: [0, (Math.random() - 0.5) * 600],
                  rotate: [0, Math.random() * 720 - 360]
                }}
                exit={{ opacity: 0 }}
                transition={{ 
                  duration: 4,
                  delay: i * 0.15,
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
          <p className="text-neon-cyan text-lg">Real Audio • Live Control • Epic Drops</p>
          {audioEngine.isSimulationMode && (
            <p className="text-yellow-400 text-sm mt-2">
              ⚠️ Running in Simulation Mode - Enable audio for full experience
            </p>
          )}
        </motion.div>

        {/* Enhanced Deck Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto mb-8">
          {/* Enhanced Deck A */}
          <EnhancedDJDeck
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
            isSimulationMode={audioEngine.isSimulationMode}
          />

          {/* Enhanced Deck B */}
          <EnhancedDJDeck
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
            isSimulationMode={audioEngine.isSimulationMode}
          />
        </div>

        {/* Center Controls - Enhanced */}
        <motion.div
          className="max-w-md mx-auto bg-bass-medium/90 backdrop-blur-md border-2 border-neon-purple/50 rounded-xl p-6 mb-8"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {/* BPM Display */}
          <div className="text-center mb-6">
            <div className="text-neon-cyan text-sm font-medium mb-2">MASTER BPM</div>
            <motion.div 
              className="text-4xl font-bold text-white"
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

          {/* Enhanced Crossfader */}
          <div className="mb-6">
            <label className="block text-neon-cyan text-sm font-medium mb-3 text-center">
              <Crosshair className="w-4 h-4 inline mr-2" />
              CROSSFADER ({crossfade[0]}%)
            </label>
            <div className="flex items-center gap-4">
              <span className={`text-sm font-bold ${activeDeck === 'A' ? 'text-neon-cyan' : 'text-slate-400'}`}>A</span>
              <Slider
                value={crossfade}
                onValueChange={setCrossfade}
                max={100}
                step={1}
                className="flex-1"
              />
              <span className={`text-sm font-bold ${activeDeck === 'B' ? 'text-neon-cyan' : 'text-slate-400'}`}>B</span>
            </div>
            <div className="text-center text-xs text-slate-400 mt-2">
              {activeDeck ? (
                <span className="text-neon-cyan">
                  DECK {activeDeck} ACTIVE ({activeDeck === 'A' ? 100 - crossfade[0] : crossfade[0]}%)
                </span>
              ) : (
                'CENTER MIX (50/50)'
              )}
            </div>
          </div>

          {/* BPM Sync Toggle */}
          <motion.button
            onClick={() => setBpmSync(!bpmSync)}
            className={`w-full p-3 rounded-lg font-bold transition-all mb-4 ${
              bpmSync
                ? 'bg-neon-cyan text-bass-dark shadow-lg shadow-neon-cyan/30'
                : 'bg-bass-dark border-2 border-neon-purple/50 text-neon-purple hover:bg-neon-purple/10'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Shuffle className="w-4 h-4 mr-2 inline" />
            BPM SYNC {bpmSync ? 'ON' : 'OFF'}
          </motion.button>

          {/* Enhanced Drop Set Button */}
          <motion.button
            onClick={handleDropSet}
            className="w-full p-4 rounded-lg font-bold text-lg bg-gradient-to-r from-neon-purple to-neon-cyan text-white hover:from-neon-purple/80 hover:to-neon-cyan/80 transition-all relative overflow-hidden"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            animate={{
              boxShadow: [
                '0 0 20px rgba(191,90,242,0.3)',
                '0 0 30px rgba(6,255,165,0.3)',
                '0 0 20px rgba(191,90,242,0.3)'
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
            <span className="relative z-10">🔥 DROP MY SET 🔥</span>
          </motion.button>
        </motion.div>
      </div>

      {/* Enhanced Subscribe Banner */}
      {showSubscribeBanner && (
        <motion.div
          className="fixed bottom-24 left-4 right-4 bg-gradient-to-r from-neon-purple/20 via-neon-cyan/20 to-neon-purple/20 backdrop-blur-md border-2 border-neon-purple/30 rounded-xl p-4 text-center z-20"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          whileHover={{ y: -5 }}
        >
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Headphones className="w-5 h-5 text-neon-cyan" />
            <span className="text-white font-bold">
              🌟 Ready to headline the Virtual Festival?
            </span>
            <motion.button
              onClick={handleSubscribe}
              className="bg-gradient-to-r from-neon-purple to-neon-cyan text-white px-6 py-2 rounded-full font-bold transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              animate={{
                boxShadow: [
                  '0 0 15px rgba(191,90,242,0.3)',
                  '0 0 25px rgba(6,255,165,0.3)',
                  '0 0 15px rgba(191,90,242,0.3)'
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Submit My Mix!
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

      <SubscribeModal
        isOpen={showSubscribeModal}
        onClose={() => setShowSubscribeModal(false)}
        onConfirm={handleSubscribeConfirm}
      />

      {/* Confetti Effect */}
      <AnimatePresence>
        {showConfetti && <ConfettiBurst />}
      </AnimatePresence>

      <BottomNavigation />
    </div>
  );
};

export default DJMixStation;
