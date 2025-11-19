import { useState, useRef } from 'react';
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
import { Upload, Music, Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useProStationStore } from '@/hooks/useProStationStore';
// TODO: Import BeatDetector when wiring audio detection
// import * as BeatDetector from 'web-audio-beat-detector';

/**
 * Sound Library Panel Component (Adapted from vFLX-10)
 *
 * TODO: Wire to Supabase for track management
 * - Replace trpc.tracks.list with Supabase query
 * - Replace trpc.tracks.create with Supabase storage + database
 * - Replace trpc.freesound.search with Supabase Edge Function
 * - Replace trpc.user.getAICredits with Supabase query
 */

interface Track {
  id: number;
  name: string;
  url: string;
  bpmDetected?: number | null;
  bpmAccurate?: number | null;
  source: string;
}

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
  const [uploading, setUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [broadcastRights, setBroadcastRights] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // TODO: Replace with Supabase query
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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
    if (!file) return;
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
    setUploading(true);

    try {
      // TODO: Wire to Supabase storage and tracks table
      // 1. Upload file to Supabase storage
      // 2. Detect BPM using web-audio-beat-detector
      // 3. Create track record in database

      toast.info('Upload Pending', {
        description: 'TODO: Wire to Supabase storage',
      });

      // Clear pending file and reset
      setPendingFile(null);
      setBroadcastRights(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('[Upload Error]', error);
      toast.error('Upload Failed', {
        description: error instanceof Error ? error.message : 'Failed to upload track',
      });
    } finally {
      setUploading(false);
    }
  };

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
        } ${uploading ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}`}
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
          disabled={uploading}
          className="hidden"
          id="file-upload"
        />
        <div className="flex flex-col items-center gap-3">
          {uploading ? (
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
          <p className="text-sm text-muted-foreground text-center py-8">TODO: Render track list</p>
        )}
      </div>
    </div>
  );
}

function SamplePacksTab() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const { addAttributionCredit } = useProStationStore();

  // TODO: Replace with Supabase Edge Function for Freesound API
  const handleSearch = () => {
    if (!searchQuery.trim()) {
      toast.error('Search Required', {
        description: 'Please enter a search term',
      });
      return;
    }

    setSearching(true);
    toast.info('Freesound Search', {
      description: 'TODO: Wire to Supabase Edge Function',
    });
    setSearching(false);
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
        <Button onClick={handleSearch} disabled={searching}>
          {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
        </Button>
      </div>

      <div className="text-sm text-muted-foreground">
        <p>Search for royalty-free samples from Freesound.org</p>
        <p className="text-xs mt-1">Only CC0 (Public Domain) and CC-BY (Attribution) licenses</p>
      </div>

      <p className="text-sm text-muted-foreground text-center py-8">
        TODO: Wire to Supabase Edge Function for Freesound API integration
      </p>
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
