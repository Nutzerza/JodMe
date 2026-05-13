// app/u/[username]/season/page.tsx

import { getSeasonAnime } from '@/lib/services/animeService';
import { fetchUserAnimeListByEmail } from '@/lib/services/userAnimeService';
import SeasonClient from '@/components/seasonPage/SeasonClient';
import { Anime } from '@/types/anime';
import { getServerSession } from "next-auth";

export default async function SeasonPage() {

  // ดึง user
  const session = await getServerSession();
  const email = session?.user?.email || null;

  // fetch list
  const animeList = email
    ? await fetchUserAnimeListByEmail(email)
    : [];
  
  const anime = await getSeasonAnime() as Anime[]; // current season

  return <SeasonClient initialAnime={anime} initialUserList={animeList} />;
}
