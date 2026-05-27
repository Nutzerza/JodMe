'use client';

import { useState, useMemo, useEffect } from 'react';
import { toast } from 'sonner';
import { AnimeStatus, UserAnimeEntry } from '@/types/anime';
import { StatusSidebar } from '@/components/StatusSidebar';
import { AnimeListSkeleton } from '@/components/skeletons/AnimeListSkeleton';
import { AnimeListItem } from '@/components/AnimeCard';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { useDebounce } from '@/hooks/useDebounce';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

type UpdatePayload = {
  progress?: number;
  status?: AnimeStatus;
  score?: number | null;
};

export default function MyListClient() {
  // const [animeList, setAnimeList] = useState<UserAnimeEntry[]>(initialList);
  const [activeStatus, setActiveStatus] = useState<AnimeStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<'updatedAt' | 'dateAdded' | 'score' | 'title'>('updatedAt');
  const [query, setQuery] = useState('');
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

  useEffect(() => {
    const controller = new AbortController();

    const fetchData = async () => {
      try {
        setLoading(true);

        const params = new URLSearchParams({
          page: String(page),
          limit: '10',
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
        if (err instanceof Error && err.name !== 'AbortError') {
          console.error(err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    return () => controller.abort();
  }, [page, debouncedQuery, sortBy, activeStatus]);

  useEffect(() => {
    setPage(1);
  }, [debouncedQuery, activeStatus, sortBy]);

  const handleUpdate = async (animeListId: number, data: UpdatePayload) => {
    const prevState = results;

    setResults((prev) =>
      prev.map((e) =>
        e.anime.anilistId === animeListId ? { ...e, ...data } : e
      )
    );

    try {
      const res = await fetch('/api/userList/list', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          animeListId,
          ...data,
        }),
      });

      if (!res.ok) {
        throw new Error('API failed');
      }
    } catch (err) {
      console.error(err);
      setResults(prevState);
      toast.error('Failed to update');
    }
  };

  const handleRemove = async (animeListId: number, title: string) => {
    const prevState = results;
    const toastId = toast.loading(`Removing "${title}"...`);

    setResults((prev) => prev.filter((e) => e.anime.anilistId !== animeListId));

    try {
      const res = await fetch(
        `/api/userList/list?animeListId=${animeListId}`,
        { method: 'DELETE' }
      );

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? 'Failed to remove');
      }

      toast.success(`Removed "${title}"`, { id: toastId });
    } catch (err) {
      console.error(err);
      setResults(prevState);
      const message =
        err instanceof Error ? err.message : 'Failed to remove';
      toast.error(message, { id: toastId });
    }
  };

  return (
    <div className="flex gap-8">
      <StatusSidebar
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

        <div className="flex gap-3 mb-8">
          <Input
            placeholder="Search anime title..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-slate-800 border-slate-700 h-12 text-base"
          />
          <Button className="bg-purple-600 px-8 h-12">
            Search
          </Button>
        </div>

        {/* List */}
        {
          loading ? (
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
                  onUpdate={(data) => handleUpdate(entry.anime.anilistId, data)}
                  onRemove={() => handleRemove(entry.anime.anilistId, entry.anime.title)}
                />
              ))}
            </div>
          )
        }

        {results.length === 0 && query && !loading && (
          <div className="text-center py-12 text-slate-400">
            No results found
          </div>
        )}

        {totalPages > 1 && (
          <Pagination>
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

function Stat({ label, value }: { label: string; value: any }) {
  return (
    <div className="bg-slate-800/40 p-4 rounded">
      <div className="text-xs text-slate-400">{label}</div>
      <div className="text-xl font-bold">{value}</div>
    </div>
  );
}