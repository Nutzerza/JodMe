'use client';

import { useState, useMemo } from 'react';
import { AnimeStatus, UserAnimeEntry } from '@/types/anime';
import { StatusSidebar } from '@/components/StatusSidebar';
import { AnimeListItem } from '@/components/AnimeCard';

type UpdatePayload = {
  progress?: number;
  status?: AnimeStatus;
  score?: number | null;
};

export default function MyListClient({ initialList }: { initialList: UserAnimeEntry[] }) {
  const [animeList, setAnimeList] = useState<UserAnimeEntry[]>(initialList);
  const [activeStatus, setActiveStatus] = useState<AnimeStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<'dateAdded' | 'score' | 'title'>('dateAdded');

  // ✅ stats
  const stats = useMemo(() => {
    const totalAnime = animeList.length;

    const episodesWatched = animeList.reduce(
      (sum, e) => sum + e.progress,
      0
    );

    const scored = animeList.filter(e => e.score !== null);

    const avgScore =
      scored.length > 0
        ? scored.reduce((sum, e) => sum + e.score!, 0) / scored.length
        : 0;

    return {
      totalAnime,
      episodesWatched,
      avgScore: avgScore.toFixed(1),
    };
  }, [animeList]);

  // ✅ status count
  const statusCounts = [
    { status: 'all' as const, label: 'All', count: animeList.length },
    { status: 'watching' as const, label: 'Watching', count: animeList.filter(e => e.status === 'watching').length },
    { status: 'completed' as const, label: 'Completed', count: animeList.filter(e => e.status === 'completed').length },
    { status: 'on_hold' as const, label: 'On Hold', count: animeList.filter(e => e.status === 'on_hold').length },
    { status: 'dropped' as const, label: 'Dropped', count: animeList.filter(e => e.status === 'dropped').length },
    { status: 'plan_to_watch' as const, label: 'Plan', count: animeList.filter(e => e.status === 'plan_to_watch').length },
  ];

  // ✅ filter + sort
  const filtered = useMemo(() => {
    const list =
      activeStatus === 'all'
        ? animeList
        : animeList.filter(e => e.status === activeStatus);

    return [...list].sort((a, b) => {
      if (sortBy === 'score') return (b.score ?? 0) - (a.score ?? 0);
      if (sortBy === 'title') return a.anime.title.localeCompare(b.anime.title);
      return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
    });
  }, [animeList, activeStatus, sortBy]);

  // FIXED handler
  const handleUpdate = async (animeId: string, data: UpdatePayload) => {
    // เก็บ state เก่าไว้ rollback
    let prevState: UserAnimeEntry[] = [];

    setAnimeList(prev => {
      prevState = prev;

      return prev.map(e =>
        e.anime.id === animeId
          ? { ...e, ...data }
          : e
      );
    });

    try {
      const res = await fetch('/api/userList', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          animeId,
          ...data,
        }),
      });

      if (!res.ok) {
        throw new Error('API failed');
      }

    } catch (err) {
      console.error(err);

      // 🔥 rollback ถ้า fail
      setAnimeList(prevState);
    }
  };

  return (
    <div className="flex gap-8">
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
          <Stat label="Total" value={stats.totalAnime} />
          <Stat label="Episodes" value={stats.episodesWatched} />
          <Stat label="Avg Score" value={stats.avgScore} />
        </div>

        {/* List */}
        <div className="flex flex-col gap-3">
          {filtered.map((entry) => (
            <AnimeListItem
              key={entry.anime.id}
              anime={entry.anime}
              progress={entry.progress}
              score={entry.score}
              status={entry.status}
              onUpdate={(data) => handleUpdate(entry.anime.id, data)}
            />
          ))}
        </div>
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