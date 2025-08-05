/**
 * Professional Audio Engine for FLX10DeckPro
 * High-quality audio processing with professional DJ features
 */

export interface AudioTrack {
  buffer: AudioBuffer
  title: string
  artist: string
  bpm: number
  key: string
  energy: number
  genre: string
  duration: number
  analyzedData: {
    beatgrid: number[]
    waveformData: number[]
    spectralCentroid: number[]
    mfcc: number[][]
    onsets: number[]
    harmonicContent: number[]
  }
}

export interface ProfessionalAudioState {
  isPlaying: boolean
  position: number
  pitch: number
  volume: number
  lowEQ: number
  midEQ: number
  highEQ: number
  filter: number
  keyLock: boolean
  loopActive: boolean
  loopStart: number
  loopEnd: number
  hotCues: Array<{
    position: number
    active: boolean
    name: string
    color: string
  }>
  quantize: boolean
  quantizeGrid: number
  
  // Additional FLX10DeckPro compatibility fields
  isCued: boolean
  isSync: boolean
  loopLength: number
}

export class ProfessionalAudioEngine {
  private audioContext: AudioContext
  private sourceNode: AudioBufferSourceNode | null = null
  private gainNode: GainNode
  private lowEQNode: BiquadFilterNode
  private midEQNode: BiquadFilterNode
  private highEQNode: BiquadFilterNode
  private filterNode: BiquadFilterNode
  private analyserNode: AnalyserNode
  private outputNode: GainNode
  
  // Professional features
  private pitchShiftNode: ScriptProcessorNode | null = null
  private keyLockProcessor: AudioWorkletNode | null = null
  private limiterNode: DynamicsCompressorNode
  private reverbNode: ConvolverNode | null = null
  
  // State management
  private currentTrack: AudioTrack | null = null
  private state: ProfessionalAudioState
  private callbacks: {
    onPositionUpdate?: (position: number) => void
    onBeatDetection?: (beat: number) => void
    onEndOfTrack?: () => void
  } = {}

  constructor(audioContext: AudioContext) {
    this.audioContext = audioContext
    
    // Initialize state
    this.state = {
      isPlaying: false,
      position: 0,
      pitch: 0,
      volume: 80,
      lowEQ: 0,
      midEQ: 0,
      highEQ: 0,
      filter: 0,
      keyLock: false,
      loopActive: false,
      loopStart: 0,
      loopEnd: 0,
      hotCues: Array(8).fill(null).map((_, i) => ({
        position: 0,
        active: false,
        name: `Cue ${i + 1}`,
        color: this.getHotCueColor(i)
      })),
      quantize: true,
      quantizeGrid: 16 // 16th notes
    }

    this.initializeAudioChain()
  }

  private initializeAudioChain() {
    // Create audio nodes
    this.gainNode = this.audioContext.createGain()
    this.lowEQNode = this.audioContext.createBiquadFilter()
    this.midEQNode = this.audioContext.createBiquadFilter()
    this.highEQNode = this.audioContext.createBiquadFilter()
    this.filterNode = this.audioContext.createBiquadFilter()
    this.analyserNode = this.audioContext.createAnalyser()
    this.outputNode = this.audioContext.createGain()
    this.limiterNode = this.audioContext.createDynamicsCompressor()

    // Configure EQ nodes
    this.lowEQNode.type = 'lowshelf'
    this.lowEQNode.frequency.value = 320
    this.midEQNode.type = 'peaking'
    this.midEQNode.frequency.value = 1000
    this.midEQNode.Q.value = 0.5
    this.highEQNode.type = 'highshelf'
    this.highEQNode.frequency.value = 3200

    // Configure filter node
    this.filterNode.type = 'allpass'
    this.filterNode.frequency.value = 1000

    // Configure analyser
    this.analyserNode.fftSize = 4096
    this.analyserNode.smoothingTimeConstant = 0.8

    // Configure limiter
    this.limiterNode.threshold.value = -3
    this.limiterNode.knee.value = 12
    this.limiterNode.ratio.value = 20
    this.limiterNode.attack.value = 0.003
    this.limiterNode.release.value = 0.25

    // Chain audio nodes
    this.gainNode
      .connect(this.lowEQNode)
      .connect(this.midEQNode)
      .connect(this.highEQNode)
      .connect(this.filterNode)
      .connect(this.limiterNode)
      .connect(this.analyserNode)
      .connect(this.outputNode)
  }

