// components/skeletons/AnimeListSkeleton.tsx

import { AnimeCardSkeleton } from '@/components/skeletons/AnimeCardSkeleton';

export function AnimeListSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 10 }).map((_, i) => (
        <AnimeCardSkeleton key={i} />
      ))}
    </div>
  );
}