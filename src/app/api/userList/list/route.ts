import { AnimeStatus } from "@prisma/client";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

import { ensureAnimeInDatabase } from "@/lib/services/animeService";
import { fetchUserAnimeListByUserId } from "@/lib/services/userAnimeService";
import { syncWatchHistory } from "@/lib/services/watchHistoryService";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const userId = await getUserFromToken(req);

  if (!userId) {
    return NextResponse.json([], { status: 200 });
  }

  const { searchParams } = new URL(req.url);

  const page = Number(searchParams.get("page") || 1);
  const limit = Number(searchParams.get("limit") || 20);

  const list = await fetchUserAnimeListByUserId({userId, page, limit});
  return NextResponse.json(list);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const userId = await getUserFromToken(req);

    const { animeListId, status, progress, score } = body;
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const anime = await ensureAnimeInDatabase(Number(animeListId));

    if (!anime) {
      return NextResponse.json(
        { error: "Anime not found on AniList" },
        { status: 404 }
      );
    }

    const existing = await prisma.userAnime.findUnique({
      where: {
        userId_animeId: {
          userId,
          animeId: anime.id,
        },
      },
    });

    const newStatus = toPrismaStatus(status);

    const data: {
      status: AnimeStatus;
      progress: number;
      score: number | null;
      startDate?: Date;
      finishDate?: Date | null;
    } = {
      status: newStatus,
      progress,
      score,
    };

    if (!existing && progress > 0) {
      data.startDate = new Date();
    }

    if (existing && existing.progress === 0 && progress > 0) {
      data.startDate = new Date();
    }

    if (newStatus === "COMPLETED") {
      data.finishDate = new Date();
    }

    if (existing && existing.status === "COMPLETED" && newStatus !== "COMPLETED") {
      data.finishDate = null;
    }

    const oldProgress = existing?.progress ?? 0;
    const newProgress = Math.max(0, Math.floor(Number(progress) || 0));

    const result = await prisma.$transaction(async (tx) => {
      const entry = await tx.userAnime.upsert({
        where: {
          userId_animeId: {
            userId,
            animeId: anime.id,
          },
        },
        update: { ...data, progress: newProgress },
        create: {
          userId,
          animeId: anime.id,
          ...data,
          progress: newProgress,
        },
      });

      await syncWatchHistory(userId, anime.id, oldProgress, newProgress, tx);

      return entry;
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const userId = await getUserFromToken(req);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const animeListId = Number(searchParams.get("animeListId"));

    if (!animeListId) {
      return NextResponse.json(
        { error: "Missing animeListId" },
        { status: 400 }
      );
    }

    const anime = await prisma.anime.findUnique({
      where: { anilistId: animeListId },
    });

    if (!anime) {
      return NextResponse.json({ error: "Anime not found" }, { status: 404 });
    }

    const existing = await prisma.userAnime.findUnique({
      where: {
        userId_animeId: { userId, animeId: anime.id },
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Not in list" }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.watchHistory.deleteMany({
        where: { userId, animeId: anime.id },
      });
      await tx.userAnime.delete({
        where: { id: existing.id },
      });
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

function toPrismaStatus(status: string): AnimeStatus {
  switch (status) {
    case "plan_to_watch":
      return AnimeStatus.PLANNING;
    case "watching":
      return AnimeStatus.WATCHING;
    case "completed":
      return AnimeStatus.COMPLETED;
    case "on_hold":
      return AnimeStatus.ON_HOLD;
    case "dropped":
      return AnimeStatus.DROPPED;
    default:
      return AnimeStatus.PLANNING;
  }
}

export async function getUserFromToken(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token) return null;

  return token.id as string;
}