  private getHotCueColor(index: number): string {
    const colors = [
      'from-red-500 to-red-700',
      'from-orange-500 to-orange-700',
      'from-yellow-500 to-yellow-700',
      'from-green-500 to-green-700',
      'from-blue-500 to-blue-700',
      'from-indigo-500 to-indigo-700',
      'from-purple-500 to-purple-700',
      'from-pink-500 to-pink-700'
    ]
    return colors[index % colors.length]
  }

  async loadTrack(audioBuffer: AudioBuffer, metadata: Partial<AudioTrack> = {}): Promise<AudioTrack> {
    // Analyze audio buffer for professional features
    const analyzedData = await this.analyzeAudioBuffer(audioBuffer)
    
    const track: AudioTrack = {
      buffer: audioBuffer,
      title: metadata.title || 'Unknown Track',
      artist: metadata.artist || 'Unknown Artist',
      bpm: metadata.bpm || await this.detectBPM(audioBuffer),
      key: metadata.key || await this.detectKey(audioBuffer),
      energy: metadata.energy || this.calculateEnergy(analyzedData),
      genre: metadata.genre || 'Electronic',
      duration: audioBuffer.duration,
      analyzedData
    }

    this.currentTrack = track
    return track
  }

  private async analyzeAudioBuffer(buffer: AudioBuffer): Promise<AudioTrack['analyzedData']> {
    const channelData = buffer.getChannelData(0)
    const sampleRate = buffer.sampleRate
    
    // Generate waveform data (downsampled for visualization)
    const waveformData = this.generateWaveformData(channelData, 256)
    
    // Detect beats and create beatgrid
    const beatgrid = await this.generateBeatGrid(channelData, sampleRate)
    
    // Spectral analysis
    const spectralCentroid = this.calculateSpectralCentroid(channelData, sampleRate)
    const mfcc = this.calculateMFCC(channelData, sampleRate)
    const onsets = this.detectOnsets(channelData, sampleRate)
    const harmonicContent = this.analyzeHarmonicContent(channelData, sampleRate)

    return {
      beatgrid,
      waveformData,
      spectralCentroid,
      mfcc,
      onsets,
      harmonicContent
    }
  }

  private generateWaveformData(channelData: Float32Array, targetLength: number): number[] {
    const waveform: number[] = []
    const blockSize = Math.floor(channelData.length / targetLength)
    
    for (let i = 0; i < targetLength; i++) {
      let sum = 0
      let peak = 0
      
      for (let j = 0; j < blockSize; j++) {
        const sample = Math.abs(channelData[i * blockSize + j] || 0)
        sum += sample
        peak = Math.max(peak, sample)
      }
      
      // Use RMS with peak detection for better visualization
      const rms = Math.sqrt(sum / blockSize)
      const amplitude = Math.max(rms, peak * 0.3)
      waveform.push(Math.min(amplitude * 2, 1))
    }
    
    return waveform
  }

  private async generateBeatGrid(channelData: Float32Array, sampleRate: number): Promise<number[]> {
    // Professional beat detection algorithm
    const beats: number[] = []
    const windowSize = 1024
    const hopSize = 512
    const energyHistory: number[] = []
    
    for (let i = 0; i < channelData.length - windowSize; i += hopSize) {
      let energy = 0
      for (let j = 0; j < windowSize; j++) {
        const sample = channelData[i + j]
        energy += sample * sample
      }
      energyHistory.push(energy)
    }
    
    // Peak picking for beat detection
    const localMeanWindow = 43 // ~1 second at 44.1kHz with 512 hop
    for (let i = localMeanWindow; i < energyHistory.length - localMeanWindow; i++) {
      const current = energyHistory[i]
      
      // Calculate local mean
      let localMean = 0
      for (let j = i - localMeanWindow; j <= i + localMeanWindow; j++) {
        localMean += energyHistory[j]
      }
      localMean /= (localMeanWindow * 2 + 1)
      
      // Beat detection threshold
      if (current > localMean * 1.3) {
        const timeSeconds = (i * hopSize) / sampleRate
        const percentage = (timeSeconds / (channelData.length / sampleRate)) * 100
        beats.push(percentage)
      }
    }
    
    return beats
  }

