import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Crosshair } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { useAudioEngine } from '@/audio/hooks/useAudioEngine';
import { FF_AUDIO_ENGINE } from '@/config/features';

interface CrossfaderProps {
  value: number;
  onChange: (value: number) => void;
  deckAActive: boolean;
  deckBActive: boolean;
  deckAVolume?: number;
  deckBVolume?: number;
  isSimulationMode?: boolean;
}

const Crossfader: React.FC<CrossfaderProps> = ({
  value: initialValue,
  onChange: onChangeProp,
  deckAActive,
  deckBActive,
  deckAVolume = 0,
  deckBVolume = 0,
  isSimulationMode = false,
}) => {
  const { audioEngine } = useAudioEngine() ?? {};
  const [value, setValue] = useState(initialValue);

  const deckAMultiplier = (100 - value) / 100;
  const deckBMultiplier = value / 100;
  const activeDeck = value < 40 ? 'A' : value > 60 ? 'B' : null;

  const handleValueChange = (newValue: number[]) => {
    const v = newValue[0];
    setValue(v);

    if (FF_AUDIO_ENGINE && audioEngine) {
      // Normalize value from 0-100 to 0-1 for the audio engine
      audioEngine.setCrossfader(v / 100);
    }

    onChangeProp(v);
  };

  return (
    <motion.div
      className="bg-bass-medium/90 backdrop-blur-md border-2 border-neon-purple/50 rounded-xl p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ borderColor: 'hsl(var(--neon-purple))' }}
    >
      {/* Header */}
      <div className="text-center mb-4">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Crosshair className="w-5 h-5 text-neon-cyan" />
          <h3 className="text-neon-cyan font-bold text-lg">CROSSFADER</h3>
          {isSimulationMode && (
            <span className="bg-yellow-400/20 text-yellow-300 px-2 py-1 rounded text-xs">
              SIM
            </span>
          )}
        </div>
        <div className="text-white text-2xl font-bold">
          {value}%
        </div>
      </div>

      {/* Deck Balance Indicators */}
      <div className="flex items-center justify-between mb-4">
        <motion.div 
          className={`text-sm font-bold transition-all ${
            activeDeck === 'A' ? 'text-neon-cyan' : 'text-slate-400'
          }`}
          animate={deckAActive ? { scale: [1, 1.1, 1] } : {}}
          transition={{ duration: 0.5, repeat: Infinity }}
        >
          <div>DECK A</div>
          <div className="text-xs">
            {Math.round(deckAMultiplier * 100)}% • {Math.round(deckAVolume)}%
          </div>
        </motion.div>

        <motion.div 
          className={`text-sm font-bold transition-all ${
            activeDeck === 'B' ? 'text-neon-cyan' : 'text-slate-400'
          }`}
          animate={deckBActive ? { scale: [1, 1.1, 1] } : {}}
          transition={{ duration: 0.5, repeat: Infinity }}
        >
          <div>DECK B</div>
          <div className="text-xs">
            {Math.round(deckBMultiplier * 100)}% • {Math.round(deckBVolume)}%
          </div>
        </motion.div>
      </div>

      {/* Crossfader Slider */}
      <div className="mb-4">
        <Slider
          value={[value]}
          onValueChange={handleValueChange}
          max={100}
          step={1}
          className="w-full"
        />
      </div>

      {/* Active Status */}
      <div className="text-center">
        <motion.div 
          className={`text-sm font-medium ${
            activeDeck ? 'text-neon-cyan' : 'text-slate-400'
          }`}
          animate={activeDeck ? {
            textShadow: [
              '0 0 5px rgba(6,255,165,0.5)',
              '0 0 15px rgba(6,255,165,0.8)',
              '0 0 5px rgba(6,255,165,0.5)'
            ]
          } : {}}
          transition={{ duration: 1, repeat: Infinity }}
        >
          {activeDeck ? (
            <>
              🎵 DECK {activeDeck} ACTIVE
              <div className="text-xs text-slate-400 mt-1">
                {activeDeck === 'A' ? Math.round(deckAMultiplier * 100) : Math.round(deckBMultiplier * 100)}% Output
              </div>
            </>
          ) : (
            <>
              🎚️ CENTER MIX
              <div className="text-xs text-slate-400 mt-1">
                50/50 Blend
              </div>
            </>
          )}
        </motion.div>
      </div>

      {/* Visual Balance Meter */}
      <div className="mt-4 flex items-center gap-1">
        {Array.from({ length: 20 }).map((_, i) => {
          const position = (i / 19) * 100;
          const isActive = Math.abs(position - value) < 5;
          const deckSide = position < 50 ? 'A' : 'B';
          
          return (
            <motion.div
              key={i}
              className={`h-2 flex-1 rounded-sm ${
                isActive 
                  ? deckSide === 'A' 
                    ? 'bg-green-400' 
                    : 'bg-purple-400'
                  : 'bg-slate-700'
              }`}
              animate={isActive ? {
                opacity: [0.5, 1, 0.5]
              } : {}}
              transition={{ duration: 0.3, repeat: Infinity }}
            />
          );
        })}
      </div>
    </motion.div>
  );
};

export default Crossfader;