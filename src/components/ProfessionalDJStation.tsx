import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { useAuth } from "@/contexts/AuthContext";
import ProfessionalAudioEngine, {
  AudioTrack,
  ProfessionalAudioState,
} from "@/lib/professionalAudioEngine";
import {
  Activity,
  Headphones,
  Radio,
  Save,
  Settings,
  Upload,
  Wifi,
  WifiOff,
} from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import FLX10DeckPro from "./FLX10DeckPro";

interface MixerState {
  crossfader: number;
  masterVolume: number;
  headphoneVolume: number;
  headphonesConnected: boolean;
  micVolume: number;
  micConnected: boolean;
  recording: boolean;
  broadcasting: boolean;
}

const ProfessionalDJStation: React.FC = () => {
  const { user } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);

  // Audio engines for each deck
  const deckAEngineRef = useRef<ProfessionalAudioEngine | null>(null);
  const deckBEngineRef = useRef<ProfessionalAudioEngine | null>(null);

  // Deck states
  const [deckAState, setDeckAState] = useState<ProfessionalAudioState>({
    isPlaying: false,
    position: 0,
    pitch: 0,
    volume: 80,
    lowEQ: 0,
    midEQ: 0,
    highEQ: 0,
    filter: 0,
    keyLock: false,
    loopActive: false,
    loopStart: 0,
    loopEnd: 0,
    hotCues: Array(8)
      .fill(null)
      .map((_, i) => ({
        position: 0,
        active: false,
        name: `Cue ${i + 1}`,
        color: `from-red-${500 + i * 100} to-red-${700 + i * 100}`,
      })),
    quantize: true,
    quantizeGrid: 16,
    isScratching: false,
    manualPitch: 0,
    reverbMix: 0,

    // FLX10DeckPro compatibility fields
    isCued: false,
    isSync: false,
    loopLength: 4,
  });

  const [deckBState, setDeckBState] = useState<ProfessionalAudioState>({
    isPlaying: false,
    position: 0,
    pitch: 0,
    volume: 80,
    lowEQ: 0,
    midEQ: 0,
    highEQ: 0,
    filter: 0,
    keyLock: false,
    loopActive: false,
    loopStart: 0,
    loopEnd: 0,
    hotCues: Array(8)
      .fill(null)
      .map((_, i) => ({
        position: 0,
        active: false,
        name: `Cue ${i + 1}`,
        color: `from-blue-${500 + i * 100} to-blue-${700 + i * 100}`,
      })),
    quantize: true,
    quantizeGrid: 16,
    isScratching: false,
    manualPitch: 0,
    reverbMix: 0,

    // FLX10DeckPro compatibility fields
    isCued: false,
    isSync: false,
    loopLength: 4,
  });

  // Tracks
  const [deckATrack, setDeckATrack] = useState<AudioTrack | null>(null);
  const [deckBTrack, setDeckBTrack] = useState<AudioTrack | null>(null);

  // Mixer state
  const [mixerState, setMixerState] = useState<MixerState>({
    crossfader: 50,
    masterVolume: 80,
    headphoneVolume: 70,
    headphonesConnected: false,
    micVolume: 0,
    micConnected: false,
    recording: false,
    broadcasting: false,
  });

  const [masterDeck, setMasterDeck] = useState<"A" | "B" | null>(null);

  // Visual feedback
  const [vuMeterData, setVuMeterData] = useState<{
    deckA: number[];
    deckB: number[];
    master: number[];
  }>({
    deckA: new Array(32).fill(0),
    deckB: new Array(32).fill(0),
    master: new Array(32).fill(0),
  });

  const masterGainRef = useRef<GainNode | null>(null);
  const crossfaderGainARef = useRef<GainNode | null>(null);
  const crossfaderGainBRef = useRef<GainNode | null>(null);
  const cueGainARef = useRef<GainNode | null>(null);
  const cueGainBRef = useRef<GainNode | null>(null);
  const headphoneGainRef = useRef<GainNode | null>(null);

  // Initialize professional audio system
  useEffect(() => {
    const initializeAudio = async () => {
      try {
        const AudioContextClass =
          window.AudioContext || (window as any).webkitAudioContext;
        const context = new AudioContextClass();
        setAudioContext(context);

        // Initialize master mixer
        masterGainRef.current = context.createGain();
        crossfaderGainARef.current = context.createGain();
        crossfaderGainBRef.current = context.createGain();

        // Initialize headphone cueing path
        headphoneGainRef.current = context.createGain();
        cueGainARef.current = context.createGain();
        cueGainBRef.current = context.createGain();

        // Initialize audio engines
        deckAEngineRef.current = new ProfessionalAudioEngine(context);
        deckBEngineRef.current = new ProfessionalAudioEngine(context);

        // Connect audio routing
        // Deck A output splits to crossfader and cue path
        deckAEngineRef.current.connect(crossfaderGainARef.current);
        deckAEngineRef.current.connect(cueGainARef.current);

        // Deck B output splits to crossfader and cue path
        deckBEngineRef.current.connect(crossfaderGainBRef.current);
        deckBEngineRef.current.connect(cueGainBRef.current);

        // Master path
        crossfaderGainARef.current.connect(masterGainRef.current);
        crossfaderGainBRef.current.connect(masterGainRef.current);
        masterGainRef.current.connect(context.destination);

        // Cue path
        cueGainARef.current.connect(headphoneGainRef.current);
        cueGainBRef.current.connect(headphoneGainRef.current);
        headphoneGainRef.current.connect(context.destination);

        // Set initial mixer values
        masterGainRef.current.gain.value = mixerState.masterVolume / 100;
        headphoneGainRef.current.gain.value = mixerState.headphoneVolume / 100;
        cueGainARef.current.gain.value = 0; // Muted by default
        cueGainBRef.current.gain.value = 0; // Muted by default
        updateCrossfader(mixerState.crossfader);

        // Set up callbacks for audio engines
        deckAEngineRef.current.setCallbacks({
          onPositionUpdate: (position) => {
            setDeckAState((prev) => ({ ...prev, position }));
          },
          onEndOfTrack: () => {
            setDeckAState((prev) => ({ ...prev, isPlaying: false }));
            toast.info("Deck A: Track ended");
          },
        });

        deckBEngineRef.current.setCallbacks({
          onPositionUpdate: (position) => {
            setDeckBState((prev) => ({ ...prev, position }));
          },
          onEndOfTrack: () => {
            setDeckBState((prev) => ({ ...prev, isPlaying: false }));
            toast.info("Deck B: Track ended");
          },
        });

        setIsInitialized(true);
        toast.success("Professional DJ Station initialized");

        // Load demo tracks
        await loadDemoTracks();
      } catch (error) {
        console.error("Failed to initialize audio:", error);
        toast.error("Failed to initialize audio system");
      }
    };

    initializeAudio();

    return () => {
      if (audioContext) {
        audioContext.close();
      }
    };
  }, []);

  // Update crossfader routing
  const updateCrossfader = useCallback((value: number) => {
    if (!crossfaderGainARef.current || !crossfaderGainBRef.current) return;

    const position = value / 100; // 0 to 1
    const gainA = Math.cos((position * Math.PI) / 2); // Cosine curve for smooth transition
    const gainB = Math.sin((position * Math.PI) / 2); // Sine curve for smooth transition

    crossfaderGainARef.current.gain.value = gainA;
    crossfaderGainBRef.current.gain.value = gainB;
  }, []);

  // Load demo tracks for testing
  const loadDemoTracks = async () => {
    try {
      // Generate procedural demo tracks
      const createDemoTrack = async (
        title: string,
        artist: string,
        bpm: number,
        key: string,
        genre: string
      ): Promise<AudioTrack> => {
        const sampleRate = 44100;
        const duration = 180; // 3 minutes
        const frameCount = sampleRate * duration;

        const buffer = audioContext!.createBuffer(2, frameCount, sampleRate);
        const leftChannel = buffer.getChannelData(0);
        const rightChannel = buffer.getChannelData(1);

        // Generate professional-quality demo audio
        for (let i = 0; i < frameCount; i++) {
          const t = i / sampleRate;
          const beatTime = ((t * bpm) / 60) % 4;

          // Kick drum pattern
          const kickTrigger =
            Math.floor(beatTime) !==
            Math.floor(((t - 1 / sampleRate) * bpm) / 60) % 4;
          const kick = kickTrigger
            ? Math.exp((-t % (60 / bpm)) * 20) * Math.sin(2 * Math.PI * 60 * t)
            : 0;

          // Bass line
          const bassFreq = key === "A" ? 110 : key === "C" ? 130.81 : 146.83;
          const bass =
            Math.sin(2 * Math.PI * bassFreq * t) *
            0.3 *
            (beatTime < 3 ? 1 : 0.5);

          // Synth lead
          const leadFreq = bassFreq * 4;
          const lead =
            Math.sin(2 * Math.PI * leadFreq * t) * 0.2 * (beatTime > 1 ? 1 : 0);

          // Hi-hats
          const hihat =
            (Math.random() - 0.5) * 0.1 * (beatTime % 0.5 < 0.1 ? 1 : 0);

          const sample = kick + bass + lead + hihat;
          leftChannel[i] = sample * 0.8;
          rightChannel[i] = sample * 0.8;
        }

        // Create analysis data
        const waveformData = new Array(256)
          .fill(0)
          .map(() => Math.random() * 0.8 + 0.2);
        const beatgrid = [];
        for (let beat = 0; beat < (duration * bpm) / 60; beat++) {
          beatgrid.push((beat / ((duration * bpm) / 60)) * 100);
        }

        return {
          buffer,
          title,
          artist,
          bpm,
          key,
          energy: Math.floor(Math.random() * 5) + 5,
          genre,
          duration,
          analyzedData: {
            beatgrid,
            waveformData,
            spectralCentroid: new Array(100).fill(1500 + Math.random() * 1000),
            mfcc: new Array(100)
              .fill(null)
              .map(() => new Array(13).fill(0).map(() => Math.random())),
            onsets: beatgrid.map((b) => (b * duration) / 100),
            harmonicContent: new Array(100).fill(0.5 + Math.random() * 0.3),
          },
        };
      };

      // Load tracks into engines
      const trackA = await createDemoTrack(
        "Progressive House Anthem",
        "DJ Demo",
        128,
        "A",
        "Progressive House"
      );
      const trackB = await createDemoTrack(
        "Tech House Groover",
        "Demo Artist",
        126,
        "C",
        "Tech House"
      );

      await deckAEngineRef.current!.loadTrack(trackA.buffer, trackA);
      await deckBEngineRef.current!.loadTrack(trackB.buffer, trackB);

      setDeckATrack(trackA);
      setDeckBTrack(trackB);

      toast.success("Demo tracks loaded successfully");
    } catch (error) {
      console.error("Failed to load demo tracks:", error);
      toast.error("Failed to load demo tracks");
    }
  };

  // Deck control handlers
  const handleDeckAControlChange = useCallback(
    (key: string, value: any) => {
      setDeckAState((prev) => ({ ...prev, [key]: value }));

      if (!deckAEngineRef.current) return;

      switch (key) {
        case "isPlaying":
          if (value) {
            deckAEngineRef.current.play();
            if (!masterDeck) setMasterDeck("A");
          } else {
            deckAEngineRef.current.pause();
            if (masterDeck === "A") {
              setMasterDeck(deckBState.isPlaying ? "B" : null);
            }
          }
          break;
        case "isSync":
          if (value && masterDeck && masterDeck !== "A" && deckBTrack) {
            deckAEngineRef.current.syncToBPM(deckBTrack.bpm);
          } else if (!value) {
            deckAEngineRef.current.resetPitch();
          }
          setDeckAState(deckAEngineRef.current.getState());
          break;
        case "volume":
          deckAEngineRef.current.setVolume(value);
          break;
        case "pitch":
          deckAEngineRef.current.setPitch(value);
          break;
        case "lowEQ":
          deckAEngineRef.current.setEQ("low", value);
          break;
        case "midEQ":
          deckAEngineRef.current.setEQ("mid", value);
          break;
        case "highEQ":
          deckAEngineRef.current.setEQ("high", value);
          break;
        case "filter":
          deckAEngineRef.current.setFilter(value);
          break;
        case "isCued":
          if (cueGainARef.current) {
            cueGainARef.current.gain.value = value ? 1 : 0;
          }
          break;
      }
    },
    [masterDeck, deckBState.isPlaying, deckBTrack]
  );

  const handleDeckBControlChange = useCallback(
    (key: string, value: any) => {
      setDeckBState((prev) => ({ ...prev, [key]: value }));

      if (!deckBEngineRef.current) return;

      switch (key) {
        case "isPlaying":
          if (value) {
            deckBEngineRef.current.play();
            if (!masterDeck) setMasterDeck("B");
          } else {
            deckBEngineRef.current.pause();
            if (masterDeck === "B") {
              setMasterDeck(deckAState.isPlaying ? "A" : null);
            }
          }
          break;
        case "isSync":
          if (value && masterDeck && masterDeck !== "B" && deckATrack) {
            deckBEngineRef.current.syncToBPM(deckATrack.bpm);
          } else if (!value) {
            deckBEngineRef.current.resetPitch();
          }
          setDeckBState(deckBEngineRef.current.getState());
          break;
        case "volume":
          deckBEngineRef.current.setVolume(value);
          break;
        case "pitch":
          deckBEngineRef.current.setPitch(value);
          break;
        case "lowEQ":
          deckBEngineRef.current.setEQ("low", value);
          break;
        case "midEQ":
          deckBEngineRef.current.setEQ("mid", value);
          break;
        case "highEQ":
          deckBEngineRef.current.setEQ("high", value);
          break;
        case "filter":
          deckBEngineRef.current.setFilter(value);
          break;
        case "isCued":
          if (cueGainBRef.current) {
            cueGainBRef.current.gain.value = value ? 1 : 0;
          }
          break;
      }
    },
    [masterDeck, deckAState.isPlaying, deckATrack]
  );

  // Hot cue handlers
  const handleDeckAHotCue = useCallback(
    (index: number, action: "set" | "trigger" | "delete") => {
      if (!deckAEngineRef.current) return;

      switch (action) {
        case "set":
          deckAEngineRef.current.setHotCue(index);
          break;
        case "trigger":
          deckAEngineRef.current.triggerHotCue(index);
          break;
        case "delete":
          deckAEngineRef.current.deleteHotCue(index);
          break;
      }

      setDeckAState((prev) => ({
        ...prev,
        hotCues: deckAEngineRef.current!.getState().hotCues,
      }));
    },
    []
  );

  const handleDeckBHotCue = useCallback(
    (index: number, action: "set" | "trigger" | "delete") => {
      if (!deckBEngineRef.current) return;

      switch (action) {
        case "set":
          deckBEngineRef.current.setHotCue(index);
          break;
        case "trigger":
          deckBEngineRef.current.triggerHotCue(index);
          break;
        case "delete":
          deckBEngineRef.current.deleteHotCue(index);
          break;
      }

      setDeckBState((prev) => ({
        ...prev,
        hotCues: deckBEngineRef.current!.getState().hotCues,
      }));
    },
    []
  );

  // Mixer control handlers
  const handleMixerChange = useCallback(
    (key: keyof MixerState, value: any) => {
      setMixerState((prev) => ({ ...prev, [key]: value }));

      switch (key) {
        case "crossfader":
          updateCrossfader(value);
          break;
        case "masterVolume":
          if (masterGainRef.current) {
            masterGainRef.current.gain.value = value / 100;
          }
          break;
        case "headphoneVolume":
          if (headphoneGainRef.current) {
            headphoneGainRef.current.gain.value = value / 100;
          }
          break;
      }
    },
    [updateCrossfader]
  );

  // File upload handler
  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    deckId: "A" | "B"
  ) => {
    const file = event.target.files?.[0];
    if (!file || !audioContext) return;

    const toastId = toast.loading(`Loading "${file.name}"...`);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

      const engine =
        deckId === "A" ? deckAEngineRef.current : deckBEngineRef.current;
      const setTrack = deckId === "A" ? setDeckATrack : setDeckBTrack;
      const handleControlChange =
        deckId === "A" ? handleDeckAControlChange : handleDeckBControlChange;

      if (engine) {
        // Stop playback on the deck before loading a new track
        handleControlChange("isPlaying", false);

        const track = await engine.loadTrack(audioBuffer, {
          title: file.name.replace(/\.[^/.]+$/, ""),
        });
        setTrack(track);
        toast.success(`"${track.title}" loaded into Deck ${deckId}`, {
          id: toastId,
        });
      }
    } catch (error) {
      console.error("Error loading track:", error);
      toast.error(
        "Failed to load track. Please use a supported audio format.",
        { id: toastId }
      );
    } finally {
      // Reset the file input so the same file can be loaded again
      event.target.value = "";
    }
  };

  // VU Meter animation
  useEffect(() => {
    if (!isInitialized) return;

    const updateVuMeters = () => {
      if (deckAEngineRef.current && deckBEngineRef.current) {
        const spectrumA = deckAEngineRef.current.getSpectrum();
        const spectrumB = deckBEngineRef.current.getSpectrum();

        // Downsample for VU meters
        const vuA = [];
        const vuB = [];
        const vuMaster = [];

        for (let i = 0; i < 32; i++) {
          const binA = spectrumA[i * 4] / 255;
          const binB = spectrumB[i * 4] / 255;

          vuA.push(binA);
          vuB.push(binB);
          vuMaster.push((binA + binB) / 2);
        }

        setVuMeterData({ deckA: vuA, deckB: vuB, master: vuMaster });
      }

      requestAnimationFrame(updateVuMeters);
    };

    updateVuMeters();
  }, [isInitialized]);

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 flex items-center justify-center">
        <Card className="bg-gray-900/80 border-purple-500/30">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">
              Initializing Professional DJ Station
            </h2>
            <p className="text-purple-300">
              Loading audio engines and analyzing demo tracks...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 p-4">
      {/* Header */}
      <div className="mb-6">
        <Card className="bg-black/60 border-purple-500/30 backdrop-blur-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-full flex items-center justify-center">
                  <Radio className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl text-white">
                    Professional DJ Station
                  </CardTitle>
                  <p className="text-purple-300">
                    Pioneer DDJ-FLX10 Professional Controller
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  {mixerState.broadcasting ? (
                    <Badge className="bg-red-600 text-white animate-pulse">
                      <Wifi className="w-3 h-3 mr-1" />
                      LIVE
                    </Badge>
                  ) : (
                    <Badge className="bg-gray-600 text-white">
                      <WifiOff className="w-3 h-3 mr-1" />
                      OFFLINE
                    </Badge>
                  )}

                  {mixerState.recording && (
                    <Badge className="bg-red-600 text-white animate-pulse">
                      <div className="w-3 h-3 bg-red-400 rounded-full mr-1" />
                      REC
                    </Badge>
                  )}

                  <Badge className="bg-green-600 text-white">
                    <Activity className="w-3 h-3 mr-1" />
                    {Math.round(audioContext?.sampleRate || 44100 / 1000)}kHz
                  </Badge>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="border-purple-500/30 text-purple-300 bg-gray-800/50 hover:bg-purple-600/20"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Studio Settings
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Main DJ Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Deck A */}
        <div className="lg:col-span-1">
          <FLX10DeckPro
            deckId="A"
            audioBuffer={deckATrack?.buffer || null}
            controls={deckAState}
            trackAnalysis={deckATrack}
            onControlChange={handleDeckAControlChange}
            onHotCueTrigger={handleDeckAHotCue}
            onJogWheel={(delta) => deckAEngineRef.current?.scratch(delta)}
            onPitchBend={(amount) => deckAEngineRef.current?.pitchBend(amount)}
            onJogStart={() => deckAEngineRef.current?.startScratch()}
            onJogEnd={() => deckAEngineRef.current?.endScratch()}
            onBeatJump={(beats) => {
              // Implement beat jumping
              const newPosition =
                deckAState.position + (beats * 60) / (deckATrack?.bpm || 128);
              deckAEngineRef.current?.seekTo(newPosition);
            }}
            onLoop={(action) => {
              if (deckAEngineRef.current) {
                if (action === "toggle") {
                  deckAEngineRef.current.toggleLoop(4);
                } else if (action === "in" || action === "out") {
                  deckAEngineRef.current.setLoop(action);
                }
                setDeckAState(deckAEngineRef.current.getState());
              }
            }}
            isMaster={masterDeck === "A"}
          />
        </div>

        {/* Master Mixer */}
        <div className="lg:col-span-1">
          <Card className="bg-gradient-to-br from-gray-900/95 to-gray-800/90 backdrop-blur-xl border-2 border-gradient-to-r from-purple-600 to-cyan-600 shadow-2xl h-full">
            <CardHeader>
              <CardTitle className="text-white text-center text-2xl">
                MASTER MIXER
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* VU Meters */}
              <div className="space-y-4">
                <h3 className="text-purple-300 font-bold text-center">
                  LEVEL METERS
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  {["DECK A", "MASTER", "DECK B"].map((label, index) => (
                    <div key={label} className="text-center">
                      <div className="text-xs text-gray-400 mb-2">{label}</div>
                      <div className="h-32 w-4 bg-gray-800 rounded-full mx-auto overflow-hidden">
                        {vuMeterData[
                          index === 0
                            ? "deckA"
                            : index === 1
                            ? "master"
                            : "deckB"
                        ]
                          .slice(0, 16)
                          .map((level, i) => (
                            <div
                              key={i}
                              className={`w-full transition-all duration-75 ${
                                level > 0.8
                                  ? "bg-red-500"
                                  : level > 0.6
                                  ? "bg-yellow-500"
                                  : "bg-green-500"
                              }`}
                              style={{
                                height: `${level * 100}%`,
                                marginTop: `${(1 - level) * 100}%`,
                              }}
                            />
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Crossfader */}
              <div className="space-y-4">
                <h3 className="text-purple-300 font-bold text-center">
                  CROSSFADER
                </h3>
                <div className="px-4">
                  <Slider
                    value={[mixerState.crossfader]}
                    onValueChange={(value) =>
                      handleMixerChange("crossfader", value[0])
                    }
                    max={100}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-2">
                    <span>A</span>
                    <span>{mixerState.crossfader}%</span>
                    <span>B</span>
                  </div>
                </div>
              </div>

              {/* Master Volume */}
              <div className="space-y-4">
                <h3 className="text-purple-300 font-bold text-center">
                  MASTER VOLUME
                </h3>
                <div className="px-4">
                  <Slider
                    value={[mixerState.masterVolume]}
                    onValueChange={(value) =>
                      handleMixerChange("masterVolume", value[0])
                    }
                    max={100}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-center text-lg font-mono text-white mt-2">
                    {mixerState.masterVolume}%
                  </div>
                </div>
              </div>

              {/* Headphone Controls */}
              <div className="space-y-4">
                <h3 className="text-purple-300 font-bold text-center">
                  HEADPHONES
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    onClick={() =>
                      handleMixerChange(
                        "headphonesConnected",
                        !mixerState.headphonesConnected
                      )
                    }
                    className={`${
                      mixerState.headphonesConnected
                        ? "bg-green-600 hover:bg-green-700 text-white"
                        : "bg-gray-700 hover:bg-gray-600 text-white"
                    }`}
                  >
                    <Headphones className="w-4 h-4 mr-2" />
                    {mixerState.headphonesConnected ? "ON" : "OFF"}
                  </Button>
                  <div className="space-y-2">
                    <Slider
                      value={[mixerState.headphoneVolume]}
                      onValueChange={(value) =>
                        handleMixerChange("headphoneVolume", value[0])
                      }
                      max={100}
                      step={1}
                    />
                    <div className="text-center text-sm text-gray-400">
                      {mixerState.headphoneVolume}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Recording Controls */}
              <div className="space-y-4">
                <h3 className="text-purple-300 font-bold text-center">
                  RECORDING
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={() =>
                      handleMixerChange("recording", !mixerState.recording)
                    }
                    className={`${
                      mixerState.recording
                        ? "bg-red-600 hover:bg-red-700 animate-pulse text-white"
                        : "bg-gray-700 hover:bg-gray-600 text-white"
                    }`}
                  >
                    <div className="w-3 h-3 bg-red-400 rounded-full mr-2" />
                    REC
                  </Button>
                  <Button
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    disabled={!mixerState.recording}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    SAVE
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Deck B */}
        <div className="lg:col-span-1">
          <FLX10DeckPro
            deckId="B"
            audioBuffer={deckBTrack?.buffer || null}
            controls={deckBState}
            trackAnalysis={deckBTrack}
            onControlChange={handleDeckBControlChange}
            onHotCueTrigger={handleDeckBHotCue}
            onJogWheel={(delta) => deckBEngineRef.current?.scratch(delta)}
            onPitchBend={(amount) => deckBEngineRef.current?.pitchBend(amount)}
            onJogStart={() => deckBEngineRef.current?.startScratch()}
            onJogEnd={() => deckBEngineRef.current?.endScratch()}
            onBeatJump={(beats) => {
              const newPosition =
                deckBState.position + (beats * 60) / (deckBTrack?.bpm || 128);
              deckBEngineRef.current?.seekTo(newPosition);
            }}
            onLoop={(action) => {
              if (deckBEngineRef.current) {
                if (action === "toggle") {
                  deckBEngineRef.current.toggleLoop(4);
                } else if (action === "in" || action === "out") {
                  deckBEngineRef.current.setLoop(action);
                }
                setDeckBState(deckBEngineRef.current.getState());
              }
            }}
            isMaster={masterDeck === "B"}
          />
        </div>
      </div>

      {/* Status Footer */}
      <Card className="bg-black/60 border-purple-500/30 backdrop-blur-lg">
        <CardContent className="p-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-6">
              <span className="text-green-400">● Audio Engine: Active</span>
              <span className="text-purple-300">
                Sample Rate: {audioContext?.sampleRate}Hz
              </span>
              <span className="text-cyan-300">
                Latency: ~{Math.round((audioContext?.baseLatency || 0) * 1000)}
                ms
              </span>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-gray-400">User: {user?.email}</span>
              <input
                type="file"
                id="track-upload-a"
                className="hidden"
                accept="audio/*"
                onChange={(e) => handleFileUpload(e, "A")}
              />
              <Button
                variant="outline"
                size="sm"
                className="border-purple-500/30 text-purple-300 bg-gray-800/50 hover:bg-purple-600/20"
                onClick={() =>
                  document.getElementById("track-upload-a")?.click()
                }
              >
                <Upload className="w-4 h-4 mr-2" />
                Load Deck A
              </Button>
              <input
                type="file"
                id="track-upload-b"
                className="hidden"
                accept="audio/*"
                onChange={(e) => handleFileUpload(e, "B")}
              />
              <Button
                variant="outline"
                size="sm"
                className="border-cyan-500/30 text-cyan-300 bg-gray-800/50 hover:bg-cyan-600/20"
                onClick={() =>
                  document.getElementById("track-upload-b")?.click()
                }
              >
                <Upload className="w-4 h-4 mr-2" />
                Load Deck B
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfessionalDJStation;
