import React, { useEffect, useRef, useState, useCallback } from 'react'
import { motion } from 'framer-motion'

interface LiveEqualizerProps {
  audioContext: AudioContext
  sourceNode: AudioNode
  onEqualizerNodeReady?: (equalizerNode: AudioNode) => void
}

interface EQBand {
  frequency: number
  label: string
  gain: number
}

const DEFAULT_BANDS: EQBand[] = [
  { frequency: 32, label: '32Hz', gain: 0 },
  { frequency: 64, label: '64Hz', gain: 0 },
  { frequency: 125, label: '125Hz', gain: 0 },
  { frequency: 250, label: '250Hz', gain: 0 },
  { frequency: 500, label: '500Hz', gain: 0 },
  { frequency: 1000, label: '1kHz', gain: 0 },
  { frequency: 2000, label: '2kHz', gain: 0 },
  { frequency: 4000, label: '4kHz', gain: 0 },
  { frequency: 8000, label: '8kHz', gain: 0 },
  { frequency: 16000, label: '16kHz', gain: 0 },
]

const LiveEqualizer: React.FC<LiveEqualizerProps> = ({
  audioContext,
  sourceNode,
  onEqualizerNodeReady
}) => {
  const [bands, setBands] = useState<EQBand[]>(DEFAULT_BANDS)
  const [isActive, setIsActive] = useState(false)
  const filtersRef = useRef<BiquadFilterNode[]>([])
  const outputNodeRef = useRef<GainNode | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animationFrameRef = useRef<number>()

  // Initialize audio chain
  useEffect(() => {
    if (!audioContext || !sourceNode) return

    // Create filters and output node
    const filters = DEFAULT_BANDS.map((band, index) => {
      const filter = audioContext.createBiquadFilter()
      filter.type = 'peaking'
      filter.frequency.value = band.frequency
      filter.Q.value = 1
      filter.gain.value = band.gain
      return filter
    })

    const outputNode = audioContext.createGain()
    const analyser = audioContext.createAnalyser()
    analyser.fftSize = 256
    analyser.smoothingTimeConstant = 0.8

    // Chain the audio nodes: source -> filters -> analyser -> output
    let currentNode: AudioNode = sourceNode
    filters.forEach(filter => {
      currentNode.connect(filter)
      currentNode = filter
    })
    currentNode.connect(analyser)
    analyser.connect(outputNode)

    // Store references
    filtersRef.current = filters
    outputNodeRef.current = outputNode
    analyserRef.current = analyser

    // Notify parent component
    if (onEqualizerNodeReady) {
      onEqualizerNodeReady(outputNode)
    }

    return () => {
      // Cleanup connections
      filters.forEach(filter => {
        filter.disconnect()
      })
      outputNode.disconnect()
      analyser.disconnect()
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [audioContext, sourceNode, onEqualizerNodeReady])

  // Update filter gain (debounced for performance)
  const updateBandGain = useCallback((bandIndex: number, gain: number) => {
    if (filtersRef.current[bandIndex]) {
      const clampedGain = Math.max(-12, Math.min(12, gain))
      
      // Update UI immediately for responsiveness
      setBands(prev => prev.map((band, index) => 
        index === bandIndex ? { ...band, gain: clampedGain } : band
      ))
      
      // Debounce audio updates to prevent overwhelming the audio thread
      clearTimeout(updateTimeouts[bandIndex])
      updateTimeouts[bandIndex] = setTimeout(() => {
        if (filtersRef.current[bandIndex] && audioContext) {
          filtersRef.current[bandIndex].gain.setTargetAtTime(
            clampedGain,
            audioContext.currentTime,
            0.05 // Faster transition for better responsiveness
          )
        }
      }, 16) // ~60 FPS debounce
    }
  }, [audioContext])
  
  // Store timeouts for debouncing
  const updateTimeouts: { [key: number]: NodeJS.Timeout } = {}

  // Reset all bands to 0dB
  const resetEQ = useCallback(() => {
    bands.forEach((_, index) => {
      updateBandGain(index, 0)
    })
  }, [bands, updateBandGain])

  // Canvas visualizer (throttled for performance)
  const drawVisualizer = useCallback(() => {
    if (!canvasRef.current || !analyserRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Throttle to 30 FPS instead of 60 for better performance
    setTimeout(() => {
      if (!analyserRef.current) return
      
      const bufferLength = Math.min(analyserRef.current.frequencyBinCount, 32) // Limit data points
      const dataArray = new Uint8Array(bufferLength)
      analyserRef.current.getByteFrequencyData(dataArray)

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw spectrum bars (optimized)
      const barWidth = canvas.width / bufferLength
      let x = 0

      ctx.fillStyle = 'rgba(0, 255, 255, 0.3)'
      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height * 0.6 // Reduced height calculations
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight)
        x += barWidth
      }

      animationFrameRef.current = requestAnimationFrame(drawVisualizer)
    }, 33) // ~30 FPS instead of 60
  }, [])

  // Start/stop visualizer
  useEffect(() => {
    if (isActive && analyserRef.current) {
      drawVisualizer()
    } else if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [isActive, drawVisualizer])

  return (
    <motion.div
      className="relative p-6 bg-gradient-to-t from-gray-900/90 to-gray-800/90 backdrop-blur-lg rounded-2xl border border-cyan-500/30 shadow-2xl"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      style={{
        boxShadow: isActive 
          ? '0 0 30px rgba(0, 255, 255, 0.4), inset 0 0 20px rgba(0, 255, 255, 0.1)'
          : '0 0 20px rgba(0, 255, 255, 0.2)'
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-cyan-400 font-mono tracking-wider">
          LIVE EQUALIZER
        </h3>
        <motion.button
          onClick={resetEQ}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold text-sm hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-200"
        >
          Reset EQ
        </motion.button>
      </div>

      {/* Canvas Visualizer */}
      <div className="relative mb-6">
        <canvas
          ref={canvasRef}
          width={400}
          height={80}
          className="w-full h-20 bg-black/50 rounded-lg border border-cyan-500/20"
          style={{ imageRendering: 'pixelated' }}
        />
        <motion.button
          onClick={() => setIsActive(!isActive)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`absolute top-2 right-2 w-8 h-8 rounded-full ${
            isActive 
              ? 'bg-green-500 shadow-lg shadow-green-500/50' 
              : 'bg-gray-600'
          } flex items-center justify-center transition-all duration-200`}
        >
          <div className={`w-3 h-3 rounded-full ${
            isActive ? 'bg-white animate-pulse' : 'bg-gray-400'
          }`} />
        </motion.button>
      </div>

      {/* EQ Sliders */}
      <div className="grid grid-cols-5 md:grid-cols-10 gap-4">
        {bands.map((band, index) => (
          <motion.div
            key={band.frequency}
            className="flex flex-col items-center space-y-2"
            whileHover={{ scale: 1.02 }}
          >
            {/* Gain Value Display */}
            <div className="text-xs font-mono text-cyan-300 bg-black/50 px-2 py-1 rounded min-w-[60px] text-center">
              {band.gain > 0 ? '+' : ''}{band.gain.toFixed(1)}dB
            </div>

            {/* Vertical Slider */}
            <div className="relative h-48 w-8 bg-gray-800 rounded-full border border-cyan-500/30 overflow-hidden">
              {/* Background gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-red-500/20 via-yellow-500/20 to-green-500/20" />
              
              {/* Center line (0dB) */}
              <div className="absolute left-0 right-0 h-0.5 bg-cyan-400 top-1/2 transform -translate-y-0.5" />
              
              {/* Slider Handle */}
              <motion.div
                className="absolute w-full h-4 bg-gradient-to-r from-cyan-400 to-blue-500 shadow-lg cursor-pointer"
                style={{
                  top: `${((12 - band.gain) / 24) * 100}%`,
                  transform: 'translateY(-50%)',
                  boxShadow: '0 0 10px rgba(0, 255, 255, 0.6)'
                }}
                drag="y"
                dragConstraints={{ top: 0, bottom: 192 - 16 }}
                dragElastic={0}
                onDrag={(_, info) => {
                  const sliderHeight = 192 - 16
                  const position = Math.max(0, Math.min(sliderHeight, info.point.y))
                  const gain = 12 - (position / sliderHeight) * 24
                  updateBandGain(index, gain)
                }}
                whileHover={{ 
                  scale: 1.1,
                  boxShadow: '0 0 15px rgba(0, 255, 255, 0.8)'
                }}
                whileDrag={{ 
                  scale: 1.15,
                  boxShadow: '0 0 20px rgba(0, 255, 255, 1)'
                }}
              />

              {/* Click area for direct positioning */}
              <div
                className="absolute inset-0 cursor-pointer"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect()
                  const y = e.clientY - rect.top
                  const sliderHeight = rect.height - 16
                  const position = Math.max(0, Math.min(sliderHeight, y - 8))
                  const gain = 12 - (position / sliderHeight) * 24
                  updateBandGain(index, gain)
                }}
              />
            </div>

            {/* Frequency Label */}
            <div className="text-xs font-mono text-gray-300 text-center min-w-[60px]">
              {band.label}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Status Indicator */}
      <div className="flex items-center justify-center mt-6 space-x-2">
        <div className={`w-2 h-2 rounded-full ${
          outputNodeRef.current ? 'bg-green-500 animate-pulse' : 'bg-red-500'
        }`} />
        <span className="text-xs text-gray-400 font-mono">
          {outputNodeRef.current ? 'CONNECTED' : 'DISCONNECTED'}
        </span>
      </div>
    </motion.div>
  )
}

export default LiveEqualizer