// Component for displaying an anime list item with progress, score, and status.

import Image from "next/image";
import { useState } from "react";
import { Star, Trash2 } from "lucide-react";
import type { Anime, AnimeStatus } from "@/types/anime";
import { STATUS_CONFIG } from "@/shared/constants/constants";
import { ScorePickerModal } from "@/features/myList/components/ScorePickerModal";

interface AnimeListItemProps {
  anime: Anime;
  progress: number;
  score: number | null;
  status: AnimeStatus;

  // ส่ง handler กลับไป parent เพื่อ update DB
  onUpdate?: (data: {
    progress: number;
    status: AnimeStatus;
    score?: number | null;
  }) => void;
  onRemove?: () => void;
}

export function AnimeListItem({
  anime,
  progress,
  score,
  status,
  onUpdate,
  onRemove,
}: AnimeListItemProps) {
  const [scoreOpen, setScoreOpen] = useState(false);
  const totalEpisodes = anime.episodes ?? 0;
  const progressPercent =
    totalEpisodes > 0 ? Math.min((progress / totalEpisodes) * 100, 100) : 0;
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.plan_to_watch;

  // Handle progress increase and status update based on total episodes and current status.
  const handleIncrease = () => {
    if (!onUpdate) return;
    const newProgress =
      totalEpisodes > 0 ? Math.min(progress + 1, totalEpisodes) : progress + 1;
    let newStatus: AnimeStatus = status;
    if (status === "plan_to_watch") newStatus = "watching";
    if (totalEpisodes > 0 && newProgress >= totalEpisodes)
      newStatus = "completed";
    onUpdate({ progress: newProgress, status: newStatus });
  };

  // Handle progress decrease and status update based on current progress and status.
  const handleDecrease = () => {
    if (!onUpdate) return;
    const newProgress = Math.max(progress - 1, 0);
    if (newProgress === 0) {
      onUpdate({ progress: newProgress, status: "plan_to_watch" });
    } else if (status === "completed") {
      onUpdate({ progress: newProgress, status: "watching" });
    } else {
      onUpdate({ progress: newProgress, status });
    }
  };

  return (
    <div
      className="group relative flex w-full items-stretch gap-0 rounded-xl overflow-hidden transition-all duration-200"
      style={{
        background:
          "linear-gradient(135deg,rgba(15,23,42,0.9) 0%,rgba(10,16,32,0.95) 100%)",
        border: "1px solid rgba(99,102,241,0.1)",
        boxShadow: "0 2px 12px rgba(0,0,0,0.3)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.border =
          `1px solid ${cfg.color}30`;
        (e.currentTarget as HTMLDivElement).style.boxShadow =
          `0 4px 20px rgba(0,0,0,0.4), 0 0 0 1px ${cfg.color}15`;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.border =
          "1px solid rgba(99,102,241,0.1)";
        (e.currentTarget as HTMLDivElement).style.boxShadow =
          "0 2px 12px rgba(0,0,0,0.3)";
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
            style={{
              background: "rgba(0,0,0,0.65)",
              backdropFilter: "blur(4px)",
            }}
          >
            <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
            <span className="text-[10px] font-bold text-amber-300">
              {score.toFixed(1)}
            </span>
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="flex-1 min-w-0 px-3 py-3 flex flex-col justify-between">
        {/* Top row */}
        <div className="flex items-start gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-white leading-snug mb-1 line-clamp-2">
              {anime.title}
            </h3>
            <div className="flex items-center gap-1.5 flex-wrap">
              {anime.genres?.slice(0, 2).map((g) => (
                <span
                  key={g}
                  className="px-1.5 py-0.5 rounded text-[10px] font-medium text-slate-400"
                  style={{
                    background: "rgba(99,102,241,0.08)",
                    border: "1px solid rgba(99,102,241,0.12)",
                  }}
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
            style={{ background: "rgba(99,102,241,0.1)" }}
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
        style={{ borderLeft: "1px solid rgba(99,102,241,0.08)" }}
      >
        {/* Episode counter */}
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDecrease();
            }}
            className="w-5 h-5 rounded flex items-center justify-center text-slate-500 hover:text-white hover:bg-slate-700 transition-all text-xs font-bold"
          >
            −
          </button>
          <span className="text-xs text-slate-300 font-mono w-14 text-center">
            <span className="text-white font-semibold">{progress}</span>
            <span className="text-slate-500">/{totalEpisodes || "?"}</span>
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleIncrease();
            }}
            className="w-5 h-5 rounded flex items-center justify-center text-slate-500 hover:text-white hover:bg-slate-700 transition-all text-xs font-bold"
            disabled={totalEpisodes > 0 && progress >= totalEpisodes}
          >
            +
          </button>
        </div>

        {/* Score button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setScoreOpen(true);
          }}
          className="flex items-center gap-1 px-2 py-1 rounded-lg transition-all text-[10px] font-semibold"
          style={{
            background:
              score !== null ? "rgba(251,191,36,0.1)" : "rgba(99,102,241,0.08)",
            border: `1px solid ${score !== null ? "rgba(251,191,36,0.2)" : "rgba(99,102,241,0.12)"}`,
            color: score !== null ? "#fbbf24" : "#64748b",
          }}
        >
          <Star
            className={`w-3 h-3 ${score !== null ? "fill-amber-400 text-amber-400" : "text-slate-600"}`}
          />
          {score !== null ? score.toFixed(1) : "—"}
        </button>

        {onRemove && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
            title="Remove from list"
            aria-label="Remove from list"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
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
