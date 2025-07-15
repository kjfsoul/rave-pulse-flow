import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Volume2, Settings, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { djOperations, profileOperations } from '@/lib/database';

interface SimpleDeck {
  id: 'A' | 'B';
  name: string;
  frequency: number;
  isPlaying: boolean;
  volume: number;
  oscillator: OscillatorNode | null;
  gainNode: GainNode | null;
  color: string;
}

export const SimpleDJStation: React.FC = () => {
  const { user, profile } = useAuth();
  const audioContextRef = useRef<AudioContext | null>(null);
  const [audioReady, setAudioReady] = useState(false);
  const [crossfade, setCrossfade] = useState(50);
  const [showSettings, setShowSettings] = useState(false);
  
  
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
    color: 'from-purple-500 to-pink-500'
  });

  const [deckB, setDeckB] = useState<SimpleDeck>({
    id: 'B', 
    name: 'High Energy',
    frequency: 440, // Higher frequency
    isPlaying: false,
    volume: 75,
    oscillator: null,
    gainNode: null,
    color: 'from-cyan-500 to-blue-500'
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
      console.error('Failed to load DJ settings:', error);
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
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }
      
      setAudioReady(true);
      toast.success('🎵 Audio system ready! Click play to hear sound.');
    } catch (error) {
      console.error('Audio initialization failed:', error);
      toast.error('Audio not available in this browser');
    }
  };

  // Load settings on component mount
  useEffect(() => {
    loadDJSettings();
  }, [user?.id]); // loadDJSettings is stable since it only depends on user?.id

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

  // Update crossfade volumes
  useEffect(() => {
    if (!audioContextRef.current || !audioReady) return;

    const deckAVolume = ((100 - crossfade) / 100) * (deckA.volume / 100) * 0.1; // Reduced volume
    const deckBVolume = (crossfade / 100) * (deckB.volume / 100) * 0.1; // Reduced volume

    if (deckA.gainNode) {
      deckA.gainNode.gain.setValueAtTime(deckAVolume, audioContextRef.current.currentTime);
    }
    if (deckB.gainNode) {
      deckB.gainNode.gain.setValueAtTime(deckBVolume, audioContextRef.current.currentTime);
    }
  }, [crossfade, deckA.volume, deckB.volume, audioReady]);

  const toggleDeck = async (deckId: 'A' | 'B') => {
    if (!audioContextRef.current || !audioReady) {
      await initAudio();
      return;
    }

    const deck = deckId === 'A' ? deckA : deckB;
    const setDeck = deckId === 'A' ? setDeckA : setDeckB;

    if (deck.isPlaying) {
      // Stop audio
      if (deck.oscillator) {
        deck.oscillator.stop();
      }
      setDeck(prev => ({ 
        ...prev, 
        isPlaying: false, 
        oscillator: null, 
        gainNode: null 
      }));
      toast(`⏸️ Deck ${deckId} stopped`);
    } else {
      // Start audio
      const oscillator = audioContextRef.current.createOscillator();
      const gainNode = audioContextRef.current.createGain();
      
      // Create a more interesting sound with multiple frequencies
      oscillator.type = 'sawtooth';
      oscillator.frequency.setValueAtTime(deck.frequency, audioContextRef.current.currentTime);
      
      // Add some modulation for more interesting sound
      const lfo = audioContextRef.current.createOscillator();
      const lfoGain = audioContextRef.current.createGain();
      lfo.frequency.setValueAtTime(4, audioContextRef.current.currentTime);
      lfoGain.gain.setValueAtTime(50, audioContextRef.current.currentTime);
      
      lfo.connect(lfoGain);
      lfoGain.connect(oscillator.frequency);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContextRef.current.destination);
      
      // Set initial volume based on crossfade
      const volume = deckId === 'A' 
        ? ((100 - crossfade) / 100) * (deck.volume / 100) * 0.1
        : (crossfade / 100) * (deck.volume / 100) * 0.1;
      gainNode.gain.setValueAtTime(volume, audioContextRef.current.currentTime);
      
      oscillator.start();
      lfo.start();
      
      setDeck(prev => ({ 
        ...prev, 
        isPlaying: true, 
        oscillator, 
        gainNode 
      }));
      
      toast(`▶️ Deck ${deckId} playing ${deck.name}`);
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
    const setDeck = deckId === 'A' ? setDeckA : setDeckB;
    setDeck(prev => ({ ...prev, volume: newVolume }));
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
            <div className="flex-1 flex justify-end">
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
          <p className="text-cyan-400 text-lg">Real Web Audio • Working Controls • Actual Sound!</p>
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
      </div>
    </div>
  );
};