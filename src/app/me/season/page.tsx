// app/u/[username]/season/page.tsx

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import SeasonClient from '@/components/seasonPage/SeasonClient';
import { Anime } from '@/types/anime';
import { getSeasonAnime } from '@/lib/services/animeService';
import { fetchUserAnimeListByEmail } from '@/lib/services/userAnimeService';
import { getCurrentSeason } from '@/utils/getCurrentSeason';

export default async function SeasonPage() {

  // ดึง user
  const session = await getServerSession(authOptions);
  const email = session?.user?.email || null;

  // fetch list
  const animeList = email
    ? await fetchUserAnimeListByEmail(email)
    : [];

  const currentSeason = getCurrentSeason(); // current season

  const anime = await getSeasonAnime(currentSeason.season, currentSeason.year) as Anime[]; // current season

  return <SeasonClient
    initialAnime={anime}
    initialUserList={animeList}
    initialSeason={currentSeason.season}
    initialYear={currentSeason.year}
  />;
}
