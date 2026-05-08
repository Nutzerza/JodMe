import { useState } from 'react';
import { Star, Plus, Tv, CheckCircle2, Clock, PauseCircle, XCircle, ChevronDown } from 'lucide-react';
import { Anime, AnimeStatus } from '@/types/anime';
import Image from 'next/image';
import { ScorePickerModal } from '@/components/ScorepickerModal';

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
  status: AnimeStatus;

  // 🔥 ส่ง handler กลับไป parent เพื่อ update DB
  onUpdate?: (data: {
    progress: number;
    status: AnimeStatus;
    score?: number | null;
  }) => void;
}
/* ── Status config ─────────────────────────────────────────────── */
const STATUS_CONFIG: Record<
  AnimeStatus,
  { label: string; icon: React.ReactNode; color: string; bar: string; badge: string }
> = {
  all: {
    label: 'All',
    icon: <ChevronDown className="w-3 h-3" />,
    color: '#64748b',
    bar: 'linear-gradient(to right,#64748b,#94a3b8)',
    badge: 'bg-slate-400/10 text-slate-400 border-slate-400/25',
  },
  watching: {
    label: 'Watching',
    icon: <Tv className="w-3 h-3" />,
    color: '#34d399',
    bar: 'linear-gradient(to right,#059669,#34d399)',
    badge: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/25',
  },
  completed: {
    label: 'Completed',
    icon: <CheckCircle2 className="w-3 h-3" />,
    color: '#818cf8',
    bar: 'linear-gradient(to right,#4f46e5,#818cf8)',
    badge: 'bg-indigo-400/10 text-indigo-400 border-indigo-400/25',
  },
  on_hold: {
    label: 'On Hold',
    icon: <PauseCircle className="w-3 h-3" />,
    color: '#fbbf24',
    bar: 'linear-gradient(to right,#d97706,#fbbf24)',
    badge: 'bg-amber-400/10 text-amber-400 border-amber-400/25',
  },
  dropped: {
    label: 'Dropped',
    icon: <XCircle className="w-3 h-3" />,
    color: '#fb7185',
    bar: 'linear-gradient(to right,#e11d48,#fb7185)',
    badge: 'bg-rose-400/10 text-rose-400 border-rose-400/25',
  },
  plan_to_watch: {
    label: 'Planning',
    icon: <Clock className="w-3 h-3" />,
    color: '#38bdf8',
    bar: 'linear-gradient(to right,#0284c7,#38bdf8)',
    badge: 'bg-sky-400/10 text-sky-400 border-sky-400/25',
  },
};

