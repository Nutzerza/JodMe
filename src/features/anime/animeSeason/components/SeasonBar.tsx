import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Button } from "@/shared/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  getPrevSeason,
  getNextSeason,
} from "@/features/anime/animeSeason/utils/seasonUtils";
import type { Season } from "@/types/anime";

export function SeasonBar({
  currentSeason,
  onSeasonChange,
}: {
  currentSeason: { season: Season; year: number };
  onSeasonChange: (season: Season, year: number) => void;
}) {
  return (
    <div className="flex items-center gap-4 mb-8">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => {
          const prevSeason = getPrevSeason(
            currentSeason.season,
            currentSeason.year,
          );
          onSeasonChange(prevSeason.season as Season, prevSeason.year);
        }}
      >
        <ChevronLeft />
      </Button>

      <h1 className="text-2xl font-bold">
        {currentSeason.season} {currentSeason.year}
      </h1>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => {
          const nextSeason = getNextSeason(
            currentSeason.season,
            currentSeason.year,
          );
          onSeasonChange(nextSeason.season as Season, nextSeason.year);
        }}
      >
        <ChevronRight />
      </Button>

      <Select value="all" onValueChange={() => {}}>
        <SelectTrigger className="w-45 ml-auto">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          <SelectItem value="action">Action</SelectItem>
          <SelectItem value="comedy">Comedy</SelectItem>
          <SelectItem value="romance">Romance</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
