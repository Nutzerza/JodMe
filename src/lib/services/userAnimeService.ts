// lib/services/userAnimeService.ts

import { prisma } from '@/lib/prisma';

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

export async function fetchUserAnimeListByUserId(userId: string) {

  const list = await prisma.userAnime.findMany({
    where: { userId: userId },
    include: { anime: true },
    orderBy: { updatedAt: 'desc' },
  });

  return list.map((entry) => ({
    id: entry.id,
    status: toClientStatus(entry.status) as any,
    score: entry.score,
    progress: entry.progress,
    dateAdded: entry.createdAt.toISOString(),

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
