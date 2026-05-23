import { getServerSession } from 'next-auth';
import PublicNavbar from '@/components/PublicNavbar';
import SearchClient from '@/components/searchPage/SearchClient';
import { authOptions } from '@/lib/authOptions';
import { getAllAnime } from '@/lib/services/animeService';
import { fetchUserAnimeListByEmail } from '@/lib/services/userAnimeService';
import { Anime } from '@/types/anime';

export default async function PublicSearchPage() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email || null;

  const data = await getAllAnime(1, 10) as Anime[];
  const anime = data.map(a => ({
    ...a,
    episodes: a.episodes ?? undefined,
    season: a.season ?? undefined,
    year: a.year ?? undefined,
    studio: a.studio ?? undefined,
    averageScore: a.averageScore ?? undefined,
  }));

  const userList = email
    ? await fetchUserAnimeListByEmail(email)
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 text-white">
      <PublicNavbar isAuthenticated={!!session?.user} />
      <main className="container mx-auto px-6 py-8">
        <SearchClient
          initialAnime={anime}
          initialUserList={userList}
          isAuthenticated={!!session?.user}
        />
      </main>
    </div>
  );
}
