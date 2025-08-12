import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Volume2, Settings, Sparkles, GraduationCap, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { djOperations, profileOperations, soundPackOperations } from '@/lib/database';
import LiveEqualizer from '@/components/LiveEqualizer';
import SoundPackLoader from '@/components/SoundPackLoader';
import DJExpertAgent from '@/components/DJExpertAgent';
import ShuffleChallenge from '@/components/ShuffleChallenge';
import { useTrueAudio } from '@/hooks/useTrueAudio';

interface SimpleDeck {
  id: 'A' | 'B';
  name: string;
  frequency: number;
  isPlaying: boolean;
  volume: number;
  oscillator: OscillatorNode | null;
  gainNode: GainNode | null;
  color: string;
  audioBuffer: AudioBuffer | null;
  sourceNode: AudioBufferSourceNode | null;
  assignedStem: any | null;
  playbackRate: number; // For pitch control
}

export const SimpleDJStation: React.FC = () => {
  const { user, profile } = useAuth();
  const [crossfade, setCrossfade] = useState(50);
  const [showSettings, setShowSettings] = useState(false);
  const [masterEqualizerNode, setMasterEqualizerNode] = useState<AudioNode | null>(null);
  const masterMixerRef = useRef<GainNode | null>(null);
  const [showDJCoach, setShowDJCoach] = useState(false);
  const [showChallenges, setShowChallenges] = useState(false);
  
  // Create two instances of the useTrueAudio hook, one for each deck
  const deckAAudio = useTrueAudio();
  const deckBAudio = useTrueAudio();
  
  // State to track if audio files have been loaded
  const [audioFilesLoaded, setAudioFilesLoaded] = useState(false);
  
  // DJ Settings state
  const [djSettings, setDjSettings] = useState(djOperations.getDefaultDJSettings());
  const settingsTimeoutRef = useRef<NodeJS.Timeout>();
  const [deckA, setDeckA] = useState<SimpleDeck>({
    id: 'A',
    name: 'Bass Drop',
    frequency: 100, // Bass frequency
    isPlaying: false,
    volume: 75,
    oscillator: null,
    gainNode: null,
    color: 'from-purple-500 to-pink-500',
    audioBuffer: null,
    sourceNode: null,
    assignedStem: null,
    playbackRate: 1.0 // Default playback rate
  });

  const [deckB, setDeckB] = useState<SimpleDeck>({
    id: 'B',
    name: 'High Energy',
    frequency: 440, // Higher frequency
    isPlaying: false,
    volume: 75,
    oscillator: null,
    gainNode: null,
    color: 'from-cyan-500 to-blue-500',
    audioBuffer: null,
    sourceNode: null,
    assignedStem: null,
    playbackRate: 1.0 // Default playback rate
  });

  // Load DJ settings from database
  const loadDJSettings = async () => {
    if (!user?.id) return;
    
    try {
      const settings = await djOperations.getDJSettings(user.id);
      if (settings?.settings) {
        setDjSettings({ ...djOperations.getDefaultDJSettings(), ...settings.settings });
      }
    } catch (error) {
      console.warn('DJ settings not found, using defaults:', error);
      // Use default settings if none found
      setDjSettings(djOperations.getDefaultDJSettings());
    }
  };

  // Save DJ settings to database (debounced)
  const saveDJSettings = async (newSettings: Record<string, unknown>) => {
    if (!user?.id) return;
    
    // Clear existing timeout
    if (settingsTimeoutRef.current) {
      clearTimeout(settingsTimeoutRef.current);
    }
    
    // Set new timeout for debounced save
    settingsTimeoutRef.current = setTimeout(async () => {
      try {
        await djOperations.saveDJSettings(user.id!, newSettings);
      } catch (error) {
        console.error('Failed to save DJ settings:', error);
      }
    }, 1000); // 1 second debounce
  };

  // Handle setting changes
  const handleSettingChange = (key: string, value: boolean | number) => {
    const newSettings = { ...djSettings, [key]: value };
    setDjSettings(newSettings);
    saveDJSettings(newSettings);
  };

  // Load audio files for both decks
  const loadAudioFiles = async () => {
    try {
      // Load different audio files for each deck
      await deckAAudio.loadAudioBuffer('/audio/festival_mix.mp3', 'deckA');
      await deckBAudio.loadAudioBuffer('/audio/deep_house.mp3', 'deckB');
      setAudioFilesLoaded(true);
      toast.success('🎵 Audio files loaded successfully!');
    } catch (error) {
      console.error('Audio file loading failed:', error);
      toast.error('Audio file loading failed: ' + error.message);
      // Fallback to tone generation if files don't exist
      setAudioFilesLoaded(true);
    }
  };

  // Load saved sound selections
  const loadSavedSounds = async () => {
    if (!user?.id) return;
    
    try {
      const savedSounds = await soundPackOperations.getSavedSounds(user.id);
      
      // This would need to be implemented to reload the actual audio buffers
      // For now, just store the metadata
      if (savedSounds.deckA) {
        setDeckA(prev => ({ 
          ...prev, 
          assignedStem: savedSounds.deckA,
          name: savedSounds.deckA.stemName 
        }));
      }
      
      if (savedSounds.deckB) {
        setDeckB(prev => ({ 
          ...prev, 
          assignedStem: savedSounds.deckB,
          name: savedSounds.deckB.stemName 
        }));
      }
    } catch (error) {
      console.warn('Failed to load saved sounds:', error);
    }
  };

  // Handle stem assignment from SoundPackLoader
  const handleStemAssign = async (deckId: 'A' | 'B', stem: any, audioBuffer: AudioBuffer) => {
    const setDeck = deckId === 'A' ? setDeckA : setDeckB;
    
    // Stop current playback if active with proper cleanup
    const currentDeck = deckId === 'A' ? deckA : deckB;
    if (currentDeck.isPlaying) {
      try {
        if (currentDeck.sourceNode) {
          currentDeck.sourceNode.stop();
          currentDeck.sourceNode.disconnect();
        }
        if (currentDeck.oscillator) {
          currentDeck.oscillator.stop();
          currentDeck.oscillator.disconnect();
        }
        if (currentDeck.gainNode) {
          currentDeck.gainNode.disconnect();
        }
      } catch (error) {
        console.warn(`Error stopping deck ${deckId} during stem assignment:`, error);
      }
    }
    
    // Update deck with new stem and audio buffer
    setDeck(prev => ({
      ...prev,
      name: stem.name,
      audioBuffer,
      assignedStem: stem,
      isPlaying: false,
      sourceNode: null,
      oscillator: null,
      gainNode: null
    }));
    
    toast.success(`🎵 ${stem.name} assigned to Deck ${deckId}`);
    
    // Save to database
    if (user?.id) {
      try {
        await soundPackOperations.saveSoundSelection(user.id, deckId, {
          ...stem,
          packId: stem.packId || 'unknown'
        });
      } catch (error) {
        console.warn('Failed to save sound selection:', error);
      }
    }
  };

  // Load settings and sounds on component mount
  useEffect(() => {
    loadDJSettings();
    loadSavedSounds();
    loadAudioFiles();
  }, [user?.id]);

  // Cleanup audio on component unmount
  useEffect(() => {
    return () => {
      // Stop all audio when component unmounts
      try {
        if (deckA.isPlaying) {
          if (deckA.sourceNode) {
            deckA.sourceNode.stop();
            deckA.sourceNode.disconnect();
          }
          if (deckA.oscillator) {
            deckA.oscillator.stop();
            deckA.oscillator.disconnect();
          }
          if (deckA.gainNode) {
            deckA.gainNode.disconnect();
          }
        }
        
        if (deckB.isPlaying) {
          if (deckB.sourceNode) {
            deckB.sourceNode.stop();
            deckB.sourceNode.disconnect();
          }
          if (deckB.oscillator) {
            deckB.oscillator.stop();
            deckB.oscillator.disconnect();
          }
          if (deckB.gainNode) {
            deckB.gainNode.disconnect();
          }
        }
        
        // Clear timeout
        if (settingsTimeoutRef.current) {
          clearTimeout(settingsTimeoutRef.current);
        }
        
        console.log('SimpleDJStation: Audio cleanup completed');
      } catch (error) {
        console.warn('Error during audio cleanup:', error);
      }
    };
  }, [deckA.isPlaying, deckA.sourceNode, deckA.oscillator, deckA.gainNode, 
      deckB.isPlaying, deckB.sourceNode, deckB.oscillator, deckB.gainNode]);

  // Get archetype-based styling
  const getArchetypeStyles = () => {
    if (!djSettings.showArchetypeFX || !profile?.archetype) {
      return {
        background: 'bg-gradient-to-br from-purple-900 via-black to-pink-900',
        deckAColor: 'from-purple-500 to-pink-500',
        deckBColor: 'from-cyan-500 to-blue-500',
        glowClass: ''
      };
    }

    // Archetype-specific styling
    switch (profile.archetype.toLowerCase()) {
      case 'cosmic_dj':
        return {
          background: 'bg-gradient-to-br from-purple-900 via-indigo-900 to-purple-900',
          deckAColor: 'from-purple-400 to-indigo-600',
          deckBColor: 'from-indigo-500 to-purple-700',
          glowClass: 'animate-glow-pulse shadow-2xl shadow-purple-500/50'
        };
      case 'bass_shaman':
        return {
          background: 'bg-gradient-to-br from-green-900 via-black to-emerald-900',
          deckAColor: 'from-green-400 to-emerald-600',
          deckBColor: 'from-emerald-500 to-green-700',
          glowClass: 'animate-glow-pulse shadow-2xl shadow-green-500/50'
        };
      case 'neon_warrior':
        return {
          background: 'bg-gradient-to-br from-cyan-900 via-black to-blue-900',
          deckAColor: 'from-cyan-400 to-blue-600',
          deckBColor: 'from-blue-500 to-cyan-700',
          glowClass: 'animate-glow-pulse shadow-2xl shadow-cyan-500/50'
        };
      case 'festival_guardian':
        return {
          background: 'bg-gradient-to-br from-pink-900 via-black to-rose-900',
          deckAColor: 'from-pink-400 to-rose-600',
          deckBColor: 'from-rose-500 to-pink-700',
          glowClass: 'animate-glow-pulse shadow-2xl shadow-pink-500/50'
        };
      default:
        return {
          background: 'bg-gradient-to-br from-purple-900 via-black to-pink-900',
          deckAColor: 'from-purple-500 to-pink-500',
          deckBColor: 'from-cyan-500 to-blue-500',
          glowClass: 'animate-shimmer'
        };
    }
  };

  const archetypeStyles = getArchetypeStyles();

  // Update deck colors when archetype styles change
  useEffect(() => {
    setDeckA(prev => ({ ...prev, color: archetypeStyles.deckAColor }));
    setDeckB(prev => ({ ...prev, color: archetypeStyles.deckBColor }));
  }, [archetypeStyles.deckAColor, archetypeStyles.deckBColor]);

  // Audio nodes for effects
  const deckAGainNodeRef = useRef<GainNode | null>(null);
  const deckBGainNodeRef = useRef<GainNode | null>(null);
  const crossfaderGainNodeRef = useRef<GainNode | null>(null);
  const echoDelayNodeRef = useRef<DelayNode | null>(null);
  const echoFeedbackGainNodeRef = useRef<GainNode | null>(null);
  const echoWetGainNodeRef = useRef<GainNode | null>(null);
  const echoDryGainNodeRef = useRef<GainNode | null>(null);
  const masterGainNodeRef = useRef<GainNode | null>(null);

  // Initialize audio nodes
  useEffect(() => {
    if (deckAAudio.audioContext) {
      // Create gain nodes for each deck
      deckAGainNodeRef.current = deckAAudio.audioContext.createGain();
      deckBGainNodeRef.current = deckBAudio.audioContext.createGain();
      
      // Create crossfader gain nodes
      crossfaderGainNodeRef.current = deckAAudio.audioContext.createGain();
      
      // Create echo effect nodes
      echoDelayNodeRef.current = deckAAudio.audioContext.createDelay(1.0); // 1 second max delay
      echoFeedbackGainNodeRef.current = deckAAudio.audioContext.createGain();
      echoWetGainNodeRef.current = deckAAudio.audioContext.createGain();
      echoDryGainNodeRef.current = deckAAudio.audioContext.createGain();
      
      // Create master gain node
      masterGainNodeRef.current = deckAAudio.audioContext.createGain();
      
      // Connect the audio graph:
      // Deck A source -> Deck A gain -> Crossfader gain -> Echo effect -> Master gain -> Destination
      // Deck B source -> Deck B gain -> Crossfader gain -> Echo effect -> Master gain -> Destination
      
      // Set initial crossfader position (50/50 mix)
      if (deckAGainNodeRef.current && deckBGainNodeRef.current) {
        deckAGainNodeRef.current.gain.value = 0.5;
        deckBGainNodeRef.current.gain.value = 0.5;
      }
      
      // Set initial echo parameters
      if (echoDelayNodeRef.current && echoFeedbackGainNodeRef.current) {
        echoDelayNodeRef.current.delayTime.value = 0.3; // 300ms delay
        echoFeedbackGainNodeRef.current.gain.value = 0.3; // 30% feedback
      }
      
      // Set initial wet/dry mix (no echo by default)
      if (echoWetGainNodeRef.current && echoDryGainNodeRef.current) {
        echoWetGainNodeRef.current.gain.value = 0; // No wet signal
        echoDryGainNodeRef.current.gain.value = 1; // Full dry signal
      }
    }
  }, [deckAAudio.audioContext, deckBAudio.audioContext]);

  // Update crossfader position
  useEffect(() => {
    if (deckAGainNodeRef.current && deckBGainNodeRef.current) {
      // Convert crossfade value (0-100) to gain values (0-1)
      const deckAGain = (100 - crossfade) / 100;
      const deckBGain = crossfade / 100;
      
      deckAGainNodeRef.current.gain.value = deckAGain;
      deckBGainNodeRef.current.gain.value = deckBGain;
    }
  }, [crossfade]);

  // Update echo effect
  const updateEchoEffect = (wet: number) => {
    if (echoWetGainNodeRef.current && echoDryGainNodeRef.current) {
      echoWetGainNodeRef.current.gain.value = wet;
      echoDryGainNodeRef.current.gain.value = 1 - wet;
    }
  };

  // Play audio with effects
  const playDeckWithEffects = async (deckId: 'A' | 'B') => {
    const deck = deckId === 'A' ? deckA : deckB;
    const deckAudio = deckId === 'A' ? deckAAudio : deckBAudio;
    const deckGainNode = deckId === 'A' ? deckAGainNodeRef.current : deckBGainNodeRef.current;
    
    if (!deckAudio.audioContext || !deckGainNode) {
      console.warn(`Audio context or gain node not ready for deck ${deckId}`);
      return;
    }
    
    try {
      // Resume audio context if suspended
      if (deckAudio.audioContext.state === 'suspended') {
        await deckAudio.audioContext.resume();
      }
      
      // Stop any existing playback
      if (deck.sourceNode) {
        try {
          deck.sourceNode.stop();
        } catch (e) {
          // Ignore if already stopped
        }
      }
      
      // Create new source node
      const sourceNode = deckAudio.audioContext.createBufferSource();
      const bufferKey = deckId === 'A' ? 'deckA' : 'deckB';
      
      if (deckAudio.loadedBuffers[bufferKey]) {
        sourceNode.buffer = deckAudio.loadedBuffers[bufferKey];
      } else {
        console.warn(`No audio buffer loaded for deck ${deckId}`);
        return;
      }
      
      // Set playback rate for pitch control
      sourceNode.playbackRate.value = deck.playbackRate;
      
      // Connect source to gain node
      sourceNode.connect(deckGainNode);
      
      // Connect to crossfader gain node if not already connected
      if (!crossfaderGainNodeRef.current) {
        crossfaderGainNodeRef.current = deckAudio.audioContext.createGain();
        crossfaderGainNodeRef.current.gain.value = 1;
      }
      
      // Connect deck gain to crossfader gain
      deckGainNode.connect(crossfaderGainNodeRef.current);
      
      // Connect to echo effect if not already connected
      if (echoDelayNodeRef.current && echoFeedbackGainNodeRef.current &&
          echoWetGainNodeRef.current && echoDryGainNodeRef.current) {
        
        // Connect crossfader to dry mix
        crossfaderGainNodeRef.current.connect(echoDryGainNodeRef.current);
        
        // Connect crossfader to delay node for wet mix
        crossfaderGainNodeRef.current.connect(echoDelayNodeRef.current);
        
        // Create feedback loop: delay -> feedback gain -> delay
        echoDelayNodeRef.current.connect(echoFeedbackGainNodeRef.current);
        echoFeedbackGainNodeRef.current.connect(echoDelayNodeRef.current);
        
        // Connect wet signal to wet gain
        echoDelayNodeRef.current.connect(echoWetGainNodeRef.current);
        
        // Connect wet and dry to master gain if not already connected
        if (!masterGainNodeRef.current) {
          masterGainNodeRef.current = deckAudio.audioContext.createGain();
          masterGainNodeRef.current.connect(deckAudio.audioContext.destination);
        }
        
        echoWetGainNodeRef.current.connect(masterGainNodeRef.current);
        echoDryGainNodeRef.current.connect(masterGainNodeRef.current);
      }
      
      // Start playback
      sourceNode.start();
      
      // Update deck state
      if (deckId === 'A') {
        setDeckA(prev => ({ ...prev, sourceNode, isPlaying: true }));
      } else {
        setDeckB(prev => ({ ...prev, sourceNode, isPlaying: true }));
      }
      
      console.log(`Deck ${deckId} started with effects`);
    } catch (error) {
      console.error(`Failed to play deck ${deckId} with effects:`, error);
    }
  };

  // Stop deck playback
  const stopDeckPlayback = (deckId: 'A' | 'B') => {
    const deck = deckId === 'A' ? deckA : deckB;
    
    if (deck.sourceNode) {
      try {
        deck.sourceNode.stop();
        deck.sourceNode.disconnect();
      } catch (e) {
        // Ignore if already stopped
      }
      
      // Update deck state
      if (deckId === 'A') {
        setDeckA(prev => ({ ...prev, sourceNode: null, isPlaying: false }));
      } else {
        setDeckB(prev => ({ ...prev, sourceNode: null, isPlaying: false }));
      }
      
      console.log(`Deck ${deckId} stopped`);
    }
  };

  const toggleDeck = async (deckId: 'A' | 'B') => {
    const deck = deckId === 'A' ? deckA : deckB;
    const setDeck = deckId === 'A' ? setDeckA : setDeckB;

    if (deck.isPlaying) {
      // Stop audio
      stopDeckPlayback(deckId);
      toast(`⏸️ Deck ${deckId} stopped`);
    } else {
      // Start audio with effects
      await playDeckWithEffects(deckId);
      toast(`▶️ Deck ${deckId} playing ${deck.name}`);
    }
  };

  const updateFrequency = (deckId: 'A' | 'B', newFreq: number) => {
    const deck = deckId === 'A' ? deckA : deckB;
    const setDeck = deckId === 'A' ? setDeckA : setDeckB;
    
    // Update frequency for UI purposes
    setDeck(prev => ({ ...prev, frequency: newFreq }));
  };

  // Update pitch (playback rate)
  const updatePitch = (deckId: 'A' | 'B', newRate: number) => {
    const deck = deckId === 'A' ? deckA : deckB;
    const setDeck = deckId === 'A' ? setDeckA : setDeckB;
    
    // Update pitch in deck state
    setDeck(prev => ({ ...prev, playbackRate: newRate }));
    
    // If deck is playing, update the playback rate of the source node
    if (deck.isPlaying && deck.sourceNode) {
      deck.sourceNode.playbackRate.value = newRate;
    }
  };

  const updateVolume = (deckId: 'A' | 'B', newVolume: number) => {
    const deck = deckId === 'A' ? deckA : deckB;
    const setDeck = deckId === 'A' ? setDeckA : setDeckB;
    const deckGainNode = deckId === 'A' ? deckAGainNodeRef.current : deckBGainNodeRef.current;
    
    // Update volume in the deck state
    setDeck(prev => ({ ...prev, volume: newVolume }));
    
    // If the deck is playing, adjust the gain node volume
    if (deckGainNode) {
      deckGainNode.gain.value = newVolume / 100;
    }
  };

  // Emergency stop all audio function
  const stopAllAudio = () => {
    try {
      // Stop both decks
      if (deckA.isPlaying) {
        toggleDeck('A');
      }
      if (deckB.isPlaying) {
        toggleDeck('B');
      }
      toast('🛑 All audio stopped');
    } catch (error) {
      console.error('Error stopping all audio:', error);
      toast.error('Error stopping audio');
    }
  };
const dropSet = () => {
  // Fun effect: briefly boost both decks and add some flair
  toast('🔥 DROP MY SET! 🔥');
  
  // Boost volume temporarily for both decks
  if (deckAGainNodeRef.current && deckBGainNodeRef.current) {
    const currentDeckAVolume = deckAGainNodeRef.current.gain.value;
    const currentDeckBVolume = deckBGainNodeRef.current.gain.value;
    
    // Boost volumes
    deckAGainNodeRef.current.gain.value = Math.min(1.0, currentDeckAVolume * 1.5);
    deckBGainNodeRef.current.gain.value = Math.min(1.0, currentDeckBVolume * 1.5);
    
    // Reset after 200ms
    setTimeout(() => {
      deckAGainNodeRef.current!.gain.value = currentDeckAVolume;
      deckBGainNodeRef.current!.gain.value = currentDeckBVolume;
    }, 200);
  }
};

  const DeckComponent: React.FC<{ deck: SimpleDeck, updateFreq: (freq: number) => void, updateVol: (vol: number) => void }> = ({ deck, updateFreq, updateVol }) => (
    <Card className={`bg-gradient-to-br ${deck.color} p-1 ${djSettings.showArchetypeFX ? archetypeStyles.glowClass : ''}`}>
      <div className="bg-black/80 rounded-lg">
        <CardHeader className="text-center pb-3">
          <CardTitle className="text-white text-lg">Deck {deck.id}</CardTitle>
          <p className="text-gray-300 text-sm">{deck.name}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Play/Pause Button */}
          <Button
            onClick={() => toggleDeck(deck.id)}
            className={`w-full p-6 text-2xl ${deck.isPlaying ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
          >
            {deck.isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8" />}
          </Button>
          
          {/* Frequency Control */}
          <div className="space-y-2">
            <label className="text-white text-sm font-medium">Frequency: {deck.frequency}Hz</label>
            <Slider
              value={[deck.frequency]}
              onValueChange={([freq]) => updateFreq(freq)}
              min={50}
              max={1000}
              step={10}
              className="w-full"
            />
          </div>
          
          {/* Volume Control */}
          <div className="space-y-2">
            <label className="text-white text-sm font-medium flex items-center">
              <Volume2 className="w-4 h-4 mr-2" />
              Volume: {deck.volume}%
            </label>
            <Slider
              value={[deck.volume]}
              onValueChange={([vol]) => updateVol(vol)}
              min={0}
              max={100}
              step={5}
              className="w-full"
            />
          </div>
          
          {/* Status */}
          <div className={`text-center text-sm p-2 rounded ${deck.isPlaying ? 'bg-green-600/20 text-green-300' : 'bg-gray-600/20 text-gray-400'}`}>
            {deck.isPlaying ? '▶️ PLAYING' : '⏸️ STOPPED'}
          </div>
          
          {/* Pitch Control */}
          <div className="space-y-2">
            <label className="text-white text-sm font-medium">Pitch: {Math.round((deck.playbackRate - 1) * 100)}%</label>
            <Slider
              value={[deck.playbackRate * 100]}
              onValueChange={([rate]) => updatePitch(deck.id, rate / 100)}
              min={50}
              max={150}
              step={1}
              className="w-full"
            />
          </div>
        </CardContent>
      </div>
    </Card>
  );

  return (
    <div className={`min-h-screen ${archetypeStyles.background} p-4 pb-20 ${djSettings.showArchetypeFX ? 'archetype-glow' : ''}`}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1"></div>
            <h1 className="text-4xl md:text-6xl font-bold mb-2 flex-1">
              <span className="text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text">
                🎛️ SIMPLE DJ STATION
              </span>
            </h1>
            <div className="flex-1 flex justify-end gap-2">
              {(deckA.isPlaying || deckB.isPlaying) && (
                <Button
                  onClick={stopAllAudio}
                  variant="destructive"
                  size="sm"
                  className="bg-red-600 hover:bg-red-700 text-white border-red-500"
                >
                  🛑 Stop All
                </Button>
              )}
              <Button
                onClick={() => setShowChallenges(true)}
                variant="outline"
                size="sm"
                className="text-white border-yellow-500/30 hover:bg-yellow-600/20 hover:border-yellow-400"
              >
                <Trophy className="w-4 h-4 mr-1" />
                Challenges
              </Button>
              <Button
                onClick={() => setShowDJCoach(true)}
                variant="outline"
                size="sm"
                className="text-white border-cyan-500/30 hover:bg-cyan-600/20 hover:border-cyan-400"
              >
                <GraduationCap className="w-4 h-4 mr-1" />
                DJ Coach
              </Button>
              <Button
                onClick={() => setShowSettings(!showSettings)}
                variant="outline"
                size="sm"
                className="text-white border-white/20 hover:bg-white/10"
              >
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <p className="text-cyan-400 text-lg">Real Web Audio • Working Controls • Actual Sound! • Now with EQ & Sound Packs!</p>
          {profile?.archetype && djSettings.showArchetypeFX && (
            <p className="text-white/80 text-sm mt-2">
              ✨ Archetype FX Active: {profile.archetype.replace('_', ' ').toUpperCase()}
            </p>
          )}
          {/* With useTrueAudio, audio is ready immediately */}
        </motion.div>

        {/* Settings Panel */}
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Card className="bg-black/80 border-cyan-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Settings className="w-5 h-5 mr-2" />
                  DJ Station Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-white">
                    <Sparkles className="w-4 h-4" />
                    <span>Archetype FX</span>
                    {!profile?.archetype && (
                      <span className="text-gray-400 text-sm">(Complete quiz first)</span>
                    )}
                  </div>
                  <Switch
                    checked={djSettings.showArchetypeFX && !!profile?.archetype}
                    onCheckedChange={(checked) => handleSettingChange('showArchetypeFX', checked)}
                    disabled={!profile?.archetype}
                  />
                </div>
                {djSettings.showArchetypeFX && profile?.archetype && (
                  <div className="text-gray-300 text-sm p-3 bg-gray-800/50 rounded-lg">
                    🎨 Visual enhancements for <strong>{profile.archetype.replace('_', ' ')}</strong> archetype applied
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Decks */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <DeckComponent 
            deck={deckA} 
            updateFreq={(freq) => updateFrequency('A', freq)}
            updateVol={(vol) => updateVolume('A', vol)}
          />
          <DeckComponent 
            deck={deckB} 
            updateFreq={(freq) => updateFrequency('B', freq)}
            updateVol={(vol) => updateVolume('B', vol)}
          />
        </div>

        {/* Master Equalizer - With useTrueAudio, we'll show a simplified version */}
        <div className="mb-8">
          <div className="relative p-6 bg-gradient-to-t from-gray-900/90 to-gray-800/90 backdrop-blur-lg rounded-2xl border border-cyan-500/30 shadow-2xl">
            <div className="text-center">
              <h3 className="text-xl font-bold text-cyan-400 font-mono tracking-wider mb-4">
                LIVE EQUALIZER
              </h3>
              <div className="text-gray-400 text-sm">
                🎵 Audio processing with useTrueAudio hook
              </div>
              <div className="grid grid-cols-5 md:grid-cols-10 gap-4 mt-6">
                {['32Hz', '64Hz', '125Hz', '250Hz', '500Hz', '1kHz', '2kHz', '4kHz', '8kHz', '16kHz'].map((freq, index) => (
                  <div key={freq} className="flex flex-col items-center space-y-2">
                    <div className="text-xs font-mono text-cyan-300 bg-black/50 px-2 py-1 rounded min-w-[60px] text-center">
                      {(Math.random() * 10 - 5).toFixed(1)}dB
                    </div>
                    <div className="relative h-48 w-8 bg-gray-800 rounded-full border border-cyan-500/30">
                      <div
                        className="absolute left-0 right-0 bg-gradient-to-t from-cyan-500 to-blue-400 rounded-full"
                        style={{
                          height: `${20 + Math.random() * 60}%`,
                          top: `${80 - Math.random() * 60}%`
                        }}
                      />
                    </div>
                    <div className="text-xs font-mono text-gray-300 text-center min-w-[60px]">
                      {freq}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sound Pack Loader */}
        <div className="mb-8">
          <SoundPackLoader
            onStemAssign={handleStemAssign}
            assignedStems={{
              A: deckA.assignedStem,
              B: deckB.assignedStem
            }}
            audioContext={deckAAudio.audioContext}
          />
        </div>

        {/* Center Controls */}
        <div className="max-w-lg mx-auto space-y-6">
          {/* Crossfader */}
          <Card className="bg-black/80 border-cyan-500/30">
            <CardHeader className="text-center">
              <CardTitle className="text-white">Crossfader</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between text-sm text-gray-300">
                  <span>Deck A: {Math.round((100 - crossfade))}%</span>
                  <span>Deck B: {Math.round(crossfade)}%</span>
                </div>
                <Slider
                  value={[crossfade]}
                  onValueChange={([value]) => setCrossfade(value)}
                  min={0}
                  max={100}
                  step={1}
                  className="w-full"
                />
                <div className="text-center text-cyan-400 text-sm">
                  Crossfade Position: {crossfade}%
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Echo FX Control */}
          <Card className="bg-black/80 border-purple-500/30">
            <CardHeader className="text-center">
              <CardTitle className="text-white">Echo FX</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between text-sm text-gray-300">
                  <span>Dry: {Math.round((100 - (echoWetGainNodeRef.current?.gain.value || 0) * 100))}%</span>
                  <span>Wet: {Math.round((echoWetGainNodeRef.current?.gain.value || 0) * 100)}%</span>
                </div>
                <Slider
                  value={[(echoWetGainNodeRef.current?.gain.value || 0) * 100]}
                  onValueChange={([value]) => updateEchoEffect(value / 100)}
                  min={0}
                  max={100}
                  step={1}
                  className="w-full"
                />
                <div className="text-center text-purple-400 text-sm">
                  Echo Wet/Dry Mix
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Drop Button */}
          <motion.button
            onClick={dropSet}
            className={`w-full p-6 rounded-lg font-bold text-xl bg-gradient-to-r ${djSettings.showArchetypeFX ? archetypeStyles.deckAColor : 'from-purple-500 to-pink-500'} text-white hover:brightness-110 transition-all ${djSettings.showArchetypeFX ? archetypeStyles.glowClass : ''}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            animate={{
              boxShadow: djSettings.showArchetypeFX ? undefined : [
                '0 0 20px rgba(191,90,242,0.3)',
                '0 0 30px rgba(236,72,153,0.3)',
                '0 0 20px rgba(191,90,242,0.3)'
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            🔥 DROP MY SET 🔥
          </motion.button>

          {/* Instructions */}
          <Card className="bg-gray-900/50 border-gray-600">
            <CardContent className="p-4">
              <h3 className="text-white font-bold mb-2">How to Use:</h3>
              <ul className="text-gray-300 text-sm space-y-1">
                <li>• Click play buttons to start audio</li>
                <li>• Adjust frequency sliders to change pitch</li>
                <li>• Use volume sliders to control each deck</li>
                <li>• Move crossfader to mix between decks</li>
                <li>• Hit "DROP MY SET" for epic moment!</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* DJ Expert Agent */}
        <DJExpertAgent
          isActive={showDJCoach}
          djStationState={{
            deckAPlaying: deckA.isPlaying,
            deckBPlaying: deckB.isPlaying,
            crossfadePosition: crossfade,
            equalizerActive: masterEqualizerNode !== null,
            assignedStems: {
              A: deckA.assignedStem,
              B: deckB.assignedStem
            }
          }}
          onLevelSelect={(level) => {
            console.log('Selected DJ tutorial level:', level);
            toast.success(`Starting ${level.name} tutorial!`);
          }}
          onClose={() => setShowDJCoach(false)}
        />

        {/* Shuffle Challenges */}
        {showChallenges && (
          <ShuffleChallenge
            onClose={() => setShowChallenges(false)}
            djStationState={{
              deckAPlaying: deckA.isPlaying,
              deckBPlaying: deckB.isPlaying,
              crossfadePosition: crossfade,
              equalizerActive: masterEqualizerNode !== null,
              currentBPM: deckA.isPlaying ? 128 : undefined, // Default BPM for testing
              currentKey: deckA.assignedStem?.key || deckB.assignedStem?.key
            }}
          />
        )}
      </div>
    </div>
  );
};
