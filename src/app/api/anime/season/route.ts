// API route for fetching anime by season and year
import { NextRequest, NextResponse } from "next/server";
import { getSeasonAnime } from "@/shared/services/animeService";
import { Season } from "@/types/anime";

export async function GET(req: NextRequest) {
  const season = req.nextUrl.searchParams.get("season") as Season;
  const year = Number(req.nextUrl.searchParams.get("year"));

  if (!season || !year) {
    return NextResponse.json([], { status: 400 });
  }

  const data = await getSeasonAnime(season, year);

  return NextResponse.json(data);
}
