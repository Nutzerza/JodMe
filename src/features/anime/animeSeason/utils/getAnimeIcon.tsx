// Utility function to get an anime icon based on the index with color coding.
import { Sparkles, Circle, Diamond, Hexagon } from "lucide-react";

export const getAnimeIcon = (index: number) => {
  const icons = [Sparkles, Circle, Diamond, Hexagon];
  const Icon = icons[index % icons.length];
  const colors = [
    "text-emerald-400",
    "text-purple-400",
    "text-amber-400",
    "text-blue-400",
  ];

  return <Icon className={`w-10 h-10 ${colors[index % colors.length]}`} />;
};
