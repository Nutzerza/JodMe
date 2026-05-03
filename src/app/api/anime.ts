import { mockAnimeDatabase, seasonalAnime2024 } from '@/utils/mock/data';

export async function getAllAnime() {
    return mockAnimeDatabase;
}

export async function searchAnime(query: string) {
    if (!query.trim()) return [];

    return mockAnimeDatabase.filter(anime =>
        anime.title.toLowerCase().includes(query.toLowerCase()) ||
        anime.genres.some(g => g.toLowerCase().includes(query.toLowerCase()))
    );
}

export async function getSeasonAnime() {
    return seasonalAnime2024;
}
