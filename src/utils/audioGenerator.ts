/**
 * Audio Generator Utility for DJ Mix Station
 * Creates procedural test audio when real files are missing
 */

export interface GeneratedTrack {
  id: string;
  title: string;
  bpm: number;
  blob: Blob;
  url: string;
}

/**
 * Generate a test audio track using Web Audio API
 */
export const generateTestTrack = async (
  bpm: number, 
  durationSeconds: number = 30,
  waveType: OscillatorType = 'sine'
): Promise<GeneratedTrack> => {
  const sampleRate = 44100;
  const length = durationSeconds * sampleRate;
  const channels = 2; // Stereo
  
  // Create audio buffer
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const buffer = audioContext.createBuffer(channels, length, sampleRate);
  
  // Calculate beat interval
  const beatInterval = (60 / bpm) * sampleRate; // Samples per beat
  
  for (let channel = 0; channel < channels; channel++) {
    const channelData = buffer.getChannelData(channel);
    
    for (let i = 0; i < length; i++) {
      const time = i / sampleRate;
      const beatPhase = (i % beatInterval) / beatInterval;
      
      // Base frequency with beat emphasis
      const baseFreq = channel === 0 ? 220 : 330; // A3 and E4
      const beatEmphasis = beatPhase < 0.1 ? 2 : 1; // Emphasize beat start
      
      // Generate waveform
      let sample = 0;
      switch (waveType) {
        case 'sine':
          sample = Math.sin(2 * Math.PI * baseFreq * time * beatEmphasis);
          break;
        case 'square':
          sample = Math.sign(Math.sin(2 * Math.PI * baseFreq * time * beatEmphasis));
          break;
        case 'sawtooth':
          sample = 2 * ((baseFreq * time * beatEmphasis) % 1) - 1;
          break;
        default:
          sample = Math.sin(2 * Math.PI * baseFreq * time * beatEmphasis);
      }
      
      // Add kick drum on beat
      if (beatPhase < 0.05) {
        const kickFreq = 60;
        const kickDecay = Math.exp(-beatPhase * 50);
        sample += 0.5 * Math.sin(2 * Math.PI * kickFreq * time) * kickDecay;
      }
      
      // Normalize and add to buffer
      channelData[i] = sample * 0.3; // Reduce volume to prevent clipping
    }
  }
  
  // Convert buffer to WAV blob
  const wavBlob = await audioBufferToWav(buffer);
  const url = URL.createObjectURL(wavBlob);
  
  await audioContext.close();
  
  return {
    id: `generated_${bpm}_${waveType}`,
    title: `Test ${waveType} (${bpm} BPM)`,
    bpm,
    blob: wavBlob,
    url
  };
};

/**
 * Convert AudioBuffer to WAV Blob
 */
const audioBufferToWav = async (buffer: AudioBuffer): Promise<Blob> => {
  const length = buffer.length;
  const channels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const arrayBuffer = new ArrayBuffer(44 + length * channels * 2);
  const view = new DataView(arrayBuffer);
  
  // WAV header
  const writeString = (offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };
  
  writeString(0, 'RIFF');
  view.setUint32(4, arrayBuffer.byteLength - 8, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, channels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * channels * 2, true);
  view.setUint16(32, channels * 2, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, length * channels * 2, true);
  
  // Audio data
  let offset = 44;
  for (let i = 0; i < length; i++) {
    for (let channel = 0; channel < channels; channel++) {
      const sample = buffer.getChannelData(channel)[i];
      const intSample = Math.max(-32768, Math.min(32767, sample * 32767));
      view.setInt16(offset, intSample, true);
      offset += 2;
    }
  }
  
  return new Blob([arrayBuffer], { type: 'audio/wav' });
};

/**
 * Generate default test tracks for DJ station
 */
export const generateDefaultTracks = async (): Promise<GeneratedTrack[]> => {
  console.log('🎵 Generating test audio tracks...');
  
  try {
    const tracks = await Promise.all([
      generateTestTrack(128, 30, 'sine'),
      generateTestTrack(124, 30, 'square'), 
      generateTestTrack(132, 30, 'sawtooth')
    ]);
    
    console.log('✅ Generated test tracks:', tracks.map(t => t.title));
    return tracks;
  } catch (error) {
    console.error('❌ Failed to generate test tracks:', error);
    return [];
  }
};

/**
 * Generate crowd cheer sound effect
 */
export const generateCrowdCheer = async (): Promise<Blob> => {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const sampleRate = 44100;
  const duration = 3; // 3 seconds
  const length = duration * sampleRate;
  const buffer = audioContext.createBuffer(2, length, sampleRate);
  
  for (let channel = 0; channel < 2; channel++) {
    const channelData = buffer.getChannelData(channel);
    
    for (let i = 0; i < length; i++) {
      const time = i / sampleRate;
      
      // Create crowd noise using filtered white noise
      let sample = (Math.random() - 0.5) * 2;
      
      // Apply envelope (fade in, sustain, fade out)
      let envelope = 1;
      if (time < 0.5) {
        envelope = time / 0.5; // Fade in
      } else if (time > duration - 0.5) {
        envelope = (duration - time) / 0.5; // Fade out
      }
      
      // Low-pass filter effect (simulate crowd sound)
      sample *= envelope * 0.5;
      channelData[i] = sample;
    }
  }
  
  const wavBlob = await audioBufferToWav(buffer);
  await audioContext.close();
  
  return wavBlob;
};