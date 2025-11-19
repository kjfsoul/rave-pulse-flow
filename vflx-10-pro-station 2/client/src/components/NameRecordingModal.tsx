import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface NameRecordingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (trackName: string) => void;
  defaultName?: string;
}

export function NameRecordingModal({
  open,
  onOpenChange,
  onSave,
  defaultName = '',
}: NameRecordingModalProps) {
  const [trackName, setTrackName] = useState(defaultName);

  const handleSave = () => {
    if (trackName.trim()) {
      onSave(trackName.trim());
      setTrackName(''); // Reset for next time
      onOpenChange(false);
    }
  };

  const handleCancel = () => {
    setTrackName(''); // Reset
    onOpenChange(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Name Your Track</DialogTitle>
          <DialogDescription>
            Give your recording a memorable name. You can always rename it later.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="track-name" className="text-right">
              Name
            </Label>
            <Input
              id="track-name"
              value={trackName}
              onChange={(e) => setTrackName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="My Awesome Track"
              className="col-span-3"
              autoFocus
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!trackName.trim()}>
            Save Recording
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
