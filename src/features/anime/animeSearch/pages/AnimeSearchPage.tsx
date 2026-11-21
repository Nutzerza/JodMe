"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { AnimeGrid } from "@/features/anime/animeSeason/components/AnimeGrid";
import { AnimeGridSkeleton } from "@/features/anime/animeSeason/components/skeleton/AnimeGridSkeleton";
import { AnimeDetailDialog } from "@/shared/components/AnimeDetailDialog";
import { AddAnimeDialog } from "@/shared/components/AddAnimeDialog";
import { Button } from "@/shared/components/ui/button";
import type { Anime, AnimeStatus } from "@/types/anime";
import { Input } from "@/shared/components/ui/input";
import {
  buildAddCallbackUrl,
  getPendingAnime,
  clearPendingAnime,
  savePendingAnime,
} from "@/features/anime/animeSeason/utils/callbackAddAnime";

const PAGE_SIZE = 20;
const DEBOUNCE_DELAY = 400;

export function AnimeSearchPage({
  isAuthenticated,
}: {
  isAuthenticated: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const tickingRef = useRef(false);

  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [detailAnime, setDetailAnime] = useState<Anime | null>(null);

  const [animes, setAnimes] = useState<Anime[]>([]);

  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  const [userAnimeIds, setUserAnimeIds] = useState<number[]>([]);

  // Get my anime list for the user
  useEffect(() => {
    async function fetchUserAnimeList() {
      try {
        const response = await fetch(`/api/userList/list/getMy`);
        const data = await response.json();
        setUserAnimeIds(data);
      } catch (err) {
        console.error("Fetch User Anime List Error:", err);
      }
    }
    fetchUserAnimeList();
  }, []);

  // Debounce query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, DEBOUNCE_DELAY);
    return () => clearTimeout(timer);
  }, [query]);

  // Reset page when query changes
  useEffect(() => {
    function resetSearch() {
      setPage(1);
      setHasMore(true);
    }
    resetSearch();
  }, [debouncedQuery]);

  // Fetch anime data when page or debounced query changes
  useEffect(() => {
    const controller = new AbortController();
    async function fetchAnime() {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams({
          page: String(page),
          limit: String(PAGE_SIZE),
          query: debouncedQuery,
        });
        const response = await fetch(`/api/anime/search?${params.toString()}`, {
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error(`API Error: ${response.status}`);
        }

        const data: unknown = await response.json();
        if (!Array.isArray(data)) {
          throw new Error("Invalid anime response");
        }

        const newAnimes = data as Anime[];
        // Search: replace results
        // Normal list: append results when loading next page
        setAnimes((prev) => {
          if (page === 1) {
            return newAnimes;
          }

          const existingIds = new Set(prev.map((anime) => anime.id));
          const filtered = newAnimes.filter(
            (anime) => !existingIds.has(anime.id),
          );

          return [...prev, ...filtered];
        });

        // Search currently loads only the first page
        setHasMore(!debouncedQuery && newAnimes.length === PAGE_SIZE);
      } catch (err) {
        if (err instanceof Error && err.name !== "AbortError") {
          console.error("Fetch Anime Error:", err);
          setError(err.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
          tickingRef.current = false;
        }
      }
    }
    fetchAnime();
    return () => controller.abort();
  }, [page, debouncedQuery]);

  // Infinite scroll (does not fetch directly)
  useEffect(() => {
    const element = loadMoreRef.current;

    if (!element || !hasMore || debouncedQuery || loading) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !tickingRef.current) {
          tickingRef.current = true;
          setPage((prev) => prev + 1);
        }
      },
      {
        root: null,
        rootMargin: "200px",
        threshold: 0,
      },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [hasMore, debouncedQuery, loading]);

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
        from: "animeSearchPage",
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
    <div className="container max-w-6xl mx-auto p-6">
      <div className="flex gap-3 mb-8">
        <Input
          placeholder="Search anime title..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 bg-slate-800 border-slate-700 h-12 text-base"
        />
        <Button className="bg-purple-600 px-8 h-12">Search</Button>
      </div>

      {/* {query && (
        <p className="text-sm text-slate-400 mb-6">
          Results for &quot;{query}&quot;
        </p>
      )}

      {loading && (
        <p className="text-center text-slate-400 mb-6">
          {page > 1 ? "Loading more..." : "Searching..."}
        </p>
      )}

      {error && <p className="text-center text-red-400 mb-6">{error}</p>} */}

      <div>
        {/* Initial Loading */}
        {loading && page === 1 ? (
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

        {/* Infinite Scroll Trigger */}
        {!debouncedQuery && hasMore && (
          <div className="mt-4" ref={loadMoreRef}>
            {loading && page > 1 && <AnimeGridSkeleton count={6} />}
          </div>
        )}
      </div>

      {/* Infinite Scroll Trigger */}
      {/* {!debouncedQuery && hasMore && (
        <div
          ref={loadMoreRef}
          className="h-20 flex items-center justify-center"
        >
          {loading && <span className="text-slate-400">Loading...</span>}
        </div>
      )} */}

      {animes.length === 0 && !loading && !error && (
        <div className="text-center py-12 text-slate-400">
          {debouncedQuery ? "No results found" : "No anime available"}
        </div>
      )}

      {!query && !loading && animes.length > 0 && (
        <div className="text-center py-12 text-slate-400">
          Start typing to search anime
        </div>
      )}

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
