import { prisma } from "@/lib/prisma";
import { Anime, Season, SEASON_ORDER } from "@/types/anime";
import { getCurrentSeason } from "@/features/anime/animeSeason/utils/getCurrentSeason";
import type { Prisma } from "@prisma/client";
import { randomUUID } from "crypto";
import { getSeasonOrder } from "@/features/anime/animeSeason/utils/seasonUtils";

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

function mapAniListMedia(
  a: AniListMedia,
): Omit<AnimeCreatePayload, "id"> & { anilistId: number } {
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

async function queryAniList<T>(
  query: string,
  variables: Record<string, unknown>,
): Promise<T | null> {
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
    { search: query },
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
    { id: anilistId },
  );

  const media = data?.Media;
  if (!media) return null;

  return mapAniListMedia(media);
}

/** Fetch from AniList and persist when the user adds to their list. */
export async function ensureAnimeInDatabase(
  animeList: AniListMedia[],
  dbAnime: Anime[],
  season: string,
  year: number,
  current: { season: string; year: number },
) {
  // 1. Collect existing AniList IDs from database results.
  const existingIds = new Set(dbAnime.map((anime) => anime.anilistId));
  // 2. Remove duplicate IDs from the AniList response.
  const uniqueAnime = Array.from(
    new Map(animeList.map((anime) => [anime.id, anime] as const)).values(),
  );
  // 3. Keep only anime that do not exist in dbAnime.
  const animeToCreate = uniqueAnime.filter(
    (anime) => !existingIds.has(anime.id),
  );

  // 4. Bulk insert missing anime and their UID mappings.
  if (animeToCreate.length > 0) {
    await prisma.$transaction(async (tx) => {
      const createdAnime = await tx.anime.createManyAndReturn({
        data: animeToCreate.map((anime) => ({
          anilistId: anime.id,
          title: anime.title?.romaji,
          description: anime.description ?? null,
          coverImage: anime.coverImage?.large ?? "",
          episodes: anime.episodes ?? null,
          season: anime.season ?? null,
          seasonOrder: getSeasonOrder(anime.season ?? ""),
          year: anime.seasonYear ?? null,
          genres: anime.genres ?? [],
          averageScore:
            anime.averageScore == null
              ? null
              : anime.averageScore > 10
                ? anime.averageScore / 10
                : anime.averageScore,
          status: anime.status ?? null,
        })),
        skipDuplicates: true,
        select: {
          id: true,
          anilistId: true,
        },
      });

      // 5. Bulk create UID mappings for newly inserted anime.
      if (createdAnime.length > 0) {
        await tx.mapAnimeUid.createMany({
          data: createdAnime.map((anime) => ({
            id: anime.id,
            uid: randomUUID(),
          })),
          skipDuplicates: true,
        });
      }
    });
  }

  // if season and year are below current season save the fetch
  // if the season and year are equal or in the future, do not save the fetch
  if (
    year < current.year ||
    (year === current.year &&
      getSeasonOrder(season) < getSeasonOrder(current.season))
  ) {
    await prisma.seasonFetch.create({
      data: { season, year },
    });
  }

  // 6. Return persisted anime with their UID mappings.
  const savedAnime = await prisma.anime.findMany({
    where: {
      anilistId: {
        in: uniqueAnime.map((anime) => anime.id),
      },
    },
    include: {
      mapAnimeUid: true,
    },
  });

  // Preserve the order of the original AniList list.
  const savedByAniListId = new Map(
    savedAnime.map((anime) => [anime.anilistId, anime]),
  );

  return uniqueAnime.flatMap((anime) => {
    const saved = savedByAniListId.get(anime.id);
    return saved ? [saved] : [];
  });
}

