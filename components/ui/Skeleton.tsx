/**
 * Shimmering placeholder block shown while content loads.
 * Size/shape it with className (h-*, w-*, rounded-*), same as a div.
 */
export function Skeleton({ className = "" }: { className?: string }) {
  return <div aria-hidden="true" className={`skeleton ${className}`} />;
}

/** Generic form/list placeholder for admin editor tabs while data loads. */
export function EditorSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-6 w-48" />
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="glass flex flex-col gap-3 rounded-2xl p-5">
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-4/5" />
        </div>
      ))}
    </div>
  );
}

/** Skeleton in the shape of a menu item card — used by route loading states. */
export function ItemCardSkeleton() {
  return (
    <div className="glass overflow-hidden rounded-2xl">
      <Skeleton className="aspect-[4/3] w-full rounded-none" />
      <div className="flex flex-col gap-2 p-4">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="mt-2 flex items-center justify-between">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-9 w-24 rounded-full" />
        </div>
      </div>
    </div>
  );
}

/** Full menu-page skeleton: heading + category pills + item card grid. */
export function MenuPageSkeleton() {
  return (
    <section className="py-10 md:py-16">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col items-center gap-3">
          <Skeleton className="h-4 w-56" />
          <Skeleton className="h-9 w-44" />
        </div>
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-28 rounded-full" />
          ))}
        </div>
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <ItemCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
