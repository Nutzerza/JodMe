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
