
import { hybridSearchAnime } from "@/shared/services/animeService";

export async function searchAnime(query: string) {
  return await hybridSearchAnime(query);
}