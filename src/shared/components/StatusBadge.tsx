export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    FINISHED: "bg-sky-500/10 text-sky-400 border-sky-400/30",
    RELEASING: "bg-emerald-500/10 text-emerald-400 border-emerald-400/30",
    NOT_YET_RELEASED: "bg-violet-500/10 text-violet-400 border-violet-400/30",
    CANCELLED: "bg-rose-500/10 text-rose-400 border-rose-400/30",
    HIATUS: "bg-amber-500/10 text-amber-400 border-amber-400/30",
  };

  const label: Record<string, string> = {
    FINISHED: "Finished",
    RELEASING: "Airing",
    NOT_YET_RELEASED: "Upcoming",
    CANCELLED: "Cancelled",
    HIATUS: "Hiatus",
  };

  const cls =
    map[status] ?? "bg-slate-500/10 text-slate-400 border-slate-400/30";

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full border text-xs font-medium tracking-wide ${cls}`}
    >
      {label[status] ?? status}
    </span>
  );
}
