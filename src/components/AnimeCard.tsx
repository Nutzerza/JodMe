import { Star } from 'lucide-react';
import { Anime } from '../types/anime';
import Image from 'next/image';
// import { ImageWithFallback } from './figma/ImageWithFallback';

interface AnimeCardProps {
    anime: Anime;
    icon?: React.ReactNode;
    statusBadge?: React.ReactNode;
    actionButton?: React.ReactNode;
    onClick?: () => void;
}

export function AnimeCard({ anime, icon, statusBadge, actionButton, onClick }: AnimeCardProps) {
    return (
        <div className="flex flex-col gap-3 cursor-pointer" onClick={onClick}>
            <div className="relative aspect-[2/3] bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg overflow-hidden group">
                <>
                    <Image
                        src={anime.coverImage}
                        alt={anime.title}
                        fill
                        className="w-full h-full object-cover"
                    />
                </>
                {statusBadge && (
                    <div className="absolute top-2 left-2">
                        {statusBadge}
                    </div>
                )}
            </div>
            <div className="flex flex-col gap-1">
                <h3 className="font-medium text-sm leading-tight line-clamp-2">{anime.title}</h3>
                <p className="text-xs text-slate-400">
                    {anime.episodes} ep · {anime.year}
                </p>
            </div>
            {actionButton && <div>{actionButton}</div>}
        </div>
    );
}

interface AnimeListItemProps {
    anime: Anime;
    progress: number;
    score: number | null;
    status: string;
    icon?: React.ReactNode;
    statusColor?: string;
    onProgressUpdate?: (delta: number) => void;
}

export function AnimeListItem({
    anime,
    progress,
    score,
    status,
    icon,
    statusColor = 'bg-blue-500',
    onProgressUpdate
}: AnimeListItemProps) {
    const progressPercent = (progress / anime.episodes) * 100;

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'watching': return 'bg-blue-500';
            case 'completed': return 'bg-emerald-500';
            case 'on_hold': return 'bg-amber-500';
            case 'dropped': return 'bg-red-500';
            case 'plan_to_watch': return 'bg-purple-500';
            default: return 'bg-slate-500';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status.toLowerCase()) {
            case 'watching': return 'Watching';
            case 'completed': return 'Done';
            case 'on_hold': return 'On hold';
            case 'dropped': return 'Dropped';
            case 'plan_to_watch': return 'Plan';
            default: return status;
        }
    };

    return (
        <div className="flex items-center gap-4 p-4 bg-slate-800/40 rounded-lg hover:bg-slate-800/60 transition-colors">
            <div className="relative overflow-hidden flex items-center justify-center w-20 h-30 bg-slate-700/50">
                <Image
                    src={anime.coverImage}
                    alt={anime.title}
                    fill
                    className="w-full h-full object-cover"
                />
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm mb-1 truncate">{anime.title}</h3>
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                            {anime.genres.slice(0, 2).map(genre => (
                                <span key={genre} className="px-2 py-0.5 bg-slate-700/50 rounded">
                                    {genre}
                                </span>
                            ))}
                            <span>{anime.year}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                        <div className="flex items-center gap-1.5">
                            <span className="text-sm text-slate-400">{progress}/{anime.episodes}</span>
                            {onProgressUpdate && progress < anime.episodes && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onProgressUpdate(1);
                                    }}
                                    className="w-6 h-6 flex items-center justify-center bg-slate-700 hover:bg-slate-600 rounded text-xs transition-colors"
                                >
                                    +
                                </button>
                            )}
                        </div>

                        {score !== null && (
                            <div className="flex items-center gap-1">
                                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                <span className="text-sm font-medium">{score.toFixed(1)}</span>
                            </div>
                        )}

                        <span className={`px-2 py-1 text-xs rounded ${getStatusColor(status)}/20 text-white`}>
                            {getStatusLabel(status)}
                        </span>
                    </div>
                </div>

                <div className="relative w-full h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
                    <div
                        className={`absolute inset-y-0 left-0 ${getStatusColor(status)} rounded-full transition-all`}
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>
            </div>
        </div>
    );
}
