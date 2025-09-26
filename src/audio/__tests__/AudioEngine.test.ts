import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AudioEngine } from '../engine/AudioEngine';
import Deck from '../engine/Deck';

// Since mocks are global via setup.ts, we can just use them.
// However, let's clear mocks before each test to ensure isolation.
beforeEach(() => {
  vi.clearAllMocks();
});

describe('AudioEngine', () => {
  it('should initialize and connect all nodes correctly', () => {
    const engine = new AudioEngine();
    const context = engine.audioContext;

    engine.connect();

    // Check that decks are connected to crossfader gains
    expect(engine.deckA.connect).toHaveBeenCalledWith(expect.any(Object));
    expect(engine.deckB.connect).toHaveBeenCalledWith(expect.any(Object));

    // Check that crossfader gains are connected to master gain
    const masterGain = engine.getMasterGain();
    expect(masterGain.connect).toHaveBeenCalledWith(engine.analyser.getNode());

    // Check that analyser is connected to destination
    expect(engine.analyser.getNode().connect).toHaveBeenCalledWith(context.destination);
  });

  describe('setCrossfader', () => {
    it('should set gain correctly for position 0 (Deck A)', () => {
      const engine = new AudioEngine();
      engine.setCrossfader(0);

      const gainA = (engine as any).crossfaderGainA.gain.setTargetAtTime;
      const gainB = (engine as any).crossfaderGainB.gain.setTargetAtTime;

      expect(gainA).toHaveBeenCalledWith(1, expect.any(Number), expect.any(Number));
      expect(gainB).toHaveBeenCalledWith(expect.closeTo(0), expect.any(Number), expect.any(Number));
    });

    it('should set gain correctly for position 0.5 (Center)', () => {
      const engine = new AudioEngine();
      engine.setCrossfader(0.5);

      const gainA = (engine as any).crossfaderGainA.gain.setTargetAtTime;
      const gainB = (engine as any).crossfaderGainB.gain.setTargetAtTime;

      const expectedGain = Math.cos(0.5 * 0.5 * Math.PI); // ~0.707
      expect(gainA).toHaveBeenCalledWith(expect.closeTo(expectedGain), expect.any(Number), expect.any(Number));
      expect(gainB).toHaveBeenCalledWith(expect.closeTo(expectedGain), expect.any(Number), expect.any(Number));
    });

    it('should set gain correctly for position 1 (Deck B)', () => {
        const engine = new AudioEngine();
        engine.setCrossfader(1);

        const gainA = (engine as any).crossfaderGainA.gain.setTargetAtTime;
        const gainB = (engine as any).crossfaderGainB.gain.setTargetAtTime;

        expect(gainA).toHaveBeenCalledWith(expect.closeTo(0), expect.any(Number), expect.any(Number));
        expect(gainB).toHaveBeenCalledWith(1, expect.any(Number), expect.any(Number));
      });
  });
});

describe('Deck', () => {
    it('should change playbackRate when setRate is called on an AudioBufferSourceNode', async () => {
        const audioContext = new window.AudioContext();
        const deck = new Deck(audioContext);

        // Mock a real AudioBuffer
        const mockAudioBuffer = {} as AudioBuffer;
        await deck.load(mockAudioBuffer);

        const newRate = 1.5;
        deck.setRate(newRate);

        const sourceNode = (deck as any).source;
        expect(sourceNode.playbackRate.setValueAtTime).toHaveBeenCalledWith(newRate, expect.any(Number));
    });

    it('should not throw when setRate is called on an OscillatorNode', async () => {
        const audioContext = new window.AudioContext();
        const deck = new Deck(audioContext);
        await deck.load('oscillator');

        const newRate = 1.5;
        // setRate should not do anything for an oscillator, but it shouldn't crash either.
        expect(() => deck.setRate(newRate)).not.toThrow();
    });
});