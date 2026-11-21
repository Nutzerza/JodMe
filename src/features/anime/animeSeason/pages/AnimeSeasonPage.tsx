// Page component for displaying the anime for the current season and managing user interactions with the anime list.
"use client";
import { useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { SeasonBar } from "@/features/anime/animeSeason/components/SeasonBar";
import { AnimeGrid } from "@/features/anime/animeSeason/components/AnimeGrid";
import { AnimeGridSkeleton } from "@/features/anime/animeSeason/components/skeleton/AnimeGridSkeleton";
import { AnimeDetailDialog } from "@/shared/components/AnimeDetailDialog";
import { AddAnimeDialog } from "@/shared/components/AddAnimeDialog";
import type { Anime, AnimeStatus } from "@/types/anime";
import { getCurrentSeason } from "@/features/anime/animeSeason/utils/getCurrentSeason";
import {
  savePendingAnime,
  getPendingAnime,
  clearPendingAnime,
  buildAddCallbackUrl,
} from "@/features/anime/animeSeason/utils/callbackAddAnime";

export function AnimeSeasonPage({
  isAuthenticated,
}: {
  isAuthenticated: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

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
  const [userAnimeIds, setUserAnimeIds] = useState<number[]>([]);

  // Fetch anime data whenever the season changes
  useEffect(() => {
    async function fetchAnime() {
      setLoading(true);
      // Fetch the anime list for the current season and year
      const responseAnimeList = await fetch(
        `/api/anime/season?season=${season.season}&year=${season.year}`,
      );
      const data = await responseAnimeList.json();
      setAnimes(data);

      // Fetch the user's anime list for the current season and year
      const responseUserAnimeList = await fetch(`/api/userList/list/getMy`);
      const userAnimeIDData = await responseUserAnimeList.json();
      setUserAnimeIds(userAnimeIDData);

      setLoading(false);
    }
    fetchAnime();
  }, [season]);

  // Handle adding an anime to the user's list by opening the add dialog
  function handleAddAnime(animeItem: Anime) {
    setDetailDialogOpen(false);
    setAddDialogOpen(true);
    setDetailAnime(animeItem);
  }

  // Update the user's anime list by sending a request to the server
  async function updateUserAnimeList(
    animeItem: Anime,
    status: AnimeStatus,
    progress: number,
    score: number | null,
  ) {
    const res = await fetch("/api/userList/list", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        animeId: animeItem.id,
        status,
        progress,
        score,
        from: "animeSeasonPage",
      }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error ?? "Failed to add anime");
    }

    setUserAnimeIds((prev) => [...prev, animeItem.id]);
  }

  // Handle the process of adding a new anime to the user's list, including authentication and pending anime management
  async function handleAddNewAnime(
    animeItem: Anime,
    status: AnimeStatus,
    progress: number,
    score: number | null,
  ): Promise<void> {
    if (!isAuthenticated) {
      savePendingAnime(animeItem, {
        status: status,
        progress: progress,
        score: score,
      });
      router.push(
        `/auth?callbackUrl=${encodeURIComponent(buildAddCallbackUrl(pathname, searchParams, animeItem.id))}`,
      );
      return;
    }

    // Adding anime to the user's list
    const title = animeItem.title;
    const toastId = toast.loading(`Adding "${title}"...`);

    try {
      await updateUserAnimeList(animeItem, status, progress, score);
      toast.success(`Added "${title}"`, { id: toastId });
      setAddDialogOpen(false);
    } catch (err) {
      console.error(err);
      const message =
        err instanceof Error ? err.message : "Failed to add anime";
      toast.error(message, { id: toastId });
      throw err;
    }
  }

  // Handle any pending anime that needs to be added after authentication
  useEffect(() => {
    async function handlePendingAnime() {
      if (!isAuthenticated) return;

      const addAnimeId = Number(searchParams.get("add"));

      if (!addAnimeId) return;

      const pendingAnime = getPendingAnime(addAnimeId);
      const animeItem = pendingAnime?.anime;
      const addForm = pendingAnime?.addForm;

      if (!animeItem) return;

      // Adding anime to the user's list
      const title = animeItem.title;
      const toastId = toast.loading(`Adding "${title}"...`);
      try {
        await updateUserAnimeList(
          animeItem,
          addForm?.status ?? "plan_to_watch",
          addForm?.progress ?? 0,
          addForm?.score ?? null,
        );
        toast.success(`Added "${title}"`, { id: toastId });
        setAddDialogOpen(false);
      } catch (err) {
        console.error(err);
        const message =
          err instanceof Error ? err.message : "Failed to add anime";
        toast.error(message, { id: toastId });
        throw err;
      }

      clearPendingAnime();

      router.replace(pathname, { scroll: false });
    }
    handlePendingAnime();
  }, [isAuthenticated, searchParams, pathname, router]);

  return (
    <div className="container mx-auto px-6 py-8 max-w-6xl">
      <SeasonBar
        currentSeason={{ season: season.season, year: season.year }}
        onSeasonChange={(newSeason, newYear) => {
          setSeason({ season: newSeason, year: newYear });
        }}
      />
      <div>
        {loading ? (
          <AnimeGridSkeleton />
        ) : (
          <AnimeGrid
            anime={animes}
            userAnimeIds={userAnimeIds}
            onDetailOpen={(animeItem) => {
              setDetailAnime(animeItem);
              setDetailDialogOpen(true);
            }}
            onAddClick={(animeItem) => {
              handleAddAnime(animeItem);
            }}
          />
        )}
      </div>

      {/* Anime detail dialogs */}
      <AnimeDetailDialog
        anime={detailAnime}
        open={detailDialogOpen}
        isInList={detailAnime ? userAnimeIds.includes(detailAnime.id) : false}
        onClose={() => setDetailDialogOpen(false)}
        onOpenAddDialog={(animeItem) => {
          if (animeItem) {
            handleAddAnime(animeItem);
          }
        }}
      />

      {/* Add anime dialog */}
      <AddAnimeDialog
        anime={detailAnime}
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        onAddNewAnime={handleAddNewAnime}
      />
    </div>
  );
}
