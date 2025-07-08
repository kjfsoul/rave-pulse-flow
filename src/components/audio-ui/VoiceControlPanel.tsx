import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic, 
  MicOff, 
  Speaker, 
  VolumeX, 
  Settings, 
  HelpCircle,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useFestivalAnnouncer } from '@/hooks/useTTS';
import { useVoiceCommands } from '@/hooks/useVoiceCommands';

interface VoiceControlPanelProps {
  isVisible: boolean;
  onToggle: () => void;
  onVoiceCommand: (command: string) => void;
}

const VoiceControlPanel: React.FC<VoiceControlPanelProps> = ({
  isVisible,
  onToggle,
  onVoiceCommand
}) => {
  const announcer = useFestivalAnnouncer();
  const voiceCommands = useVoiceCommands();
  const [showCommands, setShowCommands] = useState(false);

  // Set up voice command handlers
  React.useEffect(() => {
    const commands = voiceCommands.getRegisteredCommands();
    
    // Add handlers for each command
    commands.forEach(command => {
      voiceCommands.addCommand(command, () => {
        onVoiceCommand(command.action);
      });
    });
  }, [voiceCommands, onVoiceCommand]);

  const handleTestTTS = async () => {
    try {
      await announcer.announceGreeting();
    } catch (error) {
      console.error('TTS test failed:', error);
    }
  };

  const handleToggleListening = () => {
    if (voiceCommands.state.isListening) {
      voiceCommands.stopListening();
    } else {
      voiceCommands.startListening();
    }
  };

  const getStatusColor = () => {
    if (!voiceCommands.state.isAvailable) return 'text-red-400';
    if (voiceCommands.state.isListening) return 'text-green-400';
    if (voiceCommands.state.isProcessing) return 'text-yellow-400';
    return 'text-gray-400';
  };

  const getStatusText = () => {
    if (!voiceCommands.state.isAvailable) return 'UNAVAILABLE';
    if (voiceCommands.state.isListening) return 'LISTENING';
    if (voiceCommands.state.isProcessing) return 'PROCESSING';
    return 'READY';
  };

  return (
    <>
      {/* Toggle Button */}
      <div className="fixed bottom-24 right-4 z-50">
        <Button
          onClick={onToggle}
          size="sm"
          variant="outline"
          className={`bg-black/80 border-blue-500/50 text-blue-400 hover:bg-blue-500/20 transition-all ${
            voiceCommands.state.isListening ? 'animate-pulse border-green-500 text-green-400' : ''
          }`}
        >
          {voiceCommands.state.isListening ? (
            <Mic className="w-4 h-4" />
          ) : (
            <MicOff className="w-4 h-4" />
          )}
          Voice Control
        </Button>
      </div>

      {/* Voice Control Panel */}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 300 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 300 }}
            className="fixed bottom-32 right-4 bg-black/95 backdrop-blur-md border border-blue-500/30 text-white p-4 rounded-lg text-sm z-40 max-w-sm"
          >
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-blue-500/30">
              <Mic className="w-4 h-4 text-blue-400" />
              <h3 className="text-blue-400 font-bold">🎤 VOICE CONTROL</h3>
              <Badge 
                variant="outline" 
                className={`ml-auto ${getStatusColor()} border-current`}
              >
                {getStatusText()}
              </Badge>
            </div>

            <div className="space-y-4">
              {/* Status Display */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Speech Recognition:</span>
                  <span className={getStatusColor()}>
                    {voiceCommands.state.isAvailable ? '✅' : '❌'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Text-to-Speech:</span>
                  <span className={announcer.state.isAvailable ? 'text-green-400' : 'text-red-400'}>
                    {announcer.state.isAvailable ? '✅' : '❌'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Provider:</span>
                  <span className="text-gray-400 text-xs">
                    {voiceCommands.state.useVosk ? 'Vosk WASM' : 'Web Speech API'}
                  </span>
                </div>
              </div>

              {/* Live Transcript */}
              {voiceCommands.state.transcript && (
                <div className="bg-gray-800/50 p-2 rounded border border-gray-600">
                  <div className="text-xs text-gray-400 mb-1">Live Transcript:</div>
                  <div className="text-green-300 text-xs">
                    "{voiceCommands.state.transcript}"
                  </div>
                  {voiceCommands.state.confidence > 0 && (
                    <div className="text-xs text-gray-400 mt-1">
                      Confidence: {Math.round(voiceCommands.state.confidence * 100)}%
                    </div>
                  )}
                </div>
              )}

              {/* Last Command */}
              {voiceCommands.state.lastCommand && (
                <div className="bg-cyan-800/30 p-2 rounded border border-cyan-600/50">
                  <div className="text-xs text-cyan-400 mb-1">Last Command:</div>
                  <div className="text-cyan-300 text-xs font-mono">
                    {voiceCommands.state.lastCommand}
                  </div>
                </div>
              )}

              {/* Error Display */}
              {voiceCommands.state.error && (
                <div className="bg-red-800/30 p-2 rounded border border-red-600/50">
                  <div className="flex items-center gap-1 text-red-400 text-xs mb-1">
                    <AlertTriangle className="w-3 h-3" />
                    Error:
                  </div>
                  <div className="text-red-300 text-xs">
                    {voiceCommands.state.error}
                  </div>
                </div>
              )}

              {/* Control Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={handleToggleListening}
                  size="sm"
                  disabled={!voiceCommands.state.isAvailable}
                  className={`${
                    voiceCommands.state.isListening
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                  }`}
                >
                  {voiceCommands.state.isListening ? (
                    <>
                      <MicOff className="w-3 h-3 mr-1" />
                      Stop
                    </>
                  ) : (
                    <>
                      <Mic className="w-3 h-3 mr-1" />
                      Listen
                    </>
                  )}
                </Button>

                <Button
                  onClick={handleTestTTS}
                  size="sm"
                  disabled={!announcer.state.isAvailable || announcer.state.isSpeaking}
                  className="bg-purple-700 hover:bg-purple-600 text-white"
                >
                  {announcer.state.isSpeaking ? (
                    <>
                      <VolumeX className="w-3 h-3 mr-1" />
                      Speaking...
                    </>
                  ) : (
                    <>
                      <Speaker className="w-3 h-3 mr-1" />
                      Test TTS
                    </>
                  )}
                </Button>
              </div>

              {/* Voice Commands Toggle */}
              <Button
                onClick={() => setShowCommands(!showCommands)}
                size="sm"
                variant="outline"
                className="w-full text-xs border-blue-500/50 text-blue-400 hover:bg-blue-500/20"
              >
                <HelpCircle className="w-3 h-3 mr-1" />
                {showCommands ? 'Hide' : 'Show'} Commands
              </Button>

              {/* Available Commands */}
              <AnimatePresence>
                {showCommands && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="bg-gray-800/50 p-3 rounded border border-gray-600">
                      <div className="text-xs text-gray-400 mb-2 font-bold">Available Commands:</div>
                      <div className="space-y-1 max-h-32 overflow-y-auto">
                        {voiceCommands.getRegisteredCommands().map((command, index) => (
                          <div key={index} className="text-xs">
                            <div className="text-blue-300 font-mono">
                              "{command.phrases[0]}"
                            </div>
                            <div className="text-gray-400 ml-2">
                              {command.description}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Instructions */}
              <div className="text-xs text-gray-400 border-t border-gray-600 pt-2">
                <div>💡 Say commands clearly</div>
                <div>🎤 Click "Listen" to start voice control</div>
                <div>🎙️ Test TTS to hear announcements</div>
                {!voiceCommands.state.isAvailable && (
                  <div className="text-red-400 mt-1">
                    ⚠️ Enable microphone permissions for voice control
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default VoiceControlPanel;