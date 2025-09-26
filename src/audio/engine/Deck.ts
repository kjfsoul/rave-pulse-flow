interface EQ {
  low: number;
  mid: number;
  high: number;
}

export default class Deck {
  private audioContext: AudioContext;
  private output: GainNode;
  private source: AudioBufferSourceNode | OscillatorNode | null = null;
  private _isPlaying = false;

  private lowFilter: BiquadFilterNode;
  private midFilter: BiquadFilterNode;
  private highFilter: BiquadFilterNode;

  constructor(audioContext: AudioContext) {
    this.audioContext = audioContext;

    this.lowFilter = this.audioContext.createBiquadFilter();
    this.lowFilter.type = 'lowshelf';
    this.lowFilter.frequency.value = 320;

    this.midFilter = this.audioContext.createBiquadFilter();
    this.midFilter.type = 'peaking';
    this.midFilter.frequency.value = 1000;
    this.midFilter.Q.value = 0.5;

    this.highFilter = this.audioContext.createBiquadFilter();
    this.highFilter.type = 'highshelf';
    this.highFilter.frequency.value = 3200;

    this.output = this.audioContext.createGain();

    this.lowFilter.connect(this.midFilter);
    this.midFilter.connect(this.highFilter);
    this.highFilter.connect(this.output);
  }

  public async load(src: 'oscillator' | AudioBuffer): Promise<void> {
    this.disconnectSource();
    if (src === 'oscillator') {
      const oscillator = this.audioContext.createOscillator();
      oscillator.type = 'sawtooth';
      oscillator.frequency.setValueAtTime(220, this.audioContext.currentTime);
      this.source = oscillator;
    } else {
      const bufferSource = this.audioContext.createBufferSource();
      bufferSource.buffer = src;
      this.source = bufferSource;
    }
  }

  public play(): void {
    if (this._isPlaying || !this.source) return;
    if (this.source instanceof OscillatorNode) {
        this.source.start();
    }
    this.source.connect(this.lowFilter); // Connect source to the start of the EQ chain
    this._isPlaying = true;
  }

  public pause(): void {
    if (!this._isPlaying || !this.source) return;
     if (this.source instanceof OscillatorNode) {
        this.source.stop();
        // Oscillators can only be started once. We need a new one to play again.
        const oldFreq = this.source.frequency.value;
        const newOscillator = this.audioContext.createOscillator();
        newOscillator.type = 'sawtooth';
        newOscillator.frequency.setValueAtTime(oldFreq, this.audioContext.currentTime);
        this.source = newOscillator;
    } else {
        this.disconnectSource();
    }
    this._isPlaying = false;
  }

  public setRate(rate: number): void {
    if (this.source instanceof AudioBufferSourceNode) {
      this.source.playbackRate.setValueAtTime(rate, this.audioContext.currentTime);
    }
  }

  public setEQ(eq: EQ): void {
    // The UI sends values from 0-100. We map them to a usable dB range, e.g., -40 to 6.
    const mapToDb = (value: number) => (value / 100) * 46 - 40;
    this.lowFilter.gain.setTargetAtTime(mapToDb(eq.low), this.audioContext.currentTime, 0.01);
    this.midFilter.gain.setTargetAtTime(mapToDb(eq.mid), this.audioContext.currentTime, 0.01);
    this.highFilter.gain.setTargetAtTime(mapToDb(eq.high), this.audioContext.currentTime, 0.01);
  }

  public connect(destination: AudioNode): void {
    this.output.connect(destination);
  }

  public disconnect(): void {
    this.output.disconnect();
  }

  public get isPlaying(): boolean {
    return this._isPlaying;
  }

  private disconnectSource(): void {
    this.source?.disconnect();
  }
}