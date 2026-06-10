import { AdminSkeleton } from "@/components/ui/skeleton";

type Props = {
  variant?: "table" | "form" | "dashboard";
};

export function AdminPageSkeleton({ variant = "table" }: Props) {
  if (variant === "form") {
    return (
      <div className="max-w-lg space-y-4" aria-busy="true" aria-label="Carregando formulário">
        <AdminSkeleton className="h-8 w-48" />
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="space-y-2">
            <AdminSkeleton className="h-3 w-24" />
            <AdminSkeleton className="h-10 w-full" />
          </div>
        ))}
        <AdminSkeleton className="h-10 w-28" />
      </div>
    );
  }

  if (variant === "dashboard") {
    return (
      <div className="space-y-6" aria-busy="true" aria-label="Carregando painel">
        <AdminSkeleton className="h-8 w-56" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <AdminSkeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <AdminSkeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6" aria-busy="true" aria-label="Carregando listagem">
      <div className="flex items-center justify-between gap-4">
        <AdminSkeleton className="h-8 w-40" />
        <AdminSkeleton className="h-10 w-32" />
      </div>
      <AdminSkeleton className="h-12 w-full max-w-xl rounded-lg" />
      <div className="overflow-hidden rounded-xl border border-zinc-800">
        {Array.from({ length: 8 }, (_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 border-b border-zinc-800 px-4 py-3 last:border-0"
          >
            <AdminSkeleton className="h-4 w-4" />
            <AdminSkeleton className="h-4 flex-1" />
            <AdminSkeleton className="h-4 w-20" />
            <AdminSkeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}
