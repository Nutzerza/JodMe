'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Circle, Diamond, Flower, Hexagon } from 'lucide-react';
import { toast } from 'sonner';
import { AddAnimeDialog } from '@/components/AddAnimeDialog';
import { AnimeCard } from '@/components/AnimeCard';
import AnimeDetailDialog from '@/components/AnimeDetailDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Anime, AnimeStatus, UserAnimeEntry } from '@/types/anime';

const PENDING_ANIME_KEY = 'jodme_pending_anime';

function useDebounce<T>(value: T, delay = 400) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

interface Props {
  initialAnime: Anime[];
  initialUserList: UserAnimeEntry[];
  isAuthenticated?: boolean;
}

export default function SearchClient({ initialAnime, initialUserList, isAuthenticated = true }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [page, setPage] = useState(1);
  const [userList, setUserList] = useState<UserAnimeEntry[]>(initialUserList);
  const [hasMore, setHasMore] = useState(true);
  const [detailAnime, setDetailAnime] = useState<Anime | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Anime[]>(Array.isArray(initialAnime) ? initialAnime : []);
  const [loading, setLoading] = useState(false);
  const [selectedAnime, setSelectedAnime] = useState<Anime | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const debouncedQuery = useDebounce(query, 400);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const tickingRef = useRef(false);

  const isInList = useCallback((animeListId: number) => {
    return userList.some(entry => entry.anime.anilistId === animeListId);
  }, [userList]);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    try {
      setLoading(true);
      const nextPage = page + 1;
      const res = await fetch(`/api/anime/list?page=${nextPage}`);
      const data = await res.json();

      if (!Array.isArray(data) || data.length === 0) {
        setHasMore(false);
        return;
      }

      setResults(prev => {
        const ids = new Set(prev.map(a => a.id));
        const filtered = data.filter((a: Anime) => !ids.has(a.id));
        return [...prev, ...filtered];
      });

      setPage(nextPage);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [hasMore, loading, page]);

  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el) return;
    if (!hasMore || query) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !tickingRef.current && !loading) {
          tickingRef.current = true;
          loadMore().finally(() => {
            tickingRef.current = false;
          });
        }
      },
      {
        root: null,
        rootMargin: '200px',
        threshold: 0,
      }
    );

    observer.observe(el);

    return () => observer.disconnect();
  }, [hasMore, query, loading, loadMore]);

  useEffect(() => {
    const controller = new AbortController();

    const fetchSearch = async () => {
      if (!debouncedQuery.trim()) {
        setResults(initialAnime);
        setPage(1);
        setHasMore(true);
        return;
      }

      try {
        setLoading(true);
        const res = await fetch(
          `/api/anime/search?q=${encodeURIComponent(debouncedQuery)}`,
          { signal: controller.signal }
        );
        const data = await res.json();

        setResults(data);
        setHasMore(false);
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') {
          console.error(err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSearch();

    return () => controller.abort();
  }, [debouncedQuery, initialAnime]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const addAnimeId = Number(searchParams.get('add'));
    if (!addAnimeId || dialogOpen) return;

    if (isInList(addAnimeId)) {
      router.replace(pathname, { scroll: false });
      return;
    }

    const animeToAdd = results.find(a => a.anilistId === addAnimeId) ?? getPendingAnime(addAnimeId);

    if (!animeToAdd) return;

    const timer = window.setTimeout(() => {
      setSelectedAnime(animeToAdd);
      setDialogOpen(true);
      clearPendingAnime();
      router.replace(pathname, { scroll: false });
    }, 0);

    return () => window.clearTimeout(timer);
  }, [dialogOpen, isAuthenticated, isInList, pathname, results, router, searchParams]);

  const handleAddClick = (anime: Anime) => {
    if (!isAuthenticated) {
      savePendingAnime(anime);
      router.push(`/auth?callbackUrl=${encodeURIComponent(buildAddCallbackUrl(pathname, searchParams, anime.anilistId))}`);
      return;
    }

    if (isInList(anime.anilistId)) {
      toast.info('This anime is already in your list');
      return;
    }

    setSelectedAnime(anime);
    setDialogOpen(true);
  };

  const handleAdd = async (
    status: AnimeStatus,
    progress: number,
    score: number | null
  ) => {
    if (!selectedAnime) return;

    const title = selectedAnime.title;
    const toastId = toast.loading(`Adding "${title}"...`);

    try {
      const res = await fetch('/api/userList', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          animeListId: selectedAnime.anilistId,
          status,
          progress,
          score,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? 'Failed to add anime');
      }

      const updatedListRes = await fetch('/api/userList');
      const updatedList = await updatedListRes.json();
      setUserList(updatedList);

      toast.success(`Added "${title}"`, { id: toastId });
      setDialogOpen(false);
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : 'Failed to add anime';
      toast.error(message, { id: toastId });
      throw err;
    }
  };

  const getAnimeIcon = (index: number) => {
    const icons = [Circle, Diamond, Hexagon, Flower];
    const Icon = icons[index % icons.length];
    const colors = ['text-blue-400', 'text-purple-400', 'text-emerald-400', 'text-pink-400'];

    return <Icon className={`w-10 h-10 ${colors[index % colors.length]}`} />;
  };

  return (
    <div className="max-w-6xl mx-auto">
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

      {query && (
        <p className="text-sm text-slate-400 mb-6">
          Results for &quot;{query}&quot;
        </p>
      )}

      {loading && (
        <p className="text-center text-slate-400 mb-6">
          Searching...
        </p>
      )}

      <div className="grid grid-cols-4 gap-6">
        {results.map((anime, index) => (
          <AnimeCard
            key={`${anime.id}-${anime.anilistId}`}
            anime={anime}
            icon={getAnimeIcon(index)}
            onClick={() => {
              setDetailAnime(anime);
              setDetailOpen(true);
            }}
            statusBadge={
              isInList(anime.anilistId) && (
                <span className="px-2 py-1 bg-emerald-600 text-xs rounded">
                  In list
                </span>
              )
            }
            actionButton={
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddClick(anime);
                }}
                disabled={isInList(anime.anilistId)}
                size="sm"
              >
                {isInList(anime.anilistId) ? 'In list' : '+ Add'}
              </Button>
            }
          />
        ))}
      </div>

      {!query && hasMore && (
        <div ref={loadMoreRef} className="h-20 flex items-center justify-center">
          {loading && <span className="text-slate-400">Loading...</span>}
        </div>
      )}

      {results.length === 0 && query && !loading && (
        <div className="text-center py-12 text-slate-400">
          No results found
        </div>
      )}

      {!query && (
        <div className="text-center py-12 text-slate-400">
          Start typing to search anime
        </div>
      )}

      <AddAnimeDialog
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
      />
    </div>
  );
}

function buildAddCallbackUrl(pathname: string, searchParams: URLSearchParams, anilistId: number) {
  const params = new URLSearchParams(searchParams.toString());
  params.set('add', String(anilistId));
  return `${pathname}?${params.toString()}`;
}

function savePendingAnime(anime: Anime) {
  sessionStorage.setItem(PENDING_ANIME_KEY, JSON.stringify(anime));
}

function getPendingAnime(anilistId: number) {
  const raw = sessionStorage.getItem(PENDING_ANIME_KEY);
  if (!raw) return null;

  try {
    const anime = JSON.parse(raw) as Anime;
    return anime.anilistId === anilistId ? anime : null;
  } catch {
    return null;
  }
}

function clearPendingAnime() {
  sessionStorage.removeItem(PENDING_ANIME_KEY);
}
