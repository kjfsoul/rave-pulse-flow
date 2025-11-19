import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Play, Pause } from 'lucide-react';
import { useProStationStore } from '@/hooks/useProStationStore';
import * as Tone from 'tone';

interface MixerProps {
  onChannelVolumeChange?: (deck: 'A' | 'B', volume: number) => void;
  onCrossfaderChange?: (position: number) => void;
  onMasterVolumeChange?: (volume: number) => void;
}

/**
 * Helper function to ensure audio context is started.
 * Call this on user interaction (button click, etc.) to unlock audio on mobile/web.
 */
async function startAudioContext() {
  if (Tone.context.state !== 'running') {
    await Tone.start();
    console.log('[Tone.js] Audio context started by user interaction');
  }
}

export function Mixer({
  onChannelVolumeChange,
  onCrossfaderChange,
  onMasterVolumeChange
}: MixerProps) {
  const {
    masterBPM,
    isPlaying,
    masterVolume,
    crossfader,
    deckAVolume,
    deckBVolume,
    setMasterBPM,
    setIsPlaying,
    setMasterVolume,
    setCrossfader,
    setDeckAVolume,
    setDeckBVolume,
  } = useProStationStore();

  // Legacy callbacks for backward compatibility (deprecated)
  useEffect(() => {
    if (onChannelVolumeChange) {
      onChannelVolumeChange('A', deckAVolume * 100);
    }
  }, [deckAVolume, onChannelVolumeChange]);

  useEffect(() => {
    if (onChannelVolumeChange) {
      onChannelVolumeChange('B', deckBVolume * 100);
    }
  }, [deckBVolume, onChannelVolumeChange]);

  useEffect(() => {
    if (onCrossfaderChange) {
      // Convert 0-1 to 0-100 for legacy callback
      onCrossfaderChange(crossfader * 100);
    }
  }, [crossfader, onCrossfaderChange]);

  useEffect(() => {
    if (onMasterVolumeChange) {
      onMasterVolumeChange(masterVolume);
    }
  }, [masterVolume, onMasterVolumeChange]);

  const handlePlayPause = async () => {
    // Ensure audio context is started on user interaction
    await startAudioContext();
    setIsPlaying(!isPlaying);
  };

  const handleBPMChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 60 && value <= 200) {
      setMasterBPM(value);
    }
  };

  const handleMasterVolumeChange = (value: number) => {
    setMasterVolume(value);
    console.log(`[Mixer] Master Volume: ${value}%`);
  };

  const handleCrossfaderChange = (value: number) => {
    // Convert 0-100 to 0-1 for global store
    const normalized = value / 100;
    setCrossfader(normalized);
    console.log(`[Mixer] Crossfader: ${normalized.toFixed(2)} (${value}%)`);
  };

  const handleDeckAVolumeChange = (value: number) => {
    // Convert 0-100 to 0-1 for global store
    const normalized = value / 100;
    setDeckAVolume(normalized);
    console.log(`[Mixer] Deck A Volume: ${normalized.toFixed(2)} (${value}%)`);
  };

  const handleDeckBVolumeChange = (value: number) => {
    // Convert 0-100 to 0-1 for global store
    const normalized = value / 100;
    setDeckBVolume(normalized);
    console.log(`[Mixer] Deck B Volume: ${normalized.toFixed(2)} (${value}%)`);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Mixer</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Master Transport */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-semibold">Master Transport</Label>
            <Button
              size="lg"
              onClick={handlePlayPause}
              className="w-20"
            >
              {isPlaying ? (
                <Pause className="w-6 h-6" />
              ) : (
                <Play className="w-6 h-6" />
              )}
            </Button>
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Master BPM</Label>
            <div className="flex gap-2 items-center">
              <Input
                type="number"
                value={masterBPM}
                onChange={handleBPMChange}
                min={60}
                max={200}
                className="w-24"
              />
              <Slider
                value={[masterBPM]}
                onValueChange={([value]) => setMasterBPM(value)}
                min={60}
                max={200}
                step={1}
                className="flex-1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Master Volume: {masterVolume}%</Label>
            <Slider
              value={[masterVolume]}
              onValueChange={([value]) => handleMasterVolumeChange(value)}
              max={100}
              step={1}
              className="w-full"
            />
          </div>
        </div>

        {/* Channel Faders */}
        <div className="space-y-4">
          <Label className="text-sm font-semibold">Channel Faders</Label>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs">Deck A: {(deckAVolume * 100).toFixed(0)}%</Label>
              <Slider
                value={[deckAVolume * 100]}
                onValueChange={([value]) => handleDeckAVolumeChange(value)}
                max={100}
                step={1}
                orientation="vertical"
                className="h-32 mx-auto"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Deck B: {(deckBVolume * 100).toFixed(0)}%</Label>
              <Slider
                value={[deckBVolume * 100]}
                onValueChange={([value]) => handleDeckBVolumeChange(value)}
                max={100}
                step={1}
                orientation="vertical"
                className="h-32 mx-auto"
              />
            </div>
          </div>
        </div>

        {/* Crossfader */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold">Crossfader</Label>
          <div className="flex items-center gap-4">
            <span className="text-xs font-medium">A</span>
            <Slider
              value={[crossfader * 100]}
              onValueChange={([value]) => handleCrossfaderChange(value)}
              max={100}
              step={1}
              className="flex-1"
            />
            <span className="text-xs font-medium">B</span>
          </div>
          <p className="text-xs text-center text-muted-foreground">
            {crossfader < 0.45 ? 'Deck A' : crossfader > 0.55 ? 'Deck B' : 'Center'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
