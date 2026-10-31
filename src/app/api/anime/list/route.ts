import { NextResponse } from "next/server";
import { getAllAnime } from "@/shared/services/animeService";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const page = Number(searchParams.get("page") || 1);
  const limit = Number(searchParams.get("limit") || 20);

  const data = await getAllAnime(page, limit);
  console.log(data);

  return NextResponse.json(data);
}
