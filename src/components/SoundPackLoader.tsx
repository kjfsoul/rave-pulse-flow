import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, Download, Activity, Music, Volume2, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { toast } from 'sonner'

interface SoundStem {
  id: string
  name: string
  file: string
  bpm: number
  key: string
  duration: number
  type: string
  tags: string[]
}

interface SoundPack {
  id: string
  name: string
  description: string
  genre: string
  stems: SoundStem[]
}

interface SoundPackManifest {
  soundPacks: SoundPack[]
}

interface SoundPackLoaderProps {
  audioContext: AudioContext | null
  onStemAssign: (deckId: 'A' | 'B', stem: SoundStem, audioBuffer: AudioBuffer) => void
  assignedStems: {
    A: SoundStem | null
    B: SoundStem | null
  }
}

const SoundPackLoader: React.FC<SoundPackLoaderProps> = ({
  audioContext,
  onStemAssign,
  assignedStems
}) => {
  const [soundPacks, setSoundPacks] = useState<SoundPack[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPack, setSelectedPack] = useState<string | null>(null)
  const [previewingStem, setPreviewingStem] = useState<string | null>(null)
  const [loadingStems, setLoadingStems] = useState<Set<string>>(new Set())
  const [audioBuffers, setAudioBuffers] = useState<Map<string, AudioBuffer>>(new Map())
  const [previewGain, setPreviewGain] = useState(75)
  
  const previewSourceRef = useRef<AudioBufferSourceNode | null>(null)
  const previewGainRef = useRef<GainNode | null>(null)

  // Load sound pack manifest
  const loadSoundPacks = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/soundpacks/manifest.json')
      if (!response.ok) {
        throw new Error('Failed to load sound pack manifest')
      }
      const manifest: SoundPackManifest = await response.json()
      setSoundPacks(manifest.soundPacks)
      if (manifest.soundPacks.length > 0) {
        setSelectedPack(manifest.soundPacks[0].id)
      }
    } catch (error) {
      console.error('Error loading sound packs:', error)
      toast.error('Failed to load sound packs')
      // Fallback to demo data for development
      const demoManifest: SoundPackManifest = {
        soundPacks: [
          {
            id: 'demo-pack',
            name: 'Demo Pack',
            description: 'Generated demo sounds',
            genre: 'Electronic',
            stems: [
              {
                id: 'demo-kick',
                name: 'Demo Kick',
                file: 'demo/kick.mp3',
                bpm: 128,
                key: 'C',
                duration: 2.0,
                type: 'kick',
                tags: ['demo', 'kick']
              }
            ]
          }
        ]
      }
      setSoundPacks(demoManifest.soundPacks)
      if (demoManifest.soundPacks.length > 0) {
        setSelectedPack(demoManifest.soundPacks[0].id)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  // Generate realistic EDM procedural audio
  const generateProceduralAudio = useCallback((stem: SoundStem): AudioBuffer | null => {
    if (!audioContext) return null

    const duration = Math.min(stem.duration, 4) // Allow longer durations for better loops
    const sampleRate = audioContext.sampleRate
    const frameCount = Math.floor(sampleRate * duration)
    const buffer = audioContext.createBuffer(1, frameCount, sampleRate)
    const channelData = buffer.getChannelData(0)

    const twoPi = 2 * Math.PI
    const sampleRateInv = 1 / sampleRate

    for (let i = 0; i < frameCount; i++) {
      const t = i * sampleRateInv
      let sample = 0

      switch (stem.type) {
        case 'kick':
          // Realistic 808-style kick with sub-bass
          const kickPitch = 60 * Math.exp(-t * 25) // Faster pitch decay
          const kickBody = Math.sin(twoPi * kickPitch * t) * Math.exp(-t * 6)
          const kickClick = (Math.random() * 2 - 1) * Math.exp(-t * 80) * 0.1 // High-freq click
          sample = (kickBody + kickClick) * 0.8
          break
          
        case 'bass':
          // Wobble bass with complex filter sweep
          if (stem.id === 'wobble-bass') {
            const baseFreq = 55 // Low A
            const wobbleRate = 6 // 6Hz wobble
            const wobbleDepth = 25
            const bassFreq = baseFreq + wobbleDepth * Math.sin(twoPi * wobbleRate * t)
            
            // Create a rich bass with multiple oscillators
            const osc1 = Math.sin(twoPi * bassFreq * t)
            const osc2 = 0.5 * Math.sin(twoPi * bassFreq * 1.01 * t) // Slight detune
            const subOsc = 0.7 * Math.sin(twoPi * bassFreq * 0.5 * t) // Sub oscillator
            
            // Complex filter modulation
            const filterMod = 0.3 + 0.7 * Math.abs(Math.sin(twoPi * wobbleRate * 2 * t))
            const distortion = Math.tanh((osc1 + osc2) * 2) * 0.8
            
            sample = (distortion + subOsc) * filterMod * 0.7
          } else {
            // Sub bass - deep and clean
            const subFreq = 80
            const subOsc = Math.sin(twoPi * subFreq * t)
            const subHarmonic = 0.2 * Math.sin(twoPi * subFreq * 2 * t)
            sample = (subOsc + subHarmonic) * 0.8
          }
          break
          
        case 'lead':
          // Professional synth lead with detuned oscillators
          const rootFreq = stem.key === 'Am' ? 220 : 440 // Match the key
          const leadFreq1 = rootFreq
          const leadFreq2 = rootFreq * 1.007 // Slight detune for richness
          const leadFreq3 = rootFreq * 0.5 // Octave down
          
          // Create complex waveforms
          const saw1 = (2 * ((leadFreq1 * t) % 1) - 1)
          const saw2 = (2 * ((leadFreq2 * t) % 1) - 1)
          const sub = Math.sin(twoPi * leadFreq3 * t)
          
          // Dynamic filter with resonance simulation
          const filterFreq = 800 + 1200 * (0.5 + 0.5 * Math.sin(twoPi * 0.25 * t))
          const filterEnv = Math.sin(twoPi * filterFreq * t) * 0.1 + 1
          const resonance = 1 + 2 * Math.exp(-t * 3)
          
          const mixed = (saw1 + saw2 * 0.7 + sub * 0.3) / 2.5
          sample = mixed * filterEnv * resonance * 0.5
          break
          
        case 'keys':
          // House piano with chord progression
          const chord = stem.key === 'G' ? [196, 247, 294] : [220, 277, 330] // G major or A minor
          const beatTime = (t * stem.bpm / 60) % 4 // 4-beat pattern
          const chordIndex = Math.floor(beatTime)
          const pianoFreq = chord[chordIndex % chord.length]
          
          // Piano-like attack and decay
          const attack = Math.min(1, t * 50) // Quick attack
          const decay = Math.exp(-t * 0.8) // Slow decay
          const sustain = 0.3
          const envelope = attack * (decay + sustain)
          
          // Rich harmonic content for piano
          const fundamental = Math.sin(twoPi * pianoFreq * t)
          const harmonic2 = 0.4 * Math.sin(twoPi * pianoFreq * 2 * t)
          const harmonic3 = 0.2 * Math.sin(twoPi * pianoFreq * 3 * t)
          const harmonic4 = 0.1 * Math.sin(twoPi * pianoFreq * 4 * t)
          
          sample = (fundamental + harmonic2 + harmonic3 + harmonic4) * envelope * 0.6
          break
          
        case 'vocal':
          // Realistic vocal chop with formant synthesis
          const vocalNote = stem.key === 'G' ? 196 : 220
          const chopRate = stem.bpm / 60 * 4 // 16th note chops
          const chopPhase = (t * chopRate) % 1
          const gate = chopPhase < 0.25 ? 1 : 0 // Short chops
          
          // Formant frequencies for vowel sounds
          const formant1 = 730  // First formant (roughly "ah" sound)
          const formant2 = 1090 // Second formant
          const formant3 = 2440 // Third formant
          
          // Create vowel-like sound with multiple formants
          const voice1 = Math.sin(twoPi * vocalNote * t) * Math.sin(twoPi * formant1 * t * 0.1)
          const voice2 = 0.6 * Math.sin(twoPi * vocalNote * 1.5 * t) * Math.sin(twoPi * formant2 * t * 0.08)
          const voice3 = 0.3 * Math.sin(twoPi * vocalNote * 2 * t) * Math.sin(twoPi * formant3 * t * 0.05)
          
          const vibrato = 1 + 0.1 * Math.sin(twoPi * 5 * t) // 5Hz vibrato
          sample = (voice1 + voice2 + voice3) * gate * vibrato * 0.5
          break
          
        case 'percussion':
        case 'hihat':
          // Realistic hi-hat with proper frequency content
          const noise = Math.random() * 2 - 1
          const hihatFilter = Math.exp(-t * 12) // Quick decay
          const hipassSim = noise * (1 - Math.exp(-t * 100)) // High-pass simulation
          sample = hipassSim * hihatFilter * 0.3
          break
          
        default:
          // Default pluck sound
          const pluckFreq = 330
          const pluck = Math.sin(twoPi * pluckFreq * t) * Math.exp(-t * 4)
          sample = pluck * 0.4
      }

      // Apply overall envelope and anti-aliasing
      const fadeIn = Math.min(1, t * 20) // Quick fade-in
      const fadeOut = t > duration - 0.1 ? (duration - t) * 10 : 1 // Fade-out at end
      const envelope = fadeIn * fadeOut
      
      // Soft clipping to prevent harsh distortion
      const clipped = Math.tanh(sample * 1.5) * 0.7
      channelData[i] = clipped * envelope * 0.6
    }

    return buffer
  }, [audioContext])

  // Load audio file or generate procedural audio
  const loadStemAudio = useCallback(async (stem: SoundStem): Promise<AudioBuffer | null> => {
    if (!audioContext) return null

    // Check if already loaded
    if (audioBuffers.has(stem.id)) {
      return audioBuffers.get(stem.id)!
    }

    setLoadingStems(prev => new Set(prev).add(stem.id))

    try {
      // Try to load the actual file first
      const response = await fetch(`/soundpacks/${stem.file}`)
      if (response.ok) {
        const arrayBuffer = await response.arrayBuffer()
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
        
        setAudioBuffers(prev => new Map(prev).set(stem.id, audioBuffer))
        return audioBuffer
      } else {
        throw new Error(`File not found: ${stem.file}`)
      }
    } catch (error) {
      // More user-friendly error handling
      if (error instanceof DOMException && error.name === 'EncodingError') {
        console.info(`Audio file ${stem.file} not available, using high-quality generated sound`)
      } else {
        console.info(`Sound file ${stem.file} not found, creating procedural version`)
      }
      
      // Fallback to procedural generation
      const proceduralBuffer = generateProceduralAudio(stem)
      if (proceduralBuffer) {
        setAudioBuffers(prev => new Map(prev).set(stem.id, proceduralBuffer))
        toast.success(`🎵 Generated high-quality ${stem.type} sound for ${stem.name}`)
        return proceduralBuffer
      }
      
      toast.error(`Failed to create sound for ${stem.name}`)
      return null
    } finally {
      setLoadingStems(prev => {
        const newSet = new Set(prev)
        newSet.delete(stem.id)
        return newSet
      })
    }
  }, [audioContext, audioBuffers, generateProceduralAudio])

  // Preview stem audio
  const previewStem = useCallback(async (stem: SoundStem) => {
    if (!audioContext || previewingStem === stem.id) {
      stopPreview()
      return
    }

    try {
      const audioBuffer = await loadStemAudio(stem)
      if (!audioBuffer) return

      // Stop any current preview
      stopPreview()

      // Create audio nodes
      const source = audioContext.createBufferSource()
      const gainNode = audioContext.createGain()

      source.buffer = audioBuffer
      source.loop = true
      
      gainNode.gain.setValueAtTime(previewGain / 100 * 0.5, audioContext.currentTime)

      // Connect nodes
      source.connect(gainNode)
      gainNode.connect(audioContext.destination)

      // Store references
      previewSourceRef.current = source
      previewGainRef.current = gainNode

      // Start playback
      source.start()
      setPreviewingStem(stem.id)

      toast.success(`Previewing ${stem.name}`)
    } catch (error) {
      console.error('Error previewing stem:', error)
      toast.error('Failed to preview audio')
    }
  }, [audioContext, previewingStem, loadStemAudio, previewGain])

  // Stop preview
  const stopPreview = useCallback(() => {
    if (previewSourceRef.current) {
      try {
        previewSourceRef.current.stop()
      } catch (error) {
        // Ignore if already stopped
      }
      previewSourceRef.current = null
    }
    previewGainRef.current = null
    setPreviewingStem(null)
  }, [])

  // Assign stem to deck
  const assignToDeck = useCallback(async (deckId: 'A' | 'B', stem: SoundStem) => {
    const audioBuffer = await loadStemAudio(stem)
    if (audioBuffer) {
      onStemAssign(deckId, stem, audioBuffer)
      toast.success(`${stem.name} assigned to Deck ${deckId}`)
    }
  }, [loadStemAudio, onStemAssign])

  // Update preview gain
  const updatePreviewGain = useCallback((gain: number) => {
    setPreviewGain(gain)
    if (previewGainRef.current && audioContext) {
      previewGainRef.current.gain.setValueAtTime(gain / 100 * 0.5, audioContext.currentTime)
    }
  }, [audioContext])

  // Load sound packs on mount
  useEffect(() => {
    loadSoundPacks()
  }, [loadSoundPacks])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPreview()
    }
  }, [stopPreview])

  if (loading) {
    return (
      <Card className="bg-gray-900/90 border-cyan-500/30">
        <CardContent className="p-6 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-white">Loading sound packs...</p>
        </CardContent>
      </Card>
    )
  }

  const selectedPackData = soundPacks.find(pack => pack.id === selectedPack)

  return (
    <Card className="bg-gradient-to-t from-gray-900/95 to-gray-800/95 backdrop-blur-lg border-cyan-500/30 shadow-2xl">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-cyan-400 font-mono tracking-wider flex items-center">
          <Music className="w-6 h-6 mr-2" />
          SOUND PACK LOADER
        </CardTitle>
        
        {/* Preview Controls */}
        {previewingStem && (
          <div className="flex items-center gap-4 p-3 bg-black/50 rounded-lg">
            <Button
              onClick={stopPreview}
              size="sm"
              variant="destructive"
              className="bg-red-600 hover:bg-red-700"
            >
              <Pause className="w-4 h-4" />
            </Button>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Volume2 className="w-4 h-4 text-cyan-400" />
                <span className="text-sm text-white">Preview Volume: {previewGain}%</span>
              </div>
              <Slider
                value={[previewGain]}
                onValueChange={([gain]) => updatePreviewGain(gain)}
                min={0}
                max={100}
                step={5}
                className="w-full"
              />
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Pack Selector */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">Sound Pack</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {soundPacks.map(pack => (
              <Button
                key={pack.id}
                onClick={() => setSelectedPack(pack.id)}
                variant={selectedPack === pack.id ? "default" : "outline"}
                className={`p-3 h-auto ${
                  selectedPack === pack.id
                    ? 'bg-cyan-600 hover:bg-cyan-700 text-white'
                    : 'bg-black/50 border-gray-600 text-gray-300 hover:bg-gray-800'
                }`}
              >
                <div className="text-left">
                  <div className="font-semibold">{pack.name}</div>
                  <div className="text-xs opacity-80">{pack.genre} • {pack.stems.length} stems</div>
                </div>
              </Button>
            ))}
          </div>
        </div>

        {/* Current Pack Info */}
        {selectedPackData && (
          <div className="bg-black/50 rounded-lg p-4">
            <h3 className="font-bold text-white mb-1">{selectedPackData.name}</h3>
            <p className="text-gray-400 text-sm mb-2">{selectedPackData.description}</p>
            <Badge className="bg-cyan-600 text-white">{selectedPackData.genre}</Badge>
          </div>
        )}

        {/* Stem Grid */}
        {selectedPackData && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Available Stems</label>
            <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto">
              {selectedPackData.stems.map(stem => (
                <motion.div
                  key={stem.id}
                  className="bg-black/50 rounded-lg p-4 border border-gray-700 hover:border-cyan-500/50 transition-colors"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-white">{stem.name}</h4>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <span>{stem.bpm} BPM</span>
                        <span>•</span>
                        <span>Key: {stem.key}</span>
                        <span>•</span>
                        <span>{stem.duration}s</span>
                      </div>
                    </div>
                    <Badge className="bg-purple-600 text-white">{stem.type}</Badge>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {stem.tags.map(tag => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="text-xs border-gray-600 text-gray-400"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  {/* Controls */}
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => previewStem(stem)}
                      size="sm"
                      disabled={loadingStems.has(stem.id)}
                      className={`${
                        previewingStem === stem.id
                          ? 'bg-red-600 hover:bg-red-700'
                          : 'bg-green-600 hover:bg-green-700'
                      }`}
                    >
                      {loadingStems.has(stem.id) ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : previewingStem === stem.id ? (
                        <Pause className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                    </Button>

                    <Button
                      onClick={() => assignToDeck('A', stem)}
                      size="sm"
                      variant="outline"
                      disabled={loadingStems.has(stem.id)}
                      className={`border-purple-500 text-purple-400 hover:bg-purple-600 hover:text-white ${
                        assignedStems.A?.id === stem.id ? 'bg-purple-600 text-white' : ''
                      }`}
                    >
                      Deck A
                    </Button>

                    <Button
                      onClick={() => assignToDeck('B', stem)}
                      size="sm"
                      variant="outline"
                      disabled={loadingStems.has(stem.id)}
                      className={`border-cyan-500 text-cyan-400 hover:bg-cyan-600 hover:text-white ${
                        assignedStems.B?.id === stem.id ? 'bg-cyan-600 text-white' : ''
                      }`}
                    >
                      Deck B
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Assigned Stems Summary */}
        <div className="bg-black/50 rounded-lg p-4">
          <h3 className="font-bold text-white mb-3 flex items-center">
            <Activity className="w-5 h-5 mr-2" />
            Assigned Stems
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-purple-400 font-semibold">Deck A</div>
              {assignedStems.A ? (
                <div className="text-white text-sm">
                  {assignedStems.A.name}
                  <div className="text-gray-400 text-xs">{assignedStems.A.bpm} BPM</div>
                </div>
              ) : (
                <div className="text-gray-500 text-sm">No stem assigned</div>
              )}
            </div>
            <div className="text-center">
              <div className="text-cyan-400 font-semibold">Deck B</div>
              {assignedStems.B ? (
                <div className="text-white text-sm">
                  {assignedStems.B.name}
                  <div className="text-gray-400 text-xs">{assignedStems.B.bpm} BPM</div>
                </div>
              ) : (
                <div className="text-gray-500 text-sm">No stem assigned</div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default SoundPackLoader