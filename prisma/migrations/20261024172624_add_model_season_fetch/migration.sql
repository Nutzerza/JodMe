-- CreateTable
CREATE TABLE "SeasonFetch" (
    "id" SERIAL NOT NULL,
    "season" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SeasonFetch_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SeasonFetch_season_year_key" ON "SeasonFetch"("season", "year");
