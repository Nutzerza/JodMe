// Skeleton loader for the anime grid

type AnimeGridSkeletonProps = {
  count?: number;
};

export function AnimeGridSkeleton({ count = 12 }: AnimeGridSkeletonProps) {
  return (
    <div
      className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6"
      aria-label="Loading anime"
      aria-busy="true"
      role="status"
    >
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="animate-pulse">
          {/* Anime cover */}
          <div className="aspect-3/4 w-full rounded-xl bg-gray-200 dark:bg-gray-800" />

          {/* Anime title */}
          <div className="mt-3 space-y-2">
            <div className="h-4 w-4/5 rounded bg-gray-200 dark:bg-gray-800" />
            <div className="h-3 w-2/5 rounded bg-gray-200 dark:bg-gray-800" />
          </div>
        </div>
      ))}

      <span className="sr-only">Loading Anime...</span>
    </div>
  );
}
