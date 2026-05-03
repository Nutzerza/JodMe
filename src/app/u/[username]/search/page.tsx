// app/u/[username]/search/page.tsx

import { getAllAnime } from '@/app/api/anime';
import SearchClient from '@/components/searchPage/SearchClient';

export default async function SearchPage() {
    // ✅ server สามารถใช้ mock DB ได้
    const anime = await getAllAnime();

    return <SearchClient initialAnime={anime} />;
}
