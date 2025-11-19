import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Music, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useUserTracks } from '@/hooks/vFLX10/useTracks';
import { useProStationStore } from '@/hooks/useProStationStore';
import { supabase } from '@/lib/supabase';

/**
 * Submission System Component (Adapted from vFLX-10)
 *
 * Wired to Supabase for festival submissions:
 * - Uses useUserTracks hook to populate track selector
 * - Creates submissions in festival_submissions table
 * - Uploads submission files to Supabase Storage
 */
export function SubmissionSystem() {
  const { user, profile } = useAuth();
  const { activeScene, attributionCredits } = useProStationStore();
  const { tracks, isLoading: tracksLoading } = useUserTracks();
  const [selectedTrackId, setSelectedTrackId] = useState<string>('');
  const [artistName, setArtistName] = useState(profile?.username || '');
  const [acceptedTOS, setAcceptedTOS] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Filter tracks to only show uploaded or production-recorded tracks
  const submittableTracks = tracks.filter(
    (track) => track.source === 'upload' || track.source === 'loudly'
  );

  useEffect(() => {
    if (profile?.username && !artistName) {
      setArtistName(profile.username);
    }
  }, [profile, artistName]);

  const handleSubmit = async () => {
    if (!user) {
      toast.error('Authentication Required', {
        description: 'Please log in to submit tracks',
      });
      return;
    }

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
      const selectedTrack = submittableTracks.find((t) => t.id === selectedTrackId);

      if (!selectedTrack) {
        throw new Error('Selected track not found');
      }

      // For now, we're submitting the track as-is
      // TODO: In future, we can render the full mix (Production + DJ Station) using Tone.Offline
      // For now, users submit individual tracks they've uploaded

      // Upload submission file to Supabase Storage
      // Since we're using an existing track, we can either:
      // 1. Copy the track file to submissions bucket
      // 2. Reference the track file directly
      // We'll copy it to keep submissions separate
      const submissionFileName = `submission-${Date.now()}-${selectedTrack.name.replace(/[^a-zA-Z0-9.-]/g, '_')}.mp3`;
      const fileKey = `submissions/${user.id}/${submissionFileName}`;

      // Download the track file
      const trackResponse = await fetch(selectedTrack.url);
      const trackBlob = await trackResponse.blob();

      // Upload to submissions bucket
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('tracks') // Using tracks bucket for now; can create submissions bucket later
        .upload(fileKey, trackBlob, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: urlData } = supabase.storage.from('tracks').getPublicUrl(fileKey);

      if (!urlData) {
        throw new Error('Failed to get public URL');
      }

      const publicUrl = urlData.publicUrl;

      // Create submission record in database
      const { data: submissionData, error: insertError } = await supabase
        .from('festival_submissions')
        .insert({
          user_id: user.id,
          title: selectedTrack.name,
          artist_name: artistName.trim(),
          file_key: fileKey,
          url: publicUrl,
          attribution_credits: attributionCredits.length > 0 ? JSON.stringify(attributionCredits) : null,
          festival_scene: activeScene,
          status: 'pending',
          votes: 0,
        })
        .select()
        .single();

      if (insertError) {
        // Clean up uploaded file if database insert fails
        await supabase.storage.from('tracks').remove([fileKey]);
        throw insertError;
      }

      toast.success('Submission Complete! 🎉', {
        description: 'Your track has been submitted to the festival',
      });

      // Reset form
      setSelectedTrackId('');
      setArtistName(profile?.username || '');
      setAcceptedTOS(false);
    } catch (error) {
      console.error('[Submission Error]', error);
      toast.error('Submission Failed', {
        description: error instanceof Error ? error.message : 'Failed to submit your track',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Submit to Festival</CardTitle>
        <CardDescription>
          Submit your track to the virtual festival competition
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!user ? (
          <div className="text-center py-8 text-sm text-muted-foreground">
            Please log in to submit tracks
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <Label htmlFor="track-select">Select Track</Label>
              {tracksLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
              ) : submittableTracks.length === 0 ? (
                <div className="text-sm text-muted-foreground py-4">
                  No tracks available. Upload a track first.
                </div>
              ) : (
                <Select value={selectedTrackId} onValueChange={setSelectedTrackId}>
                  <SelectTrigger id="track-select">
                    <SelectValue placeholder="Choose a track..." />
                  </SelectTrigger>
                  <SelectContent>
                    {submittableTracks.map((track) => (
                      <SelectItem key={track.id} value={track.id}>
                        <div className="flex items-center gap-2">
                          <Music className="w-4 h-4" />
                          <span>{track.name}</span>
                          {(track.bpm_accurate || track.bpm_detected) && (
                            <span className="text-xs text-muted-foreground">
                              ({Math.round(track.bpm_accurate || track.bpm_detected || 0)} BPM)
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="artist-name">Artist Name</Label>
              <Input
                id="artist-name"
                placeholder="Your artist name"
                value={artistName}
                onChange={(e) => setArtistName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="festival-scene">Festival Scene</Label>
              <Select value={activeScene} disabled>
                <SelectTrigger id="festival-scene">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="deep_forest">Deep Forest</SelectItem>
                  <SelectItem value="urban_nights">Urban Nights</SelectItem>
                  <SelectItem value="cosmic_beach">Cosmic Beach</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Current scene: {activeScene}
              </p>
            </div>

            <div className="flex items-start space-x-2 pt-2">
              <Checkbox
                id="accept-tos"
                checked={acceptedTOS}
                onCheckedChange={(checked) => setAcceptedTOS(checked as boolean)}
              />
              <Label htmlFor="accept-tos" className="text-sm leading-relaxed cursor-pointer">
                I confirm I have the rights to submit this track and grant EDM Shuffle a broadcast license
              </Label>
            </div>

            {attributionCredits.length > 0 && (
              <div className="p-3 bg-muted/50 rounded-lg">
                <Label className="text-xs font-medium">Attribution Credits</Label>
                <div className="mt-2 space-y-1">
                  {attributionCredits.map((credit, index) => (
                    <p key={index} className="text-xs text-muted-foreground">
                      {typeof credit === 'string' ? credit : JSON.stringify(credit)}
                    </p>
                  ))}
                </div>
              </div>
            )}

            <Button
              onClick={handleSubmit}
              disabled={submitting || !selectedTrackId || !artistName.trim() || !acceptedTOS}
              className="w-full"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Submit to Festival
                </>
              )}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
