export default class Analyser {
  private audioContext: AudioContext;
  private analyserNode: AnalyserNode;
  private timeDomainData: Uint8Array;

  constructor(audioContext: AudioContext) {
    this.audioContext = audioContext;
    this.analyserNode = this.audioContext.createAnalyser();
    this.analyserNode.fftSize = 2048;
    this.analyserNode.smoothingTimeConstant = 0.8;
    this.timeDomainData = new Uint8Array(this.analyserNode.frequencyBinCount);
  }

  public getNode(): AnalyserNode {
    return this.analyserNode;
  }

  public getRMS(): number {
    this.analyserNode.getByteTimeDomainData(this.timeDomainData);
    let rms = 0;
    for (let i = 0; i < this.timeDomainData.length; i++) {
      const val = (this.timeDomainData[i] - 128) / 128;
      rms += val * val;
    }
    rms = Math.sqrt(rms / this.timeDomainData.length);
    return rms;
  }

  public getTimeDomainData(dataArray: Uint8Array): void {
    this.analyserNode.getByteTimeDomainData(dataArray);
  }
}