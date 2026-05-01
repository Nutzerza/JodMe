// app/u/[username]/mylist/page.tsx

import MyListClient from '@/components/myListPage/MyListClient';
import { getUserAnimeList } from '@/lib/api/userList';

export default async function MyListPage() {
    // ⚠️ localStorage ใช้ใน server ไม่ได้
    // 👉 ถ้ายังใช้ localStorage → ต้องปล่อยให้ client โหลดเอง
    const animeList = await getUserAnimeList();

    // 👉 ในอนาคตควรเปลี่ยนเป็น DB fetch ตรงนี้
    const initialData = {
        animeList: [],
        stats: {
            totalAnime: 0,
            episodesWatched: 0,
            daysWatched: 0,
            avgScore: 0,
        },
    };

    return <MyListClient initialList={animeList} />;
}
