import { Anime } from "@/types/anime";
import { AnimeStatus } from "@/types/anime";
const PENDING_ANIME_KEY = "jodme_pending_anime";

// Save the pending anime to session storage for later use after authentication
export function savePendingAnime(
  anime: Anime,
  addForm: { status: AnimeStatus; progress: number; score: number | null },
) {
  sessionStorage.setItem(PENDING_ANIME_KEY, JSON.stringify({ anime, addForm }));
}

// Get the pending anime from session storage by its anilistId
export function getPendingAnime(animeId: number) {
  const raw = sessionStorage.getItem(PENDING_ANIME_KEY);
  if (!raw) return null;

  try {
    const { anime, addForm } = JSON.parse(raw) as {
      anime: Anime;
      addForm: { status: AnimeStatus; progress: number; score: number | null };
    };
    return anime.id === animeId ? { anime, addForm } : null;
  } catch {
    return null;
  }
}

// Clear the pending anime from session storage
export function clearPendingAnime() {
  sessionStorage.removeItem(PENDING_ANIME_KEY);
}

// Build the callback URL for adding an anime after authentication
export { buildAddCallbackUrl };
function buildAddCallbackUrl(
  pathname: string,
  searchParams: URLSearchParams,
  anilistId: number,
) {
  const params = new URLSearchParams(searchParams.toString());
  params.set("add", String(anilistId));
  return `${pathname}?${params.toString()}`;
}
