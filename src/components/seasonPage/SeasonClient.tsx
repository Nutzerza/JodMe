'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight, Circle, Diamond, Hexagon, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { AddAnimeDialog } from '@/components/AddAnimeDialog';
import { AnimeCard } from '@/components/AnimeCard';
import AnimeDetailDialog from '@/components/AnimeDetailDialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Anime, AnimeStatus, UserAnimeEntry } from '@/types/anime';
import { getNextSeason, getPrevSeason, seasons } from '@/utils/seasonUtils';

const PENDING_ANIME_KEY = 'jodme_pending_anime';

interface Props {
  initialAnime: Anime[];
  initialUserList: UserAnimeEntry[];
  initialSeason: typeof seasons[number];
  initialYear: number;
  isAuthenticated?: boolean;
}

export default function SeasonClient({
  initialAnime,
  initialUserList,
  initialSeason,
  initialYear,
  isAuthenticated = true,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [season, setSeason] = useState<typeof seasons[number]>(initialSeason);
  const [year, setYear] = useState(initialYear);
  const [anime, setAnime] = useState<Anime[]>(initialAnime);
  const [loading, setLoading] = useState(false);
  const [detailAnime, setDetailAnime] = useState<Anime | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [filter, setFilter] = useState('all');
  const [userList, setUserList] = useState<UserAnimeEntry[]>(initialUserList);
  const [selectedAnime, setSelectedAnime] = useState<Anime | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (season === initialSeason && year === initialYear) return;

    const fetchSeason = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/anime/season?season=${season}&year=${year}`);
        const data = await res.json();
        setAnime(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSeason();
  }, [season, year, initialSeason, initialYear]);

  const filtered = useMemo(() => {
    if (filter === 'all') return anime;

    return anime.filter(a =>
      a.genres?.some(g => g.toLowerCase() === filter)
    );
  }, [filter, anime]);

  const isInList = useCallback((animeListId: number) => {
    return userList.some(entry => entry.anime.anilistId === animeListId);
  }, [userList]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const addAnimeId = Number(searchParams.get('add'));
    if (!addAnimeId || dialogOpen) return;

    if (isInList(addAnimeId)) {
      router.replace(pathname, { scroll: false });
      return;
    }

    const animeToAdd = anime.find(a => a.anilistId === addAnimeId) ?? getPendingAnime(addAnimeId);

    if (!animeToAdd) return;

    const timer = window.setTimeout(() => {
      setSelectedAnime(animeToAdd);
      setDialogOpen(true);
      clearPendingAnime();
      router.replace(pathname, { scroll: false });
    }, 0);

    return () => window.clearTimeout(timer);
  }, [anime, dialogOpen, isAuthenticated, isInList, pathname, router, searchParams]);

  const handleAddClick = (animeItem: Anime) => {
    if (!isAuthenticated) {
      savePendingAnime(animeItem);
      router.push(`/auth?callbackUrl=${encodeURIComponent(buildAddCallbackUrl(pathname, searchParams, animeItem.anilistId))}`);
      return;
    }

    if (isInList(animeItem.anilistId)) {
      toast.info('This anime is already in your list');
      return;
    }

    setSelectedAnime(animeItem);
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
      const res = await fetch('/api/userList/list', {
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

      const updatedListRes = await fetch('/api/userList/list');
      const updatedList = await updatedListRes.json();
      setUserList(updatedList.data ?? []);

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
    const icons = [Sparkles, Circle, Diamond, Hexagon];
    const Icon = icons[index % icons.length];
    const colors = ['text-emerald-400', 'text-purple-400', 'text-amber-400', 'text-blue-400'];

    return <Icon className={`w-10 h-10 ${colors[index % colors.length]}`} />;
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            const prev = getPrevSeason(season, year);
            setSeason(prev.season);
            setYear(prev.year);
          }}
        >
          <ChevronLeft />
        </Button>

        <h1 className="text-2xl font-bold">
          {season} {year}
        </h1>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            const next = getNextSeason(season, year);
            setSeason(next.season);
            setYear(next.year);
          }}
        >
          <ChevronRight />
        </Button>

        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[180px] ml-auto">
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

      {loading && (
        <p className="text-center text-slate-400 mb-6">
          Loading season...
        </p>
      )}

      <div className="grid grid-cols-4 gap-6">
        {filtered.map((animeItem, index) => (
          <AnimeCard
            key={`${animeItem.id}-${animeItem.anilistId}`}
            anime={animeItem}
            icon={getAnimeIcon(index)}
            statusBadge={
              isInList(animeItem.anilistId) && (
                <span className="px-2 py-1 bg-emerald-600 text-xs rounded">
                  In list
                </span>
              )
            }
            onClick={() => {
              setDetailAnime(animeItem);
              setDetailOpen(true);
            }}
            actionButton={
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddClick(animeItem);
                }}
                size="sm"
                disabled={isInList(animeItem.anilistId)}
              >
                {isInList(animeItem.anilistId) ? 'In list' : '+ Add'}
              </Button>
            }
          />
        ))}
      </div>

      <AddAnimeDialog
        anime={selectedAnime}
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onAdd={handleAdd}
      />

      <AnimeDetailDialog
        anime={detailAnime}
        open={detailOpen}
        isInList={detailAnime ? isInList(detailAnime.anilistId) : false}
        onClose={() => setDetailOpen(false)}
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
