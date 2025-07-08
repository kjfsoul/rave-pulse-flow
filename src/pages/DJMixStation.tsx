import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shuffle } from 'lucide-react';
import { useAudioContext } from '@/contexts/AudioContext';
import { useRealAudioEngine } from '@/hooks/useRealAudioEngine';
import BottomNavigation from '@/components/BottomNavigation';
import TrackSelectModal from '@/components/audio-ui/TrackSelectModal';
import BpmAura from '@/components/audio-ui/BpmAura';
import FestivalStageBackground from '@/components/VisualFX/FestivalStageBackground';
import ArchetypeAuraSprite from '@/components/VisualFX/ArchetypeAuraSprite';
import ShuffleDancers from '@/components/VisualFX/ShuffleDancers';
import LightSyncPulse from '@/components/VisualFX/LightSyncPulse';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import EnhancedDJDeck from '@/components/audio-ui/EnhancedDJDeck';
import DebugHUD from '@/components/audio-ui/DebugHUD';
import EnhancedDebugHUD from '@/components/audio-ui/EnhancedDebugHUD';
import VoiceControlPanel from '@/components/audio-ui/VoiceControlPanel';
import SubscribeModal from '@/components/audio-ui/SubscribeModal';
import Crossfader from '@/components/audio-ui/Crossfader';
import CrowdFXLayer, { CrowdFXLayerRef } from '@/components/audio-ui/CrowdFXLayer';
import SubscribeBanner from '@/components/audio-ui/SubscribeBanner';
import { useFestivalAnnouncer } from '@/hooks/useTTS';
import { useVoiceCommands } from '@/hooks/useVoiceCommands';

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
  const crowdFXRef = useRef<CrowdFXLayerRef>(null);
  
  const [selectedDeck, setSelectedDeck] = useState<'A' | 'B' | null>(null);
  const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);
  const [archetype] = useState<'Firestorm' | 'FrostPulse' | 'MoonWaver'>('Firestorm');
  const [lightBurst, setLightBurst] = useState(false);
  const [showSubscribeModal, setShowSubscribeModal] = useState(false);
  const [showDebugHUD, setShowDebugHUD] = useState(true);
  const [showVoicePanel, setShowVoicePanel] = useState(false);
  const [bpmSync, setBpmSync] = useState(true);
  const [isCrowdEnabled, setIsCrowdEnabled] = useState(true);
  const [showSubscribeBanner, setShowSubscribeBanner] = useState(true);
  
  // Audio and speech integration
  const announcer = useFestivalAnnouncer();
  const voiceCommands = useVoiceCommands();

  // Crossfade state synchronized with audio engine
  const [crossfade, setCrossfade] = useState(audioEngine.crossfadeValue);

  // Update crossfade in audio engine when slider changes
  useEffect(() => {
    audioEngine.setCrossfade(crossfade);
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
        const activeDeck = crossfade < 50 ? 'A' : 'B';
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
    console.log('🔥 Drop My Set clicked - triggering all effects');
    
    // Trigger crowd effects through ref
    if (isCrowdEnabled && crowdFXRef.current) {
      crowdFXRef.current.triggerEffects();
    }

    // Trigger light burst
    setLightBurst(true);
    
    // Toast notification
    toast({
      title: "🔥 EPIC DROP!",
      description: "Your set is absolutely fire! The crowd is going wild!",
      duration: 3000,
    });

    // Reset light burst
    setTimeout(() => {
      setLightBurst(false);
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
  const activeDeck = crossfade < 40 ? 'A' : crossfade > 60 ? 'B' : null;

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

      {/* Crowd FX Layer */}
      <CrowdFXLayer
        ref={crowdFXRef}
        isEnabled={isCrowdEnabled}
        onToggle={() => setIsCrowdEnabled(!isCrowdEnabled)}
        audioContext={undefined}
      />

      {/* Enhanced Debug HUD */}
      <EnhancedDebugHUD
        isVisible={showDebugHUD}
        onToggle={() => setShowDebugHUD(!showDebugHUD)}
        audioEngine={audioEngine}
        crossfadeValue={crossfade}
        bpmSync={bpmSync}
        masterBpm={bpm}
        activeDeck={activeDeck}
        isSimulationMode={audioEngine.isSimulationMode}
        ttsState={announcer.state}
        speechState={voiceCommands.state}
      />

      {/* Voice Control Panel */}
      <VoiceControlPanel
        isVisible={showVoicePanel}
        onToggle={() => setShowVoicePanel(!showVoicePanel)}
        onVoiceCommand={(command) => {
          // Handle voice commands
          console.log('Voice command received:', command);
          // TODO: Implement voice command routing
        }}
      />

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
            crossfadeValue={100 - crossfade}
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
            crossfadeValue={crossfade}
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

        {/* Enhanced Center Controls */}
        <div className="max-w-lg mx-auto mb-8 space-y-6">
          {/* BPM Master Display */}
          <motion.div
            className="text-center bg-bass-medium/90 backdrop-blur-md border-2 border-neon-cyan/50 rounded-xl p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
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
          </motion.div>

          {/* Crossfader Component */}
          <Crossfader
            value={crossfade}
            onChange={setCrossfade}
            deckAActive={audioEngine.deckA.isPlaying}
            deckBActive={audioEngine.deckB.isPlaying}
            deckAVolume={audioEngine.deckA.volume}
            deckBVolume={audioEngine.deckB.volume}
            isSimulationMode={audioEngine.isSimulationMode}
          />

          {/* Control Buttons */}
          <div className="space-y-3">
            {/* BPM Sync Toggle */}
            <motion.button
              onClick={() => setBpmSync(!bpmSync)}
              className={`w-full p-3 rounded-lg font-bold transition-all ${
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
          </div>
        </div>
      </div>

      {/* Subscribe Banner Component */}
      <SubscribeBanner
        isVisible={showSubscribeBanner}
        onDismiss={() => setShowSubscribeBanner(false)}
        onSubscribe={handleSubscribe}
      />

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


      <BottomNavigation />
    </div>
  );
};

export default DJMixStation;
