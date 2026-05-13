// app/u/[username]/mylist/page.tsx

import MyListClient from '@/components/myListPage/MyListClient';
import { fetchUserAnimeListByEmail } from '@/lib/services/userAnimeService';
import { getServerSession } from "next-auth";

export default async function MyListPage() {

  // ดึง user
  const session = await getServerSession();
  const email = session?.user?.email || null;

  // fetch list
  const animeList = email
    ? await fetchUserAnimeListByEmail(email)
    : [];

  return <MyListClient initialList={animeList} />;
}
