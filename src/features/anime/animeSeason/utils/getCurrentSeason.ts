import { Season } from "@/types/anime";
import { AnimeStatus } from "@prisma/client";

export function getCurrentSeason() {
  const now = new Date();
  const month = now.getMonth() + 1; // 1–12
  const year = now.getFullYear();

  let season: Season;

  if (month <= 3) season = "WINTER";
  else if (month <= 6) season = "SPRING";
  else if (month <= 9) season = "SUMMER";
  else season = "FALL";

  return { season, year };
}

export function toPrismaStatus(status: string): AnimeStatus {
  switch (status) {
    case "plan_to_watch":
      return AnimeStatus.PLANNING;
    case "watching":
      return AnimeStatus.WATCHING;
    case "completed":
      return AnimeStatus.COMPLETED;
    case "on_hold":
      return AnimeStatus.ON_HOLD;
    case "dropped":
      return AnimeStatus.DROPPED;
    default:
      return AnimeStatus.PLANNING;
  }
}
