import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { festivalOperations } from "@/lib/database";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import BottomNavigation from "@/components/BottomNavigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import NeonButton from "@/components/NeonButton";
import EqualizerBars from "@/components/EqualizerBars";
import { Volume2, VolumeX, Play, Users, Crown, Zap, Pause, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import FestivalStageBackground from '@/components/VisualFX/FestivalStageBackground';
import ArchetypeAuraSprite from '@/components/VisualFX/ArchetypeAuraSprite';
import ShuffleDancers from '@/components/VisualFX/ShuffleDancers';
import LightSyncPulse from '@/components/VisualFX/LightSyncPulse';
import DroneFormations from '@/components/VisualFX/DroneFormations';
import FestivalEnvironment from '@/components/VisualFX/FestivalEnvironment';

const FestivalVotingStage = () => {
  const { user, profile } = useAuth();
  const [selectedDJ, setSelectedDJ] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentBPM, setCurrentBPM] = useState(128);
  const [votes, setVotes] = useState<{[key: number]: number}>({
    1: 1240,
    2: 890,
    3: 635,
    4: 420
  });
  const [userVotes, setUserVotes] = useState<Set<string>>(new Set());
  const [isVoting, setIsVoting] = useState(false);
  const [headliner, setHeadliner] = useState<number | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{id: string, username: string, message: string, timestamp: Date}>>([]);
  const [newMessage, setNewMessage] = useState("");
  const [lightBurst, setLightBurst] = useState(false);
  const currentArchetype = (profile?.archetype || 'MoonWaver') as 'Firestorm' | 'FrostPulse' | 'MoonWaver';
  
  // Audio contexts and refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const currentTrackRef = useRef<{ source: AudioBufferSourceNode; gainNode: GainNode } | null>(null);
  // Global audio state
  const isPlayingRef = useRef(false);
  const turntableIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const djs = useMemo(() => [
    {
      id: 1,
      name: "DJ CyberStorm",
      archetype: "Firestorm",
      genre: "Hard Dance",
      track: "Digital Inferno",
      bpm: 140,
      gradient: "from-red-500 via-orange-500 to-yellow-500",
      color: "text-red-400",
      status: "🔴 LIVE",
      followers: "12.3K",
      setTime: "60 min",
      location: "Miami, FL",
      achievements: ["🏆 Ultra Rising Star", "🎵 Beatport #1"]
    },
    {
      id: 2,
      name: "Bass Dreamer",
      archetype: "FrostPulse",
      genre: "Future Bass",
      track: "Glacial Waves",
      bpm: 110,
      gradient: "from-cyan-400 via-blue-500 to-purple-500",
      color: "text-cyan-400",
      status: "🟡 UP NEXT",
      followers: "8.7K",
      setTime: "45 min",
      location: "Berlin, DE",
      achievements: ["🌊 Bass Pioneer", "❄️ Arctic Vibes"]
    },
    {
      id: 3,
      name: "Neon Pulse",
      archetype: "MoonWaver",
      genre: "Ambient Trance",
      track: "Cosmic Dreams",
      bpm: 126,
      gradient: "from-purple-500 via-pink-500 to-indigo-500",
      color: "text-purple-400",
      status: "⏰ LATER",
      followers: "15.9K",
      setTime: "75 min",
      location: "Ibiza, ES",
      achievements: ["🌙 Moonbeam Master", "🪐 Cosmic Journey"]
    },
    {
      id: 4,
      name: "Phoenix Rise",
      archetype: "Firestorm",
      genre: "Progressive House",
      track: "Solar Flare",
      bpm: 132,
      gradient: "from-orange-500 via-red-500 to-pink-500",
      color: "text-orange-400",
      status: "🟢 STANDBY",
      followers: "21.1K",
      setTime: "90 min",
      location: "Tomorrowland",
      achievements: ["🔥 Phoenix Legend", "🎪 Festival Favorite"]
    }
  ], []);

  // Initialize audio context
  const initAudioContext = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }
    return audioContextRef.current;
  };

  // Generate beat pattern for DJ preview
  const generateDJBeat = async (dj: typeof djs[0]) => {
    const audioContext = initAudioContext();
    const duration = 8; // 8 seconds of audio
    const sampleRate = audioContext.sampleRate;
    const beatLength = 60 / dj.bpm; // seconds per beat
    const buffer = audioContext.createBuffer(2, duration * sampleRate, sampleRate);
    
    for (let channel = 0; channel < 2; channel++) {
      const channelData = buffer.getChannelData(channel);
      
      for (let i = 0; i < channelData.length; i++) {
        const time = i / sampleRate;
        const beatTime = (time % beatLength) / beatLength;
        
        let sample = 0;
        
        // Different beat patterns based on archetype
        if (dj.archetype === 'Firestorm') {
          // Hard dance style - aggressive kick pattern
          const kickPattern = beatTime < 0.1 ? Math.exp(-beatTime * 50) : 0;
          const hihat = (beatTime % 0.25 < 0.05) ? Math.random() * 0.3 : 0;
          sample = kickPattern * 0.8 + hihat;
          
          // Add some distortion
          if (Math.abs(sample) > 0.5) {
            sample = Math.sign(sample) * (0.5 + Math.abs(sample - 0.5) * 0.3);
          }
        } else if (dj.archetype === 'FrostPulse') {
          // Future bass style - smoother, with wobbles
          const wobbleFreq = 2 + Math.sin(time * 0.5) * 1;
          const wobble = Math.sin(time * wobbleFreq * 2 * Math.PI) * 0.3;
          const kick = beatTime < 0.15 ? Math.exp(-beatTime * 30) : 0;
          sample = kick * 0.6 + wobble * 0.4;
        } else {
          // MoonWaver - ambient trance style
          const ambient = Math.sin(time * 110 * 2 * Math.PI) * 0.2;
          const reverb = Math.sin(time * 55 * 2 * Math.PI) * 0.1;
          const kick = beatTime < 0.2 ? Math.exp(-beatTime * 20) : 0;
          sample = kick * 0.4 + ambient + reverb;
        }
        
        channelData[i] = sample * 0.5; // Reduce volume
      }
    }
    
    return buffer;
  };

  // Play DJ preview
  const handleDJPreview = async (dj: typeof djs[0]) => {
    try {
      // Always stop any currently playing track first to prevent overlap
      if (currentTrackRef.current) {
        currentTrackRef.current.source.stop();
        currentTrackRef.current.source.disconnect();
        currentTrackRef.current = null;
      }

      // If the same DJ is clicked and was playing, just stop (toggle off)
      if (selectedDJ === dj.id && isPlaying) {
        setIsPlaying(false);
        setSelectedDJ(null);
        isPlayingRef.current = false;
        toast.success('⏸️ Preview stopped');
        return;
      }

      // Start playing the new track (either different DJ or same DJ restarting)
      const audioContext = initAudioContext();
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }

      const buffer = await generateDJBeat(dj);
      const source = audioContext.createBufferSource();
      const gainNode = audioContext.createGain();

      source.buffer = buffer;
      source.loop = true;
      source.connect(gainNode);
      gainNode.connect(audioContext.destination);
      gainNode.gain.value = isMuted ? 0 : 0.3;

      source.onended = () => {
        if (selectedDJ === dj.id) {
          setIsPlaying(false);
          setSelectedDJ(null);
          isPlayingRef.current = false;
        }
      };

      source.start(0);
      currentTrackRef.current = { source, gainNode };

      setSelectedDJ(dj.id);
      setCurrentBPM(dj.bpm);
      setIsPlaying(true);
      isPlayingRef.current = true;

      toast.success(`🎵 Now playing: ${dj.track} by ${dj.name}`);
    } catch (error) {
      console.error('Error playing DJ preview:', error);
      toast.error('Failed to play preview');
      setIsPlaying(false);
      setSelectedDJ(null);
      isPlayingRef.current = false;
    }
  };

  // Stop current track
  const stopCurrentTrack = () => {
    try {
      if (currentTrackRef.current) {
        const { source, gainNode } = currentTrackRef.current;
        if (source) {
          source.stop();
          source.disconnect();
        }
        if (gainNode) {
          gainNode.disconnect();
        }
        currentTrackRef.current = null;
      }
    } catch (error) {
      console.warn('Error stopping current track:', error);
    }

    isPlayingRef.current = false;
    setIsPlaying(false);
    setSelectedDJ(null);
  };
  
  // Global stop audio function
  const stopAllAudio = () => {
    try {
      // Stop current track
      stopCurrentTrack();

      // Clear any turntable intervals
      if (turntableIntervalRef.current) {
        clearInterval(turntableIntervalRef.current);
        turntableIntervalRef.current = null;
      }

      // Reset BPM to default
      setCurrentBPM(128);

      toast.success('⏹️ All audio stopped');
    } catch (error) {
      console.error('Error stopping all audio:', error);
      toast.error('Error stopping audio');
    }
  };

  // Toggle play/pause
  const togglePlayback = () => {
    if (isPlaying) {
      stopCurrentTrack();
    } else if (selectedDJ) {
      const dj = djs.find(d => d.id === selectedDJ);
      if (dj) {
        handleDJPreview(dj);
      }
    } else {
      // If no DJ selected, start with the first DJ
      handleDJPreview(djs[0]);
    }
  };

  // Send chat message
  const sendMessage = () => {
    if (!newMessage.trim() || !user) return;
    
    const message = {
      id: Date.now().toString(),
      username: profile?.username || 'Anonymous Raver',
      message: newMessage.trim(),
      timestamp: new Date()
    };
    
    setChatMessages(prev => [...prev.slice(-9), message]); // Keep last 10 messages
    setNewMessage("");
    toast.success('🎤 Shout-out sent!');
  };

  const handleVote = async (djId: number) => {
    if (!user) {
      toast.error("Please sign in to vote!");
      return;
    }
    
    const djData = djs.find(dj => dj.id === djId);
    if (!djData) return;
    
    // Check if user already voted for this DJ
    if (userVotes.has(djData.name)) {
      toast.error(`You already voted for ${djData.name}!`);
      return;
    }
    
    setIsVoting(true);
    try {
      // Submit vote using the new Edge Function
      const voteWeight = profile?.archetype === djData.archetype ? 2 : 1;
      const result = await festivalOperations.submitVote(user.id, djData.name, voteWeight);
      
      if (result.success) {
        // Add to user votes set (real-time updates will handle vote counts)
        setUserVotes(prev => new Set([...prev, djData.name]));
        
        // Visual feedback
        setShowConfetti(true);
        setLightBurst(true);
        setTimeout(() => {
          setShowConfetti(false);
          setLightBurst(false);
        }, 2000);
        
        // Show success message
        if (voteWeight === 2) {
          toast.success(`Double vote for ${djData.name}! Archetype match bonus!`, {
            icon: "⚡"
          });
        } else {
          toast.success(`Voted for ${djData.name}!`);
        }
      } else {
        // Handle specific error cases
        if (result.error?.includes('24 hours') || result.error?.includes('frequently')) {
          toast.error(`⏰ ${result.error}`, {
            description: result.nextVoteAllowed ? `Try again after ${new Date(result.nextVoteAllowed).toLocaleString()}` : undefined,
            duration: 5000
          });
        } else {
          toast.error(result.error || 'Failed to submit vote');
        }
      }
    } catch (error) {
      console.error('Error voting:', error);
      toast.error('Failed to submit vote');
    } finally {
      setIsVoting(false);
    }
  };

  // Generate turntable sound effects
  const generateTurntableEffect = async (type: 'scratch' | 'echo') => {
    try {
      const audioContext = initAudioContext();
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }

      const duration = type === 'scratch' ? 0.5 : 1.0;
      const buffer = audioContext.createBuffer(2, duration * audioContext.sampleRate, audioContext.sampleRate);
      
      for (let channel = 0; channel < 2; channel++) {
        const channelData = buffer.getChannelData(channel);
        
        for (let i = 0; i < channelData.length; i++) {
          const time = i / audioContext.sampleRate;
          let sample = 0;
          
          if (type === 'scratch') {
            // Scratch sound - noise with pitch bend
            const pitch = 200 + Math.sin(time * 50) * 100;
            const noise = (Math.random() - 0.5) * 0.5;
            const tone = Math.sin(time * pitch * 2 * Math.PI) * 0.3;
            sample = (noise + tone) * Math.exp(-time * 3);
          } else {
            // Echo effect - repeating tone
            const baseFreq = 110;
            const echo1 = Math.sin(time * baseFreq * 2 * Math.PI) * Math.exp(-time * 2);
            const echo2 = Math.sin((time - 0.2) * baseFreq * 2 * Math.PI) * Math.exp(-(time - 0.2) * 2) * 0.5;
            const echo3 = Math.sin((time - 0.4) * baseFreq * 2 * Math.PI) * Math.exp(-(time - 0.4) * 2) * 0.25;
            sample = (echo1 + (time > 0.2 ? echo2 : 0) + (time > 0.4 ? echo3 : 0)) * 0.3;
          }
          
          channelData[i] = sample;
        }
      }
      
      // Play the effect
      const source = audioContext.createBufferSource();
      const gainNode = audioContext.createGain();
      source.buffer = buffer;
      source.connect(gainNode);
      gainNode.connect(audioContext.destination);
      gainNode.gain.value = isMuted ? 0 : 0.5;
      source.start();
      
    } catch (error) {
      console.error('Error generating turntable effect:', error);
    }
  };

  const handleTurntableInteraction = async (action: 'scratch' | 'echo') => {
    // Generate sound effect
    await generateTurntableEffect(action);
    
    // Visual effects
    if (action === 'scratch') {
      setCurrentBPM(prev => prev + 5);
      setTimeout(() => setCurrentBPM(prev => prev - 5), 500);
      toast.success('🎛️ Scratch!');
    } else {
      toast.success('🔊 Echo effect!');
    }
    
    setLightBurst(true);
    setTimeout(() => setLightBurst(false), 1000);
  };

  // Update volume when mute changes
  useEffect(() => {
    if (currentTrackRef.current) {
      currentTrackRef.current.gainNode.gain.value = isMuted ? 0 : 0.3;
    }
  }, [isMuted]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      try {
        // Stop current track
        if (currentTrackRef.current) {
          const { source, gainNode } = currentTrackRef.current;
          if (source) {
            source.stop();
            source.disconnect();
          }
          if (gainNode) {
            gainNode.disconnect();
          }
        }

        // Clear turntable interval
        if (turntableIntervalRef.current) {
          clearInterval(turntableIntervalRef.current);
        }

        // Close audio context if it exists
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
          audioContextRef.current.close();
        }
      } catch (error) {
        console.warn('Error during audio cleanup:', error);
      }
    };
  }, []);

  // Load user's existing votes
  useEffect(() => {
    const loadUserVotes = async () => {
      if (!user) return;
      
      try {
        const votes = await festivalOperations.getUserVotes(user.id);
        setUserVotes(new Set(votes.map(v => v.dj_id)));
      } catch (error) {
        console.error('Error loading user votes:', error);
      }
    };
    
    loadUserVotes();
  }, [user]);

  // Load real-time vote counts for each DJ and set up real-time subscription
  useEffect(() => {
    const loadVoteCounts = async () => {
      const newVotes: {[key: number]: number} = {};
      
      for (const dj of djs) {
        try {
          const stats = await festivalOperations.getVotingStats(dj.name);
          newVotes[dj.id] = stats.totalWeight;
        } catch (error) {
          console.error(`Error loading votes for ${dj.name}:`, error);
          newVotes[dj.id] = 0;
        }
      }
      
      setVotes(newVotes);
    };

    // Load initial vote counts
    loadVoteCounts();

    // Set up real-time subscription for all vote updates
    const channel = festivalOperations.subscribeToAllVotes((payload) => {
      console.log('Real-time vote update:', payload);
      
      // Reload vote counts when any vote changes
      loadVoteCounts();
    });
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [djs]);

  useEffect(() => {
    // Check for headliner after votes
    const maxVotes = Math.max(...Object.values(votes));
    const headlinerId = Object.entries(votes).find(([_, v]) => v === maxVotes)?.[0];
    if (headlinerId && maxVotes > 1500) {
      setHeadliner(parseInt(headlinerId));
    }
  }, [votes, djs]);

  const selectedDJData = djs.find(dj => dj.id === selectedDJ);

  return (
      <div className="min-h-screen bg-bass-dark relative pb-20 overflow-hidden">
      {/* Visual FX Layers */}
      <FestivalEnvironment 
        currentArchetype={currentArchetype}
        className="z-0"
      />
      <FestivalStageBackground 
        archetype={currentArchetype} 
        bpm={currentBPM} 
        intensity="high" 
      />
      <LightSyncPulse 
        bpm={currentBPM} 
        intensity="intense" 
        triggerBurst={lightBurst} 
      />
      <ShuffleDancers 
        bpm={currentBPM} 
        dancerCount={8} 
        intensity="high" 
      />
      <ArchetypeAuraSprite 
        archetype={currentArchetype} 
        bpm={currentBPM} 
        intensity={90} 
        position="top-left" 
      />

      {/* Festival Arena Background */}
      <div className="absolute inset-0 opacity-30">
        {/* Crowd Silhouettes */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/80 to-transparent">
          <div className="absolute bottom-0 w-full h-16 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse" />
        </div>
        
        {/* Dynamic Background based on selected DJ */}
        <motion.div
          className="absolute inset-0"
          animate={{
            background: selectedDJData 
              ? `linear-gradient(135deg, ${selectedDJData.gradient.replace('from-', '').replace(' via-', ', ').replace(' to-', ', ')} 0.1)`
              : "radial-gradient(circle at center, rgba(191, 90, 242, 0.2) 0%, rgba(2, 6, 23, 1) 70%)"
          }}
          transition={{ duration: 1 }}
        />

        {/* Laser Effects */}
        {Array.from({ length: 6 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute inset-0"
            style={{
              background: `conic-gradient(from ${i * 60}deg, transparent 0%, rgba(191, 90, 242, 0.3) 1%, transparent 2%)`
            }}
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 8 + i, repeat: Infinity, ease: "linear" }}
          />
        ))}
        
        {/* Drone Formations */}
        <DroneFormations 
          isActive={true}
          className="z-5"
        />
      </div>

      {/* Festival Content */}
      <div className="relative z-10 p-4 pt-8">
        {/* Festival Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-2">
            <span className="text-transparent bg-gradient-to-r from-neon-purple via-neon-cyan to-neon-purple bg-clip-text">
              🪩 EDM SHUFFLE MAINSTAGE
            </span>
          </h1>
          <p className="text-neon-cyan text-lg">Live from the Digital Ultra Arena</p>
        </motion.div>

        {/* Music Controller */}
        <motion.div
          className="fixed top-4 right-4 bg-bass-medium/90 backdrop-blur-sm rounded-lg p-3 flex items-center gap-3 z-30 border border-neon-purple/20"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <EqualizerBars barCount={5} className="h-6" />
          <div className="text-sm">
            <div className="text-white font-semibold">
              {selectedDJData?.track || "Festival Mix"}
            </div>
            <div className="text-neon-cyan">{currentBPM} BPM</div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={togglePlayback}
              className="text-neon-purple hover:text-neon-cyan transition-colors"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="text-neon-purple hover:text-neon-cyan transition-colors"
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
            <button
              onClick={stopAllAudio}
              className="text-neon-purple hover:text-neon-cyan transition-colors"
              title="Stop all audio"
            >
              <VolumeX className="w-5 h-5" />
            </button>
          </div>
        </motion.div>

        {/* PLURcrew Corner */}
        <motion.div
          className="fixed top-4 left-4 bg-bass-medium/90 backdrop-blur-sm rounded-lg p-3 z-30 border border-neon-purple/20"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="text-sm text-neon-cyan">
            {profile?.archetype === 'Firestorm' ? '🔥' : 
             profile?.archetype === 'FrostPulse' ? '❄️' : 
             profile?.archetype === 'MoonWaver' ? '🌙' : '🎴'} {profile?.username || 'Raver'}
          </div>
          <div className="text-xs text-slate-400">
            {profile?.archetype || 'Festival Supporter'} • Level {profile?.level || 1}
          </div>
        </motion.div>

        {/* DJ Stage */}
        <div className="mb-8">
          <motion.div
            className="bg-gradient-to-b from-bass-medium/50 to-bass-dark/80 rounded-2xl p-6 border border-neon-purple/20"
            animate={{
              boxShadow: selectedDJ 
                ? "0 0 40px rgba(191, 90, 242, 0.5)" 
                : "0 0 20px rgba(191, 90, 242, 0.2)"
            }}
          >
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold text-white mb-2">🎤 Featured Artists</h2>
              <p className="text-slate-300 mb-4">Discover up-and-coming DJs and live performers</p>
              <div className="flex justify-center gap-4 mb-4">
                <NeonButton onClick={stopAllAudio} variant="secondary" size="sm">
                  🛑 Stop All Audio
                </NeonButton>
                {headliner && (
                  <Badge className="bg-gradient-to-r from-neon-purple to-neon-cyan text-white px-4 py-2 text-lg">
                    <Crown className="w-4 h-4 mr-2" />
                    Headliner: {djs.find(d => d.id === headliner)?.name}
                  </Badge>
                )}
              </div>
              
              {/* Live Stats */}
              <div className="flex justify-center gap-6 text-sm text-slate-400">
                <div>🔴 <span className="text-red-400">1</span> Live</div>
                <div>👥 <span className="text-neon-cyan">47.2K</span> Watching</div>
                <div>🎵 <span className="text-neon-purple">{chatMessages.length}</span> Messages</div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {djs.map((dj, index) => (
                <motion.div
                  key={dj.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative"
                >
                  <Card 
                    className={`cursor-pointer transition-all duration-300 ${
                      selectedDJ === dj.id 
                        ? 'ring-2 ring-white ring-opacity-50 scale-105' 
                        : 'hover:scale-102'
                    }`}
                    onClick={() => handleDJPreview(dj)}
                  >
                    <CardContent className="p-4 text-center">
                      {/* Spotlight Effect */}
                      {selectedDJ === dj.id && (
                        <motion.div
                          className="absolute -inset-2 rounded-lg"
                          style={{
                            background: `linear-gradient(135deg, ${dj.gradient})`
                          }}
                          animate={{ opacity: [0.3, 0.6, 0.3] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        />
                      )}
                      
                      <div className="relative z-10">
                        {/* Status Badge */}
                        <div className="absolute -top-2 -right-2 text-xs bg-bass-dark/80 px-2 py-1 rounded-full border border-neon-purple/30">
                          {dj.status}
                        </div>
                        
                        <div className="text-4xl mb-2">
                          {dj.archetype === 'Firestorm' ? '🔥' : 
                           dj.archetype === 'FrostPulse' ? '❄️' : '🌙'}
                        </div>
                        <h3 className={`font-bold ${dj.color} mb-1`}>{dj.name}</h3>
                        <div className="text-xs text-slate-300 mb-1">{dj.location}</div>
                        <Badge className="mb-2 text-xs">{dj.archetype}</Badge>
                        
                        {/* Performance Stats */}
                        <div className="text-xs text-slate-400 mb-2 space-y-1">
                          <div>{dj.genre} • {dj.bpm} BPM</div>
                          <div className="flex justify-between">
                            <span>👥 {dj.followers}</span>
                            <span>⏱️ {dj.setTime}</span>
                          </div>
                        </div>
                        
                        {/* Current Track */}
                        <div className="text-sm text-white mb-2 font-medium">{dj.track}</div>
                        
                        {/* Achievements */}
                        <div className="text-xs mb-3">
                          {dj.achievements.slice(0, 1).map((achievement, i) => (
                            <div key={i} className="text-neon-cyan bg-neon-cyan/20 px-2 py-1 rounded-full inline-block">
                              {achievement}
                            </div>
                          ))}
                        </div>
                        
                        <div className="space-y-2">
                          <NeonButton
                            size="sm"
                            onClick={() => handleDJPreview(dj)}
                            className="w-full text-xs"
                            variant={selectedDJ === dj.id ? "primary" : "secondary"}
                          >
                            {selectedDJ === dj.id && isPlaying ? "🔊 Playing" : "🎧 Preview"}
                          </NeonButton>
                          <NeonButton
                            variant={userVotes.has(dj.name) ? "secondary" : "primary"}
                            size="sm"
                            onClick={() => handleVote(dj.id)}
                            className="w-full text-xs"
                            disabled={isVoting || userVotes.has(dj.name)}
                          >
                            {userVotes.has(dj.name) ? (
                              <>✓ Voted ({votes[dj.id] || 0})</>
                            ) : (
                              <>🔥 Vote ({votes[dj.id] || 0})</>
                            )}
                          </NeonButton>
                          
                          {/* Show bonus indicator for archetype match */}
                          {profile?.archetype === dj.archetype && !userVotes.has(dj.name) && (
                            <div className="text-xs text-neon-cyan mt-1">
                              ⚡ 2x Vote Power (Archetype Match)
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Festival Celebration */}
        <motion.div
          className="mb-8 text-center"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <motion.button
            className="bg-gradient-to-r from-neon-purple to-neon-cyan text-white px-8 py-4 rounded-full font-bold text-lg shadow-lg"
            whileHover={{ scale: 1.1, boxShadow: "0 0 30px rgba(191, 90, 242, 0.6)" }}
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              setShowConfetti(true);
              setLightBurst(true);
              setTimeout(() => {
                setShowConfetti(false);
                setLightBurst(false);
              }, 2000);
              toast.success('🎉 Festival vibes activated!');
            }}
          >
            <Zap className="w-6 h-6 mr-2 inline" />
            Hype Up The Crowd
          </motion.button>
        </motion.div>

        {/* Festival Chat */}
        <motion.div
          className="fixed bottom-24 right-4 bg-bass-medium/90 backdrop-blur-sm rounded-lg p-3 max-w-72 z-30 border border-neon-purple/20"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-neon-purple" />
            <span className="text-sm text-neon-purple font-semibold">🪩 Festival Chat</span>
          </div>
          
          {/* Chat Messages */}
          <div className="space-y-1 max-h-32 overflow-y-auto mb-2">
            {chatMessages.length === 0 ? (
              <div className="text-xs text-slate-400 italic">
                Be the first to hype up the crowd! 🎉
              </div>
            ) : (
              chatMessages.map((msg) => (
                <motion.div
                  key={msg.id}
                  className="text-xs"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <span className="text-neon-cyan font-semibold">{msg.username}: </span>
                  <span className="text-slate-300">{msg.message}</span>
                </motion.div>
              ))
            )}
          </div>
          
          {/* Message Input */}
          {user ? (
            <div className="flex gap-1">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Send a shout-out..."
                className="flex-1 h-6 text-xs bg-bass-dark/50 border-neon-purple/30 text-white placeholder-slate-400"
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                maxLength={100}
              />
              <button
                onClick={sendMessage}
                disabled={!newMessage.trim()}
                className="px-2 py-1 bg-neon-purple/20 hover:bg-neon-purple/40 rounded text-neon-purple disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <div className="text-xs text-slate-400 text-center">
              Sign in to join the chat! 💬
            </div>
          )}
        </motion.div>

        {/* Confetti Animation */}
        <AnimatePresence>
          {showConfetti && (
            <div className="fixed inset-0 pointer-events-none z-30">
              {Array.from({ length: 20 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute text-2xl"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 50}%`,
                  }}
                  initial={{ opacity: 1, scale: 0 }}
                  animate={{ 
                    opacity: 0, 
                    scale: 1,
                    y: 200,
                    rotate: 360
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 2 }}
                >
                  {['🎉', '✨', '🔥', '💫', '⚡'][Math.floor(Math.random() * 5)]}
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>

      <BottomNavigation />
      </div>
  );
};

export default FestivalVotingStage;
