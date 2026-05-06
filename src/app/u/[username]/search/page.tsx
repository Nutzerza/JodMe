// app/u/[username]/search/page.tsx

import { getAllAnime } from '@/lib/services/animeService';
import SearchClient from '@/components/searchPage/SearchClient';
import { Anime } from '@/types/anime';

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

  return <SearchClient initialAnime={anime} />;
}