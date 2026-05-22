import StatsClient from '@/components/statPage/StatsClient';
import { authOptions } from '@/lib/authOptions';
import { fetchUserAnimeListByEmail } from '@/lib/services/userAnimeService';
import {
  fetchMonthlyWatchStatsByEmail,
  fetchRecentWatchStatsByEmail,
  fetchWeeklyWatchStatsByEmail,
} from '@/lib/services/watchHistoryService';
import { getServerSession } from 'next-auth';

export default async function StatsPage() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email || null;

  const animeList = email
    ? await fetchUserAnimeListByEmail(email)
    : [];

  const monthlyWatchStats = email
    ? await fetchMonthlyWatchStatsByEmail(email)
    : [];

  const weeklyWatchStats = email
    ? await fetchWeeklyWatchStatsByEmail(email)
    : [];

  const recentWatchStats = email
    ? await fetchRecentWatchStatsByEmail(email)
    : [];

  return (
    <StatsClient
      initialList={animeList}
      monthlyWatchStats={monthlyWatchStats}
      weeklyWatchStats={weeklyWatchStats}
      recentWatchStats={recentWatchStats}
    />
  );
}
