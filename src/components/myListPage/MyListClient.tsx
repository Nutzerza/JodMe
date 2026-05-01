'use client';

import { useState, useMemo } from 'react';
import { AnimeStatus, UserAnimeEntry } from '@/types/anime';
import { StatusSidebar } from '@/components/StatusSidebar';
import { AnimeListItem } from '@/components/AnimeCard';

export default function MyListClient({ initialList }: { initialList: UserAnimeEntry[] }) {
    const [animeList] = useState<UserAnimeEntry[]>(initialList);
    const [activeStatus, setActiveStatus] = useState<AnimeStatus | 'all'>('all');
    const [sortBy, setSortBy] = useState<'dateAdded' | 'score' | 'title'>('dateAdded');

    // ✅ stats
    const stats = useMemo(() => {
        const totalAnime = animeList.length;
        const episodesWatched = animeList.reduce((sum, e) => sum + e.progress, 0);
        const avgScore =
            animeList.filter(e => e.score !== null).reduce((sum, e) => sum + (e.score || 0), 0) /
            (animeList.filter(e => e.score !== null).length || 1);

        return {
            totalAnime,
            episodesWatched,
            avgScore: avgScore.toFixed(1),
        };
    }, [animeList]);

    // ✅ status count
    // const statusCounts = useMemo(() => {
    //     return [
    //         { status: 'all', label: 'All', count: animeList.length },
    //         { status: 'watching', label: 'Watching', count: animeList.filter(e => e.status === 'watching').length },
    //         { status: 'completed', label: 'Completed', count: animeList.filter(e => e.status === 'completed').length },
    //         { status: 'on_hold', label: 'On Hold', count: animeList.filter(e => e.status === 'on_hold').length },
    //         { status: 'dropped', label: 'Dropped', count: animeList.filter(e => e.status === 'dropped').length },
    //         { status: 'plan_to_watch', label: 'Plan', count: animeList.filter(e => e.status === 'plan_to_watch').length },
    //     ];
    // }, [animeList]);

    const statusCounts = [
        { status: 'all' as const, label: 'All', count: animeList.length },
        { status: 'watching' as const, label: 'Watching', count: animeList.filter(e => e.status === 'watching').length },
        { status: 'completed' as const, label: 'Completed', count: animeList.filter(e => e.status === 'completed').length },
    ];

    // ✅ filter + sort
    const filtered = useMemo(() => {
        let list =
            activeStatus === 'all'
                ? animeList
                : animeList.filter(e => e.status === activeStatus);

        return [...list].sort((a, b) => {
            if (sortBy === 'score') return (b.score || 0) - (a.score || 0);
            if (sortBy === 'title') return a.anime.title.localeCompare(b.anime.title);
            return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
        });
    }, [animeList, activeStatus, sortBy]);

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
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

function Stat({ label, value }: any) {
    return (
        <div className="bg-slate-800/40 p-4 rounded">
            <div className="text-xs text-slate-400">{label}</div>
            <div className="text-xl font-bold">{value}</div>
        </div>
    );
}