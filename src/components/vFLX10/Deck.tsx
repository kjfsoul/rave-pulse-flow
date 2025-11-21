import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useProStationStore } from "@/hooks/useProStationStore";
import { Pause, Play, SkipBack } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import * as Tone from "tone";
import WaveSurfer from "wavesurfer.js";
import RegionsPlugin from "wavesurfer.js/dist/plugins/regions.js";

interface Track {
  id: number | string;
  name: string;
  url: string;
  bpm?: number;
  source?: string;
}

interface DeckProps {
  deckId: "A" | "B";
  trackUrl?: string;
  trackName?: string;
  trackBpm?: number;
  onTrackDrop?: (track: Track) => void;
  audioOutput?: Tone.Gain | null;
  onSync?: () => void;
  otherDeckBpm?: number;
}

export function Deck({
  deckId,
  trackUrl,
  trackName,
  trackBpm,
  onTrackDrop,
  audioOutput,
  onSync,
  otherDeckBpm,
}: DeckProps) {
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
  const [hotCues, setHotCues] = useState<(number | null)[]>([
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
  ]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

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
  const volume = deckId === "A" ? deckAVolume : deckBVolume;
  const eqHigh = deckId === "A" ? deckAEqHigh : deckBEqHigh;
  const eqMid = deckId === "A" ? deckAEqMid : deckBEqMid;
  const eqLow = deckId === "A" ? deckAEqLow : deckBEqLow;
  const pitch = deckId === "A" ? deckAPitch : deckBPitch;
  const isPlaying = deckId === "A" ? deckAPlayState : deckBPlayState;

  // Select the correct setter based on deck ID
  const setVolume = deckId === "A" ? setDeckAVolume : setDeckBVolume;
  const setEqHigh = deckId === "A" ? setDeckAEqHigh : setDeckBEqHigh;
  const setEqMid = deckId === "A" ? setDeckAEqMid : setDeckBEqMid;
  const setEqLow = deckId === "A" ? setDeckAEqLow : setDeckBEqLow;
  const setPitch = deckId === "A" ? setDeckAPitch : setDeckBPitch;
  const setPlayState = deckId === "A" ? setDeckAPlayState : setDeckBPlayState;

  // Initialize Wavesurfer
  useEffect(() => {
    if (!waveformRef.current) return;

    // Create Wavesurfer instance - sized for circular jog wheel
    const ws = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: deckId === "A" ? "#06b6d4" : "#a855f7",
      progressColor: deckId === "A" ? "#22d3ee" : "#c084fc",
      cursorColor: "#fff",
      barWidth: 2,
      barRadius: 2,
      cursorWidth: 1,
      height: 200, // Larger for circular display
      barGap: 1,
      backend: "WebAudio",
      normalize: true,
    });

    // Add regions plugin for cues and loops
    const regions = ws.registerPlugin(RegionsPlugin.create());
    regionsRef.current = regions;

    wavesurferRef.current = ws;

    // Event listeners - sync play state to global store
    ws.on("play", () => setPlayState(true));
    ws.on("pause", () => setPlayState(false));
    ws.on("finish", () => setPlayState(false));

    // Update time and duration for display
    ws.on("timeupdate", (time: number) => setCurrentTime(time));
    ws.on("ready", () => {
      const dur = ws.getDuration();
      if (dur) setDuration(dur);
    });

    // Initialize EQ filters
    const eqLow = new Tone.Filter({
      type: "lowshelf",
      frequency: 250,
      gain: 0,
    });
    eqLowRef.current = eqLow;

    const eqMid = new Tone.Filter({
      type: "peaking",
      frequency: 1000,
      Q: 1,
      gain: 0,
    });
    eqMidRef.current = eqMid;

    const eqHigh = new Tone.Filter({
      type: "highshelf",
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
      wavesurferRef.current.on("ready", () => {
        const backend = wavesurferRef.current?.getMediaElement();
        if (
          backend &&
          audioOutput &&
          eqLowRef.current &&
          eqMidRef.current &&
          eqHighRef.current
        ) {
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
      console.log(
        `[Deck ${deckId}] Volume updated: ${(volume * 100).toFixed(0)}%`
      );
    }
  }, [volume, deckId]);

  // Sync EQ from global store to Tone.js filters
  useEffect(() => {
    if (
      audioChainReady &&
      eqLowRef.current &&
      typeof eqLow === "number" &&
      !isNaN(eqLow) &&
      isFinite(eqLow)
    ) {
      eqLowRef.current.gain.rampTo(eqLow, 0.05);
      console.log(`[Deck ${deckId}] EQ Low updated: ${eqLow.toFixed(1)}dB`);
    }
  }, [eqLow, audioChainReady, deckId]);

  useEffect(() => {
    if (
      audioChainReady &&
      eqMidRef.current &&
      typeof eqMid === "number" &&
      !isNaN(eqMid) &&
      isFinite(eqMid)
    ) {
      eqMidRef.current.gain.rampTo(eqMid, 0.05);
      console.log(`[Deck ${deckId}] EQ Mid updated: ${eqMid.toFixed(1)}dB`);
    }
  }, [eqMid, audioChainReady, deckId]);

  useEffect(() => {
    if (
      audioChainReady &&
      eqHighRef.current &&
      typeof eqHigh === "number" &&
      !isNaN(eqHigh) &&
      isFinite(eqHigh)
    ) {
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
      if (Tone.context.state !== "running") {
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
      const trackData = JSON.parse(e.dataTransfer.getData("application/json"));
      if (trackData && onTrackDrop) {
        onTrackDrop(trackData);
        toast.success(`Loaded: ${trackData.name}`, {
          description: `Track loaded into Deck ${deckId}`,
        });
      }
    } catch (error) {
      console.error("Failed to parse dropped track data:", error);
      toast.error("Failed to load track");
    }
  };

  // Calculate effective BPM (track BPM * pitch)
  const effectiveBPM = trackBpm ? Math.round(trackBpm * pitch) : null;

  // Pad colors for visual variety
  const padColors =
    deckId === "A"
      ? [
          "bg-cyan-500",
          "bg-cyan-600",
          "bg-blue-500",
          "bg-blue-600",
          "bg-indigo-500",
          "bg-indigo-600",
          "bg-purple-500",
          "bg-purple-600",
        ]
      : [
          "bg-red-500",
          "bg-red-600",
          "bg-orange-500",
          "bg-orange-600",
          "bg-yellow-500",
          "bg-yellow-600",
          "bg-pink-500",
          "bg-pink-600",
        ];

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative w-full h-full bg-zinc-950 rounded-lg border border-zinc-800 p-4 transition-all ${
        isDragOver ? "ring-2 ring-cyan-400 shadow-lg" : ""
      }`}
    >
      {/* Track Name at Top */}
      <div className="mb-4">
        <p className="text-sm font-medium truncate text-white text-center">
          {trackName || (
            <span className="text-zinc-500">
              Drop track or load from library
            </span>
          )}
        </p>
      </div>

      {/* Main Layout: Jog Wheel + Tempo Slider */}
      <div className="flex gap-4 items-start justify-center mb-4">
        {/* Jog Wheel - Large Circular */}
        <div className="relative flex-shrink-0">
          <div className="relative w-64 h-64 rounded-full border-4 border-zinc-700 bg-zinc-900 shadow-xl flex flex-col items-center justify-center overflow-hidden">
            {/* Waveform Summary Inside Jog Wheel - Circular */}
            <div
              ref={waveformRef}
              className="absolute inset-4 rounded-full overflow-hidden opacity-50"
              style={{
                clipPath: "circle(50% at center)",
              }}
            />

            {/* Center Content: BPM and Play/Pause */}
            <div className="relative z-10 flex flex-col items-center gap-2">
              {/* BPM Display */}
              <div className="flex flex-col items-center">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">
                  BPM
                </Label>
                <div className="text-3xl font-bold text-white font-mono">
                  {effectiveBPM || trackBpm || "--"}
                </div>
                {pitch !== 1.0 && (
                  <div className="text-xs text-zinc-400 font-mono mt-1">
                    {pitch > 1.0 ? "+" : ""}
                    {((pitch - 1.0) * 100).toFixed(1)}%
                  </div>
                )}
              </div>

              {/* Play/Pause Button */}
              <Button
                size="lg"
                onClick={handlePlayPause}
                disabled={!trackUrl}
                className={`rounded-full w-16 h-16 ${
                  deckId === "A"
                    ? "bg-cyan-500 hover:bg-cyan-600"
                    : "bg-purple-500 hover:bg-purple-600"
                } text-white shadow-lg`}
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6" />
                ) : (
                  <Play className="w-6 h-6 ml-1" />
                )}
              </Button>

              {/* Time Display */}
              <div className="text-xs text-zinc-400 font-mono mt-2">
                {Math.floor(currentTime / 60)}:
                {String(Math.floor(currentTime % 60)).padStart(2, "0")} /{" "}
                {Math.floor(duration / 60)}:
                {String(Math.floor(duration % 60)).padStart(2, "0")}
              </div>
            </div>
          </div>

          {/* Sync Button */}
          {trackBpm && otherDeckBpm && onSync && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const pitchAdjustment = otherDeckBpm / trackBpm;
                setPitch(pitchAdjustment);
                onSync();
              }}
              disabled={!trackUrl}
              className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700 text-xs"
            >
              Sync
            </Button>
          )}
        </div>

        {/* Tempo/Pitch Slider - Vertical on Right */}
        <div className="flex flex-col items-center gap-2 h-64">
          <Label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
            Tempo
          </Label>
          <div className="h-full flex items-center">
            <Slider
              value={[pitch]}
              onValueChange={([value]) => setPitch(value)}
              min={0.5}
              max={2.0}
              step={0.01}
              orientation="vertical"
              className="h-full"
            />
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-[10px] text-zinc-400 font-mono">
              {pitch.toFixed(2)}x
            </span>
            <div className="text-[8px] text-zinc-500">0.5x</div>
            <div className="text-[8px] text-zinc-500 mt-auto">2.0x</div>
          </div>
        </div>
      </div>

      {/* Hot Cue Pads - Grid of 8 below Jog Wheel */}
      <div className="space-y-2">
        <Label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block text-center mb-3">
          Hot Cues
        </Label>
        <div className="grid grid-cols-4 gap-2">
          {hotCues.map((cue, index) => (
            <Button
              key={index}
              size="lg"
              variant={cue !== null ? "default" : "outline"}
              onClick={() => handleHotCue(index)}
              disabled={!trackUrl}
              className={`relative h-16 font-bold text-white border-2 transition-all ${
                cue !== null
                  ? `${padColors[index]} border-zinc-600 shadow-lg hover:shadow-xl`
                  : "bg-zinc-900 border-zinc-700 hover:bg-zinc-800 hover:border-zinc-600"
              }`}
            >
              <span className="text-lg">{index + 1}</span>
              {cue !== null && (
                <span className="absolute top-1 right-1 text-[8px] bg-white text-black rounded-full w-3 h-3 flex items-center justify-center font-bold">
                  •
                </span>
              )}
            </Button>
          ))}
        </div>
      </div>

      {/* Stop Button */}
      <div className="flex justify-center mt-4">
        <Button
          size="sm"
          variant="outline"
          onClick={handleStop}
          disabled={!trackUrl}
          className="bg-zinc-900 border-zinc-700 text-white hover:bg-zinc-800"
        >
          <SkipBack className="w-4 h-4 mr-1" />
          Stop
        </Button>
      </div>
    </div>
  );
}
