// Page component for displaying the current anime season.
import { getServerSession } from "next-auth";
import { authOptions } from "@/features/auth/lib/authOptions";
import { AnimeSeasonPage } from "@/features/anime/animeSeason/pages/AnimeSeasonPage";

export default async function SeasonPage() {
  const session = await getServerSession(authOptions);
  return <AnimeSeasonPage isAuthenticated={!!session?.user} />;
}
