// Component for displaying a grid of anime cards with detail and add actions.

import { Anime } from "@/types/anime";
import { AnimeCard } from "@/shared/components/AnimeCard";
import { Button } from "@/shared/components/ui/button";
import { getAnimeIcon } from "@/features/anime/animeSeason/utils/getAnimeIcon";
// import { isInList } from "@/features/animeSeason/utils/isInList";

interface AnimeGridProps {
  anime: Anime[];
  onDetailOpen: (anime: Anime) => void;
  onAddClick: (anime: Anime) => void;
}

export function AnimeGrid({ anime, onDetailOpen, onAddClick }: AnimeGridProps) {
  return (
    <>
      {anime.map((animeItem, index) => (
        <AnimeCard
          key={`${animeItem.id}-${animeItem.anilistId}`}
          anime={animeItem}
          icon={getAnimeIcon(index)}
          // statusBadge={
          //   isInList(animeItem.anilistId) && (
          //     <span className="px-2 py-1 bg-emerald-600 text-xs rounded">
          //       In list
          //     </span>
          //   )
          // }
          onClick={() => {
            onDetailOpen(animeItem);
          }}
          actionButton={
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onAddClick(animeItem);
              }}
              size="sm"
              // disabled={isInList(animeItem.anilistId)}
            >
              + Add
              {/* {isInList(animeItem.anilistId) ? "In list" : "+ Add"} */}
            </Button>
          }
        />
      ))}
    </>
  );
}
