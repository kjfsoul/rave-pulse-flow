import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mic, StopCircle, Download } from 'lucide-react';
import { useAudioEngine } from '@/audio/hooks/useAudioEngine';

export const RecordingControls: React.FC = () => {
  const { audioEngine } = useAudioEngine() ?? {};
  const [isRecording, setIsRecording] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const handleStartRecording = () => {
    if (audioEngine) {
      if (audioEngine.audioContext.state === 'suspended') {
        audioEngine.audioContext.resume();
      }
      audioEngine.startRecording();
      setIsRecording(true);
      setDownloadUrl(null); // Clear previous download link
    }
  };

  const handleStopRecording = async () => {
    if (audioEngine) {
      const blob = await audioEngine.stopRecording();
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      setIsRecording(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 bg-bass-medium/90 backdrop-blur-lg border border-neon-purple/40 rounded-lg p-4 flex items-center gap-4 shadow-2xl">
      <h4 className="text-neon-cyan font-bold">REC</h4>
      {!isRecording ? (
        <motion.button
          onClick={handleStartRecording}
          className="bg-red-600/80 text-white rounded-full p-3 flex items-center justify-center hover:bg-red-500 transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Mic className="w-6 h-6" />
        </motion.button>
      ) : (
        <motion.button
          onClick={handleStopRecording}
          className="bg-gray-600 text-white rounded-full p-3 flex items-center justify-center hover:bg-gray-500 transition-colors animate-pulse"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <StopCircle className="w-6 h-6" />
        </motion.button>
      )}
      {downloadUrl && (
        <motion.a
          href={downloadUrl}
          download={`edm-shuffle-mix-${new Date().toISOString()}.webm`}
          className="bg-neon-green text-bass-dark rounded-full p-3 flex items-center justify-center hover:bg-green-400 transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Download className="w-6 h-6" />
        </motion.a>
      )}
    </div>
  );
};