import { useEffect, useRef, useState } from 'react';
import * as Tone from 'tone';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useSequenceState, STEPS, DRUM_INSTRUMENTS } from '@/hooks/vFLX10/useSequenceState';
import { useProStationStore } from '@/hooks/useProStationStore';
import { Trash2, Plus, Copy } from 'lucide-react';

// Create synthetic drum sounds using Tone.js synths
function createDrumSynths() {
  // Kick - Low frequency membrane synth
  const kick = new Tone.MembraneSynth({
    pitchDecay: 0.05,
    octaves: 6,
    oscillator: { type: 'sine' },
    envelope: { attack: 0.001, decay: 0.4, sustain: 0.01, release: 1.4, attackCurve: 'exponential' },
  }).toDestination();

  // Snare - Noise with envelope
  const snare = new Tone.NoiseSynth({
    noise: { type: 'white' },
    envelope: { attack: 0.001, decay: 0.2, sustain: 0 },
  }).toDestination();

  // Hihat - Short noise burst
  const hihat = new Tone.MetalSynth({
    envelope: { attack: 0.001, decay: 0.1, release: 0.01 },
    harmonicity: 5.1,
    modulationIndex: 32,
    resonance: 4000,
    octaves: 1.5,
  }).toDestination();

  // Clap - Two short noise bursts
  const clap = new Tone.NoiseSynth({
    noise: { type: 'pink' },
    envelope: { attack: 0.001, decay: 0.15, sustain: 0 },
  }).toDestination();

  // Tom - Mid frequency membrane
  const tom = new Tone.MembraneSynth({
    pitchDecay: 0.08,
    octaves: 4,
    oscillator: { type: 'sine' },
    envelope: { attack: 0.001, decay: 0.3, sustain: 0.01, release: 0.8 },
  }).toDestination();

  // Rim - High pitched short click
  const rim = new Tone.MetalSynth({
    envelope: { attack: 0.001, decay: 0.05, release: 0.01 },
    harmonicity: 8,
    modulationIndex: 20,
    resonance: 3000,
    octaves: 1,
  }).toDestination();

  // Cowbell - Metallic tone
  const cowbell = new Tone.MetalSynth({
    envelope: { attack: 0.001, decay: 0.2, release: 0.1 },
    harmonicity: 5.5,
    modulationIndex: 25,
    resonance: 4500,
    octaves: 1.5,
  }).toDestination();

  // Crash - Long metallic noise
  const crash = new Tone.MetalSynth({
    envelope: { attack: 0.001, decay: 1, release: 2 },
    harmonicity: 3.5,
    modulationIndex: 40,
    resonance: 5000,
    octaves: 2,
  }).toDestination();

  return { kick, snare, hihat, clap, tom, rim, cowbell, crash };
}

