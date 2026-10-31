"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { AnimeCard } from "@/shared/components/AnimeCard";
// import AnimeDetailDialog from "@/shared/components/AnimeDetailDialog";
import { AddAnimeDialog } from "@/shared/components/AddAnimeDialog";
import { Button } from "@/shared/components/ui/button";
import type { Anime } from "@/types/anime";
import { Input } from "@/shared/components/ui/input";
import { getAnimeIcon } from "../../animeSeason/utils/getAnimeIcon";

const PAGE_SIZE = 20;
const DEBOUNCE_DELAY = 400;

export function AnimeSearchPage() {
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const tickingRef = useRef(false);

  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [detailAnime, setDetailAnime] = useState<Anime | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const [animes, setAnimes] = useState<Anime[]>([]);

  // 1. Debounce query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, DEBOUNCE_DELAY);
    return () => clearTimeout(timer);
  }, [query]);

  // 2. Reset page when query changes
  useEffect(() => {
    function resetSearch() {
      setPage(1);
      setHasMore(true);
    }
    resetSearch();
  }, [debouncedQuery]);

  // 3. Fetch anime data when page or debounced query changes
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

  // 4. Infinite scroll (does not fetch directly)
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

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex gap-3 mb-8">
        <Input
          placeholder="Search anime title..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 bg-slate-800 border-slate-700 h-12 text-base"
        />
        <Button className="bg-purple-600 px-8 h-12">Search</Button>
      </div>

      {query && (
        <p className="text-sm text-slate-400 mb-6">
          Results for &quot;{query}&quot;
        </p>
      )}

      {loading && (
        <p className="text-center text-slate-400 mb-6">
          {page > 1 ? "Loading more..." : "Searching..."}
        </p>
      )}

      {error && <p className="text-center text-red-400 mb-6">{error}</p>}

      <div className="grid grid-cols-4 gap-6">
        {animes.map((anime, index) => (
          <AnimeCard
            key={`${anime.id}-${anime.anilistId}`}
            anime={anime}
            icon={getAnimeIcon(index)}
            onClick={() => {
              setDetailAnime(anime);
              setDetailOpen(true);
            }}
            // statusBadge={
            //   isInList(anime.anilistId) && (
            //     <span className="px-2 py-1 bg-emerald-600 text-xs rounded">
            //       In list
            //     </span>
            //   )
            // }
            actionButton={
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  // handleAddClick(anime);
                }}
                // disabled={isInList(anime.anilistId)}
                size="sm"
              >
                {/* {isInList(anime.anilistId) ? "In list" : "+ Add"} */}
              </Button>
            }
          />
        ))}
      </div>

      {/* Infinite Scroll Trigger */}
      {!debouncedQuery && hasMore && (
        <div
          ref={loadMoreRef}
          className="h-20 flex items-center justify-center"
        >
          {loading && <span className="text-slate-400">Loading...</span>}
        </div>
      )}

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

      {/* <AddAnimeDialog
        anime={selectedAnime}
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onAdd={handleAdd}
      />

      <AnimeDetailDialog
        anime={detailAnime}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        isInList={detailAnime ? isInList(detailAnime.anilistId) : false}
        onAdd={handleAddClick}
      /> */}
    </div>
  );
}
