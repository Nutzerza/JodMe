// This is a client component for the search page. It handles searching, pagination, and adding anime to the user's list.
'use client';

import { useState, useEffect } from 'react';
import { Circle, Diamond, Hexagon, Flower } from 'lucide-react';
import { Anime, AnimeStatus, UserAnimeEntry } from '@/types/anime';
import { AnimeCard } from '@/components/AnimeCard';
import { AddAnimeDialog } from '@/components/AddAnimeDialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useRef } from 'react';
import AnimeDetailDialog from '@/components/AnimeDetailDialog';

// 🔥 debounce hook (inline ใช้ได้เลย)
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
  initialUserList: UserAnimeEntry[]; // สำหรับเช็คว่า anime ไหนอยู่ใน list แล้วบ้าง (optional, ถ้าไม่ให้ถือว่าไม่มีตัวไหนอยู่)
}

export default function SearchClient({ initialAnime, initialUserList }: Props) {
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
  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el) return;
    if (!hasMore || query) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          !tickingRef.current &&
          !loading
        ) {
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
  }, [hasMore, query, loading]);

  useEffect(() => {
    setUserList(Array.isArray(initialUserList) ? initialUserList : []);
  }, [initialUserList]);
  const loadMore = async () => {
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
  };

  useEffect(() => {
    setResults(Array.isArray(initialAnime) ? initialAnime : []);
  }, [initialAnime]);

  // search จาก API
  useEffect(() => {
    const controller = new AbortController();

    const fetchSearch = async () => {
      if (!debouncedQuery.trim()) {
        // reset กลับ pagination mode
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
        setHasMore(false); // search ไม่มี load more

      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error(err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSearch();

    return () => controller.abort();
  }, [debouncedQuery]);

  const isInList = (animeListId: number) => {
    return userList.some(entry => entry.anime.anilistId === animeListId);
  };

  const handleAddClick = (anime: Anime) => {
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
      const message =
        err instanceof Error ? err.message : 'Failed to add anime';
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

  const handleOpenDetail = (anime: Anime) => {
    setDetailAnime(anime);
    setDetailOpen(true);
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Search */}
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

      {/* Label */}
      {query && (
        <p className="text-sm text-slate-400 mb-6">
          Results for "{query}"
        </p>
      )}

      {/* Loading */}
      {loading && (
        <p className="text-center text-slate-400 mb-6">
          Searching...
        </p>
      )}

      {/* Grid */}
      <div className="grid grid-cols-4 gap-6">
        {results.map((anime, index) => (
          <AnimeCard
            key={`${anime.id}-${anime.anilistId}`}
            anime={anime}
            icon={getAnimeIcon(index)}
            onClick={() => handleOpenDetail(anime)}
            statusBadge={
              isInList(anime.anilistId) && (
                <span className="px-2 py-1 bg-emerald-600 text-xs rounded">
                  ✓ In list
                </span>
              )
            }
            actionButton={
              <Button
                onClick={(e) => {
                  e.stopPropagation(); // ✅ กันไม่ให้ไป trigger card
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

      {/* Empty */}
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

      {/* Dialog */}
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
