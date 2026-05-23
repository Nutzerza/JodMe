import { getServerSession } from 'next-auth';
import PublicNavbar from '@/components/PublicNavbar';
import SeasonClient from '@/components/seasonPage/SeasonClient';
import { authOptions } from '@/lib/authOptions';
import { getSeasonAnime } from '@/lib/services/animeService';
import { fetchUserAnimeListByEmail } from '@/lib/services/userAnimeService';
import { getCurrentSeason } from '@/utils/getCurrentSeason';
import { Anime } from '@/types/anime';

export default async function PublicSeasonPage() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email || null;

  const currentSeason = getCurrentSeason();
  const anime = await getSeasonAnime(currentSeason.season, currentSeason.year) as Anime[];
  const userList = email
    ? await fetchUserAnimeListByEmail(email)
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 text-white">
      <PublicNavbar isAuthenticated={!!session?.user} />
      <main className="container mx-auto px-6 py-8">
        <SeasonClient
          initialAnime={anime}
          initialUserList={userList}
          initialSeason={currentSeason.season}
          initialYear={currentSeason.year}
          isAuthenticated={!!session?.user}
        />
      </main>
    </div>
  );
}
