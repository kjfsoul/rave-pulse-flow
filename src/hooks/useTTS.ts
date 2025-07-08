import { useState, useCallback, useRef, useEffect } from 'react';

export interface TTSConfig {
  voice?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
  lang?: string;
}

export interface TTSState {
  isAvailable: boolean;
  isWebSpeechAvailable: boolean;
  isCoquiTTSAvailable: boolean;
  isSpeaking: boolean;
  currentProvider: 'web-speech' | 'coqui' | null;
  error: string | null;
  supportedVoices: SpeechSynthesisVoice[];
}

export interface TTSHookReturn {
  state: TTSState;
  speak: (text: string, config?: TTSConfig) => Promise<void>;
  stop: () => void;
  pause: () => void;
  resume: () => void;
  getVoices: () => SpeechSynthesisVoice[];
  testCoquiConnection: () => Promise<boolean>;
}

// TODO: Configure Coqui TTS server endpoint - currently using localhost
const COQUI_TTS_ENDPOINT = 'http://localhost:5002';

export const useTTS = (): TTSHookReturn => {
  const [state, setState] = useState<TTSState>({
    isAvailable: false,
    isWebSpeechAvailable: false,
    isCoquiTTSAvailable: false,
    isSpeaking: false,
    currentProvider: null,
    error: null,
    supportedVoices: []
  });

  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Initialize TTS capabilities on mount
  useEffect(() => {
    const initializeTTS = async () => {
      const webSpeechAvailable = 'speechSynthesis' in window;
      const coquiAvailable = await testCoquiConnection();
      
      if (webSpeechAvailable) {
        // Load voices (may be async in some browsers)
        const loadVoices = () => {
          const voices = speechSynthesis.getVoices();
          setState(prev => ({
            ...prev,
            isWebSpeechAvailable: webSpeechAvailable,
            isCoquiTTSAvailable: coquiAvailable,
            isAvailable: webSpeechAvailable || coquiAvailable,
            supportedVoices: voices,
            currentProvider: coquiAvailable ? 'coqui' : webSpeechAvailable ? 'web-speech' : null
          }));
        };

        // Voices might load asynchronously
        if (speechSynthesis.getVoices().length === 0) {
          speechSynthesis.addEventListener('voiceschanged', loadVoices);
        } else {
          loadVoices();
        }
      } else {
        setState(prev => ({
          ...prev,
          isWebSpeechAvailable: false,
          isCoquiTTSAvailable: coquiAvailable,
          isAvailable: coquiAvailable,
          currentProvider: coquiAvailable ? 'coqui' : null,
          error: webSpeechAvailable ? null : 'Web Speech API not supported'
        }));
      }
    };

    initializeTTS();
  }, []);

  const testCoquiConnection = useCallback(async (): Promise<boolean> => {
    try {
      // TODO: Implement actual Coqui TTS server health check
      // This would require a running Coqui TTS server
      const response = await fetch(`${COQUI_TTS_ENDPOINT}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(3000)
      });
      return response.ok;
    } catch (error) {
      console.log('🔊 Coqui TTS server not available, using Web Speech API fallback');
      return false;
    }
  }, []);

  const speakWithCoquiTTS = useCallback(async (text: string, config?: TTSConfig): Promise<void> => {
    // TODO: Implement Coqui TTS integration
    // This requires a running Coqui TTS server with proper API endpoints
    try {
      abortControllerRef.current = new AbortController();
      
      const response = await fetch(`${COQUI_TTS_ENDPOINT}/api/tts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          voice: config?.voice || 'festival_host',
          speed: config?.rate || 1.0,
          pitch: config?.pitch || 1.0
        }),
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        throw new Error(`Coqui TTS error: ${response.status}`);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      setState(prev => ({ ...prev, isSpeaking: true, error: null }));
      
      audio.onended = () => {
        setState(prev => ({ ...prev, isSpeaking: false }));
        URL.revokeObjectURL(audioUrl);
      };
      
      audio.onerror = () => {
        setState(prev => ({ 
          ...prev, 
          isSpeaking: false, 
          error: 'Coqui TTS playback failed' 
        }));
        URL.revokeObjectURL(audioUrl);
      };

      await audio.play();
      
    } catch (error) {
      console.error('❌ Coqui TTS failed:', error);
      setState(prev => ({ 
        ...prev, 
        isSpeaking: false, 
        error: `Coqui TTS error: ${error instanceof Error ? error.message : 'Unknown'}`,
        currentProvider: 'web-speech' // Fallback
      }));
      
      // Fallback to Web Speech API
      if (state.isWebSpeechAvailable) {
        await speakWithWebSpeech(text, config);
      }
    }
  }, [state.isWebSpeechAvailable]);

  const speakWithWebSpeech = useCallback(async (text: string, config?: TTSConfig): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!('speechSynthesis' in window)) {
        reject(new Error('Web Speech API not supported'));
        return;
      }

      // Cancel any ongoing speech
      speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      currentUtteranceRef.current = utterance;

      // Apply configuration
      if (config?.voice) {
        const voice = speechSynthesis.getVoices().find(v => 
          v.name === config.voice || v.lang === config.voice
        );
        if (voice) utterance.voice = voice;
      }
      
      utterance.rate = config?.rate || 1.0;
      utterance.pitch = config?.pitch || 1.0;
      utterance.volume = config?.volume || 1.0;
      utterance.lang = config?.lang || 'en-US';

      // Event handlers
      utterance.onstart = () => {
        setState(prev => ({ ...prev, isSpeaking: true, error: null }));
      };

      utterance.onend = () => {
        setState(prev => ({ ...prev, isSpeaking: false }));
        currentUtteranceRef.current = null;
        resolve();
      };

      utterance.onerror = (event) => {
        setState(prev => ({ 
          ...prev, 
          isSpeaking: false, 
          error: `Speech synthesis error: ${event.error}` 
        }));
        currentUtteranceRef.current = null;
        reject(new Error(`Speech synthesis error: ${event.error}`));
      };

      // Start speaking
      speechSynthesis.speak(utterance);
    });
  }, []);

  const speak = useCallback(async (text: string, config?: TTSConfig): Promise<void> => {
    if (!state.isAvailable) {
      throw new Error('No TTS provider available');
    }

    setState(prev => ({ ...prev, error: null }));

    // Use Coqui TTS if available, otherwise fallback to Web Speech API
    if (state.currentProvider === 'coqui' && state.isCoquiTTSAvailable) {
      await speakWithCoquiTTS(text, config);
    } else if (state.isWebSpeechAvailable) {
      await speakWithWebSpeech(text, config);
    } else {
      throw new Error('No TTS provider available');
    }
  }, [state, speakWithCoquiTTS, speakWithWebSpeech]);

  const stop = useCallback(() => {
    // Stop Web Speech API
    if (currentUtteranceRef.current) {
      speechSynthesis.cancel();
      currentUtteranceRef.current = null;
    }
    
    // Stop Coqui TTS
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    
    setState(prev => ({ ...prev, isSpeaking: false }));
  }, []);

  const pause = useCallback(() => {
    if ('speechSynthesis' in window) {
      speechSynthesis.pause();
    }
  }, []);

  const resume = useCallback(() => {
    if ('speechSynthesis' in window) {
      speechSynthesis.resume();
    }
  }, []);

  const getVoices = useCallback((): SpeechSynthesisVoice[] => {
    if ('speechSynthesis' in window) {
      return speechSynthesis.getVoices();
    }
    return [];
  }, []);

  return {
    state,
    speak,
    stop,
    pause,
    resume,
    getVoices,
    testCoquiConnection
  };
};

