import React from 'react';

interface KnobProps {
  value: number;
  min?: number;
  max?: number;
  label?: string;
  color?: 'cyan' | 'purple' | 'white';
  onChange?: (value: number) => void;
  size?: 'sm' | 'md' | 'lg';
}

export const Knob: React.FC<KnobProps> = ({
  value, min = 0, max = 100, label, color = 'cyan', size = 'md'
}) => {
  // Calculate rotation (-135deg to +135deg)
  const percentage = (value - min) / (max - min);
  const rotation = -135 + (percentage * 270);

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };
  const colorClasses = {
    cyan: 'bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]',
    purple: 'bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]',
    white: 'bg-white shadow-[0_0_10px_rgba(255,255,255,0.3)]'
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <div className={`relative rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center ${sizeClasses[size]}`}>
        {/* Indicator Line */}
        <div
          className="w-full h-full absolute top-0 left-0 rounded-full transition-transform duration-75 ease-out"
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          <div className={`w-1 h-[40%] mx-auto mt-1 rounded-full ${colorClasses[color]}`} />
        </div>
      </div>
      {label && <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">{label}</span>}
    </div>
  );
};
