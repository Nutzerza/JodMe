import { Season } from "@/types/anime";

export function getCurrentSeason() {
  const now = new Date();
  const month = now.getMonth() + 1; // 1–12
  const year = now.getFullYear();

  let season: Season;

  if (month <= 3) season = 'WINTER';
  else if (month <= 6) season = 'SPRING';
  else if (month <= 9) season = 'SUMMER';
  else season = 'FALL';

  return { season, year };
}