  private async detectBPM(buffer: AudioBuffer): Promise<number> {
    // Implement professional BPM detection
    const channelData = buffer.getChannelData(0)
    const sampleRate = buffer.sampleRate
    
    // Autocorrelation-based BPM detection
    const minBPM = 60
    const maxBPM = 200
    const minPeriod = Math.floor(60 * sampleRate / maxBPM)
    const maxPeriod = Math.floor(60 * sampleRate / minBPM)
    
    let maxCorrelation = 0
    let bestBPM = 128
    
    for (let period = minPeriod; period <= maxPeriod; period += 10) {
      let correlation = 0
      const samples = Math.min(period * 10, channelData.length - period)
      
      for (let i = 0; i < samples; i++) {
        correlation += channelData[i] * channelData[i + period]
      }
      
      if (correlation > maxCorrelation) {
        maxCorrelation = correlation
        bestBPM = 60 * sampleRate / period
      }
    }
    
    return Math.round(bestBPM)
  }

  private async detectKey(buffer: AudioBuffer): Promise<string> {
    // Professional key detection using chromagram analysis
    const channelData = buffer.getChannelData(0)
    const chromagram = this.calculateChromagram(channelData, buffer.sampleRate)
    
    const keyProfiles = {
      'C': [1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1],
      'C#': [1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0],
      'D': [0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1],
      'D#': [1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0],
      'E': [0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1],
      'F': [1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0],
      'F#': [0, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1],
      'G': [1, 0, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1],
      'G#': [1, 1, 0, 1, 0, 1, 0, 1, 1, 0, 1, 0],
      'A': [0, 1, 1, 0, 1, 0, 1, 0, 1, 1, 0, 1],
      'A#': [1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 1, 0],
      'B': [0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 1]
    }
    
    let bestCorrelation = 0
    let detectedKey = 'C'
    
    Object.entries(keyProfiles).forEach(([key, profile]) => {
      let correlation = 0
      for (let i = 0; i < 12; i++) {
        correlation += chromagram[i] * profile[i]
      }
      
      if (correlation > bestCorrelation) {
        bestCorrelation = correlation
        detectedKey = key
      }
    })
    
    return detectedKey
  }

  private calculateChromagram(channelData: Float32Array, sampleRate: number): number[] {
    const chromagram = new Array(12).fill(0)
    const windowSize = 4096
    
    for (let i = 0; i < channelData.length - windowSize; i += windowSize) {
      const window = channelData.slice(i, i + windowSize)
      const spectrum = this.fft(window)
      
      // Map frequencies to chromagram
      for (let bin = 0; bin < spectrum.length / 2; bin++) {
        const frequency = (bin * sampleRate) / windowSize
        if (frequency > 80 && frequency < 2000) {
          const note = this.frequencyToNote(frequency)
          const magnitude = Math.sqrt(spectrum[bin * 2] ** 2 + spectrum[bin * 2 + 1] ** 2)
          chromagram[note] += magnitude
        }
      }
    }
    
    // Normalize
    const sum = chromagram.reduce((a, b) => a + b, 0)
    return chromagram.map(x => x / sum)
  }

  private frequencyToNote(frequency: number): number {
    const A4 = 440
    const noteNumber = Math.round(12 * Math.log2(frequency / A4))
    return ((noteNumber % 12) + 12) % 12
  }

  private calculateEnergy(analyzedData: AudioTrack['analyzedData']): number {
    // Calculate energy based on spectral features
    const avgSpectralCentroid = analyzedData.spectralCentroid.reduce((a, b) => a + b, 0) / analyzedData.spectralCentroid.length
    const beatDensity = analyzedData.beatgrid.length / 60 // beats per second approximation
    const harmonicComplexity = analyzedData.harmonicContent.reduce((a, b) => a + b, 0) / analyzedData.harmonicContent.length
    
    // Normalize to 1-10 scale
    const energy = Math.min(10, Math.max(1, 
      (avgSpectralCentroid / 2000) * 3 + 
      (beatDensity / 2) * 4 + 
      harmonicComplexity * 3
    ))
    
    return Math.round(energy)
  }

