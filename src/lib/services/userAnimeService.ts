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

  const whereId: any = {
    userId,
  };

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

  return {
    data: newList,
    meta: {
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    }
  };
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
