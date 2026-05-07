// app/u/[username]/mylist/page.tsx

import MyListClient from '@/components/myListPage/MyListClient';
import { fetchUserAnimeListByUserId } from '@/lib/services/userAnimeService';
import { getUserFromCookie } from '@/lib/auth';

export default async function MyListPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  // ✅ ดึง user จาก cookie
  const userId = await getUserFromCookie();

  // ✅ fetch list
  const animeList = userId
    ? await fetchUserAnimeListByUserId(userId)
    : [];

  return <MyListClient initialList={animeList} />;
}
