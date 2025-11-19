import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Deck } from './Deck';
import { Mixer } from './Mixer';
import { LiveEqualizer } from './LiveEqualizer';
import { useDJAudio } from '@/hooks/useDJAudio';
import { trpc } from '@/lib/trpc';
import { Loader2, Music, ArrowRight } from 'lucide-react';

interface LoadedTrack {
  id: number;
  name: string;
  url: string;
  bpm?: number;
  source: string;
}

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
  
  // Fetch user tracks
  const { data: tracks, isLoading } = trpc.tracks.list.useQuery();
  
  // Initialize centralized audio routing
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
      const pitchAdjustment = deckBTrack.bpm / deckATrack.bpm;
      toast.success(`Deck A synced to Deck B: ${pitchAdjustment.toFixed(2)}x pitch`);
      // The Deck component will handle the pitch adjustment
    }
  };
  
  const handleSyncDeckB = () => {
    if (deckBTrack?.bpm && deckATrack?.bpm) {
      // Sync Deck B to Deck A's tempo
      const pitchAdjustment = deckATrack.bpm / deckBTrack.bpm;
      toast.success(`Deck B synced to Deck A: ${pitchAdjustment.toFixed(2)}x pitch`);
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
            ) : tracks && tracks.length > 0 ? (
              <div className="space-y-2">
                {tracks.map((track) => (
                  <Card key={track.id} className="p-3">
                    <div className="space-y-2">
                      <div className="font-medium text-sm truncate" title={track.name}>
                        {track.name}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        {(track.bpmAccurate || track.bpmDetected) && (
                          <span>{track.bpmAccurate || track.bpmDetected} BPM</span>
                        )}
                        {(track.bpmAccurate || track.bpmDetected) && track.duration && <span>•</span>}
                        {track.duration && (
                          <span>
                            {Math.floor(track.duration / 60)}:
                            {String(track.duration % 60).padStart(2, '0')}
                          </span>
                        )}
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
                <p className="text-xs mt-1">Upload tracks in Sound Library</p>
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
            <Mixer 
              onChannelVolumeChange={djAudio.setChannelVolume}
              onCrossfaderChange={djAudio.setCrossfader}
              onMasterVolumeChange={djAudio.setMasterVolume}
            />

            {/* Live Equalizer */}
            <LiveEqualizer masterGain={djAudio.masterGain} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
