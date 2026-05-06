// app/u/[username]/season/page.tsx

import { getSeasonAnime } from '@/lib/services/animeService';
import SeasonClient from '@/components/seasonPage/SeasonClient';

export default async function SeasonPage() {
    const anime = await getSeasonAnime();
    return <SeasonClient initialAnime={anime as any} />;
}
