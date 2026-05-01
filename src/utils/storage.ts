import { UserAnimeEntry, Stats } from '../types/anime';

const STORAGE_KEY = 'anitrack_list';

export const getAnimeList = (): UserAnimeEntry[] => {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
};

export const saveAnimeList = (list: UserAnimeEntry[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
};

export const addAnimeToList = (entry: UserAnimeEntry) => {
    const list = getAnimeList();
    const existing = list.find(item => item.anime.id === entry.anime.id);

    if (existing) {
        return false;
    }

    list.push(entry);
    saveAnimeList(list);
    return true;
};

export const updateAnimeEntry = (animeId: number, updates: Partial<UserAnimeEntry>) => {
    const list = getAnimeList();
    const index = list.findIndex(item => item.anime.id === animeId);

    if (index !== -1) {
        list[index] = { ...list[index], ...updates };
        saveAnimeList(list);
        return true;
    }

    return false;
};

export const removeAnimeFromList = (animeId: number) => {
    const list = getAnimeList();
    const filtered = list.filter(item => item.anime.id !== animeId);
    saveAnimeList(filtered);
};

export const calculateStats = (animeList: UserAnimeEntry[]): Stats => {
    const list = getAnimeList();

    const totalAnime = list.length;
    const episodesWatched = list.reduce((sum, entry) => sum + entry.progress, 0);
    const daysWatched = Math.round((episodesWatched * 24) / 60 / 24 * 10) / 10; // Assuming 24min per episode

    const ratedAnime = list.filter(entry => entry.score !== null);
    const avgScore = ratedAnime.length > 0
        ? Math.round(ratedAnime.reduce((sum, entry) => sum + (entry.score || 0), 0) / ratedAnime.length * 10) / 10
        : 0;

    // Genre distribution
    const genreMap = new Map<string, number>();
    list.forEach(entry => {
        entry.anime.genres.forEach(genre => {
            genreMap.set(genre, (genreMap.get(genre) || 0) + 1);
        });
    });

    const genreDistribution = Array.from(genreMap.entries())
        .map(([genre, count]) => ({ genre, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

    // Score distribution
    const scoreMap = new Map<number, number>();
    for (let i = 1; i <= 10; i++) {
        scoreMap.set(i, 0);
    }

    ratedAnime.forEach(entry => {
        if (entry.score !== null) {
            scoreMap.set(entry.score, (scoreMap.get(entry.score) || 0) + 1);
        }
    });

    const scoreDistribution = Array.from(scoreMap.entries())
        .map(([score, count]) => ({ score, count }));

    return {
        totalAnime,
        episodesWatched,
        daysWatched,
        avgScore,
        genreDistribution,
        scoreDistribution,
    };
};
