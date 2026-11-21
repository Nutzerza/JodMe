import { NextRequest, NextResponse } from "next/server";
import { statCountByStatus } from "@/lib/services/userAnimeService";
import { getUserFromToken } from "@/shared/utils/getUserFromToken";

export async function GET(req: NextRequest) {
  const userId = await getUserFromToken(req);

  if (!userId) {
    return NextResponse.json([], { status: 200 });
  }

  try {
    const result = await statCountByStatus(Number(userId));
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ message: "Search failed" }, { status: 500 });
  }
}
