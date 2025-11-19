import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Deck } from './Deck';
import { Mixer } from './Mixer';
import { SoundLibraryPanel } from './SoundLibraryPanel';
import { Loader2, Music, ArrowRight } from 'lucide-react';
import { useDJAudio } from '@/hooks/vFLX10/useDJAudio';

interface LoadedTrack {
  id: number;
  name: string;
  url: string;
  bpm?: number;
  source: string;
}

interface Track {
  id: number;
  name: string;
  url: string;
  bpmDetected?: number | null;
  bpmAccurate?: number | null;
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
    const saved = localStorage.getItem('vflx10-deckA');
    return saved ? JSON.parse(saved) : null;
  });
  const [deckBTrack, setDeckBTrack] = useState<LoadedTrack | null>(() => {
    const saved = localStorage.getItem('vflx10-deckB');
    return saved ? JSON.parse(saved) : null;
  });

  // Persist deck state to localStorage
  useEffect(() => {
    if (deckATrack) {
      localStorage.setItem('vflx10-deckA', JSON.stringify(deckATrack));
    } else {
      localStorage.removeItem('vflx10-deckA');
    }
  }, [deckATrack]);

  useEffect(() => {
    if (deckBTrack) {
      localStorage.setItem('vflx10-deckB', JSON.stringify(deckBTrack));
    } else {
      localStorage.removeItem('vflx10-deckB');
    }
  }, [deckBTrack]);

  // TODO: Replace with Supabase query
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
      {/* Track Library Sidebar */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Music className="h-5 w-5" />
            Track Library
          </CardTitle>
          <CardDescription>Load tracks to decks</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : tracks.length > 0 ? (
              <div className="space-y-2">
                {tracks.map((track) => (
                  <Card key={track.id} className="p-3">
                    <div className="space-y-2">
                      <div className="font-medium text-sm truncate" title={track.name}>
                        {track.name}
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 text-xs"
                          onClick={() => handleLoadToDeckA({
                            id: track.id,
                            name: track.name,
                            url: track.url,
                            bpm: track.bpmAccurate || track.bpmDetected || undefined,
                            source: track.source,
                          })}
                        >
                          Deck A
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 text-xs"
                          onClick={() => handleLoadToDeckB({
                            id: track.id,
                            name: track.name,
                            url: track.url,
                            bpm: track.bpmAccurate || track.bpmDetected || undefined,
                            source: track.source,
                          })}
                        >
                          Deck B
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-sm text-muted-foreground">
                <Music className="h-12 w-12 mx-auto mb-2 opacity-20" />
                <p>No tracks available</p>
                <p className="text-xs mt-1">TODO: Wire to Supabase tracks table</p>
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* DJ Interface */}
      <div className="lg:col-span-3 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>DJ Station</CardTitle>
            <CardDescription>Mix and perform with the vFLX-10 interface</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Decks A & B */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
  );
}
