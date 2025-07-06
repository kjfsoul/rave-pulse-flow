
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Activity, Volume2, Zap, Radio } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DebugHUDProps {
  isVisible: boolean;
  onToggle: () => void;
  audioEngine: any;
  crossfadeValue: number;
  bpmSync: boolean;
  masterBpm: number;
  activeDeck: 'A' | 'B' | null;
  isSimulationMode: boolean;
}

const DebugHUD: React.FC<DebugHUDProps> = ({
  isVisible,
  onToggle,
  audioEngine,
  crossfadeValue,
  bpmSync,
  masterBpm,
  activeDeck,
  isSimulationMode
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'text-green-400';
      case 'suspended': return 'text-yellow-400';
      case 'error': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return '✅';
      case 'suspended': return '⏸️';
      case 'error': return '❌';
      default: return '⚪';
    }
  };

  return (
    <>
      {/* Toggle Button */}
      <div className="fixed top-4 right-4 z-50">
        <Button
          onClick={onToggle}
          size="sm"
          variant="outline"
          className="bg-black/80 border-neon-purple/50 text-neon-cyan hover:bg-neon-purple/20"
        >
          {isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          Debug
        </Button>
      </div>

      {/* Debug Panel */}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="fixed top-16 right-4 bg-black/95 backdrop-blur-md border border-neon-purple/30 text-white p-4 rounded-lg text-xs font-mono z-40 max-w-sm max-h-[80vh] overflow-y-auto"
          >
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-neon-purple/30">
              <Activity className="w-4 h-4 text-neon-cyan" />
              <h3 className="text-neon-cyan font-bold text-sm">🧪 DEBUG HUD</h3>
              {isSimulationMode && (
                <span className="bg-yellow-400/20 text-yellow-300 px-2 py-1 rounded text-xs">
                  SIMULATION
                </span>
              )}
            </div>

            <div className="space-y-3">
              {/* Audio System Status */}
              <div>
                <div className="text-yellow-400 font-bold mb-1 flex items-center gap-1">
                  <Radio className="w-3 h-3" />
                  Audio System:
                </div>
                <div className="ml-4 space-y-1">
                  <div className={`flex items-center gap-2 ${getStatusColor(audioEngine.audioContextState)}`}>
                    <span>{getStatusIcon(audioEngine.audioContextState)}</span>
                    Context: {audioEngine.audioContextState.toUpperCase()}
                  </div>
                  <div className="text-gray-300">
                    Mode: {isSimulationMode ? 'SIMULATION' : 'REAL AUDIO'}
                  </div>
                </div>
              </div>

              {/* Deck A Status */}
              <div>
                <div className="text-green-400 font-bold mb-1 flex items-center gap-1">
                  <Volume2 className="w-3 h-3" />
                  Deck A:
                </div>
                <div className="ml-4 space-y-1">
                  <div>Track: {audioEngine.deckA.track?.title || 'None'}</div>
                  <div>BPM: {audioEngine.deckA.track?.bpm || 0}</div>
                  <div>Status: {audioEngine.deckA.isPlaying ? '▶️ PLAYING' : '⏸️ PAUSED'}</div>
                  <div>Volume: {audioEngine.deckA.volume}% {audioEngine.deckA.isMuted ? '(MUTED)' : ''}</div>
                  <div>Pitch: {audioEngine.deckA.pitch > 0 ? '+' : ''}{audioEngine.deckA.pitch}%</div>
                  <div>Echo: {audioEngine.deckA.echoFX ? 'ON 🔊' : 'OFF'}</div>
                  <div>Nodes: {audioEngine.deckA.gainNode ? '✅' : '❌'} Audio Graph</div>
                </div>
              </div>

              {/* Deck B Status */}
              <div>
                <div className="text-purple-400 font-bold mb-1 flex items-center gap-1">
                  <Volume2 className="w-3 h-3" />
                  Deck B:
                </div>
                <div className="ml-4 space-y-1">
                  <div>Track: {audioEngine.deckB.track?.title || 'None'}</div>
                  <div>BPM: {audioEngine.deckB.track?.bpm || 0}</div>
                  <div>Status: {audioEngine.deckB.isPlaying ? '▶️ PLAYING' : '⏸️ PAUSED'}</div>
                  <div>Volume: {audioEngine.deckB.volume}% {audioEngine.deckB.isMuted ? '(MUTED)' : ''}</div>
                  <div>Pitch: {audioEngine.deckB.pitch > 0 ? '+' : ''}{audioEngine.deckB.pitch}%</div>
                  <div>Echo: {audioEngine.deckB.echoFX ? 'ON 🔊' : 'OFF'}</div>
                  <div>Nodes: {audioEngine.deckB.gainNode ? '✅' : '❌'} Audio Graph</div>
                </div>
              </div>

              {/* Master Controls */}
              <div>
                <div className="text-cyan-400 font-bold mb-1 flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  Master:
                </div>
                <div className="ml-4 space-y-1">
                  <div>Crossfade: {crossfadeValue}%</div>
                  <div>Active Deck: {activeDeck ? `DECK ${activeDeck}` : 'CENTER MIX'}</div>
                  <div>BPM Sync: {bpmSync ? 'ON 🎵' : 'OFF'}</div>
                  <div>Master BPM: {masterBpm}</div>
                </div>
              </div>

              {/* Performance Metrics */}
              <div>
                <div className="text-orange-400 font-bold mb-1">Performance:</div>
                <div className="ml-4 space-y-1">
                  <div>Render: {Math.round(performance.now() % 1000)}ms</div>
                  <div>Memory: {(navigator as any).deviceMemory ? `${(navigator as any).deviceMemory}GB` : 'Unknown'}</div>
                  <div>Connection: {(navigator as any).connection?.effectiveType || 'Unknown'}</div>
                </div>
              </div>

              {/* Instructions */}
              <div className="pt-2 border-t border-gray-600">
                <div className="text-gray-400 text-xs">
                  <div>💡 Click audio context status to resume</div>
                  <div>🎵 Use keyboard: Space = Play/Pause</div>
                  <div>🔊 H = Toggle Debug HUD</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default DebugHUD;
