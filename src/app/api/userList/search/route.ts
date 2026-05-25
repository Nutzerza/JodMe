import { NextRequest, NextResponse } from "next/server";
import { fetchUserAnimeListByUserId } from "@/lib/services/userAnimeService";
import { getUserFromToken } from "../list/route";

export async function GET(req: NextRequest) {
  const userId = await getUserFromToken(req);

  if (!userId) {
    return NextResponse.json([], { status: 200 });
  }

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  const page = Number(searchParams.get('page')) || 1;
  const limit = Number(searchParams.get('limit')) || 10;
  const status = searchParams.get('status') || 'all';
  const sort = searchParams.get('sort') || 'updatedAt';

  try {
    const result = await fetchUserAnimeListByUserId({ userId, search: q, page: page, limit: limit, status, sort });
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { message: "Search failed" },
      { status: 500 }
    );
  }
}
