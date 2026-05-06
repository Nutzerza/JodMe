export type AnimeStatus = 'all' | 'watching' | 'completed' | 'on_hold' | 'dropped' | 'plan_to_watch';
export type Season = 'WINTER' | 'SPRING' | 'SUMMER' | 'FALL';

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
  anime: Anime;
  status: AnimeStatus;
  progress: number; // episodes watched
  score: number | null; // 0-10
  dateAdded: string;
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
