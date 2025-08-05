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
}

export const SimpleDJStation: React.FC = () => {
  const { user, profile } = useAuth();
  const audioContextRef = useRef<AudioContext | null>(null);
  const [audioReady, setAudioReady] = useState(false);
  const [crossfade, setCrossfade] = useState(50);
  const [showSettings, setShowSettings] = useState(false);
  const [masterEqualizerNode, setMasterEqualizerNode] = useState<AudioNode | null>(null);
  const masterMixerRef = useRef<GainNode | null>(null);
  const [showDJCoach, setShowDJCoach] = useState(false);
  const [showChallenges, setShowChallenges] = useState(false);
  
  
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
    assignedStem: null
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
    assignedStem: null
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

  // Initialize Web Audio API
  const initAudio = async () => {
    try {
      console.log('Initializing audio...');
      audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      
      if (audioContextRef.current.state === 'suspended') {
        console.log('Resuming suspended audio context...');
        await audioContextRef.current.resume();
      }
      
      // Create master mixer node
      masterMixerRef.current = audioContextRef.current.createGain();
      masterMixerRef.current.gain.setValueAtTime(1, audioContextRef.current.currentTime);
      
      console.log('Audio context initialized:', audioContextRef.current.state);
      setAudioReady(true);
      toast.success('🎵 Audio system ready!');
    } catch (error) {
      console.error('Audio initialization failed:', error);
      toast.error('Audio initialization failed: ' + error.message);
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

  // Update crossfade volumes with better control
  useEffect(() => {
    if (!audioContextRef.current || !audioReady) return;

    const deckAVolume = ((100 - crossfade) / 100) * (deckA.volume / 100) * 0.3; // Better volume level
    const deckBVolume = (crossfade / 100) * (deckB.volume / 100) * 0.3; // Better volume level

    try {
      if (deckA.gainNode && deckA.isPlaying) {
        deckA.gainNode.gain.setTargetAtTime(deckAVolume, audioContextRef.current.currentTime, 0.1);
      }
      if (deckB.gainNode && deckB.isPlaying) {
        deckB.gainNode.gain.setTargetAtTime(deckBVolume, audioContextRef.current.currentTime, 0.1);
      }
    } catch (error) {
      console.warn('Error updating volumes:', error);
    }
  }, [crossfade, deckA.volume, deckB.volume, deckA.isPlaying, deckB.isPlaying, audioReady]);

  const toggleDeck = async (deckId: 'A' | 'B') => {
    if (!audioContextRef.current || !audioReady) {
      await initAudio();
      // After initializing audio, try again
      if (!audioContextRef.current) {
        toast.error('Failed to initialize audio');
        return;
      }
    }

    const deck = deckId === 'A' ? deckA : deckB;
    const setDeck = deckId === 'A' ? setDeckA : setDeckB;

    if (deck.isPlaying) {
      // Stop audio with proper cleanup
      try {
        if (deck.sourceNode) {
          deck.sourceNode.stop();
          deck.sourceNode.disconnect();
        }
        if (deck.oscillator) {
          deck.oscillator.stop();
          deck.oscillator.disconnect();
        }
        if (deck.gainNode) {
          deck.gainNode.disconnect();
        }
      } catch (error) {
        console.warn(`Error stopping deck ${deckId}:`, error);
      }
      
      setDeck(prev => ({ 
        ...prev, 
        isPlaying: false, 
        oscillator: null, 
        sourceNode: null,
        gainNode: null 
      }));
      toast(`⏸️ Deck ${deckId} stopped`);
    } else {
      // Start audio
      try {
        console.log(`Starting deck ${deckId}, context state:`, audioContextRef.current.state);
        
        const gainNode = audioContextRef.current.createGain();
        let sourceNode: AudioBufferSourceNode | null = null;
        let oscillator: OscillatorNode | null = null;

        if (deck.audioBuffer) {
          // Use assigned audio buffer (from sound pack)
          sourceNode = audioContextRef.current.createBufferSource();
          sourceNode.buffer = deck.audioBuffer;
          sourceNode.loop = true;
          
          // Add error handling for source node
          sourceNode.onended = () => {
            console.log(`Deck ${deckId} source ended`);
          };
          
          sourceNode.connect(gainNode);
          console.log('Using audio buffer:', deck.assignedStem?.name);
        } else {
          // Fallback to generated oscillator (simplified)
          oscillator = audioContextRef.current.createOscillator();
          oscillator.type = 'sawtooth';
          oscillator.frequency.setValueAtTime(deck.frequency, audioContextRef.current.currentTime);
          oscillator.connect(gainNode);
          
          console.log('Using generated oscillator for deck', deckId);
        }
        
        // Connect to master mixer
        if (masterMixerRef.current) {
          console.log('Connecting to master mixer');
          gainNode.connect(masterMixerRef.current);
        } else {
          console.log('Connecting directly to destination');
          gainNode.connect(audioContextRef.current.destination);
        }
        
        // Set initial volume based on crossfade
        const volume = deckId === 'A' 
          ? ((100 - crossfade) / 100) * (deck.volume / 100) * 0.3
          : (crossfade / 100) * (deck.volume / 100) * 0.3;
        gainNode.gain.setValueAtTime(volume, audioContextRef.current.currentTime);
        
        // Start the audio source
        if (sourceNode) {
          sourceNode.start();
        } else if (oscillator) {
          oscillator.start();
        }
        
        setDeck(prev => ({ 
          ...prev, 
          isPlaying: true, 
          oscillator,
          sourceNode,
          gainNode 
        }));
        
        console.log(`Deck ${deckId} started successfully`);
        toast(`▶️ Deck ${deckId} playing ${deck.name}`);
      } catch (error) {
        console.error(`Failed to start deck ${deckId}:`, error);
        toast.error(`Failed to start Deck ${deckId}: ${error.message}`);
      }
    }
  };

  const updateFrequency = (deckId: 'A' | 'B', newFreq: number) => {
    const deck = deckId === 'A' ? deckA : deckB;
    const setDeck = deckId === 'A' ? setDeckA : setDeckB;
    
    if (deck.oscillator && audioContextRef.current) {
      deck.oscillator.frequency.setValueAtTime(newFreq, audioContextRef.current.currentTime);
    }
    
    setDeck(prev => ({ ...prev, frequency: newFreq }));
  };

  const updateVolume = (deckId: 'A' | 'B', newVolume: number) => {
    const deck = deckId === 'A' ? deckA : deckB;
    const setDeck = deckId === 'A' ? setDeckA : setDeckB;
    
    // Update volume immediately if deck is playing
    if (deck.gainNode && deck.isPlaying && audioContextRef.current) {
      try {
        const crossfadeMultiplier = deckId === 'A' 
          ? (100 - crossfade) / 100 
          : crossfade / 100;
        const finalVolume = crossfadeMultiplier * (newVolume / 100) * 0.3;
        deck.gainNode.gain.setTargetAtTime(finalVolume, audioContextRef.current.currentTime, 0.1);
      } catch (error) {
        console.warn(`Error updating volume for deck ${deckId}:`, error);
      }
    }
    
    setDeck(prev => ({ ...prev, volume: newVolume }));
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
    
    if (deckA.gainNode && audioContextRef.current) {
      const currentTime = audioContextRef.current.currentTime;
      deckA.gainNode.gain.setValueAtTime(0.3, currentTime);
      deckA.gainNode.gain.exponentialRampToValueAtTime(0.1, currentTime + 2);
    }
    
    if (deckB.gainNode && audioContextRef.current) {
      const currentTime = audioContextRef.current.currentTime;
      deckB.gainNode.gain.setValueAtTime(0.3, currentTime);
      deckB.gainNode.gain.exponentialRampToValueAtTime(0.1, currentTime + 2);
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
          {!audioReady && (
            <div className="mt-4 p-4 bg-yellow-600/20 border border-yellow-500 rounded-lg">
              <p className="text-yellow-300">Click any play button to enable audio</p>
            </div>
          )}
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

        {/* Master Equalizer */}
        {audioReady && audioContextRef.current && masterMixerRef.current ? (
          <div className="mb-8">
            <LiveEqualizer
              audioContext={audioContextRef.current}
              sourceNode={masterMixerRef.current}
              onEqualizerNodeReady={(equalizerNode) => {
                setMasterEqualizerNode(equalizerNode);
                // Connect equalizer output to destination
                equalizerNode.connect(audioContextRef.current!.destination);
              }}
            />
          </div>
        ) : (
          <div className="mb-8">
            <div className="relative p-6 bg-gradient-to-t from-gray-900/90 to-gray-800/90 backdrop-blur-lg rounded-2xl border border-cyan-500/30 shadow-2xl">
              <div className="text-center">
                <h3 className="text-xl font-bold text-cyan-400 font-mono tracking-wider mb-4">
                  LIVE EQUALIZER
                </h3>
                <div className="text-gray-400 text-sm">
                  🎵 Click any deck's play button to enable the equalizer
                </div>
                <div className="grid grid-cols-5 md:grid-cols-10 gap-4 mt-6 opacity-50">
                  {['32Hz', '64Hz', '125Hz', '250Hz', '500Hz', '1kHz', '2kHz', '4kHz', '8kHz', '16kHz'].map((freq) => (
                    <div key={freq} className="flex flex-col items-center space-y-2">
                      <div className="text-xs font-mono text-cyan-300 bg-black/50 px-2 py-1 rounded min-w-[60px] text-center">
                        0.0dB
                      </div>
                      <div className="relative h-48 w-8 bg-gray-800 rounded-full border border-cyan-500/30">
                        <div className="absolute left-0 right-0 h-0.5 bg-cyan-400 top-1/2 transform -translate-y-0.5" />
                        <div className="absolute w-full h-4 bg-gradient-to-r from-cyan-400 to-blue-500 top-1/2 transform -translate-y-1/2" />
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
        )}

        {/* Sound Pack Loader */}
        <div className="mb-8">
          <SoundPackLoader
            audioContext={audioContextRef.current}
            onStemAssign={handleStemAssign}
            assignedStems={{
              A: deckA.assignedStem,
              B: deckB.assignedStem
            }}
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