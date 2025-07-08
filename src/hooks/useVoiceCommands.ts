import { useState, useCallback, useRef, useEffect } from 'react';

export interface VoiceCommand {
  phrases: string[];
  action: string;
  description: string;
  category: 'playback' | 'effects' | 'navigation' | 'mix';
}

export interface SpeechRecognitionState {
  isAvailable: boolean;
  isListening: boolean;
  isProcessing: boolean;
  transcript: string;
  confidence: number;
  error: string | null;
  lastCommand: string | null;
  supportedLanguages: string[];
  useVosk: boolean; // Whether using Vosk WASM or Web Speech API
}

export interface VoiceCommandsHookReturn {
  state: SpeechRecognitionState;
  startListening: () => void;
  stopListening: () => void;
  addCommand: (command: VoiceCommand, handler: () => void) => void;
  removeCommand: (action: string) => void;
  getRegisteredCommands: () => VoiceCommand[];
  initializeVosk: () => Promise<boolean>;
}

// TODO: Vosk WASM integration - requires vosk-browser package and model files
// For now using Web Speech API with Vosk fallback preparation
interface VoskRecognizer {
  acceptWaveform(buffer: Int16Array): boolean;
  result(): string;
  finalResult(): string;
  reset(): void;
  free(): void;
}

interface VoskRecognizerConstructor {
  new(sampleRate: number, grammar?: string): VoskRecognizer;
}

// TypeScript declarations for Web Speech API
interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
}

interface SpeechRecognitionConstructor {
  new(): SpeechRecognition;
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
  readonly message: string;
}

// Default voice commands for DJ controls
const DEFAULT_COMMANDS: VoiceCommand[] = [
  {
    phrases: ['play', 'start', 'go', 'drop it'],
    action: 'play',
    description: 'Start playing the active deck',
    category: 'playback'
  },
  {
    phrases: ['pause', 'stop', 'halt'],
    action: 'pause',
    description: 'Pause the active deck',
    category: 'playback'
  },
  {
    phrases: ['drop my set', 'drop the beat', 'epic drop', 'unleash'],
    action: 'drop_set',
    description: 'Trigger the epic drop effect',
    category: 'effects'
  },
  {
    phrases: ['crossfade left', 'deck a', 'left deck'],
    action: 'crossfade_left',
    description: 'Crossfade to deck A',
    category: 'mix'
  },
  {
    phrases: ['crossfade right', 'deck b', 'right deck'],
    action: 'crossfade_right',
    description: 'Crossfade to deck B',
    category: 'mix'
  },
  {
    phrases: ['echo on', 'add echo', 'echo effect'],
    action: 'echo_on',
    description: 'Enable echo effect on active deck',
    category: 'effects'
  },
  {
    phrases: ['echo off', 'remove echo', 'no echo'],
    action: 'echo_off',
    description: 'Disable echo effect on active deck',
    category: 'effects'
  },
  {
    phrases: ['volume up', 'louder', 'pump it up'],
    action: 'volume_up',
    description: 'Increase volume of active deck',
    category: 'mix'
  },
  {
    phrases: ['volume down', 'quieter', 'turn down'],
    action: 'volume_down',
    description: 'Decrease volume of active deck',
    category: 'mix'
  },
  {
    phrases: ['next track', 'switch track', 'change song'],
    action: 'next_track',
    description: 'Load next track',
    category: 'navigation'
  }
];

declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionConstructor;
    webkitSpeechRecognition: SpeechRecognitionConstructor;
    VoskRecognizer?: VoskRecognizerConstructor;
  }
}

