import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { trpc } from '@/lib/trpc';
import { useGlobalStore } from '@/hooks/useGlobalStore';
import { toast } from 'sonner';
import { Upload, Trophy, ThumbsUp, Loader2, Music, Play, Pause } from 'lucide-react';
import { useAuth } from '@/_core/hooks/useAuth';
import * as Tone from 'tone';

export function SubmissionSystem() {
  const { user } = useAuth();
  const { activeScene } = useGlobalStore();
  
  // Form state
  const [selectedTrackId, setSelectedTrackId] = useState<string>('');
  const [artistName, setArtistName] = useState(user?.name || '');
  const [acceptedTOS, setAcceptedTOS] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Audio playback state
  const [playingSubmissionId, setPlayingSubmissionId] = useState<number | null>(null);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const playerRef = useRef<Tone.Player | null>(null);

  // Initialize audio player on mount
  useEffect(() => {
    // Create a single Tone.Player instance for leaderboard preview
    const player = new Tone.Player().toDestination();
    player.volume.value = -6; // Slightly lower volume for preview
    playerRef.current = player;
    setIsPlayerReady(true);

    console.log('[SubmissionSystem] Audio player initialized');

    // Cleanup on unmount
    return () => {
      if (playerRef.current) {
        playerRef.current.stop();
        playerRef.current.dispose();
        console.log('[SubmissionSystem] Audio player disposed');
      }
    };
  }, []);

  // Fetch user's own tracks (uploaded or recorded from production station)
  const { data: userTracks = [], isLoading: tracksLoading } = trpc.tracks.list.useQuery();
  
  // Filter tracks to only show uploaded or production-recorded tracks
  const submittableTracks = userTracks.filter(
    track => track.source === 'upload' || track.source === 'loudly'
  );

  const utils = trpc.useUtils();
  const { data: mySubmissions = [] } = trpc.submissions.list.useQuery();
  const { data: allSubmissions = [] } = trpc.submissions.listAll.useQuery();
  
  const createSubmission = trpc.submissions.create.useMutation({
    onSuccess: () => {
      utils.submissions.list.invalidate();
      utils.submissions.listAll.invalidate();
      setSelectedTrackId('');
      setArtistName(user?.name || '');
      setAcceptedTOS(false);
      toast.success('Submission Complete! 🎉', {
        description: 'Your track has been submitted to the festival',
      });
    },
    onError: (error) => {
      toast.error('Submission Failed', {
        description: error.message || 'Failed to submit your track',
      });
    },
  });
  
  const voteForSubmission = trpc.submissions.vote.useMutation({
    onSuccess: () => {
      utils.submissions.listAll.invalidate();
      toast.success('Vote Recorded! 👍', {
        description: 'Your vote has been counted',
      });
    },
    onError: (error) => {
      toast.error('Vote Failed', {
        description: error.message || 'Failed to record your vote',
      });
    },
  });

  const handleSubmit = async () => {
    if (!selectedTrackId) {
      toast.error('Track Required', {
        description: 'Please select a track to submit',
      });
      return;
    }

    if (!artistName.trim()) {
      toast.error('Artist Name Required', {
        description: 'Please enter your artist name',
      });
      return;
    }

    if (!acceptedTOS) {
      toast.error('Terms Required', {
        description: 'Please accept the Terms of Service',
      });
      return;
    }

    setSubmitting(true);

    try {
      // Find the selected track
      const selectedTrack = submittableTracks.find(t => t.id.toString() === selectedTrackId);
      
      if (!selectedTrack) {
        throw new Error('Selected track not found');
      }

      // Submit the track with actual data
      await createSubmission.mutateAsync({
        title: selectedTrack.name,
        artistName: artistName.trim(),
        fileKey: selectedTrack.fileKey,
        url: selectedTrack.url,
        attributionCredits: selectedTrack.attributionCredits || undefined,
        festivalScene: activeScene,
      });
    } catch (error) {
      console.error('Submission error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleVote = (submissionId: number) => {
    voteForSubmission.mutate({ submissionId });
  };

  const handlePlayPause = async (submissionId: number, url: string) => {
    if (!playerRef.current || !isPlayerReady) {
      toast.error('Player Not Ready', {
        description: 'Audio player is still initializing',
      });
      return;
    }

    const player = playerRef.current;

    try {
      // Ensure audio context is started (required for user interaction)
      await Tone.start();

      // If clicking the same track that's playing, toggle pause/resume
      if (playingSubmissionId === submissionId) {
        if (player.state === 'started') {
          player.stop();
          setPlayingSubmissionId(null);
          console.log(`[SubmissionSystem] Paused submission ${submissionId}`);
        } else {
          player.start();
          setPlayingSubmissionId(submissionId);
          console.log(`[SubmissionSystem] Resumed submission ${submissionId}`);
        }
        return;
      }

      // Stop any currently playing track
      if (player.state === 'started') {
        player.stop();
        console.log(`[SubmissionSystem] Stopped previous track`);
      }

      // Load and play the new track
      console.log(`[SubmissionSystem] Loading submission ${submissionId} from ${url}`);
      
      // Load the new URL
      await player.load(url);
      
      // Start playback
      player.start();
      setPlayingSubmissionId(submissionId);
      
      console.log(`[SubmissionSystem] Playing submission ${submissionId}`);

      // Handle playback end
      player.onstop = () => {
        if (playingSubmissionId === submissionId) {
          setPlayingSubmissionId(null);
          console.log(`[SubmissionSystem] Playback ended for submission ${submissionId}`);
        }
      };

    } catch (error) {
      console.error('[SubmissionSystem] Playback error:', error);
      toast.error('Playback Failed', {
        description: 'Failed to play this track. The audio file may be unavailable.',
      });
      setPlayingSubmissionId(null);
    }
  };

  // Get the selected track for preview
  const selectedTrack = submittableTracks.find(t => t.id.toString() === selectedTrackId);

  return (
    <div className="space-y-4">
      {/* Submit New Track */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Submit to Festival
          </CardTitle>
          <CardDescription>
            Share your creation with the EDM Shuffle community
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Track Selection */}
          <div className="space-y-2">
            <Label htmlFor="track-select">Select Track</Label>
            {tracksLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading your tracks...
              </div>
            ) : submittableTracks.length === 0 ? (
              <div className="p-4 bg-muted rounded text-sm text-muted-foreground">
                <p className="font-medium mb-1">No tracks available for submission</p>
                <p className="text-xs">
                  Upload a track in the Sound Library or record one in the Production Station first.
                </p>
              </div>
            ) : (
              <Select value={selectedTrackId} onValueChange={setSelectedTrackId}>
                <SelectTrigger id="track-select">
                  <SelectValue placeholder="Choose a track to submit" />
                </SelectTrigger>
                <SelectContent>
                  {submittableTracks.map((track) => (
                    <SelectItem key={track.id} value={track.id.toString()}>
                      <div className="flex items-center gap-2">
                        <Music className="w-4 h-4" />
                        <span>{track.name}</span>
                        {track.bpmDetected && (
                          <span className="text-xs text-muted-foreground">
                            ({track.bpmDetected} BPM)
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Artist Name */}
          <div className="space-y-2">
            <Label htmlFor="artist-name">Artist Name</Label>
            <Input
              id="artist-name"
              placeholder="Enter your artist name"
              value={artistName}
              onChange={(e) => setArtistName(e.target.value)}
            />
          </div>

          {/* Selected Track Preview */}
          {selectedTrack && (
            <div className="p-3 bg-muted rounded space-y-2">
              <p className="text-sm font-medium">Selected Track:</p>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>• Title: {selectedTrack.name}</p>
                {selectedTrack.bpmDetected && <p>• BPM: {selectedTrack.bpmDetected}</p>}
                {selectedTrack.duration && <p>• Duration: {selectedTrack.duration}s</p>}
                <p>• Source: {selectedTrack.source === 'upload' ? 'Uploaded' : 'Production Recording'}</p>
              </div>
            </div>
          )}

          {/* Attribution Credits */}
          {selectedTrack?.attributionCredits && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Attribution Credits</Label>
              <div className="text-xs text-muted-foreground space-y-1 p-3 bg-muted rounded">
                {JSON.parse(selectedTrack.attributionCredits).map((credit: string, i: number) => (
                  <p key={i}>• {credit}</p>
                ))}
              </div>
            </div>
          )}

          {/* Terms of Service */}
          <div className="flex items-start space-x-2">
            <Checkbox
              id="tos"
              checked={acceptedTOS}
              onCheckedChange={(checked) => setAcceptedTOS(checked as boolean)}
            />
            <Label htmlFor="tos" className="text-sm leading-tight">
              I confirm I have the rights to this audio and grant EDM Shuffle a non-exclusive
              license to broadcast it for the virtual festival. I understand all attribution
              credits will be included with my submission.
            </Label>
          </div>

          {/* Submit Button */}
          <Dialog>
            <DialogTrigger asChild>
              <Button 
                className="w-full" 
                size="lg"
                disabled={!selectedTrackId || !artistName.trim() || !acceptedTOS}
              >
                <Upload className="w-4 h-4 mr-2" />
                Review & Submit
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm Submission</DialogTitle>
                <DialogDescription>
                  You are about to submit your track to the EDM Shuffle festival competition.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Track: {selectedTrack?.name || '(No track selected)'}</p>
                  <p className="text-sm text-muted-foreground">Artist: {artistName || '(No artist name)'}</p>
                  <p className="text-sm text-muted-foreground">Scene: {activeScene}</p>
                </div>
                <div className="text-xs text-muted-foreground p-3 bg-muted rounded">
                  <p className="font-medium mb-1">Terms of Service:</p>
                  <p>
                    By submitting, you confirm you own 100% of the rights to this audio and
                    grant EDM Shuffle a broadcast license for competition submissions.
                  </p>
                </div>
                <Button
                  onClick={handleSubmit}
                  disabled={submitting || !acceptedTOS || !selectedTrackId || !artistName.trim()}
                  className="w-full"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Confirm Submission'
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* My Submissions */}
      {mySubmissions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              My Submissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {mySubmissions.map((submission) => (
                <div
                  key={submission.id}
                  className="flex items-center justify-between p-3 bg-muted rounded hover:bg-muted/80 transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-medium">{submission.title}</p>
                    <p className="text-sm text-muted-foreground">
                      by {submission.artistName}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-lg font-bold">{submission.votes}</p>
                      <p className="text-xs text-muted-foreground">votes</p>
                    </div>
                    <div className={`px-2 py-1 rounded text-xs font-medium ${
                      submission.status === 'approved' ? 'bg-green-500/20 text-green-700 dark:text-green-400' :
                      submission.status === 'rejected' ? 'bg-red-500/20 text-red-700 dark:text-red-400' :
                      'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400'
                    }`}>
                      {submission.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Festival Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Festival Leaderboard
          </CardTitle>
          <CardDescription>Listen and vote for your favorite tracks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {allSubmissions.length === 0 ? (
              <div className="text-center py-12">
                <Trophy className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                <p className="text-sm text-muted-foreground font-medium">
                  No submissions yet. Be the first!
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Submit your track above to start the competition
                </p>
              </div>
            ) : (
              allSubmissions.map((submission, index) => {
                const isMySubmission = submission.userId === user?.id;
                const isTopThree = index < 3;
                const isPlaying = playingSubmissionId === submission.id;
                
                return (
                  <div
                    key={submission.id}
                    className={`flex items-center justify-between p-3 rounded transition-colors ${
                      isTopThree 
                        ? 'bg-gradient-to-r from-yellow-500/10 to-transparent border border-yellow-500/20' 
                        : 'bg-muted hover:bg-muted/80'
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      {/* Rank Badge */}
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
                        index === 0 ? 'bg-yellow-500 text-white' :
                        index === 1 ? 'bg-gray-400 text-white' :
                        index === 2 ? 'bg-orange-600 text-white' :
                        'bg-muted-foreground/20 text-muted-foreground'
                      }`}>
                        {index + 1}
                      </div>
                      
                      {/* Play/Pause Button */}
                      <Button
                        size="sm"
                        variant={isPlaying ? "default" : "outline"}
                        onClick={() => handlePlayPause(submission.id, submission.url)}
                        disabled={!isPlayerReady}
                        className="min-w-[40px]"
                      >
                        {isPlaying ? (
                          <Pause className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                      </Button>
                      
                      {/* Track Info */}
                      <div className="flex-1">
                        <p className="font-medium flex items-center gap-2">
                          {submission.title}
                          {isMySubmission && (
                            <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">
                              Your Track
                            </span>
                          )}
                          {isPlaying && (
                            <span className="text-xs bg-green-500/20 text-green-700 dark:text-green-400 px-2 py-0.5 rounded animate-pulse">
                              Playing
                            </span>
                          )}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          by {submission.artistName} • {submission.festivalScene || 'festival'}
                        </p>
                      </div>
                    </div>
                    
                    {/* Vote Section */}
                    <div className="flex items-center gap-2">
                      <div className="text-right mr-2">
                        <p className="text-xl font-bold">{submission.votes}</p>
                        <p className="text-xs text-muted-foreground">votes</p>
                      </div>
                      <Button
                        size="sm"
                        variant={isMySubmission ? "outline" : "default"}
                        onClick={() => handleVote(submission.id)}
                        disabled={voteForSubmission.isPending || isMySubmission}
                        className="min-w-[80px]"
                      >
                        {voteForSubmission.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <ThumbsUp className="w-4 h-4 mr-1" />
                            {isMySubmission ? 'Yours' : 'Vote'}
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