  private calculateSpectralCentroid(channelData: Float32Array, sampleRate: number): number[] {
    const centroids: number[] = []
    const windowSize = 2048
    const hopSize = 1024
    
    for (let i = 0; i < channelData.length - windowSize; i += hopSize) {
      const window = channelData.slice(i, i + windowSize)
      const spectrum = this.fft(window)
      
      let numerator = 0
      let denominator = 0
      
      for (let bin = 0; bin < spectrum.length / 2; bin++) {
        const magnitude = Math.sqrt(spectrum[bin * 2] ** 2 + spectrum[bin * 2 + 1] ** 2)
        const frequency = (bin * sampleRate) / windowSize
        
        numerator += frequency * magnitude
        denominator += magnitude
      }
      
      centroids.push(denominator > 0 ? numerator / denominator : 0)
    }
    
    return centroids
  }

  private calculateMFCC(channelData: Float32Array, sampleRate: number): number[][] {
    // Simplified MFCC calculation for audio fingerprinting
    const mfccs: number[][] = []
    const windowSize = 2048
    const hopSize = 1024
    const numCoeffs = 13
    
    for (let i = 0; i < channelData.length - windowSize; i += hopSize) {
      const window = channelData.slice(i, i + windowSize)
      const mfcc = this.extractMFCC(window, sampleRate, numCoeffs)
      mfccs.push(mfcc)
    }
    
    return mfccs
  }

  private extractMFCC(window: Float32Array, sampleRate: number, numCoeffs: number): number[] {
    // Simplified MFCC extraction
    const spectrum = this.fft(Array.from(window))
    const melFilters = this.createMelFilterBank(spectrum.length / 2, sampleRate)
    const melSpectrum = this.applyMelFilters(spectrum, melFilters)
    const logMelSpectrum = melSpectrum.map(x => Math.log(x + 1e-10))
    
    // DCT to get MFCCs
    const mfccs: number[] = []
    for (let i = 0; i < numCoeffs; i++) {
      let sum = 0
      for (let j = 0; j < logMelSpectrum.length; j++) {
        sum += logMelSpectrum[j] * Math.cos(Math.PI * i * (j + 0.5) / logMelSpectrum.length)
      }
      mfccs.push(sum)
    }
    
    return mfccs
  }

  private createMelFilterBank(numBins: number, sampleRate: number): number[][] {
    const numFilters = 26
    const melFilters: number[][] = []
    
    // Convert to mel scale
    const melMin = this.hzToMel(0)
    const melMax = this.hzToMel(sampleRate / 2)
    const melPoints = []
    
    for (let i = 0; i < numFilters + 2; i++) {
      const mel = melMin + i * (melMax - melMin) / (numFilters + 1)
      melPoints.push(this.melToHz(mel))
    }
    
    // Create triangular filters
    for (let i = 1; i < numFilters + 1; i++) {
      const filter = new Array(numBins).fill(0)
      const left = melPoints[i - 1]
      const center = melPoints[i]
      const right = melPoints[i + 1]
      
      for (let bin = 0; bin < numBins; bin++) {
        const freq = (bin * sampleRate) / (2 * numBins)
        
        if (freq >= left && freq <= center) {
          filter[bin] = (freq - left) / (center - left)
        } else if (freq > center && freq <= right) {
          filter[bin] = (right - freq) / (right - center)
        }
      }
      
      melFilters.push(filter)
    }
    
    return melFilters
  }

  private hzToMel(hz: number): number {
    return 2595 * Math.log10(1 + hz / 700)
  }

  private melToHz(mel: number): number {
    return 700 * (Math.pow(10, mel / 2595) - 1)
  }

  private applyMelFilters(spectrum: number[], melFilters: number[][]): number[] {
    const melSpectrum: number[] = []
    
    for (const filter of melFilters) {
      let sum = 0
      for (let i = 0; i < filter.length && i < spectrum.length / 2; i++) {
        const magnitude = Math.sqrt(spectrum[i * 2] ** 2 + spectrum[i * 2 + 1] ** 2)
        sum += magnitude * filter[i]
      }
      melSpectrum.push(sum)
    }
    
    return melSpectrum
  }