export function DrumMachine() {
  const {
    drumPatterns,
    activeDrumPatternId,
    drumInstruments,
    createDrumPattern,
    duplicateDrumPattern,
    setActiveDrumPattern,
    toggleDrumHit,
    clearActiveDrumPattern,
    getActiveDrumPattern,
    getDrumHitsAtStep,
  } = useSequenceState();

  const { isPlaying } = useProStationStore();
  const synthsRef = useRef<ReturnType<typeof createDrumSynths> | null>(null);
  const sequenceRef = useRef<Tone.Sequence | null>(null);
  const [currentStep, setCurrentStep] = useState(-1);
  const [isReady, setIsReady] = useState(false);

  const activePattern = getActiveDrumPattern();

  // Initialize synths and sequence
  useEffect(() => {
    // Create drum synths
    const synths = createDrumSynths();
    synthsRef.current = synths;
    setIsReady(true);

    // Create sequence
    const sequence = new Tone.Sequence(
      (time, step) => {
        // Get active drum hits at this step
        const hitsToPlay = getDrumHitsAtStep(step);

        // Update visual indicator
        Tone.Draw.schedule(() => {
          setCurrentStep(step);
        }, time);

        // Trigger drum synths
        if (hitsToPlay.length > 0 && synthsRef.current) {
          hitsToPlay.forEach((instrument) => {
            const synth = synthsRef.current?.[instrument as keyof typeof synthsRef.current];
            if (synth) {
              // Trigger different notes for different drums
              if (instrument === 'kick') {
                (synth as Tone.MembraneSynth).triggerAttackRelease('C1', '8n', time);
              } else if (instrument === 'tom') {
                (synth as Tone.MembraneSynth).triggerAttackRelease('G1', '8n', time);
              } else if (instrument === 'snare' || instrument === 'clap') {
                (synth as Tone.NoiseSynth).triggerAttackRelease('8n', time);
              } else {
                // MetalSynths (hihat, rim, cowbell, crash)
                (synth as Tone.MetalSynth).triggerAttackRelease('16n', time);
              }
            }
          });
        }
      },
      Array.from({ length: STEPS }, (_, i) => i),
      '16n'
    );

    // Start the sequence (it will follow Tone.Transport)
    sequence.start(0);
    sequenceRef.current = sequence;

    return () => {
      sequence.dispose();
      Object.values(synths).forEach(synth => synth.dispose());
    };
  }, [getDrumHitsAtStep]);

  const handleClear = () => {
    clearActiveDrumPattern();
    setCurrentStep(-1);
  };

  const handleNewPattern = () => {
    createDrumPattern();
  };

  const handleDuplicatePattern = () => {
    duplicateDrumPattern(activeDrumPatternId);
  };

  if (!activePattern) {
    return <div>Loading...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <CardTitle className="text-base md:text-lg">Drum Machine</CardTitle>
          <div className="flex items-center gap-1 md:gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={handleNewPattern} className="text-xs md:text-sm h-8 md:h-9">
              <Plus className="w-3 h-3 md:w-4 md:h-4 mr-1" />
              New
            </Button>
            <Button variant="outline" size="sm" onClick={handleDuplicatePattern} className="text-xs md:text-sm h-8 md:h-9">
              <Copy className="w-3 h-3 md:w-4 md:h-4 mr-1" />
              Duplicate
            </Button>
            <Button variant="outline" size="sm" onClick={handleClear} className="text-xs md:text-sm h-8 md:h-9">
              <Trash2 className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
              Clear
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 md:space-y-4">
        {!isReady && (
          <p className="text-xs md:text-sm text-muted-foreground">Initializing drum synths...</p>
        )}
        {isReady && (
          <p className="text-xs md:text-sm text-green-600">✓ Drum synths ready</p>
        )}

        {/* Pattern Selector */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
          <Label className="text-xs md:text-sm font-semibold whitespace-nowrap">Pattern:</Label>
          <Select
            value={activeDrumPatternId}
            onValueChange={setActiveDrumPattern}
          >
            <SelectTrigger className="w-full sm:w-[200px] h-9 md:h-10 text-xs md:text-sm">
              <SelectValue placeholder="Select pattern" />
            </SelectTrigger>
            <SelectContent>
              {drumPatterns.map((pattern) => (
                <SelectItem key={pattern.id} value={pattern.id} className="text-xs md:text-sm">
                  {pattern.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Drum Grid */}
        <div className="space-y-2">
          <Label className="text-xs md:text-sm font-semibold">16-Step Drum Sequencer</Label>
          <div className="overflow-x-auto -mx-2 md:mx-0 px-2 md:px-0">
            <div className="inline-block min-w-full">
              {/* Step labels */}
              <div className="flex gap-0.5 md:gap-1 mb-1">
                <div className="w-14 md:w-16 flex-shrink-0" /> {/* Spacer for instrument names */}
                {Array.from({ length: STEPS }, (_, i) => (
                  <div
                    key={i}
                    className={`w-9 md:w-8 h-5 md:h-6 flex items-center justify-center text-[10px] md:text-xs flex-shrink-0 ${
                      i === currentStep ? 'bg-primary text-primary-foreground rounded' : 'text-muted-foreground'
                    }`}
                  >
                    {i + 1}
                  </div>
                ))}
              </div>

              {/* Grid rows */}
              {drumInstruments.map((instrument, instrumentIndex) => (
                <div key={instrument} className="flex gap-0.5 md:gap-1 mb-0.5 md:mb-1">
                  <div className="w-14 md:w-16 text-[10px] md:text-xs font-medium flex items-center justify-end pr-1 md:pr-2 capitalize flex-shrink-0">
                    {instrument}
                  </div>
                  {Array.from({ length: STEPS }, (_, stepIndex) => (
                    <button
                      key={stepIndex}
                      onClick={() => {
                        toggleDrumHit(stepIndex, instrumentIndex);
                        // Play preview sound when clicking
                        if (synthsRef.current) {
                          const synth = synthsRef.current[instrument as keyof typeof synthsRef.current];
                          if (synth) {
                            if (instrument === 'kick') {
                              (synth as Tone.MembraneSynth).triggerAttackRelease('C1', '8n');
                            } else if (instrument === 'tom') {
                              (synth as Tone.MembraneSynth).triggerAttackRelease('G1', '8n');
                            } else if (instrument === 'snare' || instrument === 'clap') {
                              (synth as Tone.NoiseSynth).triggerAttackRelease('8n');
                            } else {
                              (synth as Tone.MetalSynth).triggerAttackRelease('16n', Tone.now());
                            }
                          }
                        }
                      }}
                      disabled={!isReady}
                      className={`w-9 h-9 md:w-8 md:h-8 rounded border-2 transition-all flex-shrink-0 touch-manipulation ${
                        activePattern.grid[stepIndex][instrumentIndex]
                          ? 'bg-orange-500 border-orange-600 hover:bg-orange-600 active:bg-orange-700'
                          : 'bg-muted border-muted-foreground/20 hover:bg-muted-foreground/10 active:bg-muted-foreground/20'
                      } ${
                        stepIndex === currentStep && isPlaying
                          ? 'ring-2 ring-primary ring-offset-1'
                          : ''
                      } ${!isReady ? 'opacity-50 cursor-not-allowed' : ''}`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Info */}
        <p className="text-xs text-muted-foreground">
          Click squares to program drum hits. Use dropdown to switch patterns. Press "New" to create a blank pattern.
        </p>
      </CardContent>
    </Card>
  );
}
