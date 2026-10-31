import { getUserFromToken } from "@/shared/utils/getUserFromToken";
import { NextRequest, NextResponse } from "next/server";
import { fetchUserAnimeIDListByID } from "@/lib/services/userAnimeService";

export async function GET(req: NextRequest) {
  const tokenUserId = await getUserFromToken(req);
  if (!tokenUserId) {
    return NextResponse.json([], { status: 200 });
  }
  const userId = Number(tokenUserId);
  const list = await fetchUserAnimeIDListByID(userId);
  return NextResponse.json(list);
}
