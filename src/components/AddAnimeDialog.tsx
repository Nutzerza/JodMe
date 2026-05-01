import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Anime, AnimeStatus } from '@/types/anime';

interface AddAnimeDialogProps {
  anime: Anime | null;
  open: boolean;
  onClose: () => void;
  onAdd: (status: AnimeStatus, progress: number, score: number | null) => void;
}

export function AddAnimeDialog({ anime, open, onClose, onAdd }: AddAnimeDialogProps) {
  const [status, setStatus] = useState<AnimeStatus>('plan_to_watch');
  const [progress, setProgress] = useState(0);
  const [score, setScore] = useState<string>('');

  if (!anime) return null;

  const handleSubmit = () => {
    onAdd(status, progress, score ? parseFloat(score) : null);
    setStatus('plan_to_watch');
    setProgress(0);
    setScore('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-slate-800 text-white">
        <DialogHeader>
          <DialogTitle>Add to list — {anime.title}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 mt-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={(value) => setStatus(value as AnimeStatus)}>
              <SelectTrigger id="status" className="bg-slate-800 border-slate-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700 text-white">
                <SelectItem value="plan_to_watch">Plan to watch</SelectItem>
                <SelectItem value="watching">Watching</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="on_hold">On hold</SelectItem>
                <SelectItem value="dropped">Dropped</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="episode">Episode</Label>
            <Input
              id="episode"
              type="number"
              min="0"
              max={anime.episodes}
              value={progress}
              onChange={(e) => setProgress(parseInt(e.target.value) || 0)}
              className="bg-slate-800 border-slate-700"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="score">Score</Label>
            <Select value={score} onValueChange={setScore}>
              <SelectTrigger id="score" className="bg-slate-800 border-slate-700">
                <SelectValue placeholder="— (not rated)" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700 text-white">
                <SelectItem value="">— (not rated)</SelectItem>
                {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map(num => (
                  <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 mt-2">
            <Button onClick={onClose} variant="outline" className="flex-1 border-slate-700">
              Cancel
            </Button>
            <Button onClick={handleSubmit} className="flex-1 bg-purple-600 hover:bg-purple-700">
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
