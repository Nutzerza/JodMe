// components/skeletons/AnimeCardSkeleton.tsx

export function AnimeCardSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-[#1d2340] bg-[#0b1225] p-4">
      <div className="flex gap-4">
        {/* Poster */}
        <div className="h-[100px] w-[75px] shrink-0 animate-pulse rounded-lg bg-[#1a2340]" />

        {/* Content */}
        <div className="flex flex-1 flex-col justify-between">
          <div>
            {/* Title */}
            <div className="h-5 w-[260px] animate-pulse rounded bg-[#1a2340]" />

            {/* Tags */}
            <div className="mt-3 flex gap-2">
              <div className="h-5 w-14 animate-pulse rounded bg-[#1a2340]" />
              <div className="h-5 w-20 animate-pulse rounded bg-[#1a2340]" />
              <div className="h-5 w-10 animate-pulse rounded bg-[#1a2340]" />
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-6">
            <div className="h-2 w-full animate-pulse rounded-full bg-[#1a2340]" />
          </div>
        </div>

        {/* Right controls */}
        <div className="flex w-[90px] flex-col items-end justify-between">
          <div className="h-7 w-20 animate-pulse rounded-full bg-[#1a2340]" />

          <div className="flex items-center gap-2">
            <div className="h-4 w-4 animate-pulse rounded bg-[#1a2340]" />
            <div className="h-5 w-10 animate-pulse rounded bg-[#1a2340]" />
            <div className="h-4 w-4 animate-pulse rounded bg-[#1a2340]" />
          </div>

          <div className="h-8 w-14 animate-pulse rounded-xl bg-[#1a2340]" />
        </div>
      </div>
    </div>
  );
}