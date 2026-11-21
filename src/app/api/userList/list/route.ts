// API route for managing the user's anime list

import { AnimeStatus } from "@prisma/client";
import { toPrismaStatus } from "@/features/anime/animeSeason/utils/getCurrentSeason";
import { NextRequest, NextResponse } from "next/server";
import { fetchUserAnimeListByUserId } from "@/lib/services/userAnimeService";
import { syncWatchHistory } from "@/lib/services/watchHistoryService";
import { prisma } from "@/lib/prisma";
import { getUserFromToken } from "@/shared/utils/getUserFromToken";

// GET: Fetch the user's anime list
export async function GET(req: NextRequest) {
  const tokenUserId = await getUserFromToken(req);

  if (!tokenUserId) {
    return NextResponse.json([], { status: 200 });
  }

  const userId = Number(tokenUserId);

  const { searchParams } = new URL(req.url);

  const page = Number(searchParams.get("page") || 1);
  const limit = Number(searchParams.get("limit") || 20);

  const list = await fetchUserAnimeListByUserId({ userId, page, limit });
  return NextResponse.json(list);
}

// POST: Add or update an anime entry in the user's list
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const tokenUserId = await getUserFromToken(req);

    const { animeId, status, progress, score } = body;
    if (!tokenUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = Number(tokenUserId);

    // const anime = await ensureAnimeInDatabase(Number(animeListId));

    // if (!anime) {
    //   return NextResponse.json(
    //     { error: "Anime not found on AniList" },
    //     { status: 404 },
    //   );
    // }

    // Get existing user anime entry if it exists
    const existing = await prisma.userAnime.findUnique({
      where: {
        userId_animeId: {
          userId,
          animeId: animeId,
        },
      },
    });

    // Prepare data for upsert
    const data: {
      status: AnimeStatus;
      progress: number;
      score: number | null;
      startDate?: Date;
      finishDate?: Date | null;
    } = {
      status: toPrismaStatus(status),
      progress,
      score,
    };
    // Set start and finish dates based on progress and status
    if (!existing && progress > 0) {
      data.startDate = new Date();
    } else if (existing && existing.progress === 0 && progress > 0) {
      data.startDate = new Date();
    }
    if (toPrismaStatus(status) === AnimeStatus.COMPLETED) {
      data.finishDate = new Date();
    }
    if (
      existing &&
      existing.status === AnimeStatus.COMPLETED &&
      toPrismaStatus(status) !== AnimeStatus.COMPLETED
    ) {
      data.finishDate = null;
    }

    const oldProgress = existing?.progress ?? 0;
    const newProgress = Math.max(0, Math.floor(Number(progress) || 0));

    const result = await prisma.$transaction(async (tx) => {
      const entry = await tx.userAnime.upsert({
        where: {
          userId_animeId: {
            userId,
            animeId: animeId,
          },
        },
        update: { ...data, progress: newProgress },
        create: {
          userId,
          animeId: animeId,
          ...data,
          progress: newProgress,
        },
      });

      await syncWatchHistory(userId, animeId, oldProgress, newProgress, tx);

      return entry;
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// DELETE: Remove an anime entry from the user's list
export async function DELETE(req: NextRequest) {
  try {
    const tokenUserId = await getUserFromToken(req);
    if (!tokenUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = Number(tokenUserId);

    const { searchParams } = new URL(req.url);
    const id = Number(searchParams.get("id"));
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.watchHistory.deleteMany({
        where: { userId, animeId: id },
      });
      await tx.userAnime.delete({
        where: { userId_animeId: { userId, animeId: id } },
      });
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// function toPrismaStatus(status: string): AnimeStatus {
//   switch (status) {
//     case "plan_to_watch":
//       return AnimeStatus.PLANNING;
//     case "watching":
//       return AnimeStatus.WATCHING;
//     case "completed":
//       return AnimeStatus.COMPLETED;
//     case "on_hold":
//       return AnimeStatus.ON_HOLD;
//     case "dropped":
//       return AnimeStatus.DROPPED;
//     default:
//       return AnimeStatus.PLANNING;
//   }
// }

// export async function getUserFromToken(req: NextRequest) {
//   const token = await getToken({
//     req,
//     secret: process.env.NEXTAUTH_SECRET,
//   });

//   if (!token) return null;

//   return token.id;
// }
