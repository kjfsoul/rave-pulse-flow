
import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface WaveformVisualizerProps {
  waveformData: Float32Array;
  isPlaying: boolean;
  color?: string;
  height?: number;
  bars?: number;
}

const WaveformVisualizer: React.FC<WaveformVisualizerProps> = ({
  waveformData,
  isPlaying,
  color = '#06ffa5',
  height = 48,
  bars = 32
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set up gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, color + '40');

    const barWidth = canvas.width / bars;
    const spacing = 2;

    // Draw waveform bars
    for (let i = 0; i < bars; i++) {
      const dataIndex = Math.floor((i / bars) * waveformData.length);
      let barHeight = waveformData[dataIndex] || 0;
      
      // Add some randomness when playing for visual effect
      if (isPlaying) {
        barHeight = Math.max(barHeight, Math.random() * 0.3);
      }
      
      const x = i * barWidth;
      const y = height - (barHeight * height);
      const drawHeight = barHeight * height;

      ctx.fillStyle = gradient;
      ctx.fillRect(x, y, barWidth - spacing, drawHeight);

      // Add glow effect when playing
      if (isPlaying && barHeight > 0.1) {
        ctx.shadowColor = color;
        ctx.shadowBlur = 4;
        ctx.fillRect(x, y, barWidth - spacing, drawHeight);
        ctx.shadowBlur = 0;
      }
    }
  }, [waveformData, isPlaying, color, height, bars]);

  return (
    <motion.div
      className="relative w-full bg-bass-dark rounded-lg overflow-hidden"
      style={{ height }}
      animate={isPlaying ? {
        boxShadow: [
          `0 0 10px ${color}40`,
          `0 0 20px ${color}60`,
          `0 0 10px ${color}40`
        ]
      } : {}}
      transition={{ duration: 0.5, repeat: Infinity }}
    >
      <canvas
        ref={canvasRef}
        width={320}
        height={height}
        className="w-full h-full"
      />
      
      {/* Overlay grid lines */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="h-full w-full opacity-20" style={{
          backgroundImage: `repeating-linear-gradient(
            90deg,
            transparent,
            transparent 8px,
            ${color}20 8px,
            ${color}20 10px
          )`
        }} />
      </div>

      {/* Center line */}
      <div 
        className="absolute left-0 right-0 h-px opacity-30"
        style={{ 
          top: `${height / 2}px`,
          backgroundColor: color 
        }}
      />
    </motion.div>
  );
};

export default WaveformVisualizer;
