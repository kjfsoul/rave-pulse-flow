import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDJAudio } from "@/hooks/vFLX10/useDJAudio";
import { Power } from "lucide-react";
import { useEffect, useState } from "react";
import * as Tone from "tone";
import { Deck } from "./Deck";
import { Mixer } from "./Mixer";

interface LoadedTrack {
  id: string | number;
  name: string;
  url: string;
  bpm?: number;
  source: string;
}

export function DJStation() {
  const [audioStarted, setAudioStarted] = useState(false);
  const [deckATrack, setDeckATrack] = useState<LoadedTrack | null>(() => {
    const saved = localStorage.getItem("vflx10-deckA");
    return saved ? JSON.parse(saved) : null;
  });
  const [deckBTrack, setDeckBTrack] = useState<LoadedTrack | null>(() => {
    const saved = localStorage.getItem("vflx10-deckB");
    return saved ? JSON.parse(saved) : null;
  });

  // Persist deck state to localStorage
  useEffect(() => {
    if (deckATrack) {
      localStorage.setItem("vflx10-deckA", JSON.stringify(deckATrack));
    } else {
      localStorage.removeItem("vflx10-deckA");
    }
  }, [deckATrack]);

  useEffect(() => {
    if (deckBTrack) {
      localStorage.setItem("vflx10-deckB", JSON.stringify(deckBTrack));
    } else {
      localStorage.removeItem("vflx10-deckB");
    }
  }, [deckBTrack]);

  // Initialize audio routing with useDJAudio hook
  const djAudio = useDJAudio();

  const startAudioEngine = async () => {
    await Tone.start();
    setAudioStarted(true);
  };

  const handleDeckADrop = (track: LoadedTrack) => {
    setDeckATrack(track);
  };

  const handleDeckBDrop = (track: LoadedTrack) => {
    setDeckBTrack(track);
  };

  // Sync handlers
  const handleSyncDeckA = () => {
    if (deckATrack?.bpm && deckBTrack?.bpm) {
      // Sync Deck A to Deck B's tempo
      // The Deck component will handle the pitch adjustment
    }
  };

  const handleSyncDeckB = () => {
    if (deckBTrack?.bpm && deckATrack?.bpm) {
      // Sync Deck B to Deck A's tempo
      // The Deck component will handle the pitch adjustment
    }
  };

  if (!audioStarted) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-zinc-950 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-white">Ready to Mix?</h2>
          <p className="text-zinc-400">Initialize the audio engine to begin.</p>
        </div>
        <Button
          size="lg"
          onClick={startAudioEngine}
          className="bg-cyan-500 hover:bg-cyan-600 text-black font-bold px-8 py-6 rounded-full shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all hover:scale-105"
        >
          <Power className="w-6 h-6 mr-2" />
          POWER ON FLX-10
        </Button>
      </div>
    );
  }

  return (
    <div className="h-full bg-zinc-950 p-2 lg:p-4">
      {/* Desktop Grid Layout */}
      <div className="hidden lg:grid grid-cols-12 gap-4 h-full max-h-[800px] mx-auto max-w-[1600px]">
        {/* DECK A */}
        <div className="col-span-5 bg-zinc-900/50 rounded-xl border border-zinc-800 p-4 shadow-inner">
          <Deck
            deckId="A"
            trackUrl={deckATrack?.url}
            trackName={deckATrack?.name}
            trackBpm={deckATrack?.bpm}
            onTrackDrop={handleDeckADrop}
            audioOutput={djAudio.deckAGain}
            onSync={handleSyncDeckA}
            otherDeckBpm={deckBTrack?.bpm}
          />
        </div>

        {/* MIXER */}
        <div className="col-span-2 bg-zinc-950 rounded-xl border border-zinc-800 p-2 shadow-xl flex flex-col">
          <Mixer />
        </div>

        {/* DECK B */}
        <div className="col-span-5 bg-zinc-900/50 rounded-xl border border-zinc-800 p-4 shadow-inner">
          <Deck
            deckId="B"
            trackUrl={deckBTrack?.url}
            trackName={deckBTrack?.name}
            trackBpm={deckBTrack?.bpm}
            onTrackDrop={handleDeckBDrop}
            audioOutput={djAudio.deckBGain}
            onSync={handleSyncDeckB}
            otherDeckBpm={deckATrack?.bpm}
          />
        </div>
      </div>

      {/* Mobile Tabbed Layout */}
      <div className="lg:hidden h-full flex flex-col">
        <Tabs defaultValue="mixer" className="flex-1 flex flex-col">
          <div className="flex-1 overflow-hidden relative">
            <TabsContent
              value="deck-a"
              className="h-full m-0 p-2 data-[state=active]:flex"
            >
              <Deck
                deckId="A"
                trackUrl={deckATrack?.url}
                trackName={deckATrack?.name}
                trackBpm={deckATrack?.bpm}
                onTrackDrop={handleDeckADrop}
                audioOutput={djAudio.deckAGain}
                onSync={handleSyncDeckA}
                otherDeckBpm={deckBTrack?.bpm}
              />
            </TabsContent>
            <TabsContent
              value="mixer"
              className="h-full m-0 p-2 data-[state=active]:flex"
            >
              <Mixer />
            </TabsContent>
            <TabsContent
              value="deck-b"
              className="h-full m-0 p-2 data-[state=active]:flex"
            >
              <Deck
                deckId="B"
                trackUrl={deckBTrack?.url}
                trackName={deckBTrack?.name}
                trackBpm={deckBTrack?.bpm}
                onTrackDrop={handleDeckBDrop}
                audioOutput={djAudio.deckBGain}
                onSync={handleSyncDeckB}
                otherDeckBpm={deckATrack?.bpm}
              />
            </TabsContent>
          </div>
          <TabsList className="grid grid-cols-3 bg-zinc-900 border-t border-zinc-800 h-16 rounded-none">
            <TabsTrigger
              value="deck-a"
              className="data-[state=active]:text-cyan-400 data-[state=active]:bg-zinc-800"
            >
              DECK A
            </TabsTrigger>
            <TabsTrigger
              value="mixer"
              className="data-[state=active]:text-white data-[state=active]:bg-zinc-800"
            >
              MIXER
            </TabsTrigger>
            <TabsTrigger
              value="deck-b"
              className="data-[state=active]:text-purple-400 data-[state=active]:bg-zinc-800"
            >
              DECK B
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
}
