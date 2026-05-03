// app/u/[username]/mylist/page.tsx

import MyListClient from '@/components/myListPage/MyListClient';
import { getUserAnimeList } from '@/app/api/userList';

export default async function MyListPage() {

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
