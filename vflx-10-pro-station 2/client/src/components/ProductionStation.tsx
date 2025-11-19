import { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Piano, Drum, Play, Pause, Circle, Square } from 'lucide-react';
import { SynthStation } from './SynthStation';
import { DrumMachine } from './DrumMachine';
import { NameRecordingModal } from './NameRecordingModal';
import { useGlobalStore } from '@/hooks/useGlobalStore';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

export function ProductionStation() {
  const [activeTab, setActiveTab] = useState('synth');
  const { isPlaying, setIsPlaying, masterBPM, setMasterBPM } = useGlobalStore();
  const [isRecording, setIsRecording] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [recordingBlob, setRecordingBlob] = useState<Blob | null>(null);
  const recorderRef = useRef<Tone.Recorder | null>(null);
  
  const utils = trpc.useUtils();
  const createTrack = trpc.tracks.create.useMutation({
    onSuccess: () => {
      utils.tracks.list.invalidate();
      toast.success('Recording Saved', {
        description: 'Your recording has been added to My Tracks',
      });
    },
    onError: (error) => {
      toast.error('Upload Failed', {
        description: error.message || 'Failed to save recording',
      });
    },
  });

  // Sync Tone.Transport with global state
  useEffect(() => {
    Tone.Transport.bpm.value = masterBPM;
  }, [masterBPM]);

  const handlePlayPause = async () => {
    if (!isPlaying) {
      // Start audio context and transport
      await Tone.start();
      Tone.Transport.start();
      setIsPlaying(true);
    } else {
      // Stop transport
      Tone.Transport.stop();
      setIsPlaying(false);
    }
  };

  const handleBPMChange = (value: number[]) => {
    setMasterBPM(value[0]);
  };

  const handleRecord = async () => {
    try {
      // Initialize Tone.Recorder connected to master output
      const recorder = new Tone.Recorder();
      Tone.Destination.connect(recorder);
      recorderRef.current = recorder;
      
      // Start recording
      await recorder.start();
      setIsRecording(true);
      
      toast.info('Recording Started', {
        description: 'Press Stop when finished',
      });
    } catch (error) {
      console.error('[Record Error]', error);
      toast.error('Recording Failed', {
        description: 'Failed to start recording',
      });
    }
  };

  const handleStopRecording = async () => {
    if (!recorderRef.current) return;
    
    try {
      // Stop recording and get Blob
      const blob = await recorderRef.current.stop();
      setIsRecording(false);
      
      // Store blob and open modal
      setRecordingBlob(blob);
      setIsModalOpen(true);
      
    } catch (error) {
      console.error('[Stop Recording Error]', error);
      setIsRecording(false);
      toast.error('Recording Failed', {
        description: error instanceof Error ? error.message : 'Failed to stop recording',
      });
    }
  };

  const handleSaveRecording = async (trackTitle: string) => {
    if (!recordingBlob) return;
    
    try {
      // Convert Blob to base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const base64 = reader.result as string;
          resolve(base64.split(',')[1]); // Remove data:audio/...;base64, prefix
        };
        reader.onerror = reject;
        reader.readAsDataURL(recordingBlob);
      });
      
      const base64Data = await base64Promise;
      const fileKey = `tracks/production-${Date.now()}-${trackTitle.replace(/[^a-zA-Z0-9.-]/g, '_')}.webm`;
      
      // Upload to S3 via tRPC (same logic as SoundLibraryPanel)
      await createTrack.mutateAsync({
        name: trackTitle,
        fileKey,
        fileData: base64Data,
        mimeType: 'audio/webm',
        fileSize: recordingBlob.size,
        bpmDetected: masterBPM, // Use global masterBPM
        source: 'upload', // Mark as production recording
        broadcastRightsConfirmed: true,
      });
      
      // Clean up
      setRecordingBlob(null);
      if (recorderRef.current) {
        recorderRef.current.dispose();
        recorderRef.current = null;
      }
      
    } catch (error) {
      console.error('[Save Recording Error]', error);
      toast.error('Save Failed', {
        description: error instanceof Error ? error.message : 'Failed to save recording',
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Production Station</CardTitle>
        <CardDescription>Create music from scratch with synths and drums</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Global Transport Controls */}
        <Card className="bg-muted/50">
          <CardContent className="pt-4 md:pt-6">
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 md:gap-6">
              {/* Play/Pause and Record Buttons */}
              <div className="flex items-center gap-2 md:gap-3">
                <Button
                  size="lg"
                  onClick={handlePlayPause}
                  className="flex-1 md:flex-none md:w-24 h-12 md:h-10"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2" />
                      <span className="text-sm md:text-base">Pause</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2" />
                      <span className="text-sm md:text-base">Play</span>
                    </>
                  )}
                </Button>

                {/* Record/Stop Buttons */}
                {!isRecording ? (
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={handleRecord}
                    className="flex-1 md:flex-none md:w-28 h-12 md:h-10"
                  >
                    <Circle className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2 fill-red-500 text-red-500" />
                    <span className="text-sm md:text-base">Record</span>
                  </Button>
                ) : (
                  <Button
                    size="lg"
                    variant="destructive"
                    onClick={handleStopRecording}
                    className="flex-1 md:flex-none md:w-28 h-12 md:h-10 animate-pulse"
                  >
                    <Square className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2" />
                    <span className="text-sm md:text-base">Stop</span>
                  </Button>
                )}
              </div>

              {/* BPM Control */}
              <div className="flex-1 space-y-1 md:space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs md:text-sm font-semibold">Master BPM</Label>
                  <span className="text-xl md:text-2xl font-bold text-primary">{masterBPM}</span>
                </div>
                <Slider
                  value={[masterBPM]}
                  onValueChange={handleBPMChange}
                  min={60}
                  max={180}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Synth and Drum Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="synth" className="text-xs md:text-sm">
              <Piano className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
              <span className="hidden sm:inline">Synth Station</span>
              <span className="sm:hidden">Synth</span>
            </TabsTrigger>
            <TabsTrigger value="drums" className="text-xs md:text-sm">
              <Drum className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
              <span className="hidden sm:inline">Drum Machine</span>
              <span className="sm:hidden">Drums</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="synth">
            <SynthStation />
          </TabsContent>

          <TabsContent value="drums">
            <DrumMachine />
          </TabsContent>
        </Tabs>
      </CardContent>
      
      {/* Name Recording Modal */}
      <NameRecordingModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSave={handleSaveRecording}
        defaultName={`Recording ${new Date().toLocaleString()}`}
      />
    </Card>
  );
}
