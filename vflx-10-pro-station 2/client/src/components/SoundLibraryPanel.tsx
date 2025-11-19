import { useState, useRef } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Upload, Music, Sparkles, Loader2 } from 'lucide-react';
import { TrackListItem } from './TrackListItem';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { useGlobalStore } from '@/hooks/useGlobalStore';
import * as BeatDetector from 'web-audio-beat-detector';

interface Track {
  id: number;
  name: string;
  url: string;
  bpmDetected?: number | null;
  bpmAccurate?: number | null;
  musicalKey?: string | null;
  source: 'upload' | 'freesound' | 'loudly';
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
  const [broadcastRights, setBroadcastRights] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const utils = trpc.useUtils();
  const { data: tracks = [], isLoading } = trpc.tracks.list.useQuery();
  const createTrack = trpc.tracks.create.useMutation({
    onSuccess: () => {
      utils.tracks.list.invalidate();
      setBroadcastRights(false);
    },
  });
  const updateAnalysis = trpc.tracks.updateAnalysis.useMutation({
    onSuccess: () => {
      utils.tracks.list.invalidate();
      toast.success('Analysis Complete', {
        description: 'Pro analysis completed successfully',
      });
    },
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
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
      // Reset file input to allow re-upload
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    if (!broadcastRights) {
      toast.error('Broadcast Rights Required', {
        description: 'Please confirm you own the rights to this audio',
      });
      // Reset file input to allow re-upload
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    setUploading(true);

    try {
      // Read file as array buffer for BPM detection (skip for MIDI)
      let bpmDetected: number | undefined;
      let duration: number | undefined;
      
      if (!file.name.toLowerCase().endsWith('.mid') && !file.name.toLowerCase().endsWith('.midi')) {
        try {
          const arrayBuffer = await file.arrayBuffer();
          const audioContext = new AudioContext();
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
          duration = audioBuffer.duration;
          
          // Detect BPM using web-audio-beat-detector
          const result = await BeatDetector.guess(audioBuffer);
          bpmDetected = Math.round(result.bpm);
          console.log('[BPM Detection] Detected BPM:', bpmDetected);
        } catch (error) {
          console.warn('[BPM Detection] Failed:', error);
        }
      }

      // Convert file to base64 for upload
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const base64 = reader.result as string;
          resolve(base64.split(',')[1]); // Remove data:audio/...;base64, prefix
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      
      const base64Data = await base64Promise;
      const fileKey = `tracks/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      
      // Upload to S3 via tRPC
      const uploadResult = await createTrack.mutateAsync({
        name: file.name,
        fileKey,
        fileData: base64Data,
        mimeType: file.type || 'audio/mpeg',
        fileSize: file.size,
        duration,
        bpmDetected,
        source: 'upload',
        broadcastRightsConfirmed: true,
      });

      toast.success('Upload Complete', {
        description: `Track uploaded${bpmDetected ? ` (BPM: ${bpmDetected})` : ''}`,
      });

      // Reset file input
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

  const handleProAnalyze = async (trackId: number) => {
    // Placeholder for Tonn API integration
    toast.info('Pro Analysis', {
      description: 'Tonn API integration coming soon',
    });
    
    // Mock data for now
    await updateAnalysis.mutateAsync({
      trackId,
      bpmAccurate: 128,
      musicalKey: 'A minor',
    });
  };

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed rounded-lg p-6 text-center">
        <Input
          ref={fileInputRef}
          type="file"
          accept=".mp3,.wav,.ogg,.m4a,.flac,.mid,.midi,audio/mpeg,audio/wav,audio/ogg,audio/mp4,audio/flac,audio/midi"
          onChange={handleFileUpload}
          disabled={uploading}
          className="hidden"
          id="file-upload"
        />
        <Label htmlFor="file-upload" className="cursor-pointer">
          <div className="flex flex-col items-center gap-2">
            {uploading ? (
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            ) : (
              <Upload className="w-8 h-8 text-muted-foreground" />
            )}
            <p className="text-sm font-medium">
              {uploading ? 'Uploading...' : 'Click to upload audio file'}
            </p>
            <p className="text-xs text-muted-foreground">
              Supported: MP3, WAV, OGG, M4A, FLAC, MIDI
            </p>
          </div>
        </Label>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="broadcast-rights"
          checked={broadcastRights}
          onCheckedChange={(checked) => setBroadcastRights(checked as boolean)}
        />
        <Label htmlFor="broadcast-rights" className="text-sm">
          I own 100% of the rights to this audio and grant EDM Shuffle a broadcast license for competition submissions
        </Label>
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <div className="text-center py-8">
            <Loader2 className="w-6 h-6 animate-spin mx-auto" />
          </div>
        ) : tracks.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No tracks uploaded yet</p>
        ) : (
          tracks.map((track) => (
            <TrackListItem key={track.id} track={track} />
          ))
        )}
      </div>
    </div>
  );
}

function SamplePacksTab() {
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const { addAttributionCredit } = useGlobalStore();
  const utils = trpc.useUtils();
  
  // Freesound search query
  const { data: searchResults, isLoading: searching, error } = trpc.freesound.search.useQuery(
    { query: searchQuery, page, pageSize: 15 },
    { enabled: searchQuery.trim().length > 0 }
  );
  
  const createTrack = trpc.tracks.create.useMutation({
    onSuccess: () => {
      utils.tracks.list.invalidate();
      toast.success('Sample Added', {
        description: 'Sample added to your library',
      });
    },
  });

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      toast.error('Search Required', {
        description: 'Please enter a search term',
      });
      return;
    }
    setPage(1); // Reset to first page on new search
  };

  const handleAddSample = async (sample: any) => {
    try {
      // Add CC-BY attribution if needed
      if (sample.attribution) {
        addAttributionCredit(sample.attribution);
      }
      
      // Create track record with Freesound URL (no re-hosting)
      await createTrack.mutateAsync({
        name: sample.name,
        fileKey: `freesound/${sample.id}`, // Virtual key for reference
        fileUrl: sample.previewUrl, // Stream directly from Freesound
        mimeType: 'audio/mpeg',
        duration: sample.duration,
        source: 'freesound',
        broadcastRightsConfirmed: true, // CC0/CC-BY are broadcast-safe
        attributionCredits: sample.attribution || undefined,
      });
    } catch (error) {
      toast.error('Failed to Add Sample', {
        description: 'Could not add sample to library',
      });
    }
  };
  
  const samples = searchResults?.results || [];

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

      {samples.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">
          Search for samples to get started
        </p>
      ) : (
        <div className="space-y-2">
          {samples.map((sample: any) => (
            <Card key={sample.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{sample.name}</p>
                    <p className="text-sm text-muted-foreground">
                      by {sample.username} | {sample.license}
                    </p>
                  </div>
                  <Button size="sm" onClick={() => handleAddSample(sample)}>
                    Add
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function AIGenerationTab() {
  const [prompt, setPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const { data: aiCredits = 0 } = trpc.user.getAICredits.useQuery();
  const useCredit = trpc.user.useAICredit.useMutation();
  const utils = trpc.useUtils();

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
      await useCredit.mutateAsync();
      
      toast.info('Loudly Integration', {
        description: 'Loudly API integration coming soon',
      });
      
      // Placeholder for Loudly API
      // Will generate 100% royalty-free audio
      
      utils.user.getAICredits.invalidate();
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
        <p className="text-xs">Powered by Loudly API</p>
      </div>
    </div>
  );
}
