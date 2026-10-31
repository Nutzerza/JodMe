// AnimeDetailDialog component for displaying detailed information about an anime, including cover image, title, status, score, and an optional action button to add the anime to the user's list.

"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { Plus } from "lucide-react";
// Components for displaying score and status badges
import { ScoreBadge } from "@/shared/components/ScoreBadge";
import { StatusBadge } from "@/shared/components/StatusBadge";
// Type for the anime object passed to the component
import { Anime } from "@/types/anime";

interface Props {
  anime: Anime | null;
  open: boolean;
  onClose: () => void;
  onOpenAddDialog?: (anime: Anime) => void;
  isInList?: boolean;
  actionButton?: React.ReactNode;
}

export function AnimeDetailDialog({
  anime,
  open,
  isInList,
  onClose,
  onOpenAddDialog,
  actionButton,
}: Props) {
  const overlayRef = useRef<HTMLDivElement>(null);

  // close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // lock body scroll
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open || !anime) return null;

  // Extract and format the trailer URL for embedding if it's a YouTube link
  const trailerSrc = anime.trailer
    ? anime.trailer.includes("youtube.com") ||
      anime.trailer.includes("youtu.be")
      ? anime.trailer
          .replace("watch?v=", "embed/")
          .replace("youtu.be/", "youtube.com/embed/")
      : anime.trailer
    : null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        backgroundColor: "rgba(0,0,0,0.80)",
        backdropFilter: "blur(4px)",
      }}
      onClick={(e) => e.target === overlayRef.current && onClose()}
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl"
        style={{
          background: "linear-gradient(160deg, #0f172a 0%, #0c1424 100%)",
          border: "1px solid rgba(99,102,241,0.15)",
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(99,102,241,0.3) transparent",
        }}
      >
        {/* ── Banner / Cover hero ── */}
        <div className="relative h-40 overflow-hidden rounded-t-2xl">
          {/* blurred cover as banner background */}
          <div
            className="absolute inset-0 scale-110"
            style={{
              backgroundImage: `url(${anime.coverImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center top",
              filter: "blur(18px) brightness(0.35)",
            }}
          />
          {/* gradient overlay */}
          <div className="absolute inset-0 bg-linear-to-b from-transparent to-[#0f172a]" />
        </div>

        {/* ── Cover image (overlapping banner) ── */}
        <div className="relative px-6">
          <div className="flex gap-5" style={{ marginTop: "-64px" }}>
            <div className="shrink-0">
              <div
                className="rounded-xl overflow-hidden shadow-xl"
                style={{ border: "2px solid rgba(99,102,241,0.3)" }}
              >
                <Image
                  src={anime.coverImage}
                  alt={anime.title}
                  width={110}
                  height={155}
                  className="object-cover"
                  style={{ display: "block" }}
                />
              </div>
            </div>

            {/* ── Title + badges + Add button ── */}
            <div className="flex flex-col justify-end pb-1 min-w-0 flex-1">
              <h2
                className="text-white font-bold text-xl leading-tight truncate"
                title={anime.title}
              >
                {anime.title}
              </h2>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                {anime.status && <StatusBadge status={anime.status} />}
                {anime.averageScore !== undefined && (
                  <ScoreBadge score={anime.averageScore} />
                )}
              </div>
              <div className="mt-3">
                {actionButton ?? (
                  <button
                    onClick={() => {
                      if (isInList) return;
                      onOpenAddDialog?.(anime);
                    }}
                    disabled={isInList}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white transition-all shadow-lg
                        ${
                          isInList
                            ? "bg-slate-600 cursor-not-allowed"
                            : "bg-linear-to-r from-sky-600 to-teal-500 hover:from-sky-500 hover:to-teal-400"
                        }`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    {isInList ? "In List" : "Add to List"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="px-6 pb-6 mt-4 space-y-5">
          {/* Meta row */}
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-400">
            {(anime.season || anime.year) && (
              <span>
                📅{" "}
                <span className="text-slate-200">
                  {[anime.season, anime.year].filter(Boolean).join(" ")}
                </span>
              </span>
            )}
            {anime.episodes !== undefined && (
              <span>
                🎞{" "}
                <span className="text-slate-200">
                  {anime.episodes} ep{anime.episodes !== 1 ? "s" : ""}
                </span>
              </span>
            )}
            {anime.studio && (
              <span>
                🏢 <span className="text-slate-200">{anime.studio}</span>
              </span>
            )}
          </div>

          {/* Genres */}
          {anime.genres.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {anime.genres.map((g) => (
                <span
                  key={g}
                  className="px-2.5 py-0.5 rounded-full text-xs font-medium text-indigo-300"
                  style={{
                    background: "rgba(99,102,241,0.12)",
                    border: "1px solid rgba(99,102,241,0.25)",
                  }}
                >
                  {g}
                </span>
              ))}
            </div>
          )}

          {/* Divider */}
          <div style={{ height: "1px", background: "rgba(99,102,241,0.12)" }} />

          {/* Synopsis / description */}
          {(anime.synopsis || anime.description) && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-indigo-400 mb-2">
                Synopsis
              </p>
              <p className="text-sm text-slate-300 leading-relaxed">
                {anime.synopsis || anime.description}
              </p>
            </div>
          )}

          {/* Trailer */}
          {trailerSrc && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-indigo-400 mb-2">
                Trailer
              </p>
              <div
                className="rounded-xl overflow-hidden"
                style={{ border: "1px solid rgba(99,102,241,0.2)" }}
              >
                <iframe
                  src={trailerSrc}
                  className="w-full aspect-video"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          )}
        </div>

        {/* ── Close button ── */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3 right-3 flex items-center justify-center w-8 h-8 rounded-full text-slate-400 hover:text-white transition-colors"
          style={{
            background: "rgba(15,23,42,0.7)",
            border: "1px solid rgba(99,102,241,0.2)",
          }}
        >
          X
        </button>
      </div>
    </div>
  );
}
