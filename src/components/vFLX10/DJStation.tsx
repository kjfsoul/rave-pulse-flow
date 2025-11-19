import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useDJAudio } from "@/hooks/vFLX10/useDJAudio";
import { useUserTracks } from "@/hooks/vFLX10/useTracks";
import { Loader2, Music } from "lucide-react";
import { useEffect, useState } from "react";
import { Deck } from "./Deck";
import { Mixer } from "./Mixer";

interface LoadedTrack {
  id: string | number;
  name: string;
  url: string;
  bpm?: number;
  source: string;
}

/**
 * DJ Station Component (Adapted from vFLX-10)
 *
 * TODO: Wire to Supabase for track loading
 * - Replace trpc.tracks.list with Supabase query
 * - Wire useDJAudio hook for audio routing
 */
export function DJStation() {
  // Load persisted deck state from localStorage
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

  // Use hook for track management from Supabase
  const { tracks, isLoading } = useUserTracks();

  // Initialize audio routing with useDJAudio hook
  const djAudio = useDJAudio();

  const handleLoadToDeckA = (track: LoadedTrack) => {
    setDeckATrack(track);
  };

  const handleLoadToDeckB = (track: LoadedTrack) => {
    setDeckBTrack(track);
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

  return (
    <div className="w-full">
      {/* Responsive Grid: Mobile = stacked, Desktop = sidebar + decks */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Track Library Sidebar - Hidden on mobile when in studio view */}
        <Card className="lg:col-span-1 bg-slate-900/90 border-slate-700/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Music className="h-4 w-4 md:h-5 md:w-5 text-cyan-400" />
              <span className="text-sm md:text-base">Track Library</span>
            </CardTitle>
            <CardDescription className="text-slate-400 text-xs md:text-sm">
              Load tracks to decks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] md:h-[600px]">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-cyan-400" />
                </div>
              ) : tracks.length > 0 ? (
                <div className="space-y-2">
                  {tracks.map((track) => (
                    <Card
                      key={track.id}
                      className="p-3 bg-slate-800 border-slate-600"
                    >
                      <div className="space-y-2">
                        <div
                          className="font-medium text-sm truncate text-white"
                          title={track.name}
                        >
                          {track.name}
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 text-xs !border-slate-700 !bg-slate-800 !text-white hover:!bg-slate-700 hover:!text-white"
                            onClick={() =>
                              handleLoadToDeckA({
                                id: track.id,
                                name: track.name,
                                url: track.url,
                                bpm:
                                  track.bpm_accurate ||
                                  track.bpm_detected ||
                                  undefined,
                                source: track.source,
                              })
                            }
                          >
                            Deck A
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 text-xs !border-slate-700 !bg-slate-800 !text-white hover:!bg-slate-700 hover:!text-white"
                            onClick={() =>
                              handleLoadToDeckB({
                                id: track.id,
                                name: track.name,
                                url: track.url,
                                bpm:
                                  track.bpm_accurate ||
                                  track.bpm_detected ||
                                  undefined,
                                source: track.source,
                              })
                            }
                          >
                            Deck B
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-sm text-slate-400">
                  <Music className="h-12 w-12 mx-auto mb-2 opacity-20" />
                  <p className="text-white">No tracks available</p>
                  <p className="text-xs mt-1 text-slate-500">
                    Upload tracks in the Library tab
                  </p>
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* DJ Interface */}
        <div className="lg:col-span-3 space-y-4">
          <Card className="bg-slate-900/90 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white text-base md:text-lg">
                DJ Station
              </CardTitle>
              <CardDescription className="text-slate-400 text-xs md:text-sm">
                Mix and perform with the vFLX-10 interface
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Decks A & B - Responsive: 1 column on mobile, 2 columns on desktop */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              {/* Mixer */}
              <Mixer />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
