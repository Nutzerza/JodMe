export type AnimeStatus = 'all' | 'watching' | 'completed' | 'on_hold' | 'dropped' | 'plan_to_watch';
export type Season = 'WINTER' | 'SPRING' | 'SUMMER' | 'FALL';


export const SEASON_ORDER = {
  WINTER: 1,
  SPRING: 2,
  SUMMER: 3,
  FALL: 4,
};

export interface Anime {
  id: string;
  anilistId: number;

  title: string;
  episodes?: number;
  averageScore?: number;
  status?: string;
  season?: string;
  year?: number;

  genres: string[];
  studio?: string;

  coverImage: string;
  synopsis?: string;

  description?: string | null;
  trailer?: string | null;
}

export interface UserAnimeEntry {
  id?: string;
  anime: Anime;
  status: AnimeStatus;
  progress: number; // episodes watched
  score: number | null; // 0-10
  dateAdded: string;
  userId?: string; // for POST
  animeId?: string; // for POST
}

export interface SeasonAnime extends Anime {
  airingStatus: 'airing' | 'upcoming' | 'finished';
}

export interface Stats {
  totalAnime: number;
  episodesWatched: number;
  daysWatched: number;
  avgScore: number;
  genreDistribution: { genre: string; count: number; }[];
  scoreDistribution: { score: number; count: number; }[];
}

export interface MonthlyWatchStat {
  month: string;
  episodes: number;
  anime: number;
}

export interface WeeklyWatchStat {
  week: string;
  episodes: number;
  anime: number;
}

export interface RecentWatchStat {
  anime: Anime;
  episode: number;
  watchedAt: string;
}
