import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX } from 'lucide-react';
import ConfettiBurst from './ConfettiBurst';

interface CrowdFXLayerProps {
  isEnabled: boolean;
  onToggle: () => void;
  audioContext?: AudioContext;
}

export interface CrowdFXLayerRef {
  triggerEffects: () => void;
}

const CrowdFXLayer = React.forwardRef<CrowdFXLayerRef, CrowdFXLayerProps>(({
  isEnabled,
  onToggle,
  audioContext
}, ref) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const [showFloatingEmojis, setShowFloatingEmojis] = useState(false);
  const [crowdAudio, setCrowdAudio] = useState<HTMLAudioElement | null>(null);

  // Initialize crowd audio
  useEffect(() => {
    const audio = new Audio();
    audio.volume = 0.6;
    audio.preload = 'auto';
    audio.src = '/audio/crowd_cheer.mp3';
    
    // Fallback error handling
    audio.onerror = () => {
      console.log('🎉 Crowd audio file not found, will use synthesized cheer');
    };
    
    setCrowdAudio(audio);
    
    return () => {
      audio.pause();
      audio.src = '';
    };
  }, []);

  const createSynthesizedCheer = useCallback(() => {
    if (!audioContext || !isEnabled) return;

    try {
      // Create synthesized crowd cheer using Web Audio API
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      const noiseBuffer = audioContext.createBuffer(1, 44100 * 0.5, 44100);
      const noiseSource = audioContext.createBufferSource();
      
      // Fill buffer with white noise for crowd effect
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < output.length; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      
      noiseSource.buffer = noiseBuffer;
      noiseSource.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Envelope for realistic crowd cheer
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.3, audioContext.currentTime + 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.1, audioContext.currentTime + 0.3);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      noiseSource.start();
      noiseSource.stop(audioContext.currentTime + 0.5);
      
      console.log('🎉 Synthesized crowd cheer played');
    } catch (error) {
      console.warn('Failed to create synthesized cheer:', error);
    }
  }, [audioContext, isEnabled]);

  const playCheerSound = useCallback(() => {
    if (!isEnabled) return;

    if (crowdAudio) {
      crowdAudio.currentTime = 0;
      crowdAudio.play().catch(() => {
        console.log('🎉 Audio file failed, using synthesized cheer');
        createSynthesizedCheer();
      });
    } else {
      createSynthesizedCheer();
    }
  }, [crowdAudio, isEnabled, createSynthesizedCheer]);

  const triggerAllEffects = useCallback(() => {
    console.log('🔥 Triggering all crowd effects');
    
    // Play crowd cheer sound
    playCheerSound();
    
    // Trigger visual effects
    setShowConfetti(true);
    setShowFloatingEmojis(true);
    
    // Reset effects after duration
    setTimeout(() => {
      setShowConfetti(false);
      setShowFloatingEmojis(false);
    }, 3000);
  }, [playCheerSound]);

  // Expose trigger function to parent
  React.useImperativeHandle(ref, () => ({
    triggerEffects: triggerAllEffects
  }));

  const floatingEmojis = ['👏', '🔥', '❤️', '🙌', '💯', '🎉', '🚀', '⚡', '🎵', '🌟', '🎊', '💃', '🕺', '🎶', '🔊'];

  return (
    <>
      {/* Control Toggle */}
      <motion.button
        onClick={onToggle}
        className={`fixed top-4 right-20 p-2 rounded-lg text-xs z-50 flex items-center gap-1 transition-all ${
          isEnabled 
            ? 'bg-neon-cyan/20 border border-neon-cyan text-neon-cyan' 
            : 'bg-slate-700 text-slate-400 border border-slate-600'
        }`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        title={isEnabled ? "Disable crowd effects" : "Enable crowd effects"}
      >
        {isEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        <span>CROWD FX</span>
      </motion.button>

      {/* Confetti Effect */}
      <AnimatePresence>
        {showConfetti && <ConfettiBurst />}
      </AnimatePresence>

      {/* Floating Emoji Reactions */}
      <AnimatePresence>
        {showFloatingEmojis && (
          <div className="fixed inset-0 pointer-events-none z-40">
            {floatingEmojis.map((emoji, i) => (
              <motion.div
                key={`${emoji}-${i}-${Date.now()}`}
                className="absolute text-4xl"
                style={{
                  left: `${Math.random() * 80 + 10}%`,
                  top: `${Math.random() * 20 + 70}%`
                }}
                initial={{ y: 0, opacity: 1, scale: 1 }}
                animate={{ 
                  y: [-100, -400 - Math.random() * 200],
                  opacity: [1, 1, 0], 
                  scale: [1, 1.2 + Math.random() * 0.5, 0.3],
                  x: [0, (Math.random() - 0.5) * 800],
                  rotate: [0, Math.random() * 1080 - 540]
                }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ 
                  duration: 3 + Math.random() * 2,
                  delay: i * 0.1,
                  ease: "easeOut"
                }}
              >
                {emoji}
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Status Indicator */}
      {!isEnabled && (
        <div className="fixed bottom-32 right-4 bg-slate-700/90 backdrop-blur-sm text-slate-400 px-3 py-2 rounded-lg text-xs z-30">
          🔇 Crowd effects disabled
        </div>
      )}
    </>
  );
});

export default CrowdFXLayer;