// Festival announcer utility with preset messages
export const useFestivalAnnouncer = () => {
  const tts = useTTS();

  const announceTrackChange = useCallback(async (trackTitle: string, artist?: string) => {
    const message = artist 
      ? `Now dropping ${trackTitle} by ${artist}! Let's get this crowd moving!`
      : `Here comes ${trackTitle}! Turn it up!`;
    
    await tts.speak(message, { 
      rate: 1.1, 
      pitch: 1.2, 
      voice: 'festival_host' 
    });
  }, [tts]);

  const announceVictory = useCallback(async (achievement: string) => {
    const messages = [
      `Incredible! You just ${achievement}!`,
      `The crowd goes wild! ${achievement} achieved!`,
      `Legendary! That ${achievement} was absolutely fire!`
    ];
    
    const message = messages[Math.floor(Math.random() * messages.length)];
    await tts.speak(message, { rate: 1.2, pitch: 1.3 });
  }, [tts]);

  const announceGreeting = useCallback(async () => {
    const greetings = [
      "Welcome to the hottest virtual festival! Let's make some noise!",
      "Get ready to drop the sickest beats! The crowd is waiting!",
      "Time to show them what you've got! Let the music take control!"
    ];
    
    const greeting = greetings[Math.floor(Math.random() * greetings.length)];
    await tts.speak(greeting, { rate: 1.0, pitch: 1.1 });
  }, [tts]);

  return {
    ...tts,
    announceTrackChange,
    announceVictory,
    announceGreeting
  };
};