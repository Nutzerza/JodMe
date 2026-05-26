// lib/services/userAnimeService.ts

import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { AnimeStatus as PrismaAnimeStatus } from '@prisma/client';

export async function fetchUserAnimeListByEmail(email: string) {

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return [];
  }

  const list = await prisma.userAnime.findMany({
    where: { userId: user?.id },
    include: { anime: true },
    orderBy: { updatedAt: 'desc' },
  });

  return list.map((entry) => ({
    id: entry.id,
    status: toClientStatus(entry.status) as any,
    score: entry.score,
    progress: entry.progress,
    dateAdded: entry.createdAt.toISOString(),
    updatedAt: entry.updatedAt.toISOString(),

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

function toDbStatus(status?: string): PrismaAnimeStatus | undefined {
  switch (status) {
    case 'watching':
      return PrismaAnimeStatus.WATCHING;

    case 'completed':
      return PrismaAnimeStatus.COMPLETED;

    case 'on_hold':
      return PrismaAnimeStatus.ON_HOLD;

    case 'dropped':
      return PrismaAnimeStatus.DROPPED;

    case 'plan_to_watch':
      return PrismaAnimeStatus.PLANNING;

    default:
      return undefined;
  }
}

export async function fetchUserAnimeListByUserId({
  userId, search, page, limit, status, sort
}: {
  userId: string; search?: string; page: number; limit: number; status?: string; sort?: string
}) {

  const statusMap = toDbStatus(status);

  const orderBy =
    sort === 'score'
      ? { score: 'desc' as const }
      : sort === 'title'
        ? { anime: { title: 'asc' as const } }
        : sort === 'dateAdded'
          ? { createdAt: 'desc' as const }
          : { updatedAt: 'desc' as const };

  const where: Prisma.UserAnimeWhereInput = {
    userId,

    ...(statusMap && {
      status: statusMap,
    }),

    ...(search && {
      anime: {
        title: {
          contains: search,
          mode: 'insensitive',
        },
      },
    }),
  };

  const [list, total] = await Promise.all([
    prisma.userAnime.findMany({
      where,
      include: { anime: true },
      orderBy: orderBy || { updatedAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.userAnime.count({ where }),
  ]);

  const newList = list.map((entry) => ({
    id: entry.id,
    status: toClientStatus(entry.status) as any,
    score: entry.score,
    progress: entry.progress,
    dateAdded: entry.createdAt.toISOString(),
    updatedAt: entry.updatedAt.toISOString(),

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
    }
  }));

  const stats = await prisma.userAnime.aggregate({
    where,
    _sum: {
      progress: true,
    },
    _avg: {
      score: true,
    },
    _count: true,
  });

  return {
    data: newList,
    meta: {
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    },
    stats: {
      totalEntries: stats._count,
      totalProgress: stats._sum.progress ?? 0,
      averageScore: stats._avg.score?.toFixed(2) ?? 0,
    },
  };
}

export async function statCountByStatus(userId: string) {
  const counts = await prisma.userAnime.groupBy({
    by: ['status'],
    where: { userId },
    _count: true,
  });

  const result = {
    watching: 0,
    completed: 0,
    on_hold: 0,
    dropped: 0,
    plan_to_watch: 0,
  };

  counts.forEach((item) => {
    const status = toClientStatus(item.status);
    result[status] = item._count;
  }
  );

  return result;
}

// map ให้ตรง client
function toClientStatus(status: string) {
  switch (status) {
    case 'PLANNING':
      return 'plan_to_watch';
    case 'WATCHING':
      return 'watching';
    case 'COMPLETED':
      return 'completed';
    case 'ON_HOLD':
      return 'on_hold';
    case 'DROPPED':
      return 'dropped';
    default:
      return 'plan_to_watch';
  }
}
