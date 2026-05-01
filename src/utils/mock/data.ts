import { Anime, SeasonAnime } from '@/types/anime';

export const mockAnimeDatabase: Anime[] = [
  {
    id: 1,
    title: "Frieren: Beyond Journey's End",
    episodes: 28,
    season: 'Fall',
    year: 2023,
    genres: ['Fantasy', 'Adventure', 'Drama'],
    studio: 'Madhouse',
    coverImage: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&h=600&fit=crop',
    synopsis: 'An elf mage embarks on a journey to understand humans after her hero party disbanded.'
  },
  {
    id: 2,
    title: 'Solo Leveling',
    episodes: 12,
    season: 'Winter',
    year: 2024,
    genres: ['Action', 'Fantasy'],
    studio: 'A-1 Pictures',
    coverImage: 'https://images.unsplash.com/photo-1618336753974-aae8e04506aa?w=400&h=600&fit=crop',
    synopsis: 'The weakest hunter gains a unique power to level up infinitely.'
  },
  {
    id: 3,
    title: 'Demon Slayer: Kimetsu no Yaiba',
    episodes: 26,
    season: 'Spring',
    year: 2019,
    genres: ['Action', 'Shounen', 'Supernatural'],
    studio: 'ufotable',
    coverImage: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=400&h=600&fit=crop',
    synopsis: 'A boy fights demons to save his sister and avenge his family.'
  },
  {
    id: 4,
    title: 'Vinland Saga Season 2',
    episodes: 24,
    season: 'Winter',
    year: 2023,
    genres: ['Historical', 'Drama', 'Action'],
    studio: 'MAPPA',
    coverImage: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400&h=600&fit=crop',
    synopsis: 'A Viking warrior seeks redemption through farming and peace.'
  },
  {
    id: 5,
    title: 'Bocchi the Rock!',
    episodes: 12,
    season: 'Fall',
    year: 2022,
    genres: ['Slice of Life', 'Music', 'Comedy'],
    studio: 'CloverWorks',
    coverImage: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&h=600&fit=crop',
    synopsis: 'A shy guitarist joins a band to overcome her social anxiety.'
  },
  {
    id: 6,
    title: 'Jujutsu Kaisen 2nd Season',
    episodes: 23,
    season: 'Summer',
    year: 2023,
    genres: ['Action', 'Supernatural', 'Shounen'],
    studio: 'MAPPA',
    coverImage: 'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=400&h=600&fit=crop',
    synopsis: 'Sorcerers battle curses in modern-day Japan.'
  },
  {
    id: 7,
    title: 'Chainsaw Man',
    episodes: 12,
    season: 'Fall',
    year: 2022,
    genres: ['Action', 'Horror', 'Supernatural'],
    studio: 'MAPPA',
    coverImage: 'https://images.unsplash.com/photo-1533613220915-609f661a6fe1?w=400&h=600&fit=crop',
    synopsis: 'A devil hunter with chainsaw powers fights supernatural threats.'
  },
  {
    id: 8,
    title: 'Ao no Exorcist',
    episodes: 25,
    season: 'Spring',
    year: 2011,
    genres: ['Action', 'Supernatural', 'Fantasy'],
    studio: 'A-1 Pictures',
    coverImage: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=400&h=600&fit=crop',
    synopsis: "The son of Satan trains to become an exorcist."
  },
  {
    id: 9,
    title: 'Blue Exorcist: Kyoto Saga',
    episodes: 12,
    season: 'Winter',
    year: 2017,
    genres: ['Action', 'Supernatural', 'Fantasy'],
    studio: 'A-1 Pictures',
    coverImage: 'https://images.unsplash.com/photo-1574169208507-84376144848b?w=400&h=600&fit=crop',
    synopsis: 'Rin faces new challenges in Kyoto as an exorcist trainee.'
  },
  {
    id: 10,
    title: 'Mashle Season 2',
    episodes: 12,
    season: 'Winter',
    year: 2024,
    genres: ['Comedy', 'Action', 'Fantasy'],
    studio: 'A-1 Pictures',
    coverImage: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=400&h=600&fit=crop',
    synopsis: 'A magic-less boy uses muscles to survive in a magic academy.'
  },
  {
    id: 11,
    title: 'Dungeon Meshi',
    episodes: 24,
    season: 'Winter',
    year: 2024,
    genres: ['Adventure', 'Comedy', 'Fantasy'],
    studio: 'Trigger',
    coverImage: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=600&fit=crop',
    synopsis: 'Adventurers cook and eat monsters while exploring a dungeon.'
  },
];

export const seasonalAnime2024: SeasonAnime[] = [
  {
    id: 1,
    title: "Frieren: Beyond Journey's End",
    episodes: 28,
    season: 'Winter',
    year: 2024,
    genres: ['Fantasy', 'Adventure'],
    studio: 'Madhouse',
    coverImage: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&h=600&fit=crop',
    airingStatus: 'finished'
  },
  {
    id: 10,
    title: 'Mashle Season 2',
    episodes: 12,
    season: 'Winter',
    year: 2024,
    genres: ['Comedy', 'Action', 'Fantasy'],
    studio: 'A-1 Pictures',
    coverImage: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=400&h=600&fit=crop',
    airingStatus: 'finished'
  },
  {
    id: 11,
    title: 'Dungeon Meshi',
    episodes: 24,
    season: 'Winter',
    year: 2024,
    genres: ['Adventure', 'Comedy', 'Fantasy'],
    studio: 'Trigger',
    coverImage: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=600&fit=crop',
    airingStatus: 'finished'
  },
  {
    id: 2,
    title: 'Solo Leveling',
    episodes: 12,
    season: 'Winter',
    year: 2024,
    genres: ['Action', 'Fantasy'],
    studio: 'A-1 Pictures',
    coverImage: 'https://images.unsplash.com/photo-1618336753974-aae8e04506aa?w=400&h=600&fit=crop',
    airingStatus: 'finished'
  },
];
