// Constants for navigation items, anime status configurations, and score options.
import { AnimeStatus } from "@/types/anime";
import {
  ChevronDown,
  Tv,
  CheckCircle2,
  PauseCircle,
  XCircle,
  Clock,
} from "lucide-react";

export const navItems = [
  { name: "Home", path: "/" },
  { name: "Search", path: "/search" },
  { name: "Season", path: "/season" },
  { name: "Stats", path: "/stats" },
];

export const STATUS_CONFIG: Record<
  AnimeStatus,
  {
    label: string;
    icon: React.ReactNode;
    color: string;
    bar: string;
    badge: string;
  }
> = {
  all: {
    label: "All",
    icon: <ChevronDown className="w-3 h-3" />,
    color: "#64748b",
    bar: "linear-gradient(to right,#64748b,#94a3b8)",
    badge: "bg-slate-400/10 text-slate-400 border-slate-400/25",
  },
  watching: {
    label: "Watching",
    icon: <Tv className="w-3 h-3" />,
    color: "#34d399",
    bar: "linear-gradient(to right,#059669,#34d399)",
    badge: "bg-emerald-400/10 text-emerald-400 border-emerald-400/25",
  },
  completed: {
    label: "Completed",
    icon: <CheckCircle2 className="w-3 h-3" />,
    color: "#818cf8",
    bar: "linear-gradient(to right,#4f46e5,#818cf8)",
    badge: "bg-indigo-400/10 text-indigo-400 border-indigo-400/25",
  },
  on_hold: {
    label: "On Hold",
    icon: <PauseCircle className="w-3 h-3" />,
    color: "#fbbf24",
    bar: "linear-gradient(to right,#d97706,#fbbf24)",
    badge: "bg-amber-400/10 text-amber-400 border-amber-400/25",
  },
  dropped: {
    label: "Dropped",
    icon: <XCircle className="w-3 h-3" />,
    color: "#fb7185",
    bar: "linear-gradient(to right,#e11d48,#fb7185)",
    badge: "bg-rose-400/10 text-rose-400 border-rose-400/25",
  },
  plan_to_watch: {
    label: "Planning",
    icon: <Clock className="w-3 h-3" />,
    color: "#38bdf8",
    bar: "linear-gradient(to right,#0284c7,#38bdf8)",
    badge: "bg-sky-400/10 text-sky-400 border-sky-400/25",
  },
};

export const STATUS_OPTIONS: {
  value: AnimeStatus;
  label: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
  border: string;
}[] = [
  {
    value: "plan_to_watch",
    label: "Plan to Watch",
    icon: <Clock className="w-3.5 h-3.5" />,
    color: "text-sky-400",
    bg: "bg-sky-400/10",
    border: "border-sky-400/40",
  },
  {
    value: "watching",
    label: "Watching",
    icon: <Tv className="w-3.5 h-3.5" />,
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
    border: "border-emerald-400/40",
  },
  {
    value: "completed",
    label: "Completed",
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    color: "text-indigo-400",
    bg: "bg-indigo-400/10",
    border: "border-indigo-400/40",
  },
  {
    value: "on_hold",
    label: "On Hold",
    icon: <PauseCircle className="w-3.5 h-3.5" />,
    color: "text-amber-400",
    bg: "bg-amber-400/10",
    border: "border-amber-400/40",
  },
  {
    value: "dropped",
    label: "Dropped",
    icon: <XCircle className="w-3.5 h-3.5" />,
    color: "text-rose-400",
    bg: "bg-rose-400/10",
    border: "border-rose-400/40",
  },
];

export const SCORE_OPTIONS = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1];
