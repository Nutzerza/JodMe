// app/api/userList.ts
import { prisma } from '@/lib/prisma';
import { AnimeStatus } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const userId = await getUserFromToken(req);

  if (!userId) {
    return NextResponse.json([], { status: 200 });
  }

  const list = await fetchUserAnimeListByUserId(userId);
  return NextResponse.json(list);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const userId = await getUserFromToken(req);

    const {
      animeListId,
      status,
      progress,
      score,
    } = body;

    if (!userId || !animeListId) {
      return NextResponse.json(
        { error: 'Missing userId or animeId' },
        { status: 400 }
      );
    }

    const anime = await prisma.anime.findUnique({
      where: { anilistId: animeListId },
    });

    if (!anime) {
      return NextResponse.json(
        { error: "Anime not found" },
        { status: 404 }
      );
    }

    const existing = await prisma.userAnime.findUnique({
      where: {
        userId_animeId: {
          userId: userId as string,
          animeId: anime.id,
        },
      },
    });

    const newStatus = toPrismaStatus(status);

    const data: any = {
      status: newStatus,
      progress,
      score,
    };

    // startDate logic
    if (!existing && progress > 0) {
      data.startDate = new Date();
    }

    if (existing && existing.progress === 0 && progress > 0) {
      data.startDate = new Date();
    }

    // finishDate logic
    if (newStatus === "COMPLETED") {
      data.finishDate = new Date();
    }

    // ถ้าย้อนกลับมาไม่ completed
    if (existing && existing.status === "COMPLETED" && newStatus !== "COMPLETED") {
      data.finishDate = null;
    }

    const result = await prisma.userAnime.upsert({
      where: {
        userId_animeId: {
          userId: userId as string,
          animeId: anime.id,
        },
      },
      update: data,
      create: {
        userId: userId as string,
        animeId: anime.id,
        ...data,
      },
    });

    return NextResponse.json(result);

  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// map Prisma enum → frontend enum
import { fetchUserAnimeListByUserId } from '@/lib/services/userAnimeService';

function toPrismaStatus(status: string): AnimeStatus {
  switch (status) {
    case 'plan_to_watch':
      return AnimeStatus.PLANNING;
    case 'watching':
      return AnimeStatus.WATCHING;
    case 'completed':
      return AnimeStatus.COMPLETED;
    case 'on_hold':
      return AnimeStatus.ON_HOLD;
    case 'dropped':
      return AnimeStatus.DROPPED;
    default:
      return AnimeStatus.PLANNING;
  }
}

import { getToken } from "next-auth/jwt";

export async function getUserFromToken(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token) return null;

  return token.id as string;
}
