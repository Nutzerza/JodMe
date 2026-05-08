// app/u/[username]/season/page.tsx

import { getSeasonAnime } from '@/lib/services/animeService';
import { fetchUserAnimeListByUsername } from '@/lib/services/userAnimeService';
import { getUserFromCookie } from '@/lib/auth';
import SeasonClient from '@/components/seasonPage/SeasonClient';
import { Anime } from '@/types/anime';
import { getServerSession } from "next-auth";

export default async function SeasonPage() {

  // ดึง user
  const session = await getServerSession();
  const username = session?.user?.name || null;

  // ✅ fetch list
  const animeList = username
    ? await fetchUserAnimeListByUsername(username)
    : [];
  
  const anime = await getSeasonAnime() as Anime[]; // current season

  return <SeasonClient initialAnime={anime} initialUserList={animeList} />;
}
