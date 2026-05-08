// app/u/[username]/search/page.tsx

import { getAllAnime } from '@/lib/services/animeService';
import SearchClient from '@/components/searchPage/SearchClient';
import { Anime } from '@/types/anime';
import { fetchUserAnimeListByUsername } from '@/lib/services/userAnimeService';
import { getServerSession } from "next-auth";

export default async function SearchPage() {
  const data = await getAllAnime(1, 20) as Anime[];

  const anime = data.map(a => ({
    ...a,
    episodes: a.episodes ?? undefined,
    season: a.season ?? undefined,
    year: a.year ?? undefined,
    studio: a.studio ?? undefined,
    averageScore: a.averageScore ?? undefined,
  }));

  // ดึง user
  const session = await getServerSession();
  const username = session?.user?.name || null;

  // ✅ fetch list
  const userList = username
    ? await fetchUserAnimeListByUsername(username)
    : [];

  return <SearchClient initialAnime={anime} initialUserList={userList} />;
}
