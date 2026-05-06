import { prisma } from "@/lib/prisma";

async function fetchScore(anilistId: number) {
  const res = await fetch("https://graphql.anilist.co", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: `
        query ($id: Int) {
          Media(id: $id, type: ANIME) {
            averageScore
          }
        }
      `,
      variables: { id: anilistId },
    }),
  });

  const json = await res.json();

  const score = json.data?.Media?.averageScore;
  return score ? score / 10 : null;
}

async function main() {
  const animes = await prisma.anime.findMany({
    where: {
      score: null, // 🔥 เอาเฉพาะที่ยังไม่มี
    },
    take: 100, // กันยิงหนัก
  });

  for (const anime of animes) {
    try {
      const score = await fetchScore(anime.anilistId);

      await prisma.anime.update({
        where: { id: anime.id },
        data: { score },
      });

      console.log("Updated:", anime.title);
    } catch (err) {
      console.error("Error:", anime.id);
    }
  }
}

main();