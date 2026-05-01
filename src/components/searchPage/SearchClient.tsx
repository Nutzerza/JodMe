'use client';

import { useState, useMemo } from 'react';
import { Circle, Diamond, Hexagon, Flower } from 'lucide-react';
import { Anime, AnimeStatus } from '@/types/anime';
import { AnimeCard } from '@/components/AnimeCard';
import { AddAnimeDialog } from '@/components/AddAnimeDialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { getAnimeList, addAnimeToList } from '@/utils/storage';

interface Props {
    initialAnime: Anime[];
}

export default function SearchClient({ initialAnime }: Props) {
    const [query, setQuery] = useState('');
    const [selectedAnime, setSelectedAnime] = useState<Anime | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [userList, setUserList] = useState(getAnimeList());

    // ✅ realtime search (ไม่ต้องกดปุ่มก็ได้)
    const results = useMemo(() => {
        if (!query.trim()) return [];

        return initialAnime.filter(anime =>
            anime.title.toLowerCase().includes(query.toLowerCase()) ||
            anime.genres.some(g => g.toLowerCase().includes(query.toLowerCase()))
        );
    }, [query, initialAnime]);

    const isInList = (animeId: number) => {
        return userList.some(entry => entry.anime.id === animeId);
    };

    const handleAddClick = (anime: Anime) => {
        if (isInList(anime.id)) {
            toast.info('This anime is already in your list');
            return;
        }
        setSelectedAnime(anime);
        setDialogOpen(true);
    };

    const handleAdd = (status: AnimeStatus, progress: number, score: number | null) => {
        if (!selectedAnime) return;

        const success = addAnimeToList({
            anime: selectedAnime,
            status,
            progress,
            score,
            dateAdded: new Date().toISOString(),
        });

        if (success) {
            toast.success(`Added "${selectedAnime.title}"`);
            setUserList(getAnimeList()); // ✅ refresh state
            setDialogOpen(false);
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
            {/* Search */}
            <div className="flex gap-3 mb-8">
                <Input
                    placeholder="Search anime title..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="flex-1 bg-slate-800 border-slate-700 h-12 text-base"
                />
                <Button className="bg-purple-600 px-8">
                    Search
                </Button>
            </div>

            {/* Result label */}
            {query && (
                <p className="text-sm text-slate-400 mb-6">
                    Results for "{query}"
                </p>
            )}

            {/* Grid */}
            <div className="grid grid-cols-4 gap-6">
                {results.map((anime, index) => (
                    <AnimeCard
                        key={anime.id}
                        anime={anime}
                        icon={getAnimeIcon(index)}
                        statusBadge={
                            isInList(anime.id) && (
                                <span className="px-2 py-1 bg-emerald-600 text-xs rounded">
                                    ✓ In list
                                </span>
                            )
                        }
                        actionButton={
                            <Button
                                onClick={() => handleAddClick(anime)}
                                variant={isInList(anime.id) ? 'outline' : 'default'}
                                size="sm"
                            >
                                {isInList(anime.id) ? 'In list' : '+ Add'}
                            </Button>
                        }
                    />
                ))}
            </div>

            {/* Empty states */}
            {results.length === 0 && query && (
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
        </div>
    );
}