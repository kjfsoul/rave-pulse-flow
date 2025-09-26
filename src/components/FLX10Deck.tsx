import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Zap, Volume2 } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { useAudioEngine } from '@/audio/hooks/useAudioEngine';
import { FF_AUDIO_ENGINE } from '@/config/features';

interface ControlsState {
  volume: number;
  pitch: number;
  filter: number;
  isPlaying: boolean;
  isSynced: boolean;
  hotCues: boolean[];
  // Added for new EQ controls
  low: number;
  mid: number;
  high: number;
}

interface FLX10DeckProps {
  deckId: 'A' | 'B';
  audioBuffer: AudioBuffer | null;
  controls: ControlsState;
  trackTitle?: string;
  bpm?: number;
  onControlChange: (key: string, value: any) => void;
  onHotCueTrigger: (index: number) => void;
}

const FLX10Deck: React.FC<FLX10DeckProps> = ({
  deckId,
  audioBuffer,
  controls: initialControls,
  trackTitle = 'No Track Loaded',
  bpm = 128,
  onControlChange: onControlChangeProp,
  onHotCueTrigger,
}) => {
  const { audioEngine } = useAudioEngine() ?? {};
  const deck = deckId === 'A' ? audioEngine?.deckA : audioEngine?.deckB;

  const [controls, setControls] = useState(initialControls);

  useEffect(() => {
    if (FF_AUDIO_ENGINE && deck) {
      deck.load('oscillator');
      const initialEQ = { low: 50, mid: 50, high: 50 };
      deck.setEQ(initialEQ);
      setControls(prev => ({...prev, ...initialEQ}));
    }
  }, [deck]);

  const onControlChange = (key: keyof ControlsState, value: any) => {
    const newControls = { ...controls, [key]: value };
    setControls(newControls);

    if (FF_AUDIO_ENGINE && audioEngine && deck) {
      if (key === 'isPlaying') {
        if (audioEngine.audioContext.state === 'suspended') {
          audioEngine.audioContext.resume();
        }
        if (value) deck.play();
        else deck.pause();
      } else if (key === 'pitch') {
        const rate = 1 + (value as number) / 100;
        deck.setRate(rate);
      } else if (key === 'low' || key === 'mid' || key === 'high') {
        deck.setEQ({
          low: newControls.low ?? 50,
          mid: newControls.mid ?? 50,
          high: newControls.high ?? 50,
        });
      }
    } else {
      onControlChangeProp(key, value);
    }
  };

  const [jogRotation, setJogRotation] = useState(0);
  const [isDraggingJog, setIsDraggingJog] = useState(false);
  const [pressedPad, setPressedPad] = useState<number | null>(null);
  const jogRef = useRef<HTMLDivElement>(null);

  // Continuous jog wheel rotation when playing
  useEffect(() => {
    if (!controls.isPlaying) return;
    
    const interval = setInterval(() => {
      setJogRotation(prev => (prev + (bpm / 60) * 2) % 360);
    }, 16); // ~60fps
    
    return () => clearInterval(interval);
  }, [controls.isPlaying, bpm]);

  const handleJogWheel = (e: React.MouseEvent) => {
    if (!isDraggingJog) return;
    
    const rect = jogRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
    const degrees = (angle * 180) / Math.PI + 90;
    
    setJogRotation(degrees);
  };

  const renderWaveformSkeleton = () => (
    <div className="h-16 bg-bass-dark/50 border border-neon-purple/30 rounded-lg overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-neon-cyan/20 to-transparent animate-shimmer" />
      <div className="flex items-end justify-center h-full px-2 gap-1">
        {Array.from({ length: 64 }).map((_, i) => (
          <div
            key={i}
            className="flex-1 bg-neon-cyan/30 animate-pulse rounded-sm"
            style={{
              height: `${Math.random() * 60 + 20}%`,
              animationDelay: `${i * 0.05}s`
            }}
          />
        ))}
      </div>
      <div className="absolute top-2 left-2 text-xs text-neon-cyan/60">
        WAVEFORM {audioBuffer ? 'LOADED' : 'SKELETON'}
      </div>
    </div>
  );

  return (
    <motion.div
      className="bg-bass-medium/90 backdrop-blur-lg border border-neon-purple/40 rounded-2xl p-6 space-y-6 shadow-2xl relative overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Background Glow */}
      <div className={`absolute inset-0 bg-gradient-to-br ${
        deckId === 'A' ? 'from-neon-cyan/5 to-neon-purple/5' : 'from-neon-purple/5 to-neon-pink/5'
      } rounded-2xl`} />
      
      {/* LCD Display */}
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-neon-cyan font-bold text-lg">DECK {deckId}</h3>
          <div className="flex items-center gap-2">
            <div className="text-xs text-neon-cyan bg-bass-dark px-2 py-1 rounded">
              {Math.round(bpm * (1 + controls.pitch / 100))} BPM
            </div>
            {controls.isSynced && (
              <motion.div 
                className="text-xs text-neon-green bg-bass-dark px-2 py-1 rounded"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                SYNC
              </motion.div>
            )}
          </div>
        </div>
        
        {/* Track Info */}
        <div className="bg-bass-dark/80 border border-neon-purple/30 rounded-lg p-3 mb-4">
          <div className="text-white font-medium truncate">{trackTitle}</div>
          <div className="text-neon-cyan/70 text-sm">
            Original: {bpm} BPM • Current: {Math.round(bpm * (1 + controls.pitch / 100))} BPM
          </div>
        </div>

        {/* Waveform Display */}
        {renderWaveformSkeleton()}
      </div>

      {/* Performance Pads */}
      <div className="grid grid-cols-4 gap-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <motion.button
            key={i}
            className={`h-12 rounded-lg font-bold text-sm transition-all border-2 ${
              controls.hotCues[i]
                ? 'bg-neon-green border-neon-green text-bass-dark shadow-lg shadow-neon-green/30'
                : pressedPad === i
                ? 'bg-neon-purple/50 border-neon-purple text-white'
                : 'bg-bass-dark/60 border-neon-purple/30 text-neon-purple hover:border-neon-purple/60'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onMouseDown={() => setPressedPad(i)}
            onMouseUp={() => setPressedPad(null)}
            onMouseLeave={() => setPressedPad(null)}
            onClick={() => onHotCueTrigger(i)}
          >
            HOT CUE {i + 1}
          </motion.button>
        ))}
      </div>

      {/* EQ & Control Knobs Row */}
      <div className="grid grid-cols-3 gap-4">
        {/* Low EQ */}
        <div className="space-y-2">
          <label className="block text-neon-cyan text-sm font-medium">
            LOW {controls.low}%
          </label>
          <Slider
            value={[controls.low]}
            onValueChange={(value) => onControlChange('low', value[0])}
            max={100}
            step={1}
            className="w-full"
          />
        </div>
        {/* Mid EQ */}
        <div className="space-y-2">
          <label className="block text-neon-cyan text-sm font-medium">
            MID {controls.mid}%
          </label>
          <Slider
            value={[controls.mid]}
            onValueChange={(value) => onControlChange('mid', value[0])}
            max={100}
            step={1}
            className="w-full"
          />
        </div>
        {/* High EQ */}
        <div className="space-y-2">
          <label className="block text-neon-cyan text-sm font-medium">
            HIGH {controls.high}%
          </label>
          <Slider
            value={[controls.high]}
            onValueChange={(value) => onControlChange('high', value[0])}
            max={100}
            step={1}
            className="w-full"
          />
        </div>
      </div>

      {/* Pitch Fader */}
      <div className="flex items-center gap-4">
        <div className="flex-1 space-y-2">
          <label className="block text-neon-cyan text-sm font-medium">
            PITCH {controls.pitch > 0 ? '+' : ''}{controls.pitch}%
          </label>
          <Slider
            value={[controls.pitch]}
            onValueChange={(value) => onControlChange('pitch', value[0])}
            min={-100}
            max={100}
            step={0.1}
            className="w-full"
            orientation="vertical"
          />
        </div>
      </div>

      {/* Transport Buttons */}
      <div className="flex gap-3">
        <motion.button
          className={`flex-1 py-3 px-4 rounded-xl font-bold transition-all border-2 ${
            controls.isPlaying
              ? 'bg-neon-cyan border-neon-cyan text-bass-dark shadow-lg shadow-neon-cyan/30'
              : 'bg-bass-dark border-neon-purple/50 text-neon-purple hover:border-neon-purple'
          }`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onControlChange('isPlaying', !controls.isPlaying)}
        >
          <div className="flex items-center justify-center gap-2">
            {controls.isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            {controls.isPlaying ? 'PAUSE' : 'PLAY'}
          </div>
        </motion.button>

        <motion.button
          className="px-6 py-3 rounded-xl font-bold bg-bass-dark border-2 border-neon-purple/50 text-neon-purple hover:border-neon-purple transition-all"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            // Reset to start logic would go here
          }}
        >
          <RotateCcw className="w-5 h-5" />
        </motion.button>

        <motion.button
          className={`px-6 py-3 rounded-xl font-bold transition-all border-2 ${
            controls.isSynced
              ? 'bg-neon-green border-neon-green text-bass-dark shadow-lg shadow-neon-green/30'
              : 'bg-bass-dark border-neon-purple/50 text-neon-purple hover:border-neon-purple'
          }`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onControlChange('isSynced', !controls.isSynced)}
          animate={controls.isSynced ? { 
            boxShadow: [
              '0 0 0 rgba(57, 255, 20, 0)',
              '0 0 20px rgba(57, 255, 20, 0.5)',
              '0 0 0 rgba(57, 255, 20, 0)'
            ]
          } : {}}
          transition={{ duration: 1, repeat: Infinity }}
        >
          <Zap className="w-5 h-5" />
        </motion.button>
      </div>

      {/* Jog Wheel */}
      <div className="flex justify-center">
        <motion.div
          ref={jogRef}
          className="relative w-32 h-32 rounded-full bg-gradient-to-br from-bass-dark to-bass-medium border-4 border-neon-purple/40 cursor-grab active:cursor-grabbing shadow-lg"
          style={{ rotate: jogRotation }}
          animate={controls.isPlaying ? {
            boxShadow: [
              '0 0 20px rgba(191, 90, 242, 0.3)',
              '0 0 40px rgba(191, 90, 242, 0.6)',
              '0 0 20px rgba(191, 90, 242, 0.3)'
            ]
          } : {}}
          transition={{ duration: 2, repeat: Infinity }}
          onMouseDown={() => setIsDraggingJog(true)}
          onMouseUp={() => setIsDraggingJog(false)}
          onMouseMove={handleJogWheel}
          whileHover={{ scale: 1.05 }}
        >
          {/* Jog Wheel Interior */}
          <div className="absolute inset-4 rounded-full bg-bass-dark border-2 border-neon-purple/20 flex items-center justify-center">
            <motion.div
              className="w-8 h-8 rounded-full bg-neon-purple/30 border border-neon-purple"
              animate={controls.isPlaying ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 0.5, repeat: Infinity }}
            />
          </div>
          
          {/* Rotation Indicators */}
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-4 bg-neon-purple/60 rounded"
              style={{
                top: '8px',
                left: '50%',
                transformOrigin: '50% 56px',
                transform: `translateX(-50%) rotate(${i * 45}deg)`
              }}
            />
          ))}
        </motion.div>
      </div>

      {/* Status Bar */}
      <div className="flex justify-between items-center text-xs text-neon-cyan/60 bg-bass-dark/30 rounded-lg p-2">
        <span>DECK {deckId} • FLX10</span>
        <span>{audioBuffer ? 'AUDIO LOADED' : 'NO AUDIO'}</span>
        <span>VOL: {controls.volume}%</span>
      </div>
    </motion.div>
  );
};

export default FLX10Deck;