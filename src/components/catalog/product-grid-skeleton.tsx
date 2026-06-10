import { Skeleton } from "@/components/ui/skeleton";

type Props = {
  count?: number;
};

export function ProductGridSkeleton({ count = 8 }: Props) {
  return (
    <div
      className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-5"
      aria-busy="true"
      aria-label="Carregando produtos"
    >
      {Array.from({ length: count }, (_, i) => (
        <article
          key={i}
          className="overflow-hidden rounded-2xl border border-[var(--borda)] bg-white"
        >
          <Skeleton className="aspect-square w-full rounded-none" />
          <div className="space-y-3 p-4">
            <Skeleton className="h-2 w-16" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-10 w-full rounded-[10px]" />
          </div>
        </article>
      ))}
    </div>
  );
}
