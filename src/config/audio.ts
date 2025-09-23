// Audio configuration constants (no magic numbers in engine code)

export const EQ_CONFIG = {
  low: { type: 'lowshelf' as const, frequencyHz: 250, gainRangeDb: 12 },
  mid: { type: 'peaking' as const, frequencyHz: 1000, q: 1.0, gainRangeDb: 12 },
  high: { type: 'highshelf' as const, frequencyHz: 4000, gainRangeDb: 12 },
};

export const LIMITER_CONFIG = {
  thresholdDb: -3,
  kneeDb: 12,
  ratio: 20,
  attackSec: 0.003,
  releaseSec: 0.25,
};

export const ANALYSER_CONFIG = {
  fftSize: 4096 as const,
  smoothingTimeConstant: 0.8,
};

// Filter mapping helpers
export function mapHighpassFrequency(value: number): number {
  // value in [-100, 100]; positive maps to 20Hz..10020Hz
  const clamped = Math.max(-100, Math.min(100, value));
  if (clamped <= 0) return 1000; // neutral used by allpass/lowpass path
  return 20 + (clamped / 100) * 10000;
}

export function mapLowpassFrequency(value: number): number {
  // value in [-100, 100]; negative maps to 20000Hz downwards
  const clamped = Math.max(-100, Math.min(100, value));
  if (clamped >= 0) return 1000; // neutral used by allpass/highpass path
  return 20000 + (clamped / 100) * 19000;
}


