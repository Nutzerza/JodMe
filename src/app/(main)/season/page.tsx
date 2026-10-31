import { AnimeSeasonPage } from "@/features/anime/animeSeason/pages/AnimeSeasonPage";

export default function SeasonPage() {
  return <AnimeSeasonPage />;
}

// import { getServerSession } from "next-auth";
// import SeasonClient from "@/components/seasonPage/SeasonClient";
// import { authOptions } from "@/features/auth/lib/authOptions";
// import { getSeasonAnime } from "@/lib/services/animeService";
// import { fetchUserAnimeListByEmail } from "@/lib/services/userAnimeService";
// import { getCurrentSeason } from "@/shared/utils/getCurrentSeason";
// import { Anime } from "@/types/anime";

// export default async function PublicSeasonPage() {
//   const session = await getServerSession(authOptions);
//   const email = session?.user?.email || null;

//   const currentSeason = getCurrentSeason();
//   const anime = (await getSeasonAnime(
//     currentSeason.season,
//     currentSeason.year,
//   )) as Anime[];
//   const userList = email ? await fetchUserAnimeListByEmail(email) : [];

//   return (
//     // <div className="min-h-screen bg-linear-to-b from-slate-950 to-slate-900 text-white">
//     <>
//       <main className="container mx-auto px-6 py-8">
//         <SeasonClient
//           initialAnime={anime}
//           initialUserList={userList}
//           initialSeason={currentSeason.season}
//           initialYear={currentSeason.year}
//           isAuthenticated={!!session?.user}
//         />
//       </main>
//       {/* </div> */}
//     </>
//   );
// }
