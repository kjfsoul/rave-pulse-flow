
import { motion } from "framer-motion";
import { useAudioContext } from "@/contexts/AudioContext";

interface EqualizerLiveProps {
  bpm?: number;
  bars?: number;
  className?: string;
  height?: number;
  useAudioBpm?: boolean;
}

const EqualizerLive = ({ 
  bpm, 
  bars = 12, 
  className = "", 
  height = 60,
  useAudioBpm = false
}: EqualizerLiveProps) => {
  let audioContext = null;
  
  // Only use audio context if explicitly requested and available
  try {
    if (useAudioBpm) {
      audioContext = useAudioContext();
    }
  } catch {
    // Audio context not available, continue with prop BPM
  }

  // Use audio BPM if available and requested, otherwise fall back to prop
  const activeBpm = (useAudioBpm && audioContext) ? audioContext.bpm : (bpm || 128);
  
  // Convert BPM to animation duration (beats per second)
  // 60 BPM = 1 beat/sec, 120 BPM = 2 beats/sec
  const beatsPerSecond = activeBpm / 60;
  const animationDuration = 1 / beatsPerSecond; // Duration for one beat cycle

  return (
    <div className={`flex items-end justify-center space-x-1 ${className}`}>
      {Array.from({ length: bars }).map((_, index) => {
        // Create varied heights for more realistic equalizer effect
        const baseHeight = Math.random() * 0.3 + 0.2; // 20-50% of max height
        const peakHeight = Math.random() * 0.5 + 0.5; // 50-100% of max height
        const minHeight = Math.random() * 0.2 + 0.1; // 10-30% of max height
        
        return (
          <motion.div
            key={index}
            className="bg-gradient-to-t from-neon-purple via-neon-cyan to-white rounded-t-sm relative overflow-hidden"
            style={{
              width: '3px',
              minHeight: '4px',
            }}
            animate={{
              height: [
                minHeight * height,
                peakHeight * height,
                baseHeight * height,
                peakHeight * height * 0.8,
                minHeight * height,
              ],
              opacity: [0.6, 1, 0.7, 0.9, 0.6],
            }}
            transition={{
              duration: animationDuration * 2, // Full cycle over 2 beats
              repeat: Infinity,
              delay: index * (animationDuration / bars), // Stagger each bar
              ease: "easeInOut",
            }}
          >
            {/* Glow Effect - intensity varies with BPM */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-t from-neon-purple/40 to-neon-cyan/40 blur-sm"
              animate={{
                opacity: [0.2, 0.6, 0.2],
              }}
              transition={{
                duration: animationDuration,
                repeat: Infinity,
                delay: index * (animationDuration / (bars * 2)),
              }}
            />
          </motion.div>
        );
      })}
    </div>
  );
};

export default EqualizerLive;

// Usage Examples:
// <EqualizerLive bpm={120} bars={16} className="h-12" />
// <EqualizerLive useAudioBpm={true} bars={8} height={40} className="w-32" />
// <EqualizerLive bpm={150} bars={20} height={80} className="mx-auto" />

/* 
Storybook Examples:

// Using static BPM
<EqualizerLive bpm={90} bars={10} height={50} className="mb-4" />
<EqualizerLive bpm={120} bars={15} height={60} className="mb-4" />
<EqualizerLive bpm={150} bars={20} height={70} className="mb-4" />

// Using audio context BPM
<EqualizerLive useAudioBpm={true} bars={12} height={60} className="mb-4" />

Key Features:
- BPM-driven animation speed (90 BPM = slower, 150 BPM = faster)
- Can sync to audio context BPM or use static prop BPM
- Configurable bar count and height
- Mathematical timing, with optional audio dependency
- Reusable across all views
- Staggered bar animations for realistic effect
- Responsive glow effects that scale with BPM

File path: src/components/EqualizerLive.tsx
Dependencies: framer-motion (already installed)
New context dependency: AudioContext
ESLint compatible: TypeScript interfaces, proper prop types
*/