  private detectOnsets(channelData: Float32Array, sampleRate: number): number[] {
    const onsets: number[] = []
    const windowSize = 1024
    const hopSize = 512
    const spectralFlux: number[] = []
    
    let previousSpectrum: number[] = []
    
    for (let i = 0; i < channelData.length - windowSize; i += hopSize) {
      const window = channelData.slice(i, i + windowSize)
      const spectrum = this.fft(Array.from(window))
      const magnitudes = []
      
      for (let bin = 0; bin < spectrum.length / 2; bin++) {
        magnitudes.push(Math.sqrt(spectrum[bin * 2] ** 2 + spectrum[bin * 2 + 1] ** 2))
      }
      
      if (previousSpectrum.length > 0) {
        let flux = 0
        for (let bin = 0; bin < magnitudes.length; bin++) {
          const diff = magnitudes[bin] - previousSpectrum[bin]
          flux += Math.max(0, diff) // Half-wave rectification
        }
        spectralFlux.push(flux)
      }
      
      previousSpectrum = magnitudes
    }
    
    // Peak picking on spectral flux
    const threshold = 0.3
    for (let i = 1; i < spectralFlux.length - 1; i++) {
      const current = spectralFlux[i]
      const prev = spectralFlux[i - 1]
      const next = spectralFlux[i + 1]
      
      if (current > prev && current > next && current > threshold) {
        const timeSeconds = (i * hopSize) / sampleRate
        onsets.push(timeSeconds)
      }
    }
    
    return onsets
  }

  private analyzeHarmonicContent(channelData: Float32Array, sampleRate: number): number[] {
    const harmonics: number[] = []
    const windowSize = 4096
    const fundamentals = [80, 160, 320, 640, 1280] // Base frequencies to analyze
    
    for (let i = 0; i < channelData.length - windowSize; i += windowSize) {
      const window = channelData.slice(i, i + windowSize)
      const spectrum = this.fft(Array.from(window))
      
      let harmonicStrength = 0
      
      for (const fundamental of fundamentals) {
        // Check harmonics (2f, 3f, 4f, 5f)
        for (let harmonic = 2; harmonic <= 5; harmonic++) {
          const bin = Math.round((fundamental * harmonic * windowSize) / sampleRate)
          if (bin < spectrum.length / 2) {
            const magnitude = Math.sqrt(spectrum[bin * 2] ** 2 + spectrum[bin * 2 + 1] ** 2)
            harmonicStrength += magnitude
          }
        }
      }
      
      harmonics.push(harmonicStrength)
    }
    
    return harmonics
  }

  private fft(input: number[]): number[] {
    // Simple FFT implementation for audio analysis
    const N = input.length
    if (N <= 1) return input
    
    // Pad to power of 2
    const paddedLength = Math.pow(2, Math.ceil(Math.log2(N)))
    const padded = [...input, ...new Array(paddedLength - N).fill(0)]
    
    return this.fftRecursive(padded)
  }

  private fftRecursive(input: number[]): number[] {
    const N = input.length
    if (N <= 1) return input
    
    // Split into even and odd
    const even = input.filter((_, i) => i % 2 === 0)
    const odd = input.filter((_, i) => i % 2 === 1)
    
    const evenFFT = this.fftRecursive(even)
    const oddFFT = this.fftRecursive(odd)
    
    const result = new Array(N)
    
    for (let k = 0; k < N / 2; k++) {
      const t = -2 * Math.PI * k / N
      const wk = [Math.cos(t), Math.sin(t)]
      
      const oddK = [
        oddFFT[k * 2] * wk[0] - oddFFT[k * 2 + 1] * wk[1],
        oddFFT[k * 2] * wk[1] + oddFFT[k * 2 + 1] * wk[0]
      ]
      
      result[k * 2] = evenFFT[k * 2] + oddK[0]
      result[k * 2 + 1] = evenFFT[k * 2 + 1] + oddK[1]
      result[(k + N / 2) * 2] = evenFFT[k * 2] - oddK[0]
      result[(k + N / 2) * 2 + 1] = evenFFT[k * 2 + 1] - oddK[1]
    }
    
    return result
  }

  // Public control methods
  play(): void {
    if (!this.currentTrack || this.state.isPlaying) return
    
    this.sourceNode = this.audioContext.createBufferSource()
    this.sourceNode.buffer = this.currentTrack.buffer
    this.sourceNode.connect(this.gainNode)
    
    // Apply pitch shift if needed
    if (this.state.pitch !== 0) {
      this.sourceNode.playbackRate.value = 1 + (this.state.pitch / 100)
    }
    
    this.sourceNode.start(0, this.state.position)
    this.state.isPlaying = true
    
    // Start position tracking
    this.startPositionTracking()
  }

