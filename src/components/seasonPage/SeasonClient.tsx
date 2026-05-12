'use client';

import { useState, useMemo, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, Circle, Diamond, Hexagon } from 'lucide-react';
import { Anime, AnimeStatus, UserAnimeEntry } from '@/types/anime';
import { AnimeCard } from '@/components/AnimeCard';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { toast } from 'sonner';
import AnimeDetailDialog from '@/components/AnimeDetailDialog';
import { AddAnimeDialog } from '../AddAnimeDialog';

interface Props {
  initialAnime: Anime[];
  initialUserList: UserAnimeEntry[];
}

// 🔥 season helpers
const seasons = ['WINTER', 'SPRING', 'SUMMER', 'FALL'] as const;

function getNextSeason(season: string, year: number) {
  const i = seasons.indexOf(season as any);
  if (i === 3) return { season: seasons[0], year: year + 1 };
  return { season: seasons[i + 1], year };
}

function getPrevSeason(season: string, year: number) {
  const i = seasons.indexOf(season as any);
  if (i === 0) return { season: seasons[3], year: year - 1 };
  return { season: seasons[i - 1], year };
}

export default function SeasonClient({ initialAnime, initialUserList }: Props) {
  const [season, setSeason] = useState<typeof seasons[number]>('SPRING');
  const [year, setYear] = useState(new Date().getFullYear());
  const [anime, setAnime] = useState<Anime[]>(initialAnime);
  const [loading, setLoading] = useState(false);

  const [detailAnime, setDetailAnime] = useState<Anime | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const [filter, setFilter] = useState('all'); // ✅ FIX
  const [userList, setUserList] = useState<UserAnimeEntry[]>(initialUserList);

  const [selectedAnime, setSelectedAnime] = useState<Anime | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // 🔥 fetch season
  useEffect(() => {
    const fetchSeason = async () => {
      try {
        setLoading(true);

        const res = await fetch(
          `/api/anime/season?season=${season}&year=${year}`
        );

        const data = await res.json();

        if (Array.isArray(data)) {
          setAnime(data);
        } else {
          console.error('Invalid data:', data);
          setAnime([]);
        }

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSeason();
  }, [season, year]);

  useEffect(() => {
    setUserList(initialUserList);
  }, [initialUserList]);

  // 🔥 filter
  const filtered = useMemo(() => {
    if (filter === 'all') return anime;

    // ⚠️ ปัจจุบันคุณใช้ genres เป็น filter (ยังไม่ถูกจริง)
    return anime.filter(a =>
      a.genres?.some(g => g.toLowerCase() === filter)
    );
  }, [filter, anime]);

  const isInList = (animeListId: number) => {
    return userList.some(entry => entry.anime.anilistId === animeListId);
  };

  const getStatusInList = (animeListId: number): AnimeStatus | null => {
    const entry = userList.find(e => e.anime.anilistId === animeListId);
    return entry?.status || null;
  };

  const getAnimeIcon = (index: number) => {
    const icons = [Sparkles, Circle, Diamond, Hexagon];
    const Icon = icons[index % icons.length];
    const colors = ['text-emerald-400', 'text-purple-400', 'text-amber-400', 'text-blue-400'];

    return <Icon className={`w-10 h-10 ${colors[index % colors.length]}`} />;
  };

  const handleAddClick = (anime: Anime) => {
    if (isInList(anime.anilistId)) {
      toast.info('This anime is already in your list');
      return;
    }
    setSelectedAnime(anime);
    setDialogOpen(true);
  };
  const getStatusBadge = (animeListId: number) => {
    const status = getStatusInList(animeListId);
    if (!status) return null;

    const labels: Record<string, string> = {
      watching: '✓ Watching',
      completed: '✓ Completed',
      on_hold: '⏸ On hold',
      dropped: '✗ Dropped',
      plan_to_watch: '📌 Plan to watch',
    };

    const colors: Record<string, string> = {
      watching: 'bg-blue-600',
      completed: 'bg-emerald-600',
      on_hold: 'bg-amber-600',
      dropped: 'bg-red-600',
      plan_to_watch: 'bg-purple-600',
    };

    return (
      <span className={`px-2 py-1 ${colors[status]} text-white text-xs rounded`}>
        {labels[status]}
      </span>
    );
  };

  const handleAdd = async (
    status: AnimeStatus,
    progress: number,
    score: number | null
  ) => {
    if (!selectedAnime) return;

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

      if (!res.ok) throw new Error();

      toast.success(`Added "${selectedAnime.title}"`);

      setDialogOpen(false);

      // refetch list ใหม่
      const updatedListRes = await fetch('/api/userList');
      const updatedList = await updatedListRes.json();
      setUserList(updatedList);
      
    } catch (err) {
      console.error(err);
      toast.error('Failed to add anime');
    }
  };

  const handleOpenDetail = (anime: Anime) => {
    setDetailAnime(anime);
    setDetailOpen(true);
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
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

      {/* Loading */}
      {loading && (
        <p className="text-center text-slate-400 mb-6">
          Loading season...
        </p>
      )}

      {/* Grid */}
      <div className="grid grid-cols-4 gap-6">
        {filtered.map((anime, index) => (
          <AnimeCard
            key={anime.id}
            anime={anime}
            icon={getAnimeIcon(index)}
            statusBadge={
              isInList(anime.anilistId) && (
                <span className="px-2 py-1 bg-emerald-600 text-xs rounded">
                  ✓ In list
                </span>
              )}
            onClick={() => handleOpenDetail(anime)}
            actionButton={
              <Button
                onClick={(e) => {
                  e.stopPropagation(); // ✅ กันไม่ให้ไป trigger card
                  handleAddClick(anime);
                }}
                size="sm"
                disabled={isInList(anime.anilistId)}
              >
                {isInList(anime.anilistId) ? 'In list' : '+ Add'}
              </Button>
            }
          />
        ))}
      </div>

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
        isInList={detailAnime ? isInList(detailAnime.anilistId) : false}
        onClose={() => setDetailOpen(false)}
        onAdd={handleAddClick}
      />
    </div>
  );
}