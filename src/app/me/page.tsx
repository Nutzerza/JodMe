// app/u/[username]/mylist/page.tsx

import MyListClient from '@/components/myListPage/MyListClient';
import { fetchUserAnimeListByUserId } from '@/lib/services/userAnimeService';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export default async function MyListPage() {

  return <MyListClient />;
}
