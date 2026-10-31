"use client";
import { useState, useEffect } from "react";
import { AnimeGridSkeleton } from "@/features/anime/animeSeason/components/skeleton/AnimeGridSkeleton";
import { SeasonBar } from "@/features/anime/animeSeason/components/SeasonBar";
import { AnimeGrid } from "@/features/anime/animeSeason/components/AnimeGrid";
import { getCurrentSeason } from "@/features/anime/animeSeason/utils/getCurrentSeason";
import { AnimeDetailDialog } from "@/shared/components/AnimeDetailDialog";
import { AddAnimeDialog } from "@/shared/components/AddAnimeDialog";
import type { Anime, UserAnimeEntry, AnimeStatus } from "@/types/anime";

export function AnimeSeasonPage() {
  // State for managing the detail and add dialogs, as well as the selected anime and user anime list
  const [loading, setLoading] = useState(false);
  const [season, setSeason] = useState({
    season: getCurrentSeason().season,
    year: getCurrentSeason().year,
  });
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  // Detail anime for the detail dialog set when a user clicks on an anime item in the grid
  const [detailAnime, setDetailAnime] = useState<Anime | null>(null);
  // User anime list for tracking which anime the user has added
  const [animes, setAnimes] = useState<Anime[]>([]);
  const [userAnimeList, setUserAnimeList] = useState<UserAnimeEntry[]>([]);

  // Fetch anime data whenever the season changes
  useEffect(() => {
    async function fetchAnime() {
      setLoading(true);
      const response = await fetch(
        `/api/anime/season?season=${season.season}&year=${season.year}`,
      );
      const data = await response.json();
      console.log("Fetched anime data:", data);
      setAnimes(data);
      setLoading(false);
    }
    fetchAnime();
  }, [season]);

  function handleAddAnime(animeItem: Anime) {
    setDetailDialogOpen(false);
    setAddDialogOpen(true);
    setDetailAnime(animeItem);
  }

  async function addAnimeToList(
    animeItem: Anime,
    status: AnimeStatus,
    progress: number,
    score: number | null,
  ) {
    setAddDialogOpen(false);
    console.log("Adding anime to list:", animeItem, status, progress, score);
    // setUserAnimeList((prev) => [
    //   ...prev,
    //   { anime: animeItem, status, progress, score },
    // ]);
  }

  return (
    <div className="container mx-auto px-6 py-8 max-w-6xl">
      <SeasonBar
        currentSeason={{ season: season.season, year: season.year }}
        onSeasonChange={(newSeason, newYear) => {
          console.log("Season changed to:", newSeason, newYear);
          setSeason({ season: newSeason, year: newYear });
        }}
      />
      <div
        className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6"
        aria-label="Loading anime"
        aria-busy="true"
        role="status"
      >
        {loading ? (
          <AnimeGridSkeleton />
        ) : (
          <AnimeGrid
            anime={animes}
            onDetailOpen={(animeItem) => {
              console.log("Detail opened for:", animeItem);
              setDetailAnime(animeItem);
              setDetailDialogOpen(true);
            }}
            onAddClick={(animeItem) => {
              console.log("Add clicked for:", animeItem);
              handleAddAnime(animeItem);
            }}
          />
        )}
      </div>

      <AnimeDetailDialog
        anime={detailAnime}
        open={detailDialogOpen}
        isInList={
          detailAnime
            ? userAnimeList.some(
                (entry) => entry.anime.anilistId === detailAnime.anilistId,
              )
            : false
        }
        onClose={() => setDetailDialogOpen(false)}
        onOpenAddDialog={(animeItem) => {
          if (animeItem) {
            handleAddAnime(animeItem);
          }
        }}
      />

      <AddAnimeDialog
        anime={detailAnime}
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        onAddNewAnime={async (status, progress, score) => {
          if (detailAnime) {
            await addAnimeToList(detailAnime, status, progress, score);
          }
        }}
      />
    </div>
  );
}
