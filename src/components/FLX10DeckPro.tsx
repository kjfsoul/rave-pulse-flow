import React, { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Play, Pause, RotateCcw, Zap, Volume2, Settings, 
  BookOpen, User, ChevronRight, ChevronLeft, Info,
  Headphones, Mic, Activity, Target, Award, HelpCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ProfessionalAudioState, AudioTrack } from '@/lib/professionalAudioEngine'

// Use the professional audio state interface for compatibility
type ProfessionalControlsState = ProfessionalAudioState

// Use the professional audio track interface for compatibility  
type TrackAnalysis = AudioTrack

interface DJTechnique {
  id: string
  name: string
  description: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  instructions: string[]
  videoUrl?: string
}

interface FLX10DeckProProps {
  deckId: 'A' | 'B'
  audioBuffer: AudioBuffer | null
  controls: ProfessionalControlsState
  trackAnalysis: TrackAnalysis | null
  onControlChange: (key: string, value: any) => void
  onHotCueTrigger: (index: number, action: 'set' | 'trigger' | 'delete') => void
  onJogWheel: (direction: 'forward' | 'backward', intensity: number) => void
  onBeatJump: (beats: number) => void
  onLoop: (action: 'in' | 'out' | 'toggle' | 'exit') => void
  className?: string
}

const DJ_TECHNIQUES: DJTechnique[] = [
  {
    id: 'beatmatching',
    name: 'Beatmatching',
    difficulty: 'beginner',
    description: 'Match the tempo of two tracks for seamless mixing',
    instructions: [
      'Load a track and press PLAY',
      'Use PITCH fader to adjust BPM',
      'Watch the SYNC indicator',
      'Use JOG WHEEL for fine adjustments',
      'Press SYNC when close to lock tempo'
    ]
  },
  {
    id: 'harmonic_mixing',
    name: 'Harmonic Mixing',
    difficulty: 'intermediate',
    description: 'Mix tracks in compatible musical keys',
    instructions: [
      'Check track KEY display',
      'Find compatible keys (±1 semitone)',
      'Use KEYLOCK to maintain pitch',
      'Adjust PITCH without changing key',
      'Practice 5A → 5B progressions'
    ]
  },
  {
    id: 'scratching',
    name: 'Scratching',
    difficulty: 'advanced',
    description: 'Create rhythmic sounds using the jog wheel',
    instructions: [
      'Hold CUE button down',
      'Move JOG WHEEL back and forth',
      'Release CUE at the right moment',
      'Practice baby scratch first',
      'Progress to transformer scratches'
    ]
  }
]

const INSTRUCTION_MANUAL = {
  'lcd_display': {
    title: 'LCD Display',
    content: 'Shows track information, waveform, and BPM. The waveform displays beat markers and cue points for precise mixing.'
  },
  'hot_cues': {
    title: 'Hot Cue Pads',
    content: 'Set up to 8 instant cue points. Press empty pad to SET, press active pad to JUMP, hold SHIFT + pad to DELETE.'
  },
  'eq_controls': {
    title: 'EQ Controls',
    content: 'Three-band EQ (HIGH/MID/LOW). Center position is neutral. Turn left to cut, right to boost frequencies.'
  },
  'pitch_fader': {
    title: 'Pitch Fader',
    content: 'Adjust track tempo ±50%. Use for beatmatching. Center click returns to 0%. KEYLOCK maintains musical pitch.'
  },
  'jog_wheel': {
    title: 'Jog Wheel',
    content: 'Touch outer ring for pitch bend, inner for scratching. Pressure-sensitive for realistic turntable feel.'
  },
  'transport': {
    title: 'Transport Controls',
    content: 'PLAY/PAUSE, CUE (return to last cue point), SYNC (auto-beatmatch), LOOP controls for creative mixing.'
  }
}

