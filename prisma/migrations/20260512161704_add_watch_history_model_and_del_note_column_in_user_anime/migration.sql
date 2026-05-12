/*
  Warnings:

  - You are about to drop the column `notes` on the `UserAnime` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "UserAnime" DROP COLUMN "notes";

-- CreateTable
CREATE TABLE "WatchHistory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "animeId" TEXT NOT NULL,
    "episode" INTEGER NOT NULL,
    "watchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WatchHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WatchHistory_userId_watchedAt_idx" ON "WatchHistory"("userId", "watchedAt");

-- AddForeignKey
ALTER TABLE "WatchHistory" ADD CONSTRAINT "WatchHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WatchHistory" ADD CONSTRAINT "WatchHistory_animeId_fkey" FOREIGN KEY ("animeId") REFERENCES "Anime"("id") ON DELETE CASCADE ON UPDATE CASCADE;
