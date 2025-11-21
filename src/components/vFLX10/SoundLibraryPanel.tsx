import { useState, useRef, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Upload, Music, Sparkles, Loader2, Play, Pause, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useProStationStore } from '@/hooks/useProStationStore';
import { useUserTracks, useUploadTrack, type Track } from '@/hooks/vFLX10/useTracks';
import { useFreesoundSearch } from '@/hooks/vFLX10/useFreesound';
import { supabase } from '@/lib/supabase';
// TODO: Import BeatDetector when wiring audio detection
// import * as BeatDetector from 'web-audio-beat-detector';

/**
 * Sound Library Panel Component (Adapted from vFLX-10)
 *
 * Wired to Supabase for track management:
 * - Uses useUserTracks hook for fetching tracks
 * - Uses useUploadTrack hook for uploading to Supabase Storage
 * - Uses useFreesoundSearch hook for Freesound API integration
 */

export function SoundLibraryPanel() {
  const [activeTab, setActiveTab] = useState('my-tracks');

  const handleTabChange = (value: string) => {
    console.log('[SoundLibraryPanel] Tab change requested:', value);
    setActiveTab(value);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Sound Library</CardTitle>
        <CardDescription>Upload tracks, browse samples, or generate with AI</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="my-tracks" onClick={() => handleTabChange('my-tracks')}>
              <Music className="w-4 h-4 mr-2" />
              My Tracks
            </TabsTrigger>
            <TabsTrigger value="samples" onClick={() => handleTabChange('samples')}>
              <Upload className="w-4 h-4 mr-2" />
              Sample Packs
            </TabsTrigger>
            <TabsTrigger value="ai-gen" onClick={() => handleTabChange('ai-gen')}>
              <Sparkles className="w-4 h-4 mr-2" />
              AI Generation
            </TabsTrigger>
          </TabsList>

          <TabsContent value="my-tracks" key="tab-my-tracks">
            <MyTracksTab />
          </TabsContent>

          <TabsContent value="samples" key="tab-samples">
            <SamplePacksTab />
          </TabsContent>

          <TabsContent value="ai-gen" key="tab-ai-gen">
            <AIGenerationTab />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function MyTracksTab() {
  const [isDragOver, setIsDragOver] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [broadcastRights, setBroadcastRights] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Use hooks for track management
  const { tracks, isLoading, refetch } = useUserTracks();
  const { uploadTrack, isUploading } = useUploadTrack();

  const validateFile = (file: File): boolean => {
    const validMimeTypes = [
      'audio/mpeg', // MP3
      'audio/wav', 'audio/wave', 'audio/x-wav', // WAV
      'audio/ogg', 'audio/vorbis', // OGG
      'audio/mp4', 'audio/m4a', 'audio/x-m4a', // M4A
      'audio/flac', 'audio/x-flac', // FLAC
      'audio/midi', 'audio/x-midi', // MIDI
    ];

    const validExtensions = ['.mp3', '.wav', '.ogg', '.m4a', '.flac', '.mid', '.midi'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));

    if (!validMimeTypes.includes(file.type) && !validExtensions.includes(fileExtension)) {
      toast.error('Invalid File Type', {
        description: 'Please upload MP3, WAV, OGG, M4A, FLAC, or MIDI files only',
      });
      return false;
    }
    return true;
  };

  const handleFileSelect = (file: File) => {
    if (!validateFile(file)) {
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    // Store file and open dialog instead of uploading immediately
    setPendingFile(file);
    setBroadcastRights(false); // Reset checkbox
    setIsDialogOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      toast.error('No file selected', {
        description: 'Please select an audio file to upload',
      });
      return;
    }
    handleFileSelect(file);
  };

  const handleConfirmUpload = async () => {
    if (!pendingFile) return;

    if (!broadcastRights) {
      toast.error('Broadcast Rights Required', {
        description: 'Please confirm you own the rights to this audio',
      });
      return;
    }

    setIsDialogOpen(false);

    try {
      // TODO: Add BPM detection using web-audio-beat-detector
      // For now, we'll upload without BPM detection
      let bpmDetected: number | undefined;
      let duration: number | undefined;

      // Attempt to get duration from audio file
      try {
        const audio = new Audio();
        audio.src = URL.createObjectURL(pendingFile);
        await new Promise((resolve, reject) => {
          audio.onloadedmetadata = () => {
            duration = Math.round(audio.duration);
            URL.revokeObjectURL(audio.src);
            resolve(true);
          };
          audio.onerror = reject;
        });
      } catch (err) {
        console.warn('Could not detect audio duration:', err);
      }

      // Upload track to Supabase
      const uploadedTrack = await uploadTrack(pendingFile, {
        broadcastRightsConfirmed: broadcastRights,
        bpmDetected,
        duration,
      });

      // Refresh tracks list
      await refetch();

      // Auto-play uploaded track if available
      if (uploadedTrack && uploadedTrack.url) {
        try {
          const audio = new Audio(uploadedTrack.url);
          audioRef.current = audio;
          setPlayingTrackId(uploadedTrack.id);
          await audio.play();
          audio.onended = () => {
            setPlayingTrackId(null);
            audioRef.current = null;
          };
          audio.onerror = () => {
            setPlayingTrackId(null);
            audioRef.current = null;
          };
        } catch (playError) {
          console.warn('Could not auto-play track:', playError);
        }
      }

      // Clear pending file and reset
      setPendingFile(null);
      setBroadcastRights(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('[Upload Error]', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error('Upload failed', {
        description: errorMessage,
      });
    } finally {
      // Dismiss any loading toasts and ensure UI state is clean
      toast.dismiss();
    }
  };

  const handleDeleteTrack = async (trackId: string) => {
    if (!confirm('Are you sure you want to delete this track?')) {
      return;
    }

    try {
      // Get track to find file_key
      const track = tracks.find((t) => t.id === trackId);
      if (!track) return;

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('tracks')
        .remove([track.file_key]);

      if (storageError) {
        console.error('Storage delete error:', storageError);
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('tracks')
        .delete()
        .eq('id', trackId);

      if (dbError) {
        throw dbError;
      }

      toast.success('Track deleted');
      await refetch();
    } catch (error) {
      console.error('[Delete Error]', error);
      toast.error('Failed to delete track', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  const handlePlayPause = (track: Track) => {
    if (playingTrackId === track.id) {
      // Stop playing
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setPlayingTrackId(null);
    } else {
      // Start playing new track
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const audio = new Audio(track.url);
      audioRef.current = audio;
      setPlayingTrackId(track.id);
      audio.play();
      audio.onended = () => {
        setPlayingTrackId(null);
        audioRef.current = null;
      };
      audio.onerror = () => {
        toast.error('Failed to play track');
        setPlayingTrackId(null);
        audioRef.current = null;
      };
    }
  };

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const handleCancelUpload = () => {
    // Reset everything if user cancels
    setIsDialogOpen(false);
    setPendingFile(null);
    setBroadcastRights(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      handleFileSelect(file);
    }
  };

  return (
    <div className="space-y-4">
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
          isDragOver
            ? 'border-primary bg-primary/10 scale-105'
            : 'border-muted hover:border-primary/50 hover:bg-muted/50'
        } ${isUploading ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <Input
          ref={fileInputRef}
          type="file"
          accept=".mp3,.wav,.ogg,.m4a,.flac,.mid,.midi,audio/mpeg,audio/wav,audio/ogg,audio/mp4,audio/flac,audio/midi"
          onChange={handleFileUpload}
          disabled={isUploading}
          className="hidden"
          id="file-upload"
        />
        <div className="flex flex-col items-center gap-3">
          {isUploading ? (
            <>
              <Loader2 className="w-12 h-12 animate-spin text-primary" />
              <p className="text-base font-semibold">Uploading track...</p>
              <p className="text-sm text-muted-foreground">Please wait while we process your file</p>
            </>
          ) : (
            <>
              <Upload className={`w-12 h-12 ${isDragOver ? 'text-primary' : 'text-muted-foreground'} transition-colors`} />
              <div>
                <p className="text-base font-semibold">
                  {isDragOver ? 'Drop audio file here' : 'Click or drag to upload'}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Supported formats: MP3, WAV, OGG, M4A, FLAC, MIDI
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Upload Confirmation Dialog */}
      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            // If dialog is being closed, cancel the upload
            handleCancelUpload();
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Upload</DialogTitle>
            <DialogDescription>
              Please review the file and confirm you have the rights to upload it.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label className="text-sm font-medium">File Name</Label>
              <p className="text-sm text-muted-foreground mt-1 break-all">
                {pendingFile?.name || 'Unknown'}
              </p>
            </div>
            {pendingFile && (
              <div>
                <Label className="text-sm font-medium">File Size</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  {(pendingFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            )}
            <div className="flex items-start space-x-2 pt-2">
              <Checkbox
                id="broadcast-rights-dialog"
                checked={broadcastRights}
                onCheckedChange={(checked) => setBroadcastRights(checked as boolean)}
              />
              <Label htmlFor="broadcast-rights-dialog" className="text-sm leading-relaxed cursor-pointer">
                I own 100% of the rights to this audio and grant EDM Shuffle a broadcast license for competition submissions
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancelUpload}>
              Cancel
            </Button>
            <Button onClick={handleConfirmUpload} disabled={!broadcastRights}>
              Confirm & Upload
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="space-y-3">
        {isLoading ? (
          <div className="text-center py-8">
            <Loader2 className="w-6 h-6 animate-spin mx-auto" />
          </div>
        ) : tracks.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No tracks uploaded yet</p>
        ) : (
          <div className="space-y-2">
            {tracks.map((track) => (
              <Card key={track.id} className="p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm truncate">{track.name}</h4>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <span className={`px-2 py-0.5 rounded-full ${
                        track.source === 'upload' ? 'bg-blue-500/20 text-blue-400' :
                        track.source === 'freesound' ? 'bg-green-500/20 text-green-400' :
                        'bg-purple-500/20 text-purple-400'
                      }`}>
                        {track.source === 'upload' ? 'Upload' : track.source === 'freesound' ? 'Sample' : 'AI'}
                      </span>
                      {(track.bpm_accurate || track.bpm_detected) && (
                        <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                          {Math.round(track.bpm_accurate || track.bpm_detected || 0)} BPM
                        </span>
                      )}
                      {track.duration && (
                        <span>{Math.floor(track.duration / 60)}:{(track.duration % 60).toFixed(0).padStart(2, '0')}</span>
                      )}
                      <span className="text-xs">
                        {new Date(track.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handlePlayPause(track)}
                    >
                      {playingTrackId === track.id ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleDeleteTrack(track.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SamplePacksTab() {
  const [searchQuery, setSearchQuery] = useState('');
  const { addAttributionCredit } = useProStationStore();
  const { search, results, isSearching } = useFreesoundSearch();
  const { uploadTrack, isUploading } = useUploadTrack();
  const { refetch } = useUserTracks();

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error('Search Required', {
        description: 'Please enter a search term',
      });
      return;
    }

    await search(searchQuery.trim());
  };

  const handleAddSample = async (sample: import('@/hooks/vFLX10/useFreesound').FreesoundSample) => {
    try {
      // Add attribution credit to global store
      addAttributionCredit({
        source: 'Freesound',
        artist: sample.username,
        license: sample.license,
        url: sample.url,
      });

      // For Freesound samples, we store the preview URL directly
      // (Freesound previews are licensed for our use)
      if (!sample.previewUrl) {
        toast.error('No preview available', {
          description: 'This sample does not have a preview URL',
        });
        return;
      }

      // Create a track record pointing to the Freesound preview URL
      // Note: We're storing the preview URL, not re-hosting the file
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Not authenticated', {
          description: 'Please log in to add samples',
        });
        return;
      }

      const { data: trackData, error: insertError } = await supabase
        .from('tracks')
        .insert({
          user_id: user.id,
          name: sample.name,
          url: sample.previewUrl,
          file_key: `freesound/${sample.id}`, // Store Freesound ID as file key
          mime_type: 'audio/mpeg', // Freesound previews are MP3
          source: 'freesound',
          broadcast_rights_confirmed: true, // Freesound samples are pre-licensed
          attribution_credits: JSON.stringify([{
            source: 'Freesound',
            artist: sample.username,
            license: sample.license,
            url: sample.url,
          }]),
        })
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      toast.success('Sample added to library', {
        description: sample.name,
      });

      // Refresh tracks list
      await refetch();
    } catch (error) {
      console.error('[Add Sample Error]', error);
      toast.error('Failed to add sample', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="Search for samples..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <Button onClick={handleSearch} disabled={isSearching}>
          {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
        </Button>
      </div>

      <div className="text-sm text-muted-foreground">
        <p>Search for royalty-free samples from Freesound.org</p>
        <p className="text-xs mt-1">Only CC0 (Public Domain) and CC-BY (Attribution) licenses</p>
      </div>

      {results.length > 0 && (
        <div className="space-y-2">
          {results.map((sample) => (
            <Card key={sample.id} className="p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm">{sample.name}</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    by {sample.username} • {sample.license}
                  </p>
                  {sample.description && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {sample.description}
                    </p>
                  )}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleAddSample(sample)}
                  disabled={isUploading}
                >
                  <Music className="w-4 h-4 mr-2" />
                  Add
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {!isSearching && results.length === 0 && searchQuery && (
        <p className="text-sm text-muted-foreground text-center py-8">
          No results found. Try a different search term.
        </p>
      )}

      {!searchQuery && results.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-8">
          Enter a search term to find royalty-free samples
        </p>
      )}
    </div>
  );
}

function AIGenerationTab() {
  const [prompt, setPrompt] = useState('');
  const [generating, setGenerating] = useState(false);

  // TODO: Replace with Supabase query for AI credits
  const aiCredits = 0;

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Prompt Required', {
        description: 'Please enter a description for the audio',
      });
      return;
    }

    if (aiCredits <= 0) {
      toast.error('No Credits', {
        description: 'You have no AI generation credits remaining',
      });
      return;
    }

    setGenerating(true);

    try {
      // TODO: Wire to Supabase Edge Function for Loudly API
      toast.info('Loudly Integration', {
        description: 'TODO: Wire to Supabase Edge Function',
      });
    } catch (error) {
      toast.error('Generation Failed', {
        description: 'Failed to generate audio',
      });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="ai-prompt">Describe the audio you want to generate</Label>
        <Input
          id="ai-prompt"
          placeholder="e.g., 128 BPM tech-house drum stem"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
        />
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          AI Credits Remaining: <span className="font-medium">{aiCredits}</span>
        </p>
        <Button onClick={handleGenerate} disabled={generating || aiCredits <= 0}>
          {generating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate
            </>
          )}
        </Button>
      </div>

      <div className="text-sm text-muted-foreground space-y-1">
        <p>Generate 100% royalty-free, copyright-safe audio with AI</p>
        <p className="text-xs">TODO: Wire to Loudly API via Supabase Edge Function</p>
      </div>
    </div>
  );
}
