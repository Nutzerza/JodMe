// Page component for displaying the anime search page.
import { getServerSession } from "next-auth";
import { authOptions } from "@/features/auth/lib/authOptions";
import { AnimeSearchPage } from "@/features/anime/animeSearch/pages/AnimeSearchPage";
export default async function Page() {
  const session = await getServerSession(authOptions);
  return <AnimeSearchPage isAuthenticated={!!session?.user} />;
}
