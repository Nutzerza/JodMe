const seasons = ['WINTER', 'SPRING', 'SUMMER', 'FALL'];

export function getNextSeason(season: string, year: number) {
  const index = seasons.indexOf(season);
  if (index === 3) return { season: seasons[0], year: year + 1 };
  return { season: seasons[index + 1], year };
}

export function getPrevSeason(season: string, year: number) {
  const index = seasons.indexOf(season);
  if (index === 0) return { season: seasons[3], year: year - 1 };
  return { season: seasons[index - 1], year };
}
