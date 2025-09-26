import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAudioEngine } from '@/audio/hooks/useAudioEngine';
import { FF_AUDIO_ENGINE } from '@/config/features';

const LiveEqualizer: React.FC = () => {
  const { audioEngine } = useAudioEngine() ?? {};
  const analyser = audioEngine?.analyser;

  const [isActive, setIsActive] = useState(true); // Default to active
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();

  const drawVisualizer = useCallback(() => {
    if (!canvasRef.current || !analyser) {
      animationFrameRef.current = requestAnimationFrame(drawVisualizer);
      return;
    };

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyser.getNode().frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getTimeDomainData(dataArray);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.7)';
    ctx.beginPath();

    const sliceWidth = canvas.width * 1.0 / bufferLength;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      const v = dataArray[i] / 128.0;
      const y = v * canvas.height / 2;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }

      x += sliceWidth;
    }

    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();

    animationFrameRef.current = requestAnimationFrame(drawVisualizer);
  }, [analyser]);

  useEffect(() => {
    if (isActive && FF_AUDIO_ENGINE) {
      drawVisualizer();
    } else if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isActive, drawVisualizer]);

  if (!FF_AUDIO_ENGINE) {
    // Render a skeleton or nothing if the feature is off
    return (
      <div className="relative p-6 bg-gradient-to-t from-gray-900/90 to-gray-800/90 backdrop-blur-lg rounded-2xl border border-cyan-500/30 shadow-2xl">
        <h3 className="text-xl font-bold text-cyan-400 font-mono tracking-wider">
          MASTER OUTPUT
        </h3>
        <div className="w-full h-20 bg-black/50 rounded-lg border border-cyan-500/20 flex items-center justify-center">
            <span className="text-cyan-400/50 text-sm font-mono">AUDIO ENGINE DISABLED</span>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="relative p-6 bg-gradient-to-t from-gray-900/90 to-gray-800/90 backdrop-blur-lg rounded-2xl border border-cyan-500/30 shadow-2xl"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <h3 className="text-xl font-bold text-cyan-400 font-mono tracking-wider mb-4">
        MASTER WAVEFORM
      </h3>
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={400}
          height={80}
          className="w-full h-20 bg-black/50 rounded-lg border border-cyan-500/20"
        />
        <motion.button
          onClick={() => setIsActive(!isActive)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`absolute top-2 right-2 w-8 h-8 rounded-full ${
            isActive 
              ? 'bg-green-500 shadow-lg shadow-green-500/50' 
              : 'bg-gray-600'
          } flex items-center justify-center transition-all duration-200`}
        >
          <div className={`w-3 h-3 rounded-full ${
            isActive ? 'bg-white animate-pulse' : 'bg-gray-400'
          }`} />
        </motion.button>
      </div>
    </motion.div>
  );
};

export default LiveEqualizer;