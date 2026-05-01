import { UserAnimeEntry } from '@/types/anime';
import { mockAnimeDatabase } from '@/utils/mock/data';

export const mockUserAnimeList: UserAnimeEntry[] = [
    {
        anime: mockAnimeDatabase[0],
        status: 'completed',
        progress: 28,
        score: 9.5,
        dateAdded: new Date('2024-03-20').toISOString(),
    },
    {
        anime: mockAnimeDatabase[1],
        status: 'watching',
        progress: 9,
        score: 8.8,
        dateAdded: new Date('2024-03-18').toISOString(),
    },
    {
        anime: mockAnimeDatabase[2],
        status: 'completed',
        progress: 26,
        score: 9.0,
        dateAdded: new Date('2024-03-15').toISOString(),
    },
    {
        anime: mockAnimeDatabase[3],
        status: 'on_hold',
        progress: 10,
        score: 8.5,
        dateAdded: new Date('2024-03-10').toISOString(),
    },
    {
        anime: mockAnimeDatabase[4],
        status: 'plan_to_watch',
        progress: 0,
        score: null,
        dateAdded: new Date('2024-03-05').toISOString(),
    },
];