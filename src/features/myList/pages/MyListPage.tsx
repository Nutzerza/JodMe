// Client component for the user's anime list
"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { StatusSidebar } from "@/features/myList/components/StatusSidebar";
import { AnimeListSkeleton } from "@/features/myList/components/skeletons/AnimeListSkeleton";
import { AnimeListItem } from "@/shared/components/AnimeListItem";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { useDebounce } from "@/shared/hooks/useDebounce";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/shared/components/ui/pagination";
import { AnimeStatus, UserAnimeEntry } from "@/types/anime";
import type { StatusCount } from "@/types/anime";

type UpdatePayload = {
  progress?: number;
  status?: AnimeStatus;
  score?: number | null;
};

export function MyListClient() {
  // const [animeList, setAnimeList] = useState<UserAnimeEntry[]>(initialList);
  const [activeStatus, setActiveStatus] = useState<AnimeStatus | "all">("all");
  const [refreshKey, setRefreshKey] = useState(0);
  const [sortBy, setSortBy] = useState<
    "updatedAt" | "dateAdded" | "score" | "title"
  >("updatedAt");
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 400);
  const [results, setResults] = useState<UserAnimeEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({
    totalEntries: 0,
    totalProgress: 0,
    averageScore: 0,
  });
  const [statusCounts, setStatusCounts] = useState<StatusCount[]>([
    { status: "all", label: "All", count: 0 },
    { status: "watching", label: "Watching", count: 0 },
    { status: "completed", label: "Completed", count: 0 },
    { status: "on_hold", label: "On Hold", count: 0 },
    { status: "dropped", label: "Dropped", count: 0 },
    { status: "plan_to_watch", label: "Plan", count: 0 },
  ]);

  useEffect(() => {
    const controller = new AbortController();

    const fetchData = async () => {
      try {
        setLoading(true);

        const params = new URLSearchParams({
          page: String(page),
          limit: "10",
          q: debouncedQuery,
          status: activeStatus,
          sort: sortBy,
        });

        const res = await fetch(`/api/userList/search?${params}`, {
          signal: controller.signal,
        });

        const data = await res.json();

        setResults(data.data);
        setTotalPages(data.meta.totalPages);
        setStats(data.stats);
      } catch (err) {
        if (err instanceof Error && err.name !== "AbortError") {
          console.error(err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    return () => controller.abort();
  }, [page, debouncedQuery, sortBy, activeStatus, refreshKey]);

  useEffect(() => {
    const controller = new AbortController();

    const fetchData = async () => {
      try {
        const res = await fetch(`/api/userList/statCount`, {
          signal: controller.signal,
        });

        const data = await res.json();

        const formattedData: StatusCount[] = [
          {
            status: "all",
            label: "All",
            count:
              data.watching +
              data.completed +
              data.on_hold +
              data.dropped +
              data.plan_to_watch,
          },
          { status: "watching", label: "Watching", count: data.watching },
          { status: "completed", label: "Completed", count: data.completed },
          { status: "on_hold", label: "On Hold", count: data.on_hold },
          { status: "dropped", label: "Dropped", count: data.dropped },
          { status: "plan_to_watch", label: "Plan", count: data.plan_to_watch },
        ];
        setStatusCounts(formattedData);
      } catch (err) {
        if (err instanceof Error && err.name !== "AbortError") {
          console.error(err);
        }
      }
    };

    fetchData();

    return () => controller.abort();
  }, [refreshKey]);

  useEffect(() => {
    function resetPage() {
      setPage(1);
    }
    resetPage();
  }, [debouncedQuery, activeStatus, sortBy]);

  const handleUpdate = async (animeId: number, data: UpdatePayload) => {
    const prevState = results;

    setResults((prev) =>
      prev.map((e) => (e.anime.id === animeId ? { ...e, ...data } : e)),
    );

    try {
      const res = await fetch("/api/userList/list", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          animeId,
          ...data,
        }),
      });

      if (!res.ok) {
        throw new Error("API failed");
      }

      toast.success("Updated successfully");
    } catch (err) {
      console.error(err);
      setResults(prevState);
      toast.error("Failed to update");
    }
  };

  const handleRemove = async (id: number, title: string) => {
    const prevState = results;
    const toastId = toast.loading(`Removing "${title}"...`);

    try {
      const res = await fetch(`/api/userList/list?id=${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to remove");
      }
      setResults((prev) => prev.filter((e) => e.anime.id !== id));

      setRefreshKey((prev) => prev + 1);
      toast.success(`Removed "${title}"`, { id: toastId });
    } catch (err) {
      console.error(err);
      setResults(prevState);
      const message = err instanceof Error ? err.message : "Failed to remove";
      toast.error(message, { id: toastId });
    }
  };

  return (
    <div className="flex gap-8 w-full">
      <StatusSidebar
        statusCounts={statusCounts}
        activeStatus={activeStatus}
        onStatusChange={setActiveStatus}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />

      <div className="flex-1">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Stat label="Total" value={stats.totalEntries} />
          <Stat label="Episodes" value={stats.totalProgress} />
          <Stat label="Avg Score" value={stats.averageScore} />
        </div>

        {/* Search Bar */}
        <div className="flex gap-3 mb-8">
          <Input
            placeholder="Search anime title..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-slate-800 border-slate-700 h-12 text-base"
          />
          <Button className="bg-purple-600 px-8 h-12">Search</Button>
        </div>

        {/* Anime List */}
        {loading ? (
          <AnimeListSkeleton />
        ) : (
          <div className="flex flex-col gap-3">
            {results.map((entry) => (
              <AnimeListItem
                key={entry.anime.id}
                anime={entry.anime}
                progress={entry.progress}
                score={entry.score}
                status={entry.status}
                onUpdate={(data) => handleUpdate(entry.anime.id, data)}
                onRemove={() => handleRemove(entry.anime.id, entry.anime.title)}
              />
            ))}
          </div>
        )}

        {results.length === 0 && query && !loading && (
          <div className="text-center py-12 text-slate-400">
            No results found
          </div>
        )}

        {totalPages > 1 && (
          <Pagination className="mt-4">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (page > 1) setPage(page - 1);
                  }}
                />
              </PaginationItem>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <PaginationItem key={p}>
                  <PaginationLink
                    href="#"
                    isActive={p === page}
                    onClick={(e) => {
                      e.preventDefault();
                      setPage(p);
                    }}
                    className={
                      p === page
                        ? "bg-purple-600! text-white! hover:bg-purple-700! hover:text-white!"
                        : "text-slate-400 hover:bg-slate-800 hover:text-white"
                    }
                  >
                    {p}
                  </PaginationLink>
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (page < totalPages) setPage(page + 1);
                  }}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-slate-800/40 p-4 rounded">
      <div className="text-xs text-slate-400">{label}</div>
      <div className="text-xl font-bold">{value}</div>
    </div>
  );
}
