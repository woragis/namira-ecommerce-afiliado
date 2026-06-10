type Props = {
  className?: string;
};

export function Skeleton({ className = "" }: Props) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-black/10 ${className}`}
      aria-hidden
    />
  );
}

export function AdminSkeleton({ className = "" }: Props) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-zinc-800 ${className}`}
      aria-hidden
    />
  );
}
