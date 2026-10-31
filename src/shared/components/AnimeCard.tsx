// AnimeCard component displays an anime cover with status, score, and action button.

import { Star, Plus, Clock } from "lucide-react";
import { Anime } from "@/types/anime";
import Image from "next/image";

interface AnimeCardProps {
  anime: Anime;
  icon?: React.ReactNode;
  statusBadge?: React.ReactNode;
  actionButton?: React.ReactNode;
  onClick?: () => void;
}

export function AnimeCard({
  anime,
  statusBadge,
  actionButton,
  onClick,
}: AnimeCardProps) {
  return (
    <div className="group flex flex-col cursor-pointer" onClick={onClick}>
      {/* Cover */}
      <div className="relative aspect-2/3 rounded-xl overflow-hidden bg-linear-to-br from-sky-950 to-[#020617]">
        <Image
          src={anime.coverImage}
          alt={anime.title}
          sizes="(max-width: 768px) 100vw, 50vw"
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Bottom gradient overlay */}
        <div className="absolute inset-0 bg-linear-to-t from-[#020617]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Status badge top-left */}
        {statusBadge && (
          <div className="absolute top-2.5 left-2.5">{statusBadge}</div>
        )}

        {/* Score badge top-right */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1 px-2 py-1 rounded-lg bg-[#020617]/70 backdrop-blur-sm border border-sky-900/30">
          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
          <span className="text-xs font-semibold text-amber-300">
            {anime.averageScore?.toFixed(1) || "N/A"}
          </span>
        </div>

        {/* Hover action button */}
        <div className="absolute inset-x-0 bottom-0 p-3 translate-y-1 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          {actionButton ?? (
            <button
              onClick={(e) => e.stopPropagation()}
              className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-linear-to-r from-sky-600 to-teal-500 hover:from-sky-500 hover:to-teal-400 text-xs font-semibold text-white transition-all shadow-lg shadow-sky-900/40"
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
