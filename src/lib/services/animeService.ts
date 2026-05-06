import { prisma } from "@/lib/prisma";
import { Season, SEASON_ORDER } from "@/types/anime";
import { getCurrentSeason } from "@/utils/getCurrentSeason";

// 🔹 call AniList
async function fetchAniList(query: string) {
  const res = await fetch("https://graphql.anilist.co", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: `
        query ($search: String) {
          Page(perPage: 10) {
            media(search: $search, type: ANIME) {
              id
              title {
                romaji
              }
              description(asHtml: false)
              coverImage {
                large
              }
              episodes
              season
              seasonYear
              genres
              averageScore
              status
              trailer {
                id
                site
              }
              studios {
                nodes {
                  name
                }
              }
            }
          }
        }
      `,
      variables: { search: query },
    }),
  });

  const json = await res.json();

  if (!json.data) {
    console.error("AniList error:", json.errors);
    return [];
  }

  return json.data.Page.media.map((a: any) => ({
    anilistId: a.id,
    title: a.title.romaji,
    coverImage: a.coverImage.large,
    episodes: a.episodes,
    season: a.season,
    seasonOrder: SEASON_ORDER[a.season as keyof typeof SEASON_ORDER] ?? null,
    year: a.seasonYear,
    genres: a.genres,
    averageScore: a.averageScore ? a.averageScore / 10 : null,
    studio: a.studios.nodes[0]?.name ?? null,
    status: a.status ?? null,
    description: a.description ?? null,
    // trailer → แปลงเป็น URL ใช้ง่าย
    trailer:
      a.trailer?.site === "youtube" && a.trailer?.id
        ? `https://www.youtube.com/embed/${a.trailer.id}`
        : null,
  }));
}

export async function hybridSearchAnime(query: string) {
  if (!query.trim()) return [];

  // 🔹 1. search DB
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
    orderBy: { year: 'desc' },
    take: 10,
  });

  // 🔹 2. search API (parallel)
  const apiResults = await fetchAniList(query);

  // 🔹 3. merge + dedupe
  const map = new Map();

  [...dbResults, ...apiResults].forEach((anime) => {
    map.set(anime.anilistId, anime);
  });

  const merged = Array.from(map.values());

  merged.sort((a, b) => {
    if (!a.year) return 1;
    if (!b.year) return -1;
    return b.year - a.year;
  });

  // 🔹 4. background save (ไม่ await)
  void saveNewAnime(apiResults);

  return merged;
}

async function saveNewAnime(animeList: any[]) {
  try {
    const existingList = await prisma.anime.findMany({
      where: {
        anilistId: { in: animeList.map(a => a.anilistId) },
      },
      select: {
        anilistId: true,
        episodes: true,
        averageScore: true,
        description: true,
        trailer: true,
        status: true,
      },
    });

    const STATUS_PRIORITY: Record<string, number> = {
      NOT_YET_RELEASED: 0,
      RELEASING: 1,
      FINISHED: 2,
      CANCELLED: 3,
    };

    const existingMap = new Map(
      existingList.map(a => [a.anilistId, a])
    );

    const queries = animeList.flatMap((anime) => {
      const existing = existingMap.get(anime.anilistId);

      // 🔥 ไม่มีใน DB → create
      if (!existing) {
        return [
          prisma.anime.create({
            data: anime,
          }),
        ];
      }

      // 🔍 check diff
      const shouldUpdateEpisodes =
        anime.episodes != null &&
        (!existing.episodes || anime.episodes > existing.episodes);

      const shouldUpdateScore =
        anime.averageScore != null &&
        Math.abs(anime.averageScore - (existing.averageScore ?? 0)) > 0.2;

      const normalize = (text?: string | null) =>
        text?.replace(/\s+/g, ' ').trim();
      const shouldUpdateDescription =
        anime.description &&
        normalize(anime.description) !== normalize(existing.description);

      const shouldUpdateTrailer =
        anime.trailer &&
        anime.trailer !== existing.trailer;

      const shouldUpdateStatus =
        anime.status &&
        (
          !existing.status ||
          STATUS_PRIORITY[anime.status] > (STATUS_PRIORITY[existing.status] ?? -1)
        );

      // 🔥 ไม่มีอะไรเปลี่ยน → skip
      if (
        !shouldUpdateEpisodes &&
        !shouldUpdateScore &&
        !shouldUpdateDescription &&
        !shouldUpdateTrailer &&
        !shouldUpdateStatus
      ) {
        return []; // ❗ สำคัญมาก
      }

      // ✅ update เฉพาะ field ที่เปลี่ยน
      return [
        prisma.anime.update({
          where: { anilistId: anime.anilistId },
          data: {
            ...(shouldUpdateEpisodes && { episodes: anime.episodes }),
            ...(shouldUpdateScore && { averageScore: anime.averageScore }),
            ...(shouldUpdateDescription && { description: anime.description }),
            ...(shouldUpdateTrailer && { trailer: anime.trailer }),
            ...(shouldUpdateStatus && { status: anime.status }),
          },
        }),
      ];
    });

    if (queries.length === 0) return; // 🔥 ไม่มีอะไรต้อง update

    await prisma.$transaction(queries);

  } catch (err) {
    console.error("saveNewAnime error:", err);
  }
}