export const useVoiceCommands = (): VoiceCommandsHookReturn => {
  const [state, setState] = useState<SpeechRecognitionState>({
    isAvailable: false,
    isListening: false,
    isProcessing: false,
    transcript: '',
    confidence: 0,
    error: null,
    lastCommand: null,
    supportedLanguages: [],
    useVosk: false
  });

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const voskRecognizerRef = useRef<VoskRecognizer | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const commandHandlersRef = useRef<Map<string, () => void>>(new Map());
  const commandsRef = useRef<VoiceCommand[]>([...DEFAULT_COMMANDS]);

  // Initialize speech recognition capabilities
  useEffect(() => {
    const initializeRecognition = async () => {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const isWebSpeechAvailable = !!SpeechRecognition;
      
      // Try to initialize Vosk first (if available)
      const voskAvailable = await initializeVosk();
      
      if (isWebSpeechAvailable && !voskAvailable) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';
        recognition.maxAlternatives = 3;

        recognition.onstart = () => {
          console.log('🎤 Voice recognition started');
          setState(prev => ({ 
            ...prev, 
            isListening: true, 
            error: null,
            transcript: ''
          }));
        };

        recognition.onresult = (event) => {
          let finalTranscript = '';
          let interimTranscript = '';
          
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i];
            const transcript = result[0].transcript.toLowerCase().trim();
            
            if (result.isFinal) {
              finalTranscript += transcript + ' ';
              processVoiceCommand(transcript, result[0].confidence);
            } else {
              interimTranscript += transcript;
            }
          }

          setState(prev => ({ 
            ...prev, 
            transcript: finalTranscript || interimTranscript,
            isProcessing: !!finalTranscript
          }));
        };

        recognition.onerror = (event) => {
          console.error('❌ Voice recognition error:', event.error);
          setState(prev => ({ 
            ...prev, 
            isListening: false,
            isProcessing: false,
            error: `Speech recognition error: ${event.error}`
          }));
        };

        recognition.onend = () => {
          console.log('🎤 Voice recognition ended');
          setState(prev => ({ 
            ...prev, 
            isListening: false,
            isProcessing: false
          }));
        };

        recognitionRef.current = recognition;
      }

      setState(prev => ({
        ...prev,
        isAvailable: isWebSpeechAvailable || voskAvailable,
        useVosk: voskAvailable,
        supportedLanguages: isWebSpeechAvailable ? ['en-US', 'en-GB'] : ['en']
      }));
    };

    initializeRecognition();

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (voskRecognizerRef.current) {
        voskRecognizerRef.current.free();
      }
    };
  }, []);

  const initializeVosk = useCallback(async (): Promise<boolean> => {
    try {
      // TODO: Implement Vosk WASM initialization
      // This requires:
      // 1. Loading Vosk WASM module (vosk-browser package)
      // 2. Loading language model files (en-us model)
      // 3. Setting up audio processing pipeline
      
      // For now, return false to use Web Speech API
      // In a full implementation, you would:
      
      /*
      const VoskModule = await import('vosk-browser');
      await VoskModule.default(); // Initialize WASM
      
      // Load model (requires model files in public directory)
      const modelResponse = await fetch('/models/vosk-model-en-us-0.22.zip');
      const modelData = await modelResponse.arrayBuffer();
      
      // Create recognizer
      const recognizer = new window.VoskRecognizer!(16000);
      voskRecognizerRef.current = recognizer;
      
      console.log('✅ Vosk WASM initialized successfully');
      return true;
      */
      
      console.log('⚠️ Vosk WASM not implemented, using Web Speech API fallback');
      return false;
    } catch (error) {
      console.error('❌ Vosk WASM initialization failed:', error);
      return false;
    }
  }, []);

  const processVoiceCommand = useCallback((transcript: string, confidence: number) => {
    console.log(`🎤 Processing: "${transcript}" (confidence: ${confidence})`);
    
    setState(prev => ({ 
      ...prev, 
      confidence,
      isProcessing: true 
    }));

    // Find matching command
    const command = commandsRef.current.find(cmd => 
      cmd.phrases.some(phrase => 
        transcript.includes(phrase.toLowerCase()) ||
        phrase.toLowerCase().includes(transcript)
      )
    );

    if (command) {
      const handler = commandHandlersRef.current.get(command.action);
      if (handler) {
        console.log(`✅ Executing command: ${command.action}`);
        setState(prev => ({ 
          ...prev, 
          lastCommand: command.action,
          isProcessing: false 
        }));
        handler();
      } else {
        console.warn(`⚠️ No handler for command: ${command.action}`);
        setState(prev => ({ 
          ...prev, 
          error: `No handler for command: ${command.action}`,
          isProcessing: false 
        }));
      }
    } else {
      console.log(`❓ No matching command for: "${transcript}"`);
      setState(prev => ({ 
        ...prev, 
        error: `Command not recognized: "${transcript}"`,
        isProcessing: false 
      }));
    }

    // Clear processing state after a delay
    setTimeout(() => {
      setState(prev => ({ ...prev, isProcessing: false }));
    }, 1000);
  }, []);

  const startListening = useCallback(() => {
    if (!state.isAvailable) {
      setState(prev => ({ 
        ...prev, 
        error: 'Voice recognition not available' 
      }));
      return;
    }

    if (state.useVosk && voskRecognizerRef.current) {
      // TODO: Implement Vosk audio capture and processing
      console.log('🎤 Starting Vosk recognition...');
      setState(prev => ({ 
        ...prev, 
        isListening: true, 
        error: null 
      }));
    } else if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.error('❌ Failed to start recognition:', error);
        setState(prev => ({ 
          ...prev, 
          error: 'Failed to start voice recognition' 
        }));
      }
    }
  }, [state.isAvailable, state.useVosk]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }

    setState(prev => ({ 
      ...prev, 
      isListening: false,
      isProcessing: false
    }));
  }, []);

  const addCommand = useCallback((command: VoiceCommand, handler: () => void) => {
    commandsRef.current.push(command);
    commandHandlersRef.current.set(command.action, handler);
    console.log(`✅ Added voice command: ${command.action}`);
  }, []);

  const removeCommand = useCallback((action: string) => {
    commandsRef.current = commandsRef.current.filter(cmd => cmd.action !== action);
    commandHandlersRef.current.delete(action);
    console.log(`🗑️ Removed voice command: ${action}`);
  }, []);

  const getRegisteredCommands = useCallback((): VoiceCommand[] => {
    return [...commandsRef.current];
  }, []);

  return {
    state,
    startListening,
    stopListening,
    addCommand,
    removeCommand,
    getRegisteredCommands,
    initializeVosk
  };
};