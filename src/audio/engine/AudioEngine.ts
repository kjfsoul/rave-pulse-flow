import Deck from './Deck';
import Analyser from './Analyser';
import { Recorder } from '../recording/Recorder';

export class AudioEngine {
  public audioContext: AudioContext;
  private masterGain: GainNode;

  public deckA: Deck;
  public deckB: Deck;
  public analyser: Analyser;
  public recorder: Recorder;

  private crossfaderGainA: GainNode;
  private crossfaderGainB: GainNode;
  private destinationNode: MediaStreamAudioDestinationNode;

  constructor() {
    this.audioContext = new AudioContext();
    this.masterGain = this.audioContext.createGain();

    this.deckA = new Deck(this.audioContext);
    this.deckB = new Deck(this.audioContext);

    this.analyser = new Analyser(this.audioContext);

    this.crossfaderGainA = this.audioContext.createGain();
    this.crossfaderGainB = this.audioContext.createGain();
    this.setCrossfader(0.5); // Initialize at center

    this.destinationNode = this.audioContext.createMediaStreamDestination();
    this.recorder = new Recorder(this.destinationNode.stream);
  }

  public connect(): void {
    // Deck -> Crossfader Gain -> Master Gain
    this.deckA.connect(this.crossfaderGainA);
    this.deckB.connect(this.crossfaderGainB);
    this.crossfaderGainA.connect(this.masterGain);
    this.crossfaderGainB.connect(this.masterGain);

    // Master Gain -> Analyser -> Destination (for playback)
    this.masterGain.connect(this.analyser.getNode());
    this.analyser.getNode().connect(this.audioContext.destination);

    // Master Gain -> Destination Node (for recording)
    this.masterGain.connect(this.destinationNode);
  }

  public disconnect(): void {
    this.deckA.disconnect();
    this.deckB.disconnect();
    this.crossfaderGainA.disconnect();
    this.crossfaderGainB.disconnect();
    this.masterGain.disconnect();
    this.analyser.getNode().disconnect();
  }

  public setCrossfader(x: number): void {
    const value = Math.max(0, Math.min(1, x)); // Clamp value between 0 and 1
    const gainA = Math.cos(value * 0.5 * Math.PI);
    const gainB = Math.cos((1.0 - value) * 0.5 * Math.PI);
    this.crossfaderGainA.gain.setTargetAtTime(gainA, this.audioContext.currentTime, 0.01);
    this.crossfaderGainB.gain.setTargetAtTime(gainB, this.audioContext.currentTime, 0.01);
  }

  public getMasterGain(): GainNode {
    return this.masterGain;
  }

  public startRecording(): void {
    this.recorder.start();
  }

  public stopRecording(): Promise<Blob> {
    return this.recorder.stop();
  }
}