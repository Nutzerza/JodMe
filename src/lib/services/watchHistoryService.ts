import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

type Db = Prisma.TransactionClient | typeof prisma;


/** Sync episode watch logs when list progress changes. */
export async function syncWatchHistory(
  userId: string,
  animeId: string,
  oldProgress: number,
  newProgress: number,
  db: Db = prisma
) {
  const oldP = Math.max(0, Math.floor(oldProgress));
  const newP = Math.max(0, Math.floor(newProgress));

  if (newP > oldP) {
    const existing = await db.watchHistory.findMany({
      where: {
        userId,
        animeId,
        episode: { gt: oldP, lte: newP },
      },
      select: { episode: true },
    });

    const logged = new Set(existing.map((e) => e.episode));
    const toCreate: { userId: string; animeId: string; episode: number }[] = [];

    for (let episode = oldP + 1; episode <= newP; episode++) {
      if (!logged.has(episode)) {
        toCreate.push({ userId, animeId, episode });
      }
    }

    if (toCreate.length > 0) {
      await db.watchHistory.createMany({ data: toCreate });
    }
  } else if (newP < oldP) {
    await db.watchHistory.deleteMany({
      where: {
        userId,
        animeId,
        episode: { gt: newP },
      },
    });
  }
}

export async function clearWatchHistoryForAnime(
  userId: string,
  animeId: string,
  db: Db = prisma
) {
  await db.watchHistory.deleteMany({
    where: { userId, animeId },
  });
}

export async function fetchMonthlyWatchStatsByEmail(email: string, months = 12) {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (!user) {
    return [];
  }

  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - months + 1, 1);

  const history = await prisma.watchHistory.findMany({
    where: {
      userId: user.id,
      watchedAt: {
        gte: start,
      },
    },
    select: {
      animeId: true,
      watchedAt: true,
    },
    orderBy: { watchedAt: "asc" },
  });

  const monthMap = new Map<string, { episodes: number; animeIds: Set<string> }>();

  for (let offset = months - 1; offset >= 0; offset--) {
    const date = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    monthMap.set(key, { episodes: 0, animeIds: new Set<string>() });
  }

  history.forEach((entry) => {
    const key = `${entry.watchedAt.getFullYear()}-${String(entry.watchedAt.getMonth() + 1).padStart(2, "0")}`;
    const month = monthMap.get(key);

    if (!month) return;

    month.episodes += 1;
    month.animeIds.add(entry.animeId);
  });

  return Array.from(monthMap.entries()).map(([month, value]) => ({
    month,
    episodes: value.episodes,
    anime: value.animeIds.size,
  }));
}

export async function fetchWeeklyWatchStatsByEmail(email: string, weeks = 12) {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (!user) {
    return [];
  }

  const now = new Date();
  const currentWeekStart = getWeekStart(now);
  const start = new Date(currentWeekStart);
  start.setDate(start.getDate() - ((weeks - 1) * 7));

  const history = await prisma.watchHistory.findMany({
    where: {
      userId: user.id,
      watchedAt: {
        gte: start,
      },
    },
    select: {
      animeId: true,
      watchedAt: true,
    },
    orderBy: { watchedAt: "asc" },
  });

  const weekMap = new Map<string, { episodes: number; animeIds: Set<string> }>();

  for (let offset = weeks - 1; offset >= 0; offset--) {
    const date = new Date(currentWeekStart);
    date.setDate(date.getDate() - (offset * 7));
    weekMap.set(formatDateKey(date), { episodes: 0, animeIds: new Set<string>() });
  }

  history.forEach((entry) => {
    const key = formatDateKey(getWeekStart(entry.watchedAt));
    const week = weekMap.get(key);

    if (!week) return;

    week.episodes += 1;
    week.animeIds.add(entry.animeId);
  });

  return Array.from(weekMap.entries()).map(([week, value]) => ({
    week,
    episodes: value.episodes,
    anime: value.animeIds.size,
  }));
}

export async function fetchRecentWatchStatsByEmail(email: string, limit = 5) {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (!user) {
    return [];
  }

  const history = await prisma.watchHistory.findMany({
    where: { userId: user.id },
    include: { anime: true },
    orderBy: { watchedAt: "desc" },
    // take: limit * 4,
  });

  const latestByAnime = new Map<string, (typeof history)[number]>();

  for (const entry of history) {
    if (!latestByAnime.has(entry.animeId)) {
      latestByAnime.set(entry.animeId, entry);
    }

    if (latestByAnime.size >= limit) {
      break;
    }
  }

  return Array.from(latestByAnime.values()).map((entry) => ({
    episode: entry.episode,
    watchedAt: entry.watchedAt.toISOString(),
    anime: {
      id: entry.anime.id,
      anilistId: entry.anime.anilistId,
      title: entry.anime.title,
      genres: entry.anime.genres,
      coverImage: entry.anime.coverImage,
      episodes: entry.anime.episodes ?? undefined,
      year: entry.anime.year ?? undefined,
      season: entry.anime.season ?? undefined,
      status: entry.anime.status ?? undefined,
      averageScore: entry.anime.averageScore ?? undefined,
      studio: entry.anime.studio ?? undefined,
      description: entry.anime.description ?? undefined,
      trailer: entry.anime.trailer ?? undefined,
    },
  }));
}

function getWeekStart(date: Date) {
  const weekStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = weekStart.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  weekStart.setDate(weekStart.getDate() + diff);
  weekStart.setHours(0, 0, 0, 0);
  return weekStart;
}

function formatDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
