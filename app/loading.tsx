import { Skeleton, ItemCardSkeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-6">
      {/* Hero */}
      <section className="flex flex-col items-center gap-4 py-16 text-center md:py-24">
        <Skeleton className="h-4 w-64" />
        <Skeleton className="h-12 w-3/4 max-w-xl" />
        <Skeleton className="h-12 w-1/2 max-w-md" />
        <Skeleton className="h-5 w-2/3 max-w-lg" />
        <div className="mt-4 flex gap-3">
          <Skeleton className="h-12 w-40 rounded-full" />
          <Skeleton className="h-12 w-40 rounded-full" />
        </div>
      </section>
      {/* Featured items */}
      <section className="pb-16">
        <div className="mb-8 flex flex-col items-center gap-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <ItemCardSkeleton key={i} />
          ))}
        </div>
      </section>
    </div>
  );
}
