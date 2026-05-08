// app/u/[username]/season/page.tsx

import { getSeasonAnime } from '@/lib/services/animeService';
import { fetchUserAnimeListByUserId } from '@/lib/services/userAnimeService';
import { getUserFromCookie } from '@/lib/auth';
import SeasonClient from '@/components/seasonPage/SeasonClient';
import { Anime } from '@/types/anime';

export default async function SeasonPage() {

  // ✅ ดึง user จาก cookie
  const userId = await getUserFromCookie();

  // ✅ fetch list
  const animeList = userId
    ? await fetchUserAnimeListByUserId(userId)
    : [];
  
  const anime = await getSeasonAnime() as Anime[]; // current season

  return <SeasonClient initialAnime={anime} initialUserList={animeList} />;
}
