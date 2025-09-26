import { vi } from 'vitest';
import '@testing-library/jest-dom';

// Mock scrollTo
window.scrollTo = vi.fn();

// Mock HTMLMediaElement
Object.defineProperty(window, 'HTMLMediaElement', {
  writable: true,
  value: vi.fn().mockImplementation(() => ({
    play: vi.fn(),
    pause: vi.fn(),
    load: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })),
});

// Mock IntersectionObserver
const intersectionObserverMock = () => ({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null,
});
window.IntersectionObserver = vi.fn().mockImplementation(intersectionObserverMock);

// Mock matchMedia
window.matchMedia = vi.fn().mockImplementation(query => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
}));

// --- MOCK WEB AUDIO API ---
const mockAudioNode = {
  connect: vi.fn(),
  disconnect: vi.fn(),
};

const mockGainNode = {
  ...mockAudioNode,
  gain: {
    value: 1,
    setValueAtTime: vi.fn(),
    setTargetAtTime: vi.fn(),
  },
};

const mockBiquadFilterNode = {
    ...mockAudioNode,
    type: 'lowpass',
    frequency: { value: 350, setValueAtTime: vi.fn() },
    Q: { value: 1, setValueAtTime: vi.fn() },
    gain: { value: 0, setTargetAtTime: vi.fn() },
};

const mockAudioBufferSourceNode = {
  ...mockAudioNode,
  buffer: null,
  playbackRate: { value: 1, setValueAtTime: vi.fn() },
  start: vi.fn(),
  stop: vi.fn(),
};

const mockOscillatorNode = {
    ...mockAudioNode,
    frequency: { value: 440, setValueAtTime: vi.fn() },
    type: 'sine',
    start: vi.fn(),
    stop: vi.fn(),
};

const mockAnalyserNode = {
  ...mockAudioNode,
  fftSize: 2048,
  frequencyBinCount: 1024,
  smoothingTimeConstant: 0.8,
  getByteTimeDomainData: vi.fn(),
  getByteFrequencyData: vi.fn(),
};

const mockMediaStreamAudioDestinationNode = {
    ...mockAudioNode,
    stream: new MediaStream(),
};

Object.defineProperty(window, 'AudioContext', {
  writable: true,
  value: vi.fn().mockImplementation(() => ({
    currentTime: 0,
    state: 'running',
    destination: mockAudioNode,
    createGain: vi.fn(() => mockGainNode),
    createBiquadFilter: vi.fn(() => mockBiquadFilterNode),
    createBufferSource: vi.fn(() => mockAudioBufferSourceNode),
    createOscillator: vi.fn(() => mockOscillatorNode),
    createAnalyser: vi.fn(() => mockAnalyserNode),
    createMediaStreamDestination: vi.fn(() => mockMediaStreamAudioDestinationNode),
    resume: vi.fn().mockResolvedValue(undefined),
  })),
});

Object.defineProperty(window, 'MediaRecorder', {
    writable: true,
    value: vi.fn().mockImplementation(() => ({
        start: vi.fn(),
        stop: vi.fn(),
        ondataavailable: vi.fn(),
        onerror: vi.fn(),
        state: 'inactive',
        isTypeSupported: vi.fn(() => true),
    })),
});

Object.defineProperty(window.URL, 'createObjectURL', {
    writable: true,
    value: vi.fn((blob: Blob) => `blob:${blob.type}/${blob.size}`),
});