export class Recorder {
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];

  constructor(stream: MediaStream) {
    // Check if the mimeType is supported
    const mimeType = 'audio/webm;codecs=opus';
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      console.warn(`${mimeType} is not supported, falling back to default.`);
      this.mediaRecorder = new MediaRecorder(stream);
    } else {
      this.mediaRecorder = new MediaRecorder(stream, { mimeType });
    }

    this.mediaRecorder.ondataavailable = (event: BlobEvent) => {
      if (event.data.size > 0) {
        this.recordedChunks.push(event.data);
      }
    };
  }

  public start(): void {
    if (this.mediaRecorder && this.mediaRecorder.state === 'inactive') {
      this.recordedChunks = []; // Clear previous recording
      this.mediaRecorder.start();
      console.log('Recorder started');
    }
  }

  public stop(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        return reject(new Error('MediaRecorder is not initialized.'));
      }

      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.recordedChunks, { type: 'audio/webm' });
        this.recordedChunks = [];
        console.log('Recorder stopped, blob created.');
        resolve(blob);
      };

      if (this.mediaRecorder.state === 'recording') {
        this.mediaRecorder.stop();
      } else {
        // If it's not recording, resolve with an empty blob.
        resolve(new Blob(this.recordedChunks, { type: 'audio/webm' }));
      }
    });
  }

  public get state(): RecordingState | undefined {
    return this.mediaRecorder?.state;
  }
}