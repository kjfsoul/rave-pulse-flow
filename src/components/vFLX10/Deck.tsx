import { useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions.js';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Play, Pause, SkipBack, Plus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import * as Tone from 'tone';
import { toast } from 'sonner';
import { useProStationStore } from '@/hooks/useProStationStore';

interface Track {
  id: number | string;
  name: string;
  url: string;
  bpm?: number;
  source?: string;
}

interface DeckProps {
  deckId: 'A' | 'B';
  trackUrl?: string;
  trackName?: string;
  trackBpm?: number;
  onTrackDrop?: (track: Track) => void;
  audioOutput?: Tone.Gain | null;
  onSync?: () => void;
  otherDeckBpm?: number;
}

export function Deck({ deckId, trackUrl, trackName, trackBpm, onTrackDrop, audioOutput, onSync, otherDeckBpm }: DeckProps) {
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const regionsRef = useRef<any>(null); // RegionsPlugin doesn't export types
  const mediaElementRef = useRef<HTMLAudioElement | null>(null);
  const mediaElementSourceRef = useRef<Tone.UserMedia | null>(null);

  // Audio processing nodes
  const eqLowRef = useRef<Tone.Filter | null>(null);
  const eqMidRef = useRef<Tone.Filter | null>(null);
  const eqHighRef = useRef<Tone.Filter | null>(null);

  const [audioChainReady, setAudioChainReady] = useState(false);
  const [hotCues, setHotCues] = useState<(number | null)[]>([null, null, null, null]);
  const [isDragOver, setIsDragOver] = useState(false);

  // Read from global store based on deck ID
  const {
    deckAVolume,
    deckBVolume,
    deckAEqHigh,
    deckAEqMid,
    deckAEqLow,
    deckBEqHigh,
    deckBEqMid,
    deckBEqLow,
    deckAPitch,
    deckBPitch,
    deckAPlayState,
    deckBPlayState,
    setDeckAVolume,
    setDeckBVolume,
    setDeckAEqHigh,
    setDeckAEqMid,
    setDeckAEqLow,
    setDeckBEqHigh,
    setDeckBEqMid,
    setDeckBEqLow,
    setDeckAPitch,
    setDeckBPitch,
    setDeckAPlayState,
    setDeckBPlayState,
  } = useProStationStore();

  // Select the correct state based on deck ID
  const volume = deckId === 'A' ? deckAVolume : deckBVolume;
  const eqHigh = deckId === 'A' ? deckAEqHigh : deckBEqHigh;
  const eqMid = deckId === 'A' ? deckAEqMid : deckBEqMid;
  const eqLow = deckId === 'A' ? deckAEqLow : deckBEqLow;
  const pitch = deckId === 'A' ? deckAPitch : deckBPitch;
  const isPlaying = deckId === 'A' ? deckAPlayState : deckBPlayState;

  // Select the correct setter based on deck ID
  const setVolume = deckId === 'A' ? setDeckAVolume : setDeckBVolume;
  const setEqHigh = deckId === 'A' ? setDeckAEqHigh : setDeckBEqHigh;
  const setEqMid = deckId === 'A' ? setDeckAEqMid : setDeckBEqMid;
  const setEqLow = deckId === 'A' ? setDeckAEqLow : setDeckBEqLow;
  const setPitch = deckId === 'A' ? setDeckAPitch : setDeckBPitch;
  const setPlayState = deckId === 'A' ? setDeckAPlayState : setDeckBPlayState;

  // Initialize Wavesurfer
  useEffect(() => {
    if (!waveformRef.current) return;

    // Create Wavesurfer instance
    const ws = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: deckId === 'A' ? '#3b82f6' : '#ef4444',
      progressColor: deckId === 'A' ? '#1d4ed8' : '#b91c1c',
      cursorColor: '#fff',
      barWidth: 2,
      barRadius: 3,
      cursorWidth: 2,
      height: 80,
      barGap: 2,
      backend: 'WebAudio',
    });

    // Add regions plugin for cues and loops
    const regions = ws.registerPlugin(RegionsPlugin.create());
    regionsRef.current = regions;

    wavesurferRef.current = ws;

    // Event listeners - sync play state to global store
    ws.on('play', () => setPlayState(true));
    ws.on('pause', () => setPlayState(false));
    ws.on('finish', () => setPlayState(false));

    // Initialize EQ filters
    const eqLow = new Tone.Filter({
      type: 'lowshelf',
      frequency: 250,
      gain: 0,
    });
    eqLowRef.current = eqLow;

    const eqMid = new Tone.Filter({
      type: 'peaking',
      frequency: 1000,
      Q: 1,
      gain: 0,
    });
    eqMidRef.current = eqMid;

    const eqHigh = new Tone.Filter({
      type: 'highshelf',
      frequency: 4000,
      gain: 0,
    });
    eqHighRef.current = eqHigh;

    return () => {
      ws.destroy();
      // Capture ref values for cleanup
      const eqLowFilter = eqLowRef.current;
      const eqMidFilter = eqMidRef.current;
      const eqHighFilter = eqHighRef.current;
      // mediaElementSourceRef is set in a different effect (track loading),
      // but we clean it up defensively here
      // eslint-disable-next-line react-hooks/exhaustive-deps
      const mediaElementSource = mediaElementSourceRef.current;

      eqLowFilter?.dispose();
      eqMidFilter?.dispose();
      eqHighFilter?.dispose();
      mediaElementSource?.dispose();
    };
  }, [deckId, setPlayState]);

  // Load track and connect to audio chain
  useEffect(() => {
    if (wavesurferRef.current && trackUrl) {
      wavesurferRef.current.load(trackUrl);

      // Connect Wavesurfer to Tone.js audio chain
      wavesurferRef.current.on('ready', () => {
        const backend = wavesurferRef.current?.getMediaElement();
        if (backend && audioOutput && eqLowRef.current && eqMidRef.current && eqHighRef.current) {
          // Create Web Audio API source from media element
          const source = Tone.context.createMediaElementSource(backend);

          // Connect: source → EQ Low → EQ Mid → EQ High → Deck Gain → Destination
          // Connect native Web Audio node to Tone.js nodes
          const gainNode = Tone.context.createGain();
          source.connect(gainNode);

          const toneGain = new Tone.Gain(1.0);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (toneGain.input as any).connect(gainNode);

          toneGain.connect(eqLowRef.current);
          eqLowRef.current.connect(eqMidRef.current);
          eqMidRef.current.connect(eqHighRef.current);
          eqHighRef.current.connect(audioOutput);

          mediaElementRef.current = backend;
          setAudioChainReady(true);
        }
      });
    }
  }, [trackUrl, audioOutput]);

  // Sync pitch from global store to Wavesurfer
  useEffect(() => {
    if (wavesurferRef.current) {
      wavesurferRef.current.setPlaybackRate(pitch);
      console.log(`[Deck ${deckId}] Pitch updated: ${pitch.toFixed(2)}x`);
    }
  }, [pitch, deckId]);

  // Sync volume from global store to Wavesurfer
  useEffect(() => {
    if (wavesurferRef.current) {
      wavesurferRef.current.setVolume(volume);
      console.log(`[Deck ${deckId}] Volume updated: ${(volume * 100).toFixed(0)}%`);
    }
  }, [volume, deckId]);

  // Sync EQ from global store to Tone.js filters
  useEffect(() => {
    if (audioChainReady && eqLowRef.current && typeof eqLow === 'number' && !isNaN(eqLow) && isFinite(eqLow)) {
      eqLowRef.current.gain.rampTo(eqLow, 0.05);
      console.log(`[Deck ${deckId}] EQ Low updated: ${eqLow.toFixed(1)}dB`);
    }
  }, [eqLow, audioChainReady, deckId]);

  useEffect(() => {
    if (audioChainReady && eqMidRef.current && typeof eqMid === 'number' && !isNaN(eqMid) && isFinite(eqMid)) {
      eqMidRef.current.gain.rampTo(eqMid, 0.05);
      console.log(`[Deck ${deckId}] EQ Mid updated: ${eqMid.toFixed(1)}dB`);
    }
  }, [eqMid, audioChainReady, deckId]);

  useEffect(() => {
    if (audioChainReady && eqHighRef.current && typeof eqHigh === 'number' && !isNaN(eqHigh) && isFinite(eqHigh)) {
      eqHighRef.current.gain.rampTo(eqHigh, 0.05);
      console.log(`[Deck ${deckId}] EQ High updated: ${eqHigh.toFixed(1)}dB`);
    }
  }, [eqHigh, audioChainReady, deckId]);

  // Sync play state from global store to Wavesurfer
  useEffect(() => {
    if (wavesurferRef.current) {
      const wsIsPlaying = wavesurferRef.current.isPlaying();
      if (isPlaying && !wsIsPlaying) {
        // Global store says play, but Wavesurfer is paused → play
        wavesurferRef.current.play();
      } else if (!isPlaying && wsIsPlaying) {
        // Global store says pause, but Wavesurfer is playing → pause
        wavesurferRef.current.pause();
      }
    }
  }, [isPlaying]);

  const handlePlayPause = async () => {
    if (wavesurferRef.current) {
      // Ensure Tone.js context is started
      if (Tone.context.state !== 'running') {
        await Tone.start();
      }
      // Toggle play state in global store
      setPlayState(!isPlaying);
    }
  };

  const handleStop = () => {
    if (wavesurferRef.current) {
      wavesurferRef.current.stop();
      setPlayState(false);
    }
  };

  const handleHotCue = (index: number) => {
    if (!wavesurferRef.current) return;

    const currentTime = wavesurferRef.current.getCurrentTime();
    const cueTime = hotCues[index];

    if (cueTime === null) {
      // First click: Store cue point
      const newHotCues = [...hotCues];
      newHotCues[index] = currentTime;
      setHotCues(newHotCues);
      toast.success(`Hot Cue ${index + 1} set at ${currentTime.toFixed(2)}s`);
    } else {
      // Second click: Jump to cue point
      wavesurferRef.current.setTime(cueTime);
      toast.info(`Jumped to Hot Cue ${index + 1}`);
    }
  };

  const addLoop = () => {
    if (wavesurferRef.current && regionsRef.current) {
      const currentTime = wavesurferRef.current.getCurrentTime();
      const duration = wavesurferRef.current.getDuration();
      const loopEnd = Math.min(currentTime + 4, duration);

      regionsRef.current.addRegion({
        start: currentTime,
        end: loopEnd,
        color: 'rgba(0, 255, 0, 0.3)',
        loop: true,
      });

      toast.success(`Loop created: ${currentTime.toFixed(2)}s - ${loopEnd.toFixed(2)}s`);
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    try {
      const trackData = JSON.parse(e.dataTransfer.getData('application/json'));
      if (trackData && onTrackDrop) {
        onTrackDrop(trackData);
        toast.success(`Loaded: ${trackData.name}`, {
          description: `Track loaded into Deck ${deckId}`,
        });
      }
    } catch (error) {
      console.error('Failed to parse dropped track data:', error);
      toast.error('Failed to load track');
    }
  };

  return (
    <Card
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`transition-all ${isDragOver ? 'ring-2 ring-primary shadow-lg' : ''}`}
    >
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Deck {deckId}</h3>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={handleStop}>
              <SkipBack className="w-4 h-4" />
            </Button>
            <Button size="sm" onClick={handlePlayPause}>
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium truncate">
            {trackName || (
              <span className="text-muted-foreground">
                Click 'Deck {deckId}' button in Track Library to load
              </span>
            )}
          </p>
          <div ref={waveformRef} className="bg-muted rounded min-h-[80px]" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Pitch: {pitch.toFixed(2)}x</Label>
              {trackBpm && otherDeckBpm && onSync && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    // Calculate pitch adjustment to match other deck's BPM
                    const pitchAdjustment = otherDeckBpm / trackBpm;
                    setPitch(pitchAdjustment);
                    onSync();
                  }}
                  className="h-6 px-2 text-[10px]"
                  disabled={!trackUrl}
                >
                  Sync
                </Button>
              )}
            </div>
            <Slider
              value={[pitch]}
              onValueChange={([value]) => setPitch(value)}
              min={0.5}
              max={2.0}
              step={0.01}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Volume: {(volume * 100).toFixed(0)}%</Label>
            <Slider
              value={[volume * 100]}
              onValueChange={([value]) => setVolume(value / 100)}
              max={100}
              step={1}
              className="w-full"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-semibold">3-Band EQ</Label>
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1">
              <Label className="text-xs">Low</Label>
              <Slider
                value={[eqLow]}
                onValueChange={([value]) => setEqLow(value)}
                min={-12}
                max={12}
                step={1}
                orientation="vertical"
                className="h-24"
              />
              <p className="text-xs text-center">{eqLow.toFixed(0)}dB</p>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Mid</Label>
              <Slider
                value={[eqMid]}
                onValueChange={([value]) => setEqMid(value)}
                min={-12}
                max={12}
                step={1}
                orientation="vertical"
                className="h-24"
              />
              <p className="text-xs text-center">{eqMid.toFixed(0)}dB</p>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">High</Label>
              <Slider
                value={[eqHigh]}
                onValueChange={([value]) => setEqHigh(value)}
                min={-12}
                max={12}
                step={1}
                orientation="vertical"
                className="h-24"
              />
              <p className="text-xs text-center">{eqHigh.toFixed(0)}dB</p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-semibold">Hot Cues</Label>
          <div className="grid grid-cols-4 gap-2">
            {hotCues.map((cue, index) => (
              <Button
                key={index}
                size="sm"
                variant={cue !== null ? 'default' : 'outline'}
                onClick={() => handleHotCue(index)}
                disabled={!trackUrl}
                className="relative"
              >
                {index + 1}
                {cue !== null && (
                  <span className="absolute -top-1 -right-1 text-[10px] bg-background rounded-full w-4 h-4 flex items-center justify-center border">
                    ×
                  </span>
                )}
              </Button>
            ))}
          </div>
          <Button size="sm" variant="outline" onClick={addLoop} disabled={!trackUrl} className="w-full">
            <Plus className="w-3 h-3 mr-1" />
            Add Loop Region
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
