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
import { useSequenceState, STEPS, SYNTH_NOTES } from '@/hooks/vFLX10/useSequenceState';
import { useProStationStore } from '@/hooks/useProStationStore';
import { Trash2, Plus, Copy } from 'lucide-react';

export function SynthStation() {
  const {
    synthPatterns,
    activeSynthPatternId,
    synthNotes,
    createSynthPattern,
    duplicateSynthPattern,
    setActiveSynthPattern,
    toggleSynthNote,
    clearActiveSynthPattern,
    getActiveSynthPattern,
    getSynthNotesAtStep,
  } = useSequenceState();

  const { isPlaying } = useProStationStore();
  const synthRef = useRef<Tone.PolySynth | null>(null);
  const sequenceRef = useRef<Tone.Sequence | null>(null);
  const [currentStep, setCurrentStep] = useState(-1);

  const activePattern = getActiveSynthPattern();

  // Initialize synth and sequence
  useEffect(() => {
    // Create PolySynth with FMSynth
    const synth = new Tone.PolySynth(Tone.FMSynth, {
      volume: -6,
    }).toDestination();

    synthRef.current = synth;

    // Create sequence
    const sequence = new Tone.Sequence(
      (time, step) => {
        // Get active notes at this step
        const notesToPlay = getSynthNotesAtStep(step);

        // Update visual indicator
        Tone.Draw.schedule(() => {
          setCurrentStep(step);
        }, time);

        // Play notes if any are active
        if (notesToPlay.length > 0 && synthRef.current) {
          synthRef.current.triggerAttackRelease(notesToPlay, '16n', time);
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
      synth.dispose();
    };
  }, [getSynthNotesAtStep]);

  const handleClear = () => {
    clearActiveSynthPattern();
    setCurrentStep(-1);
  };

  const handleNewPattern = () => {
    createSynthPattern();
  };

  const handleDuplicatePattern = () => {
    duplicateSynthPattern(activeSynthPatternId);
  };

  if (!activePattern) {
    return <div>Loading...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <CardTitle className="text-base md:text-lg">Synth Station</CardTitle>
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
        {/* Pattern Selector */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
          <Label className="text-xs md:text-sm font-semibold whitespace-nowrap">Pattern:</Label>
          <Select
            value={activeSynthPatternId}
            onValueChange={setActiveSynthPattern}
          >
            <SelectTrigger className="w-full sm:w-[200px] h-9 md:h-10 text-xs md:text-sm">
              <SelectValue placeholder="Select pattern" />
            </SelectTrigger>
            <SelectContent>
              {synthPatterns.map((pattern) => (
                <SelectItem key={pattern.id} value={pattern.id} className="text-xs md:text-sm">
                  {pattern.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Piano Roll Grid */}
        <div className="space-y-2">
          <Label className="text-xs md:text-sm font-semibold">16-Step Piano Roll</Label>
          <div className="overflow-x-auto -mx-2 md:mx-0 px-2 md:px-0">
            <div className="inline-block min-w-full">
              {/* Step labels */}
              <div className="flex gap-0.5 md:gap-1 mb-1">
                <div className="w-10 md:w-12 flex-shrink-0" /> {/* Spacer for note names */}
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
              {synthNotes.map((note, noteIndex) => (
                <div key={note} className="flex gap-0.5 md:gap-1 mb-0.5 md:mb-1">
                  <div className="w-10 md:w-12 text-[10px] md:text-xs font-medium flex items-center justify-end pr-1 md:pr-2 flex-shrink-0">
                    {note}
                  </div>
                  {Array.from({ length: STEPS }, (_, stepIndex) => (
                    <button
                      key={stepIndex}
                      onClick={() => {
                        toggleSynthNote(stepIndex, noteIndex);
                        // Play preview sound when clicking
                        if (synthRef.current) {
                          synthRef.current.triggerAttackRelease(note, '8n');
                        }
                      }}
                      className={`w-9 h-9 md:w-8 md:h-8 rounded border-2 transition-all flex-shrink-0 touch-manipulation ${
                        activePattern.grid[stepIndex][noteIndex]
                          ? 'bg-blue-500 border-blue-600 hover:bg-blue-600 active:bg-blue-700'
                          : 'bg-muted border-muted-foreground/20 hover:bg-muted-foreground/10 active:bg-muted-foreground/20'
                      } ${
                        stepIndex === currentStep && isPlaying
                          ? 'ring-2 ring-primary ring-offset-1'
                          : ''
                      }`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Info */}
        <p className="text-xs text-muted-foreground">
          Click squares to program notes. Use dropdown to switch patterns. Press "New" to create a blank pattern.
        </p>
      </CardContent>
    </Card>
  );
}
