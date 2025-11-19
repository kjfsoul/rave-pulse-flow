import { useState } from 'react';
import * as Tone from 'tone';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Piano, Drum, Play, Pause, Circle, Square } from 'lucide-react';
import { SynthStation } from './SynthStation';
import { DrumMachine } from './DrumMachine';
import { useProStationStore } from '@/hooks/useProStationStore';
import { useToneTransport } from '@/hooks/vFLX10/useToneTransport';
import { toast } from 'sonner';

/**
 * Production Station Component (Adapted from vFLX-10)
 *
 * TODO: Wire to Supabase for recording persistence
 * - Replace recording save logic with Supabase storage
 * - Connect to tracks table
 */
export function ProductionStation() {
  const [activeTab, setActiveTab] = useState('synth');
  const { isPlaying, setIsPlaying, masterBPM, setMasterBPM } = useProStationStore();
  const [isRecording, setIsRecording] = useState(false);
  // TODO: Wire to Supabase for recording save
  const [recordingBlob, setRecordingBlob] = useState<Blob | null>(null);

  // Initialize and sync Tone.js Transport with global state
  useToneTransport();

  const handlePlayPause = async () => {
    // Toggle play state - useToneTransport will handle Transport.start/stop
    setIsPlaying(!isPlaying);
  };

  const handleBPMChange = (value: number[]) => {
    setMasterBPM(value[0]);
  };

  const handleRecord = async () => {
    try {
      // TODO: Initialize Tone.Recorder connected to master output
      // const recorder = new Tone.Recorder();
      // Tone.Destination.connect(recorder);
      // await recorder.start();
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
    try {
      // TODO: Stop recording and get Blob
      // const blob = await recorder.stop();
      // setRecordingBlob(blob);
      setIsRecording(false);

      toast.success('Recording Stopped', {
        description: 'TODO: Save recording to Supabase',
      });
    } catch (error) {
      console.error('[Stop Recording Error]', error);
      setIsRecording(false);
      toast.error('Recording Failed', {
        description: error instanceof Error ? error.message : 'Failed to stop recording',
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
    </Card>
  );
}
