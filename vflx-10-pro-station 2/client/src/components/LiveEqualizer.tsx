import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import * as Tone from 'tone';

const EQ_BANDS = [
  { freq: 32, label: '32Hz' },
  { freq: 64, label: '64Hz' },
  { freq: 125, label: '125Hz' },
  { freq: 250, label: '250Hz' },
  { freq: 500, label: '500Hz' },
  { freq: 1000, label: '1kHz' },
  { freq: 2000, label: '2kHz' },
  { freq: 4000, label: '4kHz' },
  { freq: 8000, label: '8kHz' },
  { freq: 16000, label: '16kHz' },
];

interface LiveEqualizerProps {
  masterGain?: Tone.Gain | null;
}

export function LiveEqualizer({ masterGain }: LiveEqualizerProps) {
  const [bands, setBands] = useState<number[]>(Array(10).fill(0));
  const eqFiltersRef = useRef<Tone.Filter[]>([]);
  const isInitializedRef = useRef(false);

  // Initialize EQ filters
  useEffect(() => {
    if (isInitializedRef.current || !masterGain) return;
    
    // Create 10-band EQ using peaking filters
    const filters = EQ_BANDS.map((band, index) => {
      const filter = new Tone.Filter({
        type: index === 0 ? 'lowshelf' : index === 9 ? 'highshelf' : 'peaking',
        frequency: band.freq,
        Q: 1,
        gain: 0,
      });
      return filter;
    });

    // Chain filters: masterGain → filter0 → filter1 → ... → filter9 → Destination
    if (filters.length > 0) {
      masterGain.disconnect();
      masterGain.connect(filters[0]);
      
      for (let i = 0; i < filters.length - 1; i++) {
        filters[i].connect(filters[i + 1]);
      }
      
      filters[filters.length - 1].toDestination();
    }

    eqFiltersRef.current = filters;
    isInitializedRef.current = true;

    return () => {
      filters.forEach(filter => filter.dispose());
      eqFiltersRef.current = [];
      isInitializedRef.current = false;
    };
  }, [masterGain]);

  // Update filter gains when sliders change
  useEffect(() => {
    bands.forEach((gain, index) => {
      const filter = eqFiltersRef.current[index];
      if (filter) {
        filter.gain.rampTo(gain, 0.05);
      }
    });
  }, [bands]);

  const updateBand = (index: number, value: number) => {
    const newBands = [...bands];
    newBands[index] = value;
    setBands(newBands);
  };

  const resetEQ = () => {
    setBands(Array(10).fill(0));
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Live Equalizer</CardTitle>
        <CardDescription>10-band graphic EQ for master output</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-end justify-between gap-2">
          {EQ_BANDS.map((band, index) => (
            <div key={band.freq} className="flex flex-col items-center gap-2">
              <div className="text-xs text-center text-muted-foreground">
                {bands[index] > 0 ? `+${bands[index]}` : bands[index]}dB
              </div>
              <Slider
                value={[bands[index]]}
                onValueChange={([value]) => updateBand(index, value)}
                min={-12}
                max={12}
                step={1}
                orientation="vertical"
                className="h-40"
              />
              <Label className="text-xs text-center whitespace-nowrap">
                {band.label}
              </Label>
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center pt-4 border-t">
          <p className="text-xs text-muted-foreground">
            Master EQ applied to all audio output
          </p>
          <Button size="sm" variant="outline" onClick={resetEQ}>
            Reset EQ
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
