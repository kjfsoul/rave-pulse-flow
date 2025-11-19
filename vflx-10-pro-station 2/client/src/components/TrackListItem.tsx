import { useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { Button } from '@/components/ui/button';
import { Play, Pause, Trash2, Upload } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface TrackListItemProps {
  track: {
    id: number;
    name: string;
    url: string;
    duration?: number | null;
    bpmDetected?: number | null;
    bpmAccurate?: number | null;
    source: string;
    createdAt: Date;
  };
  onDelete?: () => void;
}

export function TrackListItem({ track, onDelete }: TrackListItemProps) {
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDragging, setIsDragging] = useState(false);

  // Drag handlers
  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    // Pass track data via dataTransfer
    e.dataTransfer.setData('application/json', JSON.stringify({
      id: track.id,
      name: track.name,
      url: track.url,
      bpm: track.bpmAccurate || track.bpmDetected,
      source: track.source,
    }));
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };
  
  const utils = trpc.useUtils();
  const deleteTrack = trpc.tracks.delete.useMutation({
    onSuccess: () => {
      toast.success('Track deleted successfully');
      utils.tracks.list.invalidate();
      onDelete?.();
    },
    onError: (error) => {
      toast.error(`Failed to delete track: ${error.message}`);
    },
  });

  useEffect(() => {
    if (!waveformRef.current) return;

    // Initialize WaveSurfer
    const wavesurfer = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: '#94a3b8',
      progressColor: '#3b82f6',
      cursorColor: '#3b82f6',
      barWidth: 2,
      barRadius: 3,
      cursorWidth: 1,
      height: 60,
      barGap: 2,
      normalize: true,
      interact: true,
    });

    wavesurferRef.current = wavesurfer;

    // Load audio
    wavesurfer.load(track.url);

    wavesurfer.on('ready', () => {
      setIsLoading(false);
    });

    wavesurfer.on('play', () => {
      setIsPlaying(true);
    });

    wavesurfer.on('pause', () => {
      setIsPlaying(false);
    });

    wavesurfer.on('finish', () => {
      setIsPlaying(false);
    });

    wavesurfer.on('error', (error) => {
      console.error('WaveSurfer error:', error);
      setIsLoading(false);
      toast.error('Failed to load waveform');
    });

    return () => {
      wavesurfer.destroy();
    };
  }, [track.url]);

  const togglePlayback = () => {
    if (!wavesurferRef.current) return;
    wavesurferRef.current.playPause();
  };

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete "${track.name}"?`)) {
      deleteTrack.mutate({ trackId: track.id });
    }
  };

  const formatDuration = (seconds?: number | null) => {
    if (!seconds) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getSourceBadgeColor = (source: string) => {
    switch (source) {
      case 'upload':
        return 'bg-blue-500/10 text-blue-500';
      case 'production':
        return 'bg-purple-500/10 text-purple-500';
      case 'freesound':
        return 'bg-green-500/10 text-green-500';
      case 'loudly':
        return 'bg-orange-500/10 text-orange-500';
      default:
        return 'bg-gray-500/10 text-gray-500';
    }
  };

  const getSourceLabel = (source: string) => {
    switch (source) {
      case 'upload':
        return 'Uploaded';
      case 'production':
        return 'Recorded';
      case 'freesound':
        return 'Freesound';
      case 'loudly':
        return 'AI Generated';
      default:
        return source;
    }
  };

  return (
    <div 
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={`border border-border rounded-lg p-4 bg-card hover:bg-accent/50 transition-colors cursor-move ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <div className="flex items-start gap-4">
        {/* Play Button */}
        <Button
          variant="outline"
          size="icon"
          onClick={togglePlayback}
          disabled={isLoading}
          className="shrink-0 mt-1"
        >
          {isPlaying ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4 ml-0.5" />
          )}
        </Button>

        {/* Track Info & Waveform */}
        <div className="flex-1 min-w-0">
          {/* Track Name & Metadata */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm truncate">{track.name}</h4>
              <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                <span className={`px-2 py-0.5 rounded-full ${getSourceBadgeColor(track.source)}`}>
                  {getSourceLabel(track.source)}
                </span>
                {(track.bpmAccurate || track.bpmDetected) && (
                  <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                    {Math.round(track.bpmAccurate || track.bpmDetected || 0)} BPM
                  </span>
                )}
                <span>{formatDuration(track.duration)}</span>
                <span>•</span>
                <span>{formatDistanceToNow(new Date(track.createdAt), { addSuffix: true })}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-1 shrink-0">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleDelete}
                disabled={deleteTrack.isPending}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>

          {/* Waveform */}
          <div 
            ref={waveformRef} 
            className="w-full rounded overflow-hidden bg-muted/30"
            style={{ minHeight: '60px' }}
          />
          
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/50 rounded">
              <div className="text-xs text-muted-foreground">Loading waveform...</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
