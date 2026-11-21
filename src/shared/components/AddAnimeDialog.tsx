// Component for adding an anime to the user's list with status, progress, and score options.
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { X, BookmarkPlus, Star, Loader2 } from "lucide-react";
import { Anime, AnimeStatus } from "@/types/anime";
import { STATUS_OPTIONS, SCORE_OPTIONS } from "@/shared/constants/constants";
import { ScoreButton } from "@/shared/components/ScoreButton";

interface AddAnimeDialogProps {
  anime: Anime | null;
  open: boolean;
  onClose: () => void;
  onAddNewAnime: (
    anime: Anime,
    status: AnimeStatus,
    progress: number,
    score: number | null,
  ) => Promise<void>;
}

export function AddAnimeDialog({
  anime,
  open,
  onClose,
  onAddNewAnime,
}: AddAnimeDialogProps) {
  const [status, setStatus] = useState<AnimeStatus>("plan_to_watch");
  const [progress, setProgress] = useState(0);
  const [score, setScore] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const [adding, setAdding] = useState(false);

  // Handle mounting animation
  useEffect(() => {
    function handleOpen() {
      if (open) {
        setTimeout(() => setMounted(true), 10);
      } else {
        setMounted(false);
      }
    }
    handleOpen();
  }, [open]);

  function resetForm() {
    setStatus("plan_to_watch");
    setProgress(0);
    setScore(null);
  }

  // Reset form when anime changes
  useEffect(() => {
    function handleAnimeChange() {
      if (anime) {
        resetForm();
      }
    }
    handleAnimeChange();
  }, [anime]);

  // close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !adding) onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose, adding]);

  // Handle change status and progress based on current status and episode count
  useEffect(() => {
    function handleStatusAndProgress() {
      const totalEpisodes = anime?.episodes;

      if (!totalEpisodes || totalEpisodes <= 0) return;

      if (status === "completed") {
        if (progress !== totalEpisodes) {
          setProgress(totalEpisodes);
        }
      } else if (status === "plan_to_watch") {
        if (progress !== 0) {
          setProgress(0);
        }
      } else if (status === "watching") {
        if (progress <= 0) {
          setProgress(1);
        } else if (progress >= totalEpisodes) {
          setProgress(totalEpisodes - 1);
        }
      }
    }
    handleStatusAndProgress();
  }, [status, progress, anime?.episodes]);

  if (!open || !anime) return null;

  // Handle submit
  const handleSubmit = async () => {
    if (adding) return;

    setAdding(true);
    try {
      await onAddNewAnime(anime, status, progress, score);
      resetForm();
      onClose();
    } catch {
      // Stay open; parent shows error toast
    } finally {
      setAdding(false);
    }
  };

  const maxEp = anime.episodes ?? 9999;
  const progressPercent =
    maxEp === 9999 ? 0 : Math.min((progress / maxEp) * 100, 100);
  const selectedStatus = STATUS_OPTIONS.find((s) => s.value === status)!;

  return (
    <div
      className="fixed inset-0 z-60 flex items-center justify-center p-4"
      style={{
        backgroundColor: `rgba(0,0,0,${mounted ? "0.75" : "0"})`,
        backdropFilter: "blur(6px)",
        transition: "background-color 0.2s ease",
      }}
      onClick={(e) => e.currentTarget === e.target && !adding && onClose()}
    >
      <div
        className="relative w-full max-w-md rounded-2xl overflow-hidden"
        style={{
          background: "linear-gradient(160deg, #0d1526 0%, #0a1020 100%)",
          border: "1px solid rgba(99,102,241,0.2)",
          boxShadow:
            "0 25px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(99,102,241,0.1)",
          transform: mounted
            ? "translateY(0) scale(1)"
            : "translateY(16px) scale(0.97)",
          opacity: mounted ? 1 : 0,
          transition:
            "transform 0.25s cubic-bezier(0.34,1.56,0.64,1), opacity 0.2s ease",
        }}
      >
        {/* Ambient glow top */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse, rgba(99,102,241,0.12) 0%, transparent 70%)",
          }}
        />

        {/* ── Header ── */}
        <div
          className="relative px-5 pt-5 pb-4"
          style={{ borderBottom: "1px solid rgba(99,102,241,0.1)" }}
        >
          <div className="flex items-start gap-3">
            {/* Cover thumbnail */}
            {anime.coverImage && (
              <Image
                src={anime.coverImage}
                alt={anime.title}
                width={40}
                height={56}
                className="w-10 h-14 rounded-lg object-cover shrink-0"
                style={{ border: "1px solid rgba(99,102,241,0.25)" }}
              />
            )}
            <div className="flex-1 min-w-0 pt-0.5">
              <div className="flex items-center gap-1.5 mb-1">
                <BookmarkPlus className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-xs font-semibold uppercase tracking-widest text-indigo-400">
                  Add to List
                </span>
              </div>
              <h2 className="text-white font-bold text-base leading-snug line-clamp-2">
                {anime.title}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={adding}
            className="absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center text-slate-500 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: "rgba(15,23,42,0.8)",
              border: "1px solid rgba(99,102,241,0.15)",
            }}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="px-5 py-5 space-y-5">
          {/* Status */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-2.5">
              Status
            </p>
            <div className="grid grid-cols-5 gap-1.5">
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setStatus(opt.value)}
                  className={`flex flex-col items-center gap-1 py-2 rounded-xl transition-all duration-150 text-center ${status === opt.value ? "scale-105 border border-[color:" + opt.border + "] bg-[color:" + opt.bg + "]" : "border border-gray-900"}`}
                >
                  <span
                    className={
                      status === opt.value ? opt.color : "text-slate-600"
                    }
                  >
                    {opt.icon}
                  </span>
                  <span
                    className="text-[9px] font-semibold leading-tight"
                    style={{
                      color: status === opt.value ? "inherit" : "#475569",
                    }}
                  >
                    {opt.label.split(" ").map((w, i) => (
                      <span key={i} className="block">
                        {w}
                      </span>
                    ))}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Episode progress */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                Episode Progress
              </p>
              <span className="text-xs text-slate-400 font-mono">
                <span className="text-white font-semibold">{progress}</span>
                {anime.episodes ? ` / ${anime.episodes}` : ""}
              </span>
            </div>

            {/* Progress bar */}
            {anime.episodes && (
              <div
                className="h-1 rounded-full mb-3 overflow-hidden"
                style={{ background: "rgba(99,102,241,0.1)" }}
              >
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${progressPercent}%`,
                    background: "linear-gradient(to right, #6366f1, #14b8a6)",
                  }}
                />
              </div>
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setProgress(Math.max(0, progress - 1))}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white transition-colors font-bold"
                style={{
                  background: "rgba(99,102,241,0.1)",
                  border: "1px solid rgba(99,102,241,0.15)",
                }}
              >
                −
              </button>
              <input
                type="number"
                min="0"
                max={maxEp}
                value={progress}
                onChange={(e) =>
                  setProgress(
                    Math.max(0, Math.min(maxEp, parseInt(e.target.value) || 0)),
                  )
                }
                className="flex-1 text-center text-sm font-semibold text-white rounded-lg py-1.5 bg-transparent outline-none focus:ring-1"
                style={{
                  background: "rgba(15,23,42,0.6)",
                  border: "1px solid rgba(99,102,241,0.2)",
                  borderColor: "#6366f1",
                }}
              />
              <button
                type="button"
                onClick={() => setProgress(Math.min(maxEp, progress + 1))}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white transition-colors font-bold"
                style={{
                  background: "rgba(99,102,241,0.1)",
                  border: "1px solid rgba(99,102,241,0.15)",
                }}
              >
                +
              </button>
              {anime.episodes && (
                <button
                  type="button"
                  onClick={() => setProgress(anime.episodes!)}
                  className="px-2.5 h-8 rounded-lg text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
                  style={{
                    background: "rgba(99,102,241,0.1)",
                    border: "1px solid rgba(99,102,241,0.15)",
                  }}
                >
                  Max
                </button>
              )}
            </div>
          </div>

          {/* Score */}
          <div>
            <div className="flex items-center gap-1.5 mb-2.5">
              <Star className="w-3 h-3 text-slate-500" />
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                Your Score
              </p>
              {score !== null && (
                <button
                  onClick={() => setScore(null)}
                  className="ml-auto text-xs text-slate-600 hover:text-slate-400 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {SCORE_OPTIONS.map((v) => (
                <ScoreButton
                  key={v}
                  value={v}
                  selected={score === v}
                  onClick={() => setScore(score === v ? null : v)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <div
          className="px-5 pb-5 flex gap-2.5"
          style={{
            borderTop: "1px solid rgba(99,102,241,0.08)",
            paddingTop: "16px",
          }}
        >
          <button
            onClick={onClose}
            disabled={adding}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-slate-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: "rgba(99,102,241,0.06)",
              border: "1px solid rgba(99,102,241,0.12)",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={adding}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{
              background:
                `linear-gradient(135deg, ${selectedStatus.color.replace("text-", "")} -20%, #6366f1 60%, #14b8a6 140%)`.replace(
                  /text-(\w+-\d+)/,
                  (_, cls) => {
                    const map: Record<string, string> = {
                      "sky-400": "#38bdf8",
                      "emerald-400": "#34d399",
                      "indigo-400": "#818cf8",
                      "amber-400": "#fbbf24",
                      "rose-400": "#fb7185",
                    };
                    return map[cls] ?? "#818cf8";
                  },
                ),
              boxShadow: "0 4px 16px rgba(99,102,241,0.3)",
            }}
          >
            {adding ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save to List"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
