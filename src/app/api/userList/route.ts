// app/api/userList.ts
import { prisma } from '@/lib/prisma';
import { AnimeStatus } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

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
      animeId,
      status,
      progress,
      score,
    } = body;

    if (!userId || !animeId) {
      return NextResponse.json(
        { error: 'Missing userId or animeId' },
        { status: 400 }
      );
    }

    console.log(`Received update for user: ${userId}, animeId: ${animeId}, status: ${status}, progress: ${progress}, score: ${score}`);

    // upsert กันซ้ำ
    const result = await prisma.userAnime.upsert({
      where: {
        userId_animeId: {
          userId: userId as string,
          animeId,
        },
      },
      update: {
        status: toPrismaStatus(status),
        progress,
        score,
      },
      create: {
        userId: userId as string,
        animeId,
        status: toPrismaStatus(status),
        progress,
        score,
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
import { Prisma } from '@prisma/client';
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

export async function getUserFromToken(req: NextRequest) {
  const token = req.cookies.get('token')?.value;

  if (!token) return null;

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);

    return payload.userId as string;
  } catch {
    return null;
  }
}