  pause(): void {
    if (this.sourceNode) {
      this.sourceNode.stop()
      this.sourceNode = null
    }
    this.state.isPlaying = false
  }

  stop(): void {
    this.pause()
    this.state.position = 0
  }

  setVolume(volume: number): void {
    this.state.volume = Math.max(0, Math.min(100, volume))
    this.gainNode.gain.value = this.state.volume / 100
  }

  setPitch(pitch: number): void {
    this.state.pitch = Math.max(-50, Math.min(50, pitch))
    if (this.sourceNode) {
      this.sourceNode.playbackRate.value = 1 + (this.state.pitch / 100)
    }
  }

  setEQ(band: 'low' | 'mid' | 'high', value: number): void {
    const gain = Math.max(-30, Math.min(30, value))
    
    switch (band) {
      case 'low':
        this.state.lowEQ = gain
        this.lowEQNode.gain.value = gain
        break
      case 'mid':
        this.state.midEQ = gain
        this.midEQNode.gain.value = gain
        break
      case 'high':
        this.state.highEQ = gain
        this.highEQNode.gain.value = gain
        break
    }
  }

  setFilter(value: number): void {
    this.state.filter = Math.max(-100, Math.min(100, value))
    
    if (value === 0) {
      this.filterNode.type = 'allpass'
    } else if (value > 0) {
      // High-pass filter
      this.filterNode.type = 'highpass'
      this.filterNode.frequency.value = 20 + (value / 100) * 10000
    } else {
      // Low-pass filter
      this.filterNode.type = 'lowpass'
      this.filterNode.frequency.value = 20000 + (value / 100) * 19000
    }
  }

  setHotCue(index: number, position?: number): void {
    if (index < 0 || index >= this.state.hotCues.length) return
    
    if (position !== undefined) {
      this.state.hotCues[index] = {
        ...this.state.hotCues[index],
        position,
        active: true
      }
    } else {
      this.state.hotCues[index] = {
        ...this.state.hotCues[index],
        position: this.state.position,
        active: true
      }
    }
  }

  triggerHotCue(index: number): void {
    if (index < 0 || index >= this.state.hotCues.length) return
    
    const cue = this.state.hotCues[index]
    if (cue.active) {
      this.seekTo(cue.position)
    }
  }

  deleteHotCue(index: number): void {
    if (index < 0 || index >= this.state.hotCues.length) return
    
    this.state.hotCues[index] = {
      ...this.state.hotCues[index],
      active: false,
      position: 0
    }
  }

  seekTo(position: number): void {
    const wasPlaying = this.state.isPlaying
    
    if (wasPlaying) {
      this.pause()
    }
    
    this.state.position = Math.max(0, Math.min(this.currentTrack?.duration || 0, position))
    
    if (wasPlaying) {
      this.play()
    }
  }

  getSpectrum(): Uint8Array {
    const dataArray = new Uint8Array(this.analyserNode.frequencyBinCount)
    this.analyserNode.getByteFrequencyData(dataArray)
    return dataArray
  }

  getWaveform(): Uint8Array {
    const dataArray = new Uint8Array(this.analyserNode.frequencyBinCount)
    this.analyserNode.getByteTimeDomainData(dataArray)
    return dataArray
  }

  private startPositionTracking(): void {
    const updatePosition = () => {
      if (this.state.isPlaying && this.currentTrack) {
        this.state.position += 0.016 // ~60fps updates
        
        if (this.callbacks.onPositionUpdate) {
          this.callbacks.onPositionUpdate(this.state.position)
        }
        
        // Check for end of track
        if (this.state.position >= this.currentTrack.duration) {
          this.pause()
          if (this.callbacks.onEndOfTrack) {
            this.callbacks.onEndOfTrack()
          }
        }
        
        requestAnimationFrame(updatePosition)
      }
    }
    
    requestAnimationFrame(updatePosition)
  }

  // Getters
  getState(): ProfessionalAudioState {
    return { ...this.state }
  }

  getCurrentTrack(): AudioTrack | null {
    return this.currentTrack
  }

  connect(destination: AudioNode): void {
    this.outputNode.connect(destination)
  }

  disconnect(): void {
    this.outputNode.disconnect()
  }

  setCallbacks(callbacks: typeof this.callbacks): void {
    this.callbacks = { ...this.callbacks, ...callbacks }
  }
}

export default ProfessionalAudioEngine