export async function getAllAnime(page = 1, limit = 20) {
  return prisma.anime.findMany({
    where: {
      status: {
        in: ['RELEASING', 'FINISHED'],
      },
    },
    orderBy: [
      { year: { sort: 'desc', nulls: 'last' } },
      { seasonOrder: 'desc' },
      // { createdAt: 'desc' },
    ],
    skip: (page - 1) * limit,
    take: limit,
  });
}

async function fetchSeasonFromAniList(season: Season, year: number) {
  const res = await fetch("https://graphql.anilist.co", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: `
        query ($season: MediaSeason, $seasonYear: Int) {
          Page(perPage: 20) {
            media(
              season: $season
              seasonYear: $seasonYear
              type: ANIME
              sort: POPULARITY_DESC
            ) {
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
              studios {
                nodes { name }
              }
              trailer {
                id
                site
              }
            }
          }
        }
      `,
      variables: {
        season,
        seasonYear: year,
      },
    }),
  });

  const json = await res.json();

  if (!json.data) {
    console.error("AniList season error:", json);
    return [];
  }

  return (json.data.Page.media ?? []).map((a: any) => ({
    id: `anilist-${a.id}`, // 🔥 กันชน id ให้ไม่ชน DB
    anilistId: a.id,
    title: a.title.romaji,
    coverImage: a.coverImage.large,
    episodes: a.episodes ?? undefined,
    season: a.season ?? undefined,
    year: a.seasonYear ?? undefined,
    genres: a.genres ?? [],
    studio: a.studios.nodes[0]?.name ?? undefined,
    averageScore: a.averageScore ? a.averageScore / 10 : null,
    status: a.status ?? null,
    description: a.description ?? null,
    // trailer → แปลงเป็น URL ใช้ง่าย
    trailer:
      a.trailer?.site === "youtube" && a.trailer?.id
        ? `https://www.youtube.com/embed/${a.trailer.id}`
        : null,
  }));
}

function mergeAnime(db: any[], api: any[], limit = 40) {
  const map = new Map<number, any>();

  // ✅ ใส่ DB ก่อน (priority สูงกว่า)
  for (const a of db) {
    if (a.anilistId) {
      map.set(a.anilistId, a);
    }
  }

  // ✅ เติมจาก API ถ้ายังไม่มี
  for (const a of api) {
    if (!map.has(a.anilistId)) {
      map.set(a.anilistId, a);
    }
  }

  const merged = Array.from(map.values());

  // 🔥 sort: ปีใหม่ → เก่า
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
    orderBy: { updatedAt: 'desc' },
  });

  const apiAnime = await fetchSeasonFromAniList(season, year);

  void saveNewAnime(apiAnime);

  return mergeAnime(dbAnime, apiAnime);
}
