// app/u/[username]/mylist/page.tsx

import MyListClient from '@/components/myListPage/MyListClient';
import { fetchUserAnimeListByUsername } from '@/lib/services/userAnimeService';
import { getServerSession } from "next-auth";

export default async function MyListPage() {

  // ดึง user
  const session = await getServerSession();
  const username = session?.user?.name || null;

  // fetch list
  const animeList = username
    ? await fetchUserAnimeListByUsername(username)
    : [];

  return <MyListClient initialList={animeList} />;
}
