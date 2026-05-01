'use client';

import { useState, useMemo, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, Circle, Diamond, Hexagon } from 'lucide-react';
import { Anime, AnimeStatus } from '@/types/anime';
import { AnimeCard } from '@/components/AnimeCard';
import { Button } from '@/components/ui/button';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { toast } from 'sonner';
import { getAnimeList, addAnimeToList } from '@/utils/storage';

interface Props {
    initialAnime: Anime[];
}

export default function SeasonClient({ initialAnime }: Props) {
    const [season, setSeason] = useState('Winter 2024');
    const [filter, setFilter] = useState('all');
    const [userList, setUserList] = useState<any[]>([]);

    useEffect(() => {
        setUserList(getAnimeList());
    }, []);

    // ✅ filter type (tv/movie/ona)
    const filtered = useMemo(() => {
        if (filter === 'all') return initialAnime;
        return initialAnime.filter(a => a.genres.includes(filter));
    }, [filter, initialAnime]);

    const isInList = (animeId: number) => {
        return userList.some(entry => entry.anime.id === animeId);
    };

    const getStatusInList = (animeId: number): AnimeStatus | null => {
        const entry = userList.find(e => e.anime.id === animeId);
        return entry?.status || null;
    };

    const handleQuickAdd = (animeId: number) => {
        const anime = initialAnime.find(a => a.id === animeId);
        if (!anime) return;

        if (isInList(animeId)) {
            toast.info('Already in your list');
            return;
        }

        const success = addAnimeToList({
            anime,
            status: 'plan_to_watch',
            progress: 0,
            score: null,
            dateAdded: new Date().toISOString(),
        });

        if (success) {
            toast.success('Added to Plan to Watch');
            setUserList(getAnimeList());
        }
    };

    const getAnimeIcon = (index: number) => {
        const icons = [Sparkles, Circle, Diamond, Hexagon];
        const Icon = icons[index % icons.length];
        const colors = ['text-emerald-400', 'text-purple-400', 'text-amber-400', 'text-blue-400'];

        return <Icon className={`w-10 h-10 ${colors[index % colors.length]}`} />;
    };

    const getStatusBadge = (animeId: number) => {
        const status = getStatusInList(animeId);
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

    return (
        <div className="max-w-6xl mx-auto">
            {/* Season Header */}
            <div className="flex items-center gap-4 mb-8">
                <Button variant="ghost" size="icon">
                    <ChevronLeft />
                </Button>

                <h1 className="text-2xl font-bold">{season}</h1>

                <Button variant="ghost" size="icon">
                    <ChevronRight />
                </Button>

                <Select value={filter} onValueChange={setFilter}>
                    <SelectTrigger className="w-[180px] ml-auto">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="tv">TV</SelectItem>
                        <SelectItem value="movie">Movies</SelectItem>
                        <SelectItem value="ona">ONA</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-4 gap-6">
                {filtered.map((anime, index) => (
                    <AnimeCard
                        key={anime.id}
                        anime={anime}
                        icon={getAnimeIcon(index)}
                        statusBadge={getStatusBadge(anime.id)}
                        actionButton={
                            <Button
                                onClick={() => handleQuickAdd(anime.id)}
                                size="sm"
                                disabled={isInList(anime.id)}
                            >
                                {isInList(anime.id) ? 'In list' : '+ Add'}
                            </Button>
                        }
                    />
                ))}
            </div>
        </div>
    );
}