export function AnimeListItem({ anime, progress, score, status, onUpdate }: AnimeListItemProps) {
  const [scoreOpen, setScoreOpen] = useState(false);
  const totalEpisodes = anime.episodes ?? 0;
  const progressPercent = totalEpisodes > 0 ? Math.min((progress / totalEpisodes) * 100, 100) : 0;
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.plan_to_watch;

  const handleIncrease = () => {
    if (!onUpdate) return;
    const newProgress = totalEpisodes > 0 ? Math.min(progress + 1, totalEpisodes) : progress + 1;
    let newStatus: AnimeStatus = status;
    if (status === 'plan_to_watch') newStatus = 'watching';
    if (totalEpisodes > 0 && newProgress >= totalEpisodes) newStatus = 'completed';
    onUpdate({ progress: newProgress, status: newStatus });
  };

  const handleDecrease = () => {
    if (!onUpdate) return;
    const newProgress = Math.max(progress - 1, 0);
    onUpdate({ progress: newProgress, status: newProgress === 0 ? 'plan_to_watch' : status });
  };

  const handleScoreEdit = () => {
    const input = prompt('Enter score (1–10):');
    if (!input) return;
    const parsed = Number(input);
    if (isNaN(parsed) || parsed < 1 || parsed > 10) return;
    onUpdate?.({ score: parsed, progress, status });
  };

  return (
    <div
      className="group relative flex items-stretch gap-0 rounded-xl overflow-hidden transition-all duration-200"
      style={{
        background: 'linear-gradient(135deg,rgba(15,23,42,0.9) 0%,rgba(10,16,32,0.95) 100%)',
        border: '1px solid rgba(99,102,241,0.1)',
        boxShadow: '0 2px 12px rgba(0,0,0,0.3)',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.border = `1px solid ${cfg.color}30`;
        (e.currentTarget as HTMLDivElement).style.boxShadow = `0 4px 20px rgba(0,0,0,0.4), 0 0 0 1px ${cfg.color}15`;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.border = '1px solid rgba(99,102,241,0.1)';
        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 12px rgba(0,0,0,0.3)';
      }}
    >
      {/* Status accent bar */}
      <div
        className="absolute left-0 top-0 bottom-0 w-0.5 rounded-l-xl"
        style={{ background: cfg.bar }}
      />

      {/* Cover */}
      <div className="relative w-14 h-20 shrink-0 ml-2 my-3 rounded-lg overflow-hidden">
        <Image
          src={anime.coverImage}
          alt={anime.title}
          fill
          sizes="56px"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {/* score overlay on cover */}
        {score !== null && (
          <div
            className="absolute bottom-0 inset-x-0 flex items-center justify-center gap-0.5 py-0.5"
            style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
          >
            <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
            <span className="text-[10px] font-bold text-amber-300">{score.toFixed(1)}</span>
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="flex-1 min-w-0 px-3 py-3 flex flex-col justify-between">

        {/* Top row */}
        <div className="flex items-start gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-white truncate leading-snug mb-1">
              {anime.title}
            </h3>
            <div className="flex items-center gap-1.5 flex-wrap">
              {anime.genres?.slice(0, 2).map((g) => (
                <span
                  key={g}
                  className="px-1.5 py-0.5 rounded text-[10px] font-medium text-slate-400"
                  style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.12)' }}
                >
                  {g}
                </span>
              ))}
              {anime.year && (
                <span className="text-[10px] text-slate-500">{anime.year}</span>
              )}
            </div>
          </div>

          {/* Status badge */}
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border shrink-0 ${cfg.badge}`}
          >
            {cfg.icon}
            {cfg.label}
          </span>
        </div>

        {/* Progress bar */}
        <div className="mt-2.5">
          <div
            className="w-full h-1 rounded-full overflow-hidden"
            style={{ background: 'rgba(99,102,241,0.1)' }}
          >
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%`, background: cfg.bar }}
            />
          </div>
        </div>
      </div>

      {/* Right controls */}
      <div
        className="flex flex-col items-center justify-center gap-1.5 px-3 py-3 shrink-0"
        style={{ borderLeft: '1px solid rgba(99,102,241,0.08)' }}
      >
        {/* Episode counter */}
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); handleDecrease(); }}
            className="w-5 h-5 rounded flex items-center justify-center text-slate-500 hover:text-white hover:bg-slate-700 transition-all text-xs font-bold"
          >
            −
          </button>
          <span className="text-xs text-slate-300 font-mono w-14 text-center">
            <span className="text-white font-semibold">{progress}</span>
            <span className="text-slate-500">/{totalEpisodes || '?'}</span>
          </span>
          <button
            onClick={(e) => { e.stopPropagation(); handleIncrease(); }}
            className="w-5 h-5 rounded flex items-center justify-center text-slate-500 hover:text-white hover:bg-slate-700 transition-all text-xs font-bold"
            disabled={totalEpisodes > 0 && progress >= totalEpisodes}
          >
            +
          </button>
        </div>

        {/* Score button */}
        <button
          onClick={(e) => { e.stopPropagation(); setScoreOpen(true); }}
          className="flex items-center gap-1 px-2 py-1 rounded-lg transition-all text-[10px] font-semibold"
          style={{
            background: score !== null ? 'rgba(251,191,36,0.1)' : 'rgba(99,102,241,0.08)',
            border: `1px solid ${score !== null ? 'rgba(251,191,36,0.2)' : 'rgba(99,102,241,0.12)'}`,
            color: score !== null ? '#fbbf24' : '#64748b',
          }}
        >
          <Star className={`w-3 h-3 ${score !== null ? 'fill-amber-400 text-amber-400' : 'text-slate-600'}`} />
          {score !== null ? score.toFixed(1) : '—'}
        </button>
      </div>

      <ScorePickerModal
        open={scoreOpen}
        currentScore={score}
        animeTitle={anime.title}
        onClose={() => setScoreOpen(false)}
        onSave={(newScore) => {
          if (!onUpdate) return;

          onUpdate({
            score: newScore,
            progress,
            status,
          });
        }}
      />
    </div>
  );
}