
import { hybridSearchAnime } from "@/lib/services/animeService";

export async function searchAnime(query: string) {
  return await hybridSearchAnime(query);
}