export async function hybridSearchAnime(searchParams: URLSearchParams) {
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "20", 10);
  const query = searchParams.get("query") || "";
  // if (!query.trim()) return [];

  const dbResults = await prisma.anime.findMany({
    // where: {
    //   title: {
    //     contains: query,
    //     mode: "insensitive",
    //   },
    // status: {
    //   in: ["RELEASING", "FINISHED"],
    // },
    // },
    // orderBy: { year: "desc" },
    orderBy: [
      { year: { sort: "desc", nulls: "last" } },
      { seasonOrder: { sort: "desc", nulls: "last" } },
      { averageScore: { sort: "desc", nulls: "last" } },
    ],
    take: limit,
    skip: (page - 1) * limit,
  });

  // const apiResults = await fetchAniListSearch(query);

  const map = new Map<
    number,
    (typeof dbResults)[number]
    // | (typeof apiResults)[number]
  >();

  // , ...apiResults
  [...dbResults].forEach((anime) => {
    map.set(anime.anilistId, anime);
  });

  const merged = Array.from(map.values());

  merged.sort((a, b) => {
    if (!a.year) return 1;
    if (!b.year) return -1;
    return b.year - a.year;
  });
  console.log("DB Results:", merged);

  return merged;
}

// Fetch all anime from the database with pagination, ordered by year and season.
export async function getAllAnime(page = 1, limit = 20) {
  return prisma.anime.findMany({
    // where: {
    //   status: {
    //     in: ["RELEASING", "FINISHED"],
    //   },
    // },
    include: {
      mapAnimeUid: true,
    },
    orderBy: [
      { year: { sort: "desc", nulls: "last" } },
      { seasonOrder: "desc" },
    ],
    skip: (page - 1) * limit,
    take: limit,
  });
}

// Fetch anime for a specific season and year from AniList API.
async function fetchSeasonFromAniList(season: Season, year: number) {
  const allMedia: AniListMedia[] = [];

  const perPage = 50;
  let page = 1;
  let hasNextPage = true;

  while (hasNextPage) {
    // AniList จำกัดการเข้าถึง Pagination ไว้ที่ 5,000 รายการ
    if ((page - 1) * perPage >= 5000) {
      throw new Error("AniList pagination limit reached");
    }

    const data = await queryAniList<{
      Page: {
        pageInfo: {
          hasNextPage: boolean | null;
        };
        media: AniListMedia[];
      };
    }>(
      `
        query (
          $season: MediaSeason,
          $seasonYear: Int,
          $page: Int,
          $perPage: Int
        ) {
          Page(
            page: $page,
            perPage: $perPage
          ) {
            pageInfo {
              hasNextPage
            }
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
      {
        season,
        seasonYear: year,
        page,
        perPage,
      },
    );

    if (!data?.Page) {
      throw new Error(`Failed to fetch AniList page ${page}`);
    }

    allMedia.push(...data.Page.media);

    hasNextPage = data.Page.pageInfo.hasNextPage ?? false;

    page++;
  }

  return allMedia;
}

// Merge anime from the database and API, prioritizing database entries and limiting the result set.
function mergeAnime(
  db: Anime[],
  api: ReturnType<typeof mapAniListMedia>[],
  // limit = 40,
) {
  const map = new Map<number, (typeof db)[number] | (typeof api)[number]>();

  for (const a of db) {
    if (a.anilistId) map.set(a.anilistId, a);
  }

  for (const a of api) {
    if (!map.has(a.anilistId)) map.set(a.anilistId, a);
  }

  const merged = Array.from(map.values());

  merged.sort((a, b) => {
    return (b.averageScore ?? 0) - (a.averageScore ?? 0);
  });

  // return merged.slice(0, limit);
  return merged;
}

// Fetch anime for a specific season and year, merging database and API results.
export async function getSeasonAnime(season?: Season, year?: number) {
  const current = getCurrentSeason();
  if (!season || !year) {
    season = current.season;
    year = current.year;
  }

  const dbAnime = (await prisma.anime.findMany({
    where: { season, year },
    orderBy: { updatedAt: "desc" },
  })) as Anime[];

  const seasonFetch = await prisma.seasonFetch.findFirst({
    where: { season, year },
  });

  if (!seasonFetch) {
    const apiAnime = await fetchSeasonFromAniList(season, year);
    console.log(apiAnime.length);
    await ensureAnimeInDatabase(apiAnime, dbAnime, season, year, current);
    const mappedApiAnime = apiAnime.map(mapAniListMedia);
    return mergeAnime(dbAnime, mappedApiAnime);
  } else {
    return mergeAnime(dbAnime, []);
  }
}
