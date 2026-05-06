// app/api/anime/season/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getSeasonAnime } from '@/lib/services/animeService';

export async function GET(req: NextRequest) {
  const season = req.nextUrl.searchParams.get('season');
  const year = Number(req.nextUrl.searchParams.get('year'));

  if (!season || !year) {
    return NextResponse.json([], { status: 400 });
  }

  const data = await getSeasonAnime(season as any, year);

  return NextResponse.json(data);
}