const FLX10DeckPro: React.FC<FLX10DeckProProps> = ({
  deckId,
  audioBuffer,
  controls,
  trackAnalysis,
  onControlChange,
  onHotCueTrigger,
  onJogWheel,
  onBeatJump,
  onLoop,
  className = ''
}) => {
  const [showManual, setShowManual] = useState(false)
  const [showCoach, setShowCoach] = useState(false)
  const [selectedTechnique, setSelectedTechnique] = useState<DJTechnique | null>(null)
  const [manualSection, setManualSection] = useState('lcd_display')
  const [jogRotation, setJogRotation] = useState(0)
  const [isDraggingJog, setIsDraggingJog] = useState(false)
  const [lastJogAngle, setLastJogAngle] = useState(0)
  
  const jogRef = useRef<HTMLDivElement>(null)
  
  // Core Audio Architecture - Phase 1
  const audioContextRef = useRef<AudioContext | null>(null)
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null)
  const gainNodeRef = useRef<GainNode | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const masterGainRef = useRef<GainNode | null>(null)
  
  // Professional EQ Nodes - Phase 2 
  const lowEQRef = useRef<BiquadFilterNode | null>(null)
  const midEQRef = useRef<BiquadFilterNode | null>(null)
  const highEQRef = useRef<BiquadFilterNode | null>(null)
  const filterRef = useRef<BiquadFilterNode | null>(null)
  
  // Audio state management
  const [audioReady, setAudioReady] = useState(false)
  const [audioError, setAudioError] = useState<string | null>(null)

  const deckColor = deckId === 'A' ? 'from-purple-600 to-pink-600' : 'from-cyan-600 to-blue-600'
  const accentColor = deckId === 'A' ? 'purple' : 'cyan'

  // Phase 1: Core Audio Architecture Implementation
  const initializeAudioEngine = useCallback(async () => {
    try {
      console.log(`FLX10 Deck ${deckId}: Initializing professional audio engine...`)
      
      // Create AudioContext
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      
      if (audioContextRef.current.state === 'suspended') {
        console.log(`FLX10 Deck ${deckId}: Resuming suspended audio context...`)
        await audioContextRef.current.resume()
      }
      
      // Create core audio processing chain
      gainNodeRef.current = audioContextRef.current.createGain()
      analyserRef.current = audioContextRef.current.createAnalyser()
      masterGainRef.current = audioContextRef.current.createGain()
      
      // Configure analyser for professional visualization
      analyserRef.current.fftSize = 2048
      analyserRef.current.smoothingTimeConstant = 0.8
      
      // Set initial volumes (professional levels)
      gainNodeRef.current.gain.setValueAtTime(controls.volume / 100, audioContextRef.current.currentTime)
      masterGainRef.current.gain.setValueAtTime(1.0, audioContextRef.current.currentTime)
      
      // Create professional EQ chain (Phase 2)
      await initializeProfessionalEQ()
      
      // Connect core audio chain: source → gain → EQ → filter → analyser → master → output
      gainNodeRef.current.connect(lowEQRef.current!)
      lowEQRef.current!.connect(midEQRef.current!)
      midEQRef.current!.connect(highEQRef.current!)
      highEQRef.current!.connect(filterRef.current!)
      filterRef.current!.connect(analyserRef.current)
      analyserRef.current.connect(masterGainRef.current)
      // Note: Final connection to destination handled by parent DJ station
      
      setAudioReady(true)
      setAudioError(null)
      console.log(`FLX10 Deck ${deckId}: Professional audio engine initialized successfully`)
      
    } catch (error) {
      console.error(`FLX10 Deck ${deckId}: Audio engine initialization failed:`, error)
      setAudioError(`Audio engine failed: ${error.message}`)
      setAudioReady(false)
    }
  }, [deckId, controls.volume])

  // Phase 2: Professional EQ Implementation
  const initializeProfessionalEQ = useCallback(async () => {
    if (!audioContextRef.current) return
    
    try {
      // Create 3-band professional EQ
      lowEQRef.current = audioContextRef.current.createBiquadFilter()
      midEQRef.current = audioContextRef.current.createBiquadFilter()
      highEQRef.current = audioContextRef.current.createBiquadFilter()
      filterRef.current = audioContextRef.current.createBiquadFilter()
      
      // Configure Low EQ (low-shelf)
      lowEQRef.current.type = 'lowshelf'
      lowEQRef.current.frequency.setValueAtTime(250, audioContextRef.current.currentTime)
      lowEQRef.current.gain.setValueAtTime(controls.lowEQ - 12, audioContextRef.current.currentTime)
      
      // Configure Mid EQ (peaking)
      midEQRef.current.type = 'peaking'
      midEQRef.current.frequency.setValueAtTime(1000, audioContextRef.current.currentTime)
      midEQRef.current.Q.setValueAtTime(1, audioContextRef.current.currentTime)
      midEQRef.current.gain.setValueAtTime(controls.midEQ - 12, audioContextRef.current.currentTime)
      
      // Configure High EQ (high-shelf)
      highEQRef.current.type = 'highshelf'
      highEQRef.current.frequency.setValueAtTime(4000, audioContextRef.current.currentTime)
      highEQRef.current.gain.setValueAtTime(controls.highEQ - 12, audioContextRef.current.currentTime)
      
      // Configure Main Filter (lowpass)
      filterRef.current.type = 'lowpass'
      filterRef.current.frequency.setValueAtTime(20000 * (controls.filter / 100), audioContextRef.current.currentTime)
      filterRef.current.Q.setValueAtTime(1, audioContextRef.current.currentTime)
      
      console.log(`FLX10 Deck ${deckId}: Professional EQ initialized`)
    } catch (error) {
      console.error(`FLX10 Deck ${deckId}: EQ initialization failed:`, error)
      throw error
    }
  }, [deckId, controls.lowEQ, controls.midEQ, controls.highEQ, controls.filter])

  // Phase 3: Professional Demo Audio Generation
  const generateProfessionalDemoTrack = useCallback(async (): Promise<AudioBuffer | null> => {
    if (!audioContextRef.current) return null

    try {
      const sampleRate = audioContextRef.current.sampleRate
      const duration = 30 // 30 second demo track
      const frameCount = sampleRate * duration
      const audioBuffer = audioContextRef.current.createBuffer(2, frameCount, sampleRate) // Stereo
      
      const leftChannel = audioBuffer.getChannelData(0)
      const rightChannel = audioBuffer.getChannelData(1)
      
      const bpm = 128
      const beatDuration = 60 / bpm // seconds per beat
      const samplesPerBeat = sampleRate * beatDuration
      
      console.log(`FLX10 Deck ${deckId}: Generating professional demo track (${duration}s, ${bpm} BPM)`)
      
      for (let i = 0; i < frameCount; i++) {
        const t = i / sampleRate
        const beatTime = (t * bpm / 60) % 4 // 4-beat pattern
        const barTime = (t * bpm / 60) % 16 // 16-beat bar
        
        // Professional EDM structure
        let sample = 0
        
        // 1. Professional Kick Drum (every beat)
        const beatPosition = (t * bpm / 60) % 1
        if (beatPosition < 0.1) {
          const kickEnv = Math.exp(-beatPosition * 50)
          const kickFreq = 60 * Math.exp(-beatPosition * 20)
          const kick = Math.sin(2 * Math.PI * kickFreq * t) * kickEnv * 0.8
          sample += kick
        }
        
        // 2. Bass Line (808-style with harmonic progression)
        const bassFreq = deckId === 'A' ? 
          [65.4, 73.4, 82.4, 87.3][Math.floor(barTime / 4) % 4] : // C Major progression
          [110, 98, 87.3, 103.8][Math.floor(barTime / 4) % 4]     // A Minor progression
        
        const bassOsc = Math.sin(2 * Math.PI * bassFreq * t)
        const bassHarmonic = 0.3 * Math.sin(2 * Math.PI * bassFreq * 2 * t)
        const bassSub = 0.5 * Math.sin(2 * Math.PI * bassFreq * 0.5 * t)
        const bassEnv = Math.sin(2 * Math.PI * 0.25 * t) * 0.5 + 0.5 // 2-second cycle
        sample += (bassOsc + bassHarmonic + bassSub) * bassEnv * 0.4
        
        // 3. Professional Synth Lead (for EQ testing)
        const leadFreq = deckId === 'A' ? 523.25 : 440 // C5 or A4
        const leadDetuned = leadFreq * 1.007 // Slight detune for richness
        const lead1 = Math.sin(2 * Math.PI * leadFreq * t)
        const lead2 = Math.sin(2 * Math.PI * leadDetuned * t)
        const leadFilter = 0.5 + 0.5 * Math.sin(2 * Math.PI * 0.125 * t) // 8-second filter sweep
        const leadEnv = beatTime < 2 ? 0.3 : 0.1 // Accent first half of 4-beat pattern
        sample += (lead1 + lead2) * 0.5 * leadFilter * leadEnv * 0.3
        
        // 4. Hi-hats (for high-frequency EQ testing)
        if ((beatPosition + 0.5) % 1 < 0.05) { // Off-beat hi-hats
          const hihatEnv = Math.exp(-((beatPosition + 0.5) % 1) * 80)
          const hihat = (Math.random() * 2 - 1) * hihatEnv * 0.2
          sample += hihat
        }
        
        // 5. Reverb simulation (spatial depth)
        const reverb = sample * 0.1 * Math.sin(2 * Math.PI * t * 0.1)
        
        // Apply professional mastering curve
        const finalSample = Math.tanh(sample * 0.8) * 0.7
        
        // Stereo processing for professional sound
        leftChannel[i] = finalSample + reverb
        rightChannel[i] = finalSample - reverb * 0.5 // Slight stereo separation
      }
      
      console.log(`FLX10 Deck ${deckId}: Professional demo track generated successfully`)
      return audioBuffer
      
    } catch (error) {
      console.error(`FLX10 Deck ${deckId}: Demo track generation failed:`, error)
      return null
    }
  }, [deckId])

  // Phase 3: Load Demo Audio if no audioBuffer provided
  const loadDemoAudio = useCallback(async () => {
    if (audioBuffer) {
      console.log(`FLX10 Deck ${deckId}: Using provided audio buffer`)
      return audioBuffer
    }
    
    console.log(`FLX10 Deck ${deckId}: No audio buffer provided, generating demo track`)
    const demoBuffer = await generateProfessionalDemoTrack()
    
    if (demoBuffer) {
      // Create mock track analysis for demo
      const mockTrackAnalysis: TrackAnalysis = {
        buffer: demoBuffer,
        title: `Demo Track ${deckId}`,
        artist: `FLX10 Demo`,
        bpm: 128,
        key: deckId === 'A' ? 'C Major' : 'A Minor',
        energy: 8,
        genre: 'Progressive House',
        duration: 30,
        analyzedData: {
          beatgrid: [0, 25, 50, 75], // Beat positions for visualization
          waveformData: Array.from({length: 200}, (_, i) => Math.sin(i * 0.1) * 0.5 + 0.5),
          spectralCentroid: Array.from({length: 100}, () => Math.random()),
          mfcc: Array.from({length: 13}, () => Array.from({length: 100}, () => Math.random())),
          onsets: [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5], // Beat onsets
          harmonicContent: Array.from({length: 50}, () => Math.random())
        }
      }
      
      // Update parent with demo track data
      if (onControlChange) {
        onControlChange('_demoTrack', mockTrackAnalysis)
      }
    }
    
    return demoBuffer
  }, [audioBuffer, deckId, generateProfessionalDemoTrack, onControlChange])

  // Phase 1: Audio Buffer Management and Playback Control
  const startPlayback = useCallback(async () => {
    if (!audioContextRef.current || !gainNodeRef.current) {
      console.warn(`FLX10 Deck ${deckId}: Cannot start playback - audio engine not ready`)
      return false
    }

    try {
      // Stop any existing playback first
      await stopPlayback()
      
      // Load audio (either provided or demo)
      const bufferToPlay = await loadDemoAudio()
      if (!bufferToPlay) {
        console.error(`FLX10 Deck ${deckId}: No audio buffer available for playback`)
        return false
      }
      
      // Create new source node
      sourceNodeRef.current = audioContextRef.current.createBufferSource()
      sourceNodeRef.current.buffer = bufferToPlay
      sourceNodeRef.current.loop = true
      
      // Connect to audio processing chain
      sourceNodeRef.current.connect(gainNodeRef.current)
      
      // Start playback
      sourceNodeRef.current.start(0)
      console.log(`FLX10 Deck ${deckId}: Playback started successfully with ${bufferToPlay === audioBuffer ? 'provided' : 'demo'} audio`)
      
      // Update controls state
      onControlChange('isPlaying', true)
      return true
      
    } catch (error) {
      console.error(`FLX10 Deck ${deckId}: Playback start failed:`, error)
      return false
    }
  }, [audioBuffer, deckId, onControlChange, loadDemoAudio])

  const stopPlayback = useCallback(async () => {
    try {
      if (sourceNodeRef.current) {
        sourceNodeRef.current.stop()
        sourceNodeRef.current.disconnect()
        sourceNodeRef.current = null
        console.log(`FLX10 Deck ${deckId}: Playback stopped and cleaned up`)
      }
      
      // Update controls state
      onControlChange('isPlaying', false)
      return true
      
    } catch (error) {
      console.error(`FLX10 Deck ${deckId}: Playback stop failed:`, error)
      return false
    }
  }, [deckId, onControlChange])

  // Professional transport control with enhanced feedback
  const handleTransportControl = useCallback(async (action: 'play' | 'pause' | 'stop') => {
    try {
      if (!audioReady) {
        console.log(`FLX10 Deck ${deckId}: Initializing audio engine for transport control`)
        setAudioError('Initializing audio engine...')
        await initializeAudioEngine()
        setAudioError(null)
      }
      
      switch (action) {
        case 'play':
          if (!controls.isPlaying) {
            const success = await startPlayback()
            if (success) {
              // Show user feedback
              if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
                window.navigator.vibrate(50) // Haptic feedback if available
              }
              console.log(`FLX10 Deck ${deckId}: ▶️ PLAYING`)
            } else {
              setAudioError('Failed to start playback')
              setTimeout(() => setAudioError(null), 3000)
            }
          }
          break
        case 'pause':
        case 'stop':
          if (controls.isPlaying) {
            const success = await stopPlayback()
            if (success) {
              console.log(`FLX10 Deck ${deckId}: ⏸️ STOPPED`)
            } else {
              setAudioError('Failed to stop playback')
              setTimeout(() => setAudioError(null), 3000)
            }
          }
          break
      }
    } catch (error) {
      console.error(`FLX10 Deck ${deckId}: Transport control failed:`, error)
      setAudioError(`Transport error: ${error.message}`)
      setTimeout(() => setAudioError(null), 5000)
    }
  }, [audioReady, controls.isPlaying, deckId, initializeAudioEngine, startPlayback, stopPlayback])

  // Phase 3: Emergency Stop with complete cleanup
  const emergencyStop = useCallback(async () => {
    try {
      console.log(`FLX10 Deck ${deckId}: 🛑 EMERGENCY STOP ACTIVATED`)
      
      // Immediate audio cutoff
      if (sourceNodeRef.current) {
        sourceNodeRef.current.stop()
        sourceNodeRef.current.disconnect()
        sourceNodeRef.current = null
      }
      
      // Reset all gain nodes to silence
      if (gainNodeRef.current && audioContextRef.current) {
        gainNodeRef.current.gain.setValueAtTime(0, audioContextRef.current.currentTime)
      }
      if (masterGainRef.current && audioContextRef.current) {
        masterGainRef.current.gain.setValueAtTime(0, audioContextRef.current.currentTime)
      }
      
      // Update state
      onControlChange('isPlaying', false)
      
      // Restore volume after brief silence
      setTimeout(() => {
        if (gainNodeRef.current && audioContextRef.current) {
          gainNodeRef.current.gain.setTargetAtTime(controls.volume / 100, audioContextRef.current.currentTime, 0.1)
        }
        if (masterGainRef.current && audioContextRef.current) {
          masterGainRef.current.gain.setTargetAtTime(1.0, audioContextRef.current.currentTime, 0.1)
        }
      }, 100)
      
      console.log(`FLX10 Deck ${deckId}: Emergency stop completed successfully`)
      return true
      
    } catch (error) {
      console.error(`FLX10 Deck ${deckId}: Emergency stop failed:`, error)
      setAudioError('Emergency stop failed')
      setTimeout(() => setAudioError(null), 3000)
      return false
    }
  }, [deckId, onControlChange, controls.volume])

  // Phase 2: Real-time EQ and Effects Control
  const updateEQParameters = useCallback(() => {
    if (!audioContextRef.current || !lowEQRef.current || !midEQRef.current || !highEQRef.current) return
    
    try {
      const currentTime = audioContextRef.current.currentTime
      
      // Update EQ with smooth transitions (professional behavior)
      lowEQRef.current.gain.setTargetAtTime(controls.lowEQ - 12, currentTime, 0.1)
      midEQRef.current.gain.setTargetAtTime(controls.midEQ - 12, currentTime, 0.1)
      highEQRef.current.gain.setTargetAtTime(controls.highEQ - 12, currentTime, 0.1)
      
      console.log(`FLX10 Deck ${deckId}: EQ updated - Low: ${controls.lowEQ}, Mid: ${controls.midEQ}, High: ${controls.highEQ}`)
    } catch (error) {
      console.error(`FLX10 Deck ${deckId}: EQ update failed:`, error)
    }
  }, [controls.lowEQ, controls.midEQ, controls.highEQ, deckId])

  const updateFilterParameters = useCallback(() => {
    if (!audioContextRef.current || !filterRef.current) return
    
    try {
      const currentTime = audioContextRef.current.currentTime
      const filterFreq = 20000 * (controls.filter / 100)
      
      filterRef.current.frequency.setTargetAtTime(filterFreq, currentTime, 0.1)
      console.log(`FLX10 Deck ${deckId}: Filter updated to ${filterFreq}Hz`)
    } catch (error) {
      console.error(`FLX10 Deck ${deckId}: Filter update failed:`, error)
    }
  }, [controls.filter, deckId])

  const updateVolumeParameters = useCallback(() => {
    if (!audioContextRef.current || !gainNodeRef.current) return
    
    try {
      const currentTime = audioContextRef.current.currentTime
      const volume = controls.volume / 100
      
      gainNodeRef.current.gain.setTargetAtTime(volume, currentTime, 0.1)
      console.log(`FLX10 Deck ${deckId}: Volume updated to ${controls.volume}%`)
    } catch (error) {
      console.error(`FLX10 Deck ${deckId}: Volume update failed:`, error)
    }
  }, [controls.volume, deckId])

  // Phase 1: Audio buffer change handling
  useEffect(() => {
    if (audioBuffer && !audioReady) {
      console.log(`FLX10 Deck ${deckId}: New audio buffer received, initializing audio engine`)
      initializeAudioEngine()
    }
  }, [audioBuffer, audioReady, deckId, initializeAudioEngine])

  // Phase 2: Real-time parameter updates 
  useEffect(() => {
    if (audioReady) {
      updateEQParameters()
    }
  }, [audioReady, updateEQParameters])

  useEffect(() => {
    if (audioReady) {
      updateFilterParameters()
    }
  }, [audioReady, updateFilterParameters])

  useEffect(() => {
    if (audioReady) {
      updateVolumeParameters()
    }
  }, [audioReady, updateVolumeParameters])

  // Critical cleanup on component unmount
  useEffect(() => {
    return () => {
      console.log(`FLX10 Deck ${deckId}: Component unmounting, cleaning up audio resources`)
      
      try {
        // Stop playback
        if (sourceNodeRef.current) {
          sourceNodeRef.current.stop()
          sourceNodeRef.current.disconnect()
          sourceNodeRef.current = null
        }
        
        // Disconnect all nodes
        if (gainNodeRef.current) gainNodeRef.current.disconnect()
        if (lowEQRef.current) lowEQRef.current.disconnect()
        if (midEQRef.current) midEQRef.current.disconnect()
        if (highEQRef.current) highEQRef.current.disconnect()
        if (filterRef.current) filterRef.current.disconnect()
        if (analyserRef.current) analyserRef.current.disconnect()
        if (masterGainRef.current) masterGainRef.current.disconnect()
        
        console.log(`FLX10 Deck ${deckId}: Audio cleanup completed`)
      } catch (error) {
        console.error(`FLX10 Deck ${deckId}: Error during cleanup:`, error)
      }
    }
  }, [deckId])

  // Professional jog wheel rotation with BPM sync
  useEffect(() => {
    if (controls.isPlaying && !isDraggingJog && trackAnalysis) {
      const bpmAdjusted = trackAnalysis.bpm * (1 + controls.pitch / 100)
      const rotationSpeed = (bpmAdjusted / 60) * 360 / 33.33 // 33.33 RPM simulation
      
      const interval = setInterval(() => {
        setJogRotation(prev => (prev + rotationSpeed / 60) % 360)
      }, 16) // 60fps
      
      return () => clearInterval(interval)
    }
  }, [controls.isPlaying, controls.pitch, trackAnalysis, isDraggingJog])

  // Professional jog wheel interaction
  const handleJogInteraction = useCallback((event: React.MouseEvent) => {
    if (!jogRef.current) return
    
    const rect = jogRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const clientX = event.clientX
    const clientY = event.clientY
    
    const angle = Math.atan2(clientY - centerY, clientX - centerX) * (180 / Math.PI)
    const distance = Math.sqrt(Math.pow(clientX - centerX, 2) + Math.pow(clientY - centerY, 2))
    const radius = rect.width / 2
    
    if (isDraggingJog) {
      const deltaAngle = angle - lastJogAngle
      const normalizedDelta = ((deltaAngle + 180) % 360) - 180
      const intensity = Math.abs(normalizedDelta) / 180
      
      // Outer ring: pitch bend, Inner ring: scratching
      if (distance > radius * 0.7) {
        onJogWheel(normalizedDelta > 0 ? 'forward' : 'backward', intensity * 0.02)
      } else {
        onJogWheel(normalizedDelta > 0 ? 'forward' : 'backward', intensity * 0.1)
      }
      
      setJogRotation(prev => prev + normalizedDelta)
      setLastJogAngle(angle)
    }
  }, [isDraggingJog, lastJogAngle, onJogWheel])

  const startJogDrag = useCallback((event: React.MouseEvent) => {
    if (!jogRef.current) return
    
    setIsDraggingJog(true)
    const rect = jogRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const angle = Math.atan2(event.clientY - centerY, event.clientX - centerX) * (180 / Math.PI)
    setLastJogAngle(angle)
  }, [])

  const stopJogDrag = useCallback(() => {
    setIsDraggingJog(false)
  }, [])

  // Professional waveform rendering
  const renderProfessionalWaveform = () => {
    if (!trackAnalysis?.analyzedData?.waveformData) {
      return (
        <div className="h-20 bg-gray-900/80 border border-gray-700 rounded-lg flex items-center justify-center">
          <div className="text-gray-500 text-sm">Load track for waveform analysis</div>
        </div>
      )
    }

    return (
      <div className="h-20 bg-gray-900/80 border border-gray-700 rounded-lg overflow-hidden relative">
        <div className="flex items-end h-full px-1">
          {trackAnalysis.analyzedData.waveformData.map((amplitude, i) => (
            <div
              key={i}
              className={`flex-1 bg-gradient-to-t ${
                deckId === 'A' ? 'from-purple-500 to-purple-300' : 'from-cyan-500 to-cyan-300'
              } mx-px rounded-sm`}
              style={{ height: `${amplitude * 100}%` }}
            />
          ))}
        </div>
        
        {/* Playhead indicator */}
        <div className={`absolute top-0 bottom-0 w-0.5 bg-white shadow-lg transform transition-transform duration-75`} 
             style={{ left: '50%' }} />
             
        {/* Beat grid markers */}
        {trackAnalysis.analyzedData?.beatgrid?.map((beat, i) => (
          <div
            key={i}
            className="absolute top-0 bottom-0 w-px bg-yellow-400/60"
            style={{ left: `${beat}%` }}
          />
        ))}
      </div>
    )
  }

  // Professional EQ Control
  const EQKnob: React.FC<{
    label: string
    value: number
    onChange: (value: number) => void
    color: string
  }> = ({ label, value, onChange, color }) => {
    const rotation = (value + 100) * 1.35 - 135 // -135° to +135°
    
    return (
      <div className="flex flex-col items-center space-y-2">
        <label className={`text-xs font-semibold text-${color}-300 tracking-wider`}>
          {label}
        </label>
        <div className="relative">
          <div 
            className={`w-16 h-16 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-${color}-500/30 cursor-pointer shadow-lg`}
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect()
              const centerX = rect.left + rect.width / 2
              const centerY = rect.top + rect.height / 2
              const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI)
              const normalizedAngle = (angle + 135 + 360) % 360
              const newValue = (normalizedAngle / 270) * 200 - 100
              onChange(Math.max(-100, Math.min(100, newValue)))
            }}
          >
            <div 
              className={`absolute inset-1 rounded-full bg-gradient-to-br from-${color}-400 to-${color}-600 shadow-inner`}
              style={{ transform: `rotate(${rotation}deg)` }}
            >
              <div className="absolute top-1 left-1/2 w-1 h-5 bg-white rounded-full transform -translate-x-1/2 shadow-lg" />
            </div>
          </div>
        </div>
        <div className={`text-xs text-${color}-200 font-mono bg-gray-900/50 px-2 py-1 rounded`}>
          {value > 0 ? '+' : ''}{Math.round(value)}
        </div>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      <motion.div
        className={`bg-gradient-to-br from-gray-900/95 to-gray-800/90 backdrop-blur-xl rounded-3xl border-2 border-gradient-to-r ${deckColor} p-8 shadow-2xl relative overflow-hidden`}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Premium Background Effects */}
        <div className={`absolute inset-0 bg-gradient-to-br ${deckColor} opacity-5 rounded-3xl`} />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent)] rounded-3xl" />

        {/* Header with Controls */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className={`px-6 py-3 bg-gradient-to-r ${deckColor} rounded-xl shadow-lg`}>
              <h2 className="text-2xl font-bold text-white">DECK {deckId}</h2>
              <div className="text-xs text-white/80">Pioneer DDJ-FLX10</div>
            </div>
            
            {trackAnalysis && (
              <div className="flex items-center space-x-3">
                <Badge className={`bg-${accentColor}-600 text-white`}>
                  {trackAnalysis.genre}
                </Badge>
                <Badge className="bg-green-600 text-white">
                  Key: {trackAnalysis.key}
                </Badge>
                <Badge className="bg-orange-600 text-white">
                  Energy: {trackAnalysis.energy}/10
                </Badge>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Button
              onClick={() => setShowManual(!showManual)}
              variant="outline"
              size="sm"
              className={`border-${accentColor}-500/30 text-${accentColor}-300 hover:bg-${accentColor}-600/20`}
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Manual
            </Button>
            <Button
              onClick={() => setShowCoach(!showCoach)}
              variant="outline"
              size="sm"
              className={`border-${accentColor}-500/30 text-${accentColor}-300 hover:bg-${accentColor}-600/20`}
            >
              <User className="w-4 h-4 mr-2" />
              DJ Coach
            </Button>
          </div>
        </div>

        {/* Professional LCD Display */}
        <div className="mb-8 p-6 bg-black/90 border-2 border-gray-700 rounded-2xl">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-4">
              <div className={`text-2xl font-bold text-${accentColor}-300`}>
                {trackAnalysis?.title || 'No Track Loaded'}
              </div>
              {controls.isPlaying && (
                <div className="flex items-center space-x-2">
                  <Activity className={`w-5 h-5 text-${accentColor}-400 animate-pulse`} />
                  <span className={`text-${accentColor}-400 text-sm font-mono`}>PLAYING</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              <div className={`text-3xl font-mono font-bold text-${accentColor}-300`}>
                {trackAnalysis ? Math.round(trackAnalysis.bpm * (1 + controls.pitch / 100)) : '--'}
                <span className="text-sm ml-1">BPM</span>
              </div>
              
              {controls.isSync && (
                <Badge className="bg-green-600 text-white animate-pulse">
                  SYNC
                </Badge>
              )}
              
              {controls.keyLock && (
                <Badge className="bg-blue-600 text-white">
                  KEY LOCK
                </Badge>
              )}
              
              {/* Phase 1 & 2: Audio Engine Status Indicators */}
              {audioReady && (
                <Badge className="bg-green-600 text-white animate-pulse">
                  🎛️ AUDIO ENGINE
                </Badge>
              )}
              
              {audioError && (
                <Badge className="bg-red-600 text-white animate-pulse">
                  ⚠️ {audioError}
                </Badge>
              )}
              
              {!audioBuffer && audioReady && (
                <Badge className="bg-blue-600 text-white">
                  🎵 DEMO AUDIO
                </Badge>
              )}
            </div>
            
            {/* Emergency Audio Controls */}
            {audioReady && controls.isPlaying && (
              <div className="mt-2 flex justify-end">
                <Button
                  onClick={emergencyStop}
                  variant="destructive"
                  size="sm"
                  className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1 animate-pulse"
                >
                  🛑 EMERGENCY STOP
                </Button>
              </div>
            )}
          </div>

          {trackAnalysis?.artist && (
            <div className={`text-${accentColor}-400 text-lg mb-4`}>
              {trackAnalysis.artist}
            </div>
          )}

          {renderProfessionalWaveform()}
        </div>

        {/* Professional Hot Cue Pads */}
        <div className="mb-8">
          <h3 className={`text-lg font-bold text-${accentColor}-300 mb-4 tracking-wider`}>
            HOT CUE PERFORMANCE PADS
          </h3>
          <div className="grid grid-cols-4 gap-3">
            {controls.hotCues.map((cue, index) => (
              <motion.button
                key={index}
                className={`aspect-square rounded-xl font-bold text-sm transition-all duration-150 border-2 ${
                  cue.active
                    ? `bg-gradient-to-br ${cue.color} border-white/50 text-white shadow-lg`
                    : `bg-gray-800/60 border-gray-600 text-gray-400 hover:border-${accentColor}-500/50 hover:text-${accentColor}-300`
                }`}
                whileTap={{ scale: 0.95 }}
                onClick={() => onHotCueTrigger(index, cue.active ? 'trigger' : 'set')}
                onContextMenu={(e) => {
                  e.preventDefault()
                  if (cue.active) onHotCueTrigger(index, 'delete')
                }}
              >
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="text-lg font-bold">{index + 1}</div>
                  {cue.active && (
                    <div className="text-xs mt-1 opacity-80">{cue.name}</div>
                  )}
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Professional EQ Section */}
        <div className="mb-8">
          <h3 className={`text-lg font-bold text-${accentColor}-300 mb-4 tracking-wider`}>
            3-BAND EQUALIZER
          </h3>
          <div className="flex justify-around items-center">
            <EQKnob
              label="HIGH"
              value={controls.highEQ}
              onChange={(value) => onControlChange('highEQ', value)}
              color={accentColor}
            />
            <EQKnob
              label="MID"
              value={controls.midEQ}
              onChange={(value) => onControlChange('midEQ', value)}
              color={accentColor}
            />
            <EQKnob
              label="LOW"
              value={controls.lowEQ}
              onChange={(value) => onControlChange('lowEQ', value)}
              color={accentColor}
            />
          </div>
        </div>

        {/* Professional Pitch Control */}
        <div className="mb-8 flex items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <h3 className={`text-lg font-bold text-${accentColor}-300 tracking-wider`}>
              PITCH CONTROL
            </h3>
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <div className={`text-2xl font-mono font-bold text-${accentColor}-300`}>
                  {controls.pitch > 0 ? '+' : ''}{controls.pitch.toFixed(1)}%
                </div>
                <div className="h-64 relative">
                  <input
                    type="range"
                    min="-50"
                    max="50"
                    step="0.1"
                    value={controls.pitch}
                    onChange={(e) => onControlChange('pitch', parseFloat(e.target.value))}
                    className={`writing-mode-vertical-lr h-full w-6 bg-gray-800 rounded-full appearance-none cursor-pointer slider-${accentColor}`}
                    style={{ writingMode: 'vertical-lr' }}
                  />
                </div>
              </div>
              
              <div className="flex flex-col space-y-3">
                <Button
                  onClick={() => onControlChange('keyLock', !controls.keyLock)}
                  className={`${controls.keyLock ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-700 hover:bg-gray-600'}`}
                >
                  Key Lock
                </Button>
                <Button
                  onClick={() => onControlChange('pitch', 0)}
                  variant="outline"
                  className={`border-${accentColor}-500/30 text-${accentColor}-300`}
                >
                  Reset
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Professional Transport Controls */}
        <div className="mb-8 flex justify-center space-x-4">
          <motion.button
            className={`px-8 py-4 rounded-xl font-bold text-lg transition-all duration-200 border-2 ${
              controls.isPlaying
                ? `bg-gradient-to-br from-red-600 to-red-800 border-red-400 text-white shadow-lg shadow-red-500/50`
                : `bg-gradient-to-br from-green-600 to-green-800 border-green-400 text-white shadow-lg shadow-green-500/50`
            }`}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleTransportControl(controls.isPlaying ? 'pause' : 'play')}
          >
            <div className="flex items-center space-x-2">
              {controls.isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
              <span>{controls.isPlaying ? 'PAUSE' : 'PLAY'}</span>
            </div>
          </motion.button>

          <motion.button
            className={`px-8 py-4 rounded-xl font-bold text-lg border-2 transition-all duration-200 ${
              controls.isCued
                ? `bg-gradient-to-br from-${accentColor}-600 to-${accentColor}-800 border-${accentColor}-400 text-white shadow-lg`
                : 'bg-gray-700 border-gray-500 text-gray-300 hover:bg-gray-600'
            }`}
            whileTap={{ scale: 0.95 }}
            onClick={() => onControlChange('isCued', !controls.isCued)}
          >
            <div className="flex items-center space-x-2">
              <RotateCcw className="w-6 h-6" />
              <span>CUE</span>
            </div>
          </motion.button>

          <motion.button
            className={`px-8 py-4 rounded-xl font-bold text-lg border-2 transition-all duration-200 ${
              controls.isSync
                ? 'bg-gradient-to-br from-yellow-600 to-yellow-800 border-yellow-400 text-white shadow-lg shadow-yellow-500/50'
                : 'bg-gray-700 border-gray-500 text-gray-300 hover:bg-gray-600'
            }`}
            whileTap={{ scale: 0.95 }}
            onClick={() => onControlChange('isSync', !controls.isSync)}
          >
            <div className="flex items-center space-x-2">
              <Zap className="w-6 h-6" />
              <span>SYNC</span>
            </div>
          </motion.button>
        </div>

        {/* Professional Jog Wheel */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <h3 className={`text-center text-lg font-bold text-${accentColor}-300 mb-4 tracking-wider`}>
              PROFESSIONAL JOG WHEEL
            </h3>
            <motion.div
              ref={jogRef}
              className={`w-40 h-40 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 border-4 border-${accentColor}-500/50 cursor-pointer relative overflow-hidden shadow-2xl`}
              style={{ transform: `rotate(${jogRotation}deg)` }}
              onMouseDown={startJogDrag}
              onMouseMove={handleJogInteraction}
              onMouseUp={stopJogDrag}
              onMouseLeave={stopJogDrag}
              whileHover={{ scale: 1.05 }}
              animate={controls.isPlaying ? {
                boxShadow: [
                  `0 0 20px rgba(${deckId === 'A' ? '168, 85, 247' : '6, 182, 212'}, 0.3)`,
                  `0 0 40px rgba(${deckId === 'A' ? '168, 85, 247' : '6, 182, 212'}, 0.6)`,
                  `0 0 20px rgba(${deckId === 'A' ? '168, 85, 247' : '6, 182, 212'}, 0.3)`
                ]
              } : {}}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {/* Jog wheel surface with professional markings */}
              <div className="absolute inset-4 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 border border-gray-600">
                {/* Rotation markers */}
                {Array.from({ length: 24 }).map((_, i) => (
                  <div
                    key={i}
                    className={`absolute w-0.5 h-8 bg-${accentColor}-400/60`}
                    style={{
                      top: '8px',
                      left: '50%',
                      transformOrigin: '50% 68px',
                      transform: `translateX(-50%) rotate(${i * 15}deg)`
                    }}
                  />
                ))}
                
                {/* Center element */}
                <div className={`absolute inset-8 rounded-full bg-gradient-to-br from-${accentColor}-500 to-${accentColor}-700 flex items-center justify-center shadow-inner`}>
                  <motion.div
                    className="w-8 h-8 rounded-full bg-white/20 border border-white/40"
                    animate={controls.isPlaying ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ duration: 0.6, repeat: Infinity }}
                  />
                </div>
              </div>

              {/* Touch indicator */}
              <AnimatePresence>
                {isDraggingJog && (
                  <motion.div
                    className={`absolute inset-0 rounded-full border-2 border-${accentColor}-400 bg-${accentColor}-500/20`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                  />
                )}
              </AnimatePresence>
            </motion.div>
            
            <div className="text-center mt-4 space-y-2">
              <div className={`text-sm text-${accentColor}-300`}>
                Outer Ring: Pitch Bend • Inner Ring: Scratch
              </div>
              <div className="text-xs text-gray-500">
                {isDraggingJog ? 'ACTIVE' : 'STANDBY'}
              </div>
            </div>
          </div>
        </div>

        {/* Professional Status Display */}
        <div className="bg-black/80 border border-gray-700 rounded-xl p-4">
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <div className={`text-${accentColor}-300 text-sm font-semibold`}>VOLUME</div>
              <div className="text-white text-lg font-mono">{Math.round(controls.volume)}%</div>
            </div>
            <div>
              <div className={`text-${accentColor}-300 text-sm font-semibold`}>FILTER</div>
              <div className="text-white text-lg font-mono">
                {controls.filter === 0 ? 'OFF' : controls.filter > 0 ? `HPF ${controls.filter}` : `LPF ${Math.abs(controls.filter)}`}
              </div>
            </div>
            <div>
              <div className={`text-${accentColor}-300 text-sm font-semibold`}>LOOP</div>
              <div className="text-white text-lg font-mono">
                {controls.loopActive ? `${controls.loopLength} BEAT` : 'OFF'}
              </div>
            </div>
            <div>
              <div className={`text-${accentColor}-300 text-sm font-semibold`}>STATUS</div>
              <div className="flex items-center justify-center space-x-2">
                {audioBuffer && <div className="w-2 h-2 bg-green-400 rounded-full" />}
                <div className="text-white text-sm">
                  {audioBuffer ? 'READY' : 'NO AUDIO'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Instruction Manual Modal */}
      <AnimatePresence>
        {showManual && (
          <motion.div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="max-w-4xl w-full max-h-[90vh] overflow-hidden"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <Card className="bg-gray-900 border-gray-700">
                <CardHeader className="border-b border-gray-700">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl text-white flex items-center">
                      <BookOpen className="w-6 h-6 mr-3" />
                      Pioneer DDJ-FLX10 Instruction Manual
                    </CardTitle>
                    <Button
                      onClick={() => setShowManual(false)}
                      variant="outline"
                      size="sm"
                      className="text-gray-400 border-gray-600"
                    >
                      ✕
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <Tabs value={manualSection} onValueChange={setManualSection}>
                    <TabsList className="grid w-full grid-cols-6 bg-gray-800">
                      {Object.keys(INSTRUCTION_MANUAL).map((section) => (
                        <TabsTrigger key={section} value={section} className="text-sm">
                          {INSTRUCTION_MANUAL[section as keyof typeof INSTRUCTION_MANUAL].title}
                        </TabsTrigger>
                      ))}
                    </TabsList>

                    {Object.entries(INSTRUCTION_MANUAL).map(([key, manual]) => (
                      <TabsContent key={key} value={key} className="mt-6">
                        <div className="space-y-4">
                          <h3 className="text-xl font-bold text-white">{manual.title}</h3>
                          <p className="text-gray-300 leading-relaxed">{manual.content}</p>
                          
                          {/* Add interactive elements here */}
                          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                            <div className="flex items-center space-x-2 text-blue-400 mb-2">
                              <Info className="w-4 h-4" />
                              <span className="font-semibold">Pro Tip</span>
                            </div>
                            <p className="text-gray-300 text-sm">
                              {key === 'hot_cues' && "Color-code your cues: Red for drops, Blue for breakdowns, Green for vocals."}
                              {key === 'eq_controls' && "Use EQ creatively: Cut lows when introducing a new track to avoid muddy bass."}
                              {key === 'pitch_fader' && "Practice beatmatching by ear before relying on SYNC - it will make you a better DJ."}
                              {key === 'jog_wheel' && "Light touches on the outer ring for subtle adjustments, firm pressure for dramatic effects."}
                              {key === 'transport' && "Always use CUE to set your starting point before attempting complex transitions."}
                              {key === 'lcd_display' && "Watch the waveform peaks to identify the best mixing points in your tracks."}
                            </p>
                          </div>
                        </div>
                      </TabsContent>
                    ))}
                  </Tabs>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DJ Coach Modal */}
      <AnimatePresence>
        {showCoach && (
          <motion.div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="max-w-2xl w-full max-h-[90vh] overflow-hidden"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <Card className="bg-gray-900 border-gray-700">
                <CardHeader className="border-b border-gray-700">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl text-white flex items-center">
                      <User className="w-6 h-6 mr-3" />
                      Virtual DJ Mentor
                    </CardTitle>
                    <Button
                      onClick={() => setShowCoach(false)}
                      variant="outline"
                      size="sm"
                      className="text-gray-400 border-gray-600"
                    >
                      ✕
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  {!selectedTechnique ? (
                    <div className="space-y-6">
                      <div className="text-center">
                        <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-cyan-600 rounded-full flex items-center justify-center mx-auto mb-4">
                          <User className="w-10 h-10 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">
                          Welcome to DJ Mastery Training
                        </h3>
                        <p className="text-gray-300">
                          Choose a technique to learn with step-by-step guidance
                        </p>
                      </div>

                      <div className="space-y-3">
                        {DJ_TECHNIQUES.map((technique) => (
                          <motion.button
                            key={technique.id}
                            className="w-full p-4 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 transition-all text-left"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setSelectedTechnique(technique)}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="text-white font-semibold">{technique.name}</h4>
                                <p className="text-gray-400 text-sm mt-1">{technique.description}</p>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Badge 
                                  className={`${
                                    technique.difficulty === 'beginner' ? 'bg-green-600' :
                                    technique.difficulty === 'intermediate' ? 'bg-yellow-600' :
                                    'bg-red-600'
                                  } text-white`}
                                >
                                  {technique.difficulty}
                                </Badge>
                                <ChevronRight className="w-4 h-4 text-gray-400" />
                              </div>
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => setSelectedTechnique(null)}
                          className="flex items-center text-gray-400 hover:text-white transition-colors"
                        >
                          <ChevronLeft className="w-4 h-4 mr-1" />
                          Back to Techniques
                        </button>
                        <Badge 
                          className={`${
                            selectedTechnique.difficulty === 'beginner' ? 'bg-green-600' :
                            selectedTechnique.difficulty === 'intermediate' ? 'bg-yellow-600' :
                            'bg-red-600'
                          } text-white`}
                        >
                          {selectedTechnique.difficulty}
                        </Badge>
                      </div>

                      <div>
                        <h3 className="text-2xl font-bold text-white mb-2">
                          {selectedTechnique.name}
                        </h3>
                        <p className="text-gray-300 mb-6">
                          {selectedTechnique.description}
                        </p>

                        <div className="space-y-4">
                          <h4 className="text-lg font-semibold text-white flex items-center">
                            <Target className="w-5 h-5 mr-2" />
                            Step-by-Step Instructions
                          </h4>
                          
                          {selectedTechnique.instructions.map((instruction, index) => (
                            <div key={index} className="flex items-start space-x-3 p-3 bg-gray-800 rounded-lg">
                              <div className={`w-6 h-6 rounded-full bg-${accentColor}-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}>
                                {index + 1}
                              </div>
                              <p className="text-gray-300">{instruction}</p>
                            </div>
                          ))}
                        </div>

                        <div className="mt-6 p-4 bg-blue-900/30 border border-blue-700 rounded-lg">
                          <div className="flex items-center space-x-2 text-blue-400 mb-2">
                            <Award className="w-4 h-4" />
                            <span className="font-semibold">Master's Advice</span>
                          </div>
                          <p className="text-blue-200 text-sm">
                            {selectedTechnique.difficulty === 'beginner' && 
                              "Start slow and focus on muscle memory. Speed comes with practice."}
                            {selectedTechnique.difficulty === 'intermediate' && 
                              "Listen to the harmonic content. Your ears are your best tool."}
                            {selectedTechnique.difficulty === 'advanced' && 
                              "Precision and timing are everything. Practice daily for best results."}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default FLX10DeckPro
