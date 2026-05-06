import { Clock, Star, Plus } from 'lucide-react';
import { Anime } from '@/types/anime';
import Image from 'next/image';

interface AnimeCardProps {
  anime: Anime;
  icon?: React.ReactNode;
  statusBadge?: React.ReactNode;
  actionButton?: React.ReactNode;
  onClick?: () => void;
}

export function AnimeCard({ anime, statusBadge, actionButton, onClick }: AnimeCardProps) {
  return (
    <div className="group flex flex-col cursor-pointer" onClick={onClick}>
      {/* Cover */}
      <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-gradient-to-br from-sky-950 to-[#020617]">
        <Image
          src={anime.coverImage}
          alt={anime.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Bottom gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#020617]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Status badge top-left */}
        {statusBadge && (
          <div className="absolute top-2.5 left-2.5">
            {statusBadge}
          </div>
        )}

        {/* Score badge top-right */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1 px-2 py-1 rounded-lg bg-[#020617]/70 backdrop-blur-sm border border-sky-900/30">
          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
          <span className="text-xs font-semibold text-amber-300">{anime.averageScore?.toFixed(1) || 'N/A'}</span>
        </div>

        {/* Hover action button */}
        <div className="absolute inset-x-0 bottom-0 p-3 translate-y-1 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          {actionButton ?? (
            <button
              onClick={(e) => e.stopPropagation()}
              className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-gradient-to-r from-sky-600 to-teal-500 hover:from-sky-500 hover:to-teal-400 text-xs font-semibold text-white transition-all shadow-lg shadow-sky-900/40"
            >
              <Plus className="w-3.5 h-3.5" />
              Add to List
            </button>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="mt-3 px-0.5">
        <h3 className="font-semibold text-sm text-sky-50 leading-snug line-clamp-2 mb-1.5 group-hover:text-sky-300 transition-colors duration-200">
          {anime.title}
        </h3>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />

            {anime.episodes ?? 0} ep
          </span>
          <span className="w-1 h-1 rounded-full bg-slate-700" />
          <span>{anime.year}</span>
        </div>
      </div>
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
  const progressPercent = anime.episodes ? (progress / anime.episodes) * 100 : 0;

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
              <span className="text-sm text-slate-400">{progress}/{anime.episodes ?? 0}</span>
              {onProgressUpdate && anime.episodes != null && progress < anime.episodes && (
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
