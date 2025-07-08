import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye,
  EyeOff,
  Activity,
  Volume2,
  Zap,
  Radio,
  Mic,
  MicOff,
  Speaker,
  VolumeX,
  Wifi,
  WifiOff,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { TTSState } from "@/hooks/useTTS";
import type { SpeechRecognitionState } from "@/hooks/useVoiceCommands";

interface EnhancedDebugHUDProps {
  isVisible: boolean;
  onToggle: () => void;
  audioEngine: any;
  crossfadeValue: number;
  bpmSync: boolean;
  masterBpm: number;
  activeDeck: "A" | "B" | null;
  isSimulationMode: boolean;
  ttsState?: TTSState;
  speechState?: SpeechRecognitionState;
}

const EnhancedDebugHUD: React.FC<EnhancedDebugHUDProps> = ({
  isVisible,
  onToggle,
  audioEngine,
  crossfadeValue,
  bpmSync,
  masterBpm,
  activeDeck,
  isSimulationMode,
  ttsState,
  speechState,
}) => {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "running":
      case "available":
      case "connected":
        return "text-green-400";
      case "suspended":
      case "listening":
      case "processing":
        return "text-yellow-400";
      case "error":
      case "unavailable":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  const getStatusIcon = (status: string, type: 'audio' | 'tts' | 'speech' = 'audio') => {
    if (type === 'audio') {
      switch (status) {
        case "running": return <CheckCircle className="w-3 h-3" />;
        case "suspended": return <Clock className="w-3 h-3" />;
        case "error": return <XCircle className="w-3 h-3" />;
        default: return <AlertTriangle className="w-3 h-3" />;
      }
    } else if (type === 'tts') {
      return ttsState?.isSpeaking ? <Speaker className="w-3 h-3" /> : <VolumeX className="w-3 h-3" />;
    } else if (type === 'speech') {
      return speechState?.isListening ? <Mic className="w-3 h-3" /> : <MicOff className="w-3 h-3" />;
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
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
          {isVisible ? (
            <EyeOff className="w-4 h-4" />
          ) : (
            <Eye className="w-4 h-4" />
          )}
          Enhanced Debug
        </Button>
      </div>

      {/* Enhanced Debug Panel */}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, x: 400 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 400 }}
            className="fixed top-16 right-4 bg-black/95 backdrop-blur-md border border-neon-purple/30 text-white rounded-lg text-xs font-mono z-40 max-w-md max-h-[85vh] overflow-y-auto"
          >
            <div className="flex items-center gap-2 p-4 pb-2 border-b border-neon-purple/30">
              <Activity className="w-4 h-4 text-neon-cyan" />
              <h3 className="text-neon-cyan font-bold text-sm">🧪 ENHANCED DEBUG HUD</h3>
              {isSimulationMode && (
                <Badge variant="outline" className="bg-yellow-400/20 text-yellow-300 border-yellow-400/30">
                  SIMULATION
                </Badge>
              )}
            </div>

            <div className="p-4 space-y-4">
              {/* Audio System Status */}
              <div>
                <button
                  onClick={() => toggleSection('audio')}
                  className="w-full text-left flex items-center gap-2 text-yellow-400 font-bold mb-2 hover:text-yellow-300"
                >
                  <Radio className="w-3 h-3" />
                  Audio System
                  <span className="ml-auto">{expandedSection === 'audio' ? '▼' : '▶'}</span>
                </button>
                
                <AnimatePresence>
                  {expandedSection === 'audio' && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="ml-4 space-y-1 overflow-hidden"
                    >
                      <div className={`flex items-center gap-2 ${getStatusColor(audioEngine.audioContextState)}`}>
                        {getStatusIcon(audioEngine.audioContextState, 'audio')}
                        Context: {audioEngine.audioContextState.toUpperCase()}
                      </div>
                      <div className="text-gray-300">
                        Mode: {isSimulationMode ? "SIMULATION" : "REAL AUDIO"}
                      </div>
                      <div className="text-gray-300">
                        Sample Rate: {audioEngine.audioContext?.sampleRate || 'N/A'} Hz
                      </div>
                      <div className="text-gray-300">
                        Latency: {Math.round((audioEngine.audioContext?.baseLatency || 0) * 1000)}ms
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Speech Recognition Status */}
              {speechState && (
                <div>
                  <button
                    onClick={() => toggleSection('speech')}
                    className="w-full text-left flex items-center gap-2 text-blue-400 font-bold mb-2 hover:text-blue-300"
                  >
                    <Mic className="w-3 h-3" />
                    Speech Recognition
                    <span className="ml-auto">{expandedSection === 'speech' ? '▼' : '▶'}</span>
                  </button>
                  
                  <AnimatePresence>
                    {expandedSection === 'speech' && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="ml-4 space-y-1 overflow-hidden"
                      >
                        <div className={`flex items-center gap-2 ${getStatusColor(speechState.isAvailable ? 'available' : 'unavailable')}`}>
                          {getStatusIcon('', 'speech')}
                          Status: {speechState.isAvailable ? 'AVAILABLE' : 'UNAVAILABLE'}
                        </div>
                        <div className="text-gray-300">
                          Listening: {speechState.isListening ? '🔴 ACTIVE' : '⚪ INACTIVE'}
                        </div>
                        <div className="text-gray-300">
                          Processing: {speechState.isProcessing ? '⚡ YES' : '⚪ NO'}
                        </div>
                        <div className="text-gray-300">
                          Provider: {speechState.useVosk ? 'Vosk WASM' : 'Web Speech API'}
                        </div>
                        {speechState.transcript && (
                          <div className="text-green-300 text-wrap">
                            Transcript: "{speechState.transcript}"
                          </div>
                        )}
                        {speechState.lastCommand && (
                          <div className="text-cyan-300">
                            Last Command: {speechState.lastCommand}
                          </div>
                        )}
                        {speechState.confidence > 0 && (
                          <div className="text-gray-300">
                            Confidence: {Math.round(speechState.confidence * 100)}%
                          </div>
                        )}
                        {speechState.error && (
                          <div className="text-red-300 text-wrap">
                            Error: {speechState.error}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Text-to-Speech Status */}
              {ttsState && (
                <div>
                  <button
                    onClick={() => toggleSection('tts')}
                    className="w-full text-left flex items-center gap-2 text-purple-400 font-bold mb-2 hover:text-purple-300"
                  >
                    <Speaker className="w-3 h-3" />
                    Text-to-Speech
                    <span className="ml-auto">{expandedSection === 'tts' ? '▼' : '▶'}</span>
                  </button>
                  
                  <AnimatePresence>
                    {expandedSection === 'tts' && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="ml-4 space-y-1 overflow-hidden"
                      >
                        <div className={`flex items-center gap-2 ${getStatusColor(ttsState.isAvailable ? 'available' : 'unavailable')}`}>
                          {getStatusIcon('', 'tts')}
                          Status: {ttsState.isAvailable ? 'AVAILABLE' : 'UNAVAILABLE'}
                        </div>
                        <div className="text-gray-300">
                          Speaking: {ttsState.isSpeaking ? '🔊 YES' : '⚪ NO'}
                        </div>
                        <div className="text-gray-300">
                          Provider: {ttsState.currentProvider?.toUpperCase() || 'NONE'}
                        </div>
                        <div className="text-gray-300">
                          Web Speech: {ttsState.isWebSpeechAvailable ? '✅' : '❌'}
                        </div>
                        <div className="text-gray-300">
                          Coqui TTS: {ttsState.isCoquiTTSAvailable ? '✅' : '❌'}
                        </div>
                        <div className="text-gray-300">
                          Voices: {ttsState.supportedVoices.length}
                        </div>
                        {ttsState.error && (
                          <div className="text-red-300 text-wrap">
                            Error: {ttsState.error}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Deck Status */}
              <div>
                <button
                  onClick={() => toggleSection('decks')}
                  className="w-full text-left flex items-center gap-2 text-green-400 font-bold mb-2 hover:text-green-300"
                >
                  <Volume2 className="w-3 h-3" />
                  DJ Decks
                  <span className="ml-auto">{expandedSection === 'decks' ? '▼' : '▶'}</span>
                </button>
                
                <AnimatePresence>
                  {expandedSection === 'decks' && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="ml-4 space-y-3 overflow-hidden"
                    >
                      {/* Deck A */}
                      <div className="border-l-2 border-green-400 pl-2">
                        <div className="text-green-400 font-bold">Deck A:</div>
                        <div>Track: {audioEngine.deckA.track?.title || "None"}</div>
                        <div>BPM: {audioEngine.deckA.track?.bpm || 0}</div>
                        <div>Status: {audioEngine.deckA.isPlaying ? "▶️ PLAYING" : "⏸️ PAUSED"}</div>
                        <div>Volume: {audioEngine.deckA.volume}% {audioEngine.deckA.isMuted ? "(MUTED)" : ""}</div>
                        <div>Pitch: {audioEngine.deckA.pitch > 0 ? "+" : ""}{audioEngine.deckA.pitch}%</div>
                        <div>Echo: {audioEngine.deckA.echoFX ? "ON 🔊" : "OFF"}</div>
                        <div>Nodes: {audioEngine.deckA.gainNode ? "✅" : "❌"} Audio Graph</div>
                      </div>

                      {/* Deck B */}
                      <div className="border-l-2 border-purple-400 pl-2">
                        <div className="text-purple-400 font-bold">Deck B:</div>
                        <div>Track: {audioEngine.deckB.track?.title || "None"}</div>
                        <div>BPM: {audioEngine.deckB.track?.bpm || 0}</div>
                        <div>Status: {audioEngine.deckB.isPlaying ? "▶️ PLAYING" : "⏸️ PAUSED"}</div>
                        <div>Volume: {audioEngine.deckB.volume}% {audioEngine.deckB.isMuted ? "(MUTED)" : ""}</div>
                        <div>Pitch: {audioEngine.deckB.pitch > 0 ? "+" : ""}{audioEngine.deckB.pitch}%</div>
                        <div>Echo: {audioEngine.deckB.echoFX ? "ON 🔊" : "OFF"}</div>
                        <div>Nodes: {audioEngine.deckB.gainNode ? "✅" : "❌"} Audio Graph</div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Master Controls */}
              <div>
                <button
                  onClick={() => toggleSection('master')}
                  className="w-full text-left flex items-center gap-2 text-cyan-400 font-bold mb-2 hover:text-cyan-300"
                >
                  <Zap className="w-3 h-3" />
                  Master Controls
                  <span className="ml-auto">{expandedSection === 'master' ? '▼' : '▶'}</span>
                </button>
                
                <AnimatePresence>
                  {expandedSection === 'master' && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="ml-4 space-y-1 overflow-hidden"
                    >
                      <div>Crossfade: {crossfadeValue}%</div>
                      <div>Active Deck: {activeDeck ? `DECK ${activeDeck}` : "CENTER MIX"}</div>
                      <div>BPM Sync: {bpmSync ? "ON 🎵" : "OFF"}</div>
                      <div>Master BPM: {masterBpm}</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Performance Metrics */}
              <div>
                <button
                  onClick={() => toggleSection('performance')}
                  className="w-full text-left flex items-center gap-2 text-orange-400 font-bold mb-2 hover:text-orange-300"
                >
                  <Activity className="w-3 h-3" />
                  Performance
                  <span className="ml-auto">{expandedSection === 'performance' ? '▼' : '▶'}</span>
                </button>
                
                <AnimatePresence>
                  {expandedSection === 'performance' && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="ml-4 space-y-1 overflow-hidden"
                    >
                      <div>Render: {Math.round(performance.now() % 1000)}ms</div>
                      <div>
                        Memory: {(navigator as any).deviceMemory
                          ? `${(navigator as any).deviceMemory}GB`
                          : "Unknown"}
                      </div>
                      <div>
                        Connection: {(navigator as any).connection?.effectiveType || "Unknown"}
                      </div>
                      <div>User Agent: {navigator.userAgent.split(' ')[0]}</div>
                      <div>Platform: {navigator.platform}</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Instructions */}
              <div className="pt-2 border-t border-gray-600">
                <div className="text-gray-400 text-xs space-y-1">
                  <div>💡 Click sections to expand/collapse</div>
                  <div>🎵 Space = Play/Pause Active Deck</div>
                  <div>🔊 H = Toggle Debug HUD</div>
                  <div>🎤 Voice commands available when enabled</div>
                  <div>🎙️ TTS announcements for track changes</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default EnhancedDebugHUD;