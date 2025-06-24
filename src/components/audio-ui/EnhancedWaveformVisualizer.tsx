
import React, { useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';

interface EnhancedWaveformVisualizerProps {
  waveformData: Float32Array;
  isPlaying: boolean;
  color?: string;
  height?: number;
  bars?: number;
  deckId: 'A' | 'B';
  isSimulationMode?: boolean;
}

const EnhancedWaveformVisualizer: React.FC<EnhancedWaveformVisualizerProps> = ({
  waveformData,
  isPlaying,
  color = '#06ffa5',
  height = 64,
  bars = 32,
  deckId,
  isSimulationMode = false
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();

  const drawWaveform = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set up gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, color);
    gradient.addColorStop(0.7, color + '80');
    gradient.addColorStop(1, color + '20');

    const barWidth = canvas.width / bars;
    const spacing = Math.max(1, barWidth * 0.1);

    // Draw waveform bars
    for (let i = 0; i < bars; i++) {
      const dataIndex = Math.floor((i / bars) * waveformData.length);
      let barHeight = waveformData[dataIndex] || 0;
      
      // Ensure minimum height for visual appeal
      if (isPlaying) {
        barHeight = Math.max(barHeight, 0.1);
      }
      
      const x = i * barWidth;
      const drawHeight = barHeight * height;
      const y = height - drawHeight;

      // Main bar
      ctx.fillStyle = gradient;
      ctx.fillRect(x, y, barWidth - spacing, drawHeight);

      // Add glow effect when playing
      if (isPlaying && barHeight > 0.2) {
        ctx.shadowColor = color;
        ctx.shadowBlur = 8;
        ctx.fillRect(x, y, barWidth - spacing, drawHeight);
        ctx.shadowBlur = 0;
      }

      // Peak indicator
      if (barHeight > 0.8) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x, Math.max(0, y - 2), barWidth - spacing, 2);
      }
    }

    // Request next frame if playing
    if (isPlaying) {
      animationFrameRef.current = requestAnimationFrame(drawWaveform);
    }
  }, [waveformData, isPlaying, color, height, bars]);

  useEffect(() => {
    drawWaveform();
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [drawWaveform]);

  return (
    <motion.div
      className="relative w-full bg-bass-dark rounded-lg overflow-hidden border"
      style={{ height }}
      animate={isPlaying ? {
        borderColor: [color + '40', color + '80', color + '40'],
        boxShadow: [
          `0 0 10px ${color}20`,
          `0 0 20px ${color}40`,
          `0 0 10px ${color}20`
        ]
      } : {
        borderColor: '#374151'
      }}
      transition={{ duration: 0.8, repeat: Infinity }}
    >
      <canvas
        ref={canvasRef}
        width={400}
        height={height}
        className="w-full h-full"
      />
      
      {/* Status indicators */}
      <div className="absolute top-1 left-2 flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-green-400' : 'bg-gray-400'}`} />
        <span className="text-xs text-gray-300">
          DECK {deckId}
        </span>
        {isSimulationMode && (
          <span className="text-xs text-yellow-400 bg-yellow-400/20 px-1 rounded">
            SIM
          </span>
        )}
      </div>

      {/* Center line */}
      <div 
        className="absolute left-0 right-0 h-px opacity-30"
        style={{ 
          top: `${height / 2}px`,
          backgroundColor: color 
        }}
      />

      {/* Grid overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-10">
        <div className="h-full w-full" style={{
          backgroundImage: `repeating-linear-gradient(
            90deg,
            transparent,
            transparent 12px,
            ${color}40 12px,
            ${color}40 14px
          )`
        }} />
      </div>
    </motion.div>
  );
};

export default EnhancedWaveformVisualizer;
