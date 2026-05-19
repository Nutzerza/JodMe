import { prisma } from "@/lib/prisma";
import { Season, SEASON_ORDER } from "@/types/anime";
import { getCurrentSeason } from "@/utils/getCurrentSeason";
import type { Prisma } from "@prisma/client";

type AniListMedia = {
  id: number;
  title: { romaji: string };
  description?: string | null;
  coverImage?: { large?: string | null };
  episodes?: number | null;
  season?: string | null;
  seasonYear?: number | null;
  genres?: string[];
  averageScore?: number | null;
  status?: string | null;
  trailer?: { id?: string; site?: string } | null;
  studios?: { nodes: { name: string }[] };
};

export type AnimeCreatePayload = Prisma.AnimeCreateInput;

const ANILIST_MEDIA_FIELDS = `
  id
  title { romaji }
  description(asHtml: false)
  coverImage { large }
  episodes
  season
  seasonYear
  genres
  averageScore
  status
  trailer { id site }
  studios { nodes { name } }
`;

function mapAniListMedia(a: AniListMedia): Omit<AnimeCreatePayload, "id"> & { anilistId: number } {
  return {
    anilistId: a.id,
    title: a.title.romaji,
    coverImage: a.coverImage?.large ?? "",
    episodes: a.episodes ?? undefined,
    season: a.season ?? undefined,
    seasonOrder: a.season
      ? (SEASON_ORDER[a.season as keyof typeof SEASON_ORDER] ?? undefined)
      : undefined,
    year: a.seasonYear ?? undefined,
    genres: a.genres ?? [],
    averageScore: a.averageScore ? a.averageScore / 10 : undefined,
    studio: a.studios?.nodes[0]?.name ?? undefined,
    status: a.status ?? undefined,
    description: a.description ?? undefined,
    trailer:
      a.trailer?.site === "youtube" && a.trailer?.id
        ? `https://www.youtube.com/embed/${a.trailer.id}`
        : undefined,
  };
}

async function queryAniList<T>(query: string, variables: Record<string, unknown>): Promise<T | null> {
  const res = await fetch("https://graphql.anilist.co", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });

  const json = await res.json();

  if (!json.data) {
    console.error("AniList error:", json.errors ?? json);
    return null;
  }

  return json.data as T;
}

async function fetchAniListSearch(query: string) {
  const data = await queryAniList<{ Page: { media: AniListMedia[] } }>(
    `
      query ($search: String) {
        Page(perPage: 10) {
          media(search: $search, type: ANIME) {
            ${ANILIST_MEDIA_FIELDS}
          }
        }
      }
    `,
    { search: query }
  );

  return (data?.Page.media ?? []).map(mapAniListMedia);
}

export async function fetchAnimeFromAniListById(anilistId: number) {
  const data = await queryAniList<{ Media: AniListMedia | null }>(
    `
      query ($id: Int) {
        Media(id: $id, type: ANIME) {
          ${ANILIST_MEDIA_FIELDS}
        }
      }
    `,
    { id: anilistId }
  );

  const media = data?.Media;
  if (!media) return null;

  return mapAniListMedia(media);
}

/** Fetch from AniList and persist when the user adds to their list. */
export async function ensureAnimeInDatabase(anilistId: number) {
  const existing = await prisma.anime.findUnique({
    where: { anilistId },
  });

  if (existing) return existing;

  const payload = await fetchAnimeFromAniListById(anilistId);
  if (!payload) return null;

  if (!payload.coverImage) {
    return null;
  }

  try {
    return await prisma.anime.create({ data: payload });
  } catch (err: unknown) {
    // Another request may have created the row first
    const retry = await prisma.anime.findUnique({ where: { anilistId } });
    if (retry) return retry;
    throw err;
  }
}

export async function hybridSearchAnime(query: string) {
  if (!query.trim()) return [];

  const dbResults = await prisma.anime.findMany({
    where: {
      title: {
        contains: query,
        mode: "insensitive",
      },
      status: {
        in: ["RELEASING", "FINISHED"],
      },
    },
    orderBy: { year: "desc" },
    take: 10,
  });

  const apiResults = await fetchAniListSearch(query);

  const map = new Map<number, (typeof dbResults)[number] | (typeof apiResults)[number]>();

  [...dbResults, ...apiResults].forEach((anime) => {
    map.set(anime.anilistId, anime);
  });

  const merged = Array.from(map.values());

  merged.sort((a, b) => {
    if (!a.year) return 1;
    if (!b.year) return -1;
    return b.year - a.year;
  });

  return merged;
}

export async function getAllAnime(page = 1, limit = 20) {
  return prisma.anime.findMany({
    where: {
      status: {
        in: ["RELEASING", "FINISHED"],
      },
    },
    orderBy: [
      { year: { sort: "desc", nulls: "last" } },
      { seasonOrder: "desc" },
    ],
    skip: (page - 1) * limit,
    take: limit,
  });
}

async function fetchSeasonFromAniList(season: Season, year: number) {
  const data = await queryAniList<{ Page: { media: AniListMedia[] } }>(
    `
      query ($season: MediaSeason, $seasonYear: Int) {
        Page(perPage: 20) {
          media(
            season: $season
            seasonYear: $seasonYear
            type: ANIME
            sort: POPULARITY_DESC
          ) {
            ${ANILIST_MEDIA_FIELDS}
          }
        }
      }
    `,
    { season, seasonYear: year }
  );

  return (data?.Page.media ?? []).map(mapAniListMedia);
}

function mergeAnime(db: Awaited<ReturnType<typeof prisma.anime.findMany>>, api: ReturnType<typeof mapAniListMedia>[], limit = 40) {
  const map = new Map<number, (typeof db)[number] | (typeof api)[number]>();

  for (const a of db) {
    if (a.anilistId) map.set(a.anilistId, a);
  }

  for (const a of api) {
    if (!map.has(a.anilistId)) map.set(a.anilistId, a);
  }

  const merged = Array.from(map.values());

  merged.sort((a, b) => {
    if (!a.year) return 1;
    if (!b.year) return -1;
    return b.year - a.year;
  });

  return merged.slice(0, limit);
}

export async function getSeasonAnime(season?: Season, year?: number) {
  if (!season || !year) {
    const current = getCurrentSeason();
    season = current.season;
    year = current.year;
  }

  const dbAnime = await prisma.anime.findMany({
    where: { season, year },
    take: 40,
    orderBy: { updatedAt: "desc" },
  });

  const apiAnime = await fetchSeasonFromAniList(season, year);

  return mergeAnime(dbAnime, apiAnime);
}
