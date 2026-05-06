import { NextResponse } from "next/server";
import { hybridSearchAnime } from "@/lib/services/animeService";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";

  if (!q.trim()) {
    return NextResponse.json([]);
  }

  try {
    const result = await hybridSearchAnime(q);

    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { message: "Search failed" },
      { status: 500 }
    );
  }
}
