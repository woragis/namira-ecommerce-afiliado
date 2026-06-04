import Link from "next/link";
import {
  PRODUCT_SORT_OPTIONS,
  type PeriodDays,
  type ProductSort,
} from "@/lib/analytics-stats";

type Store = { id: string; name: string; slug: string };

type Props = {
  days: PeriodDays;
  sort: ProductSort;
  storeId?: string;
  page: number;
  totalPages: number;
  total: number;
  stores: Store[];
  showImpressions: boolean;
};

const SORT_LABELS: Record<ProductSort, string> = {
  cliques: "Cliques",
  pdp: "PDP",
  impressoes: "Impressões",
  ctr_pdp: "CTR imp→PDP",
  ctr_clique: "CTR PDP→clique",
};

function buildQuery(
  days: PeriodDays,
  opts: { sort?: ProductSort; loja?: string; page?: number; impressoes?: boolean },
) {
  const p = new URLSearchParams();
  p.set("days", String(days));
  if (opts.sort) p.set("sort", opts.sort);
  if (opts.loja) p.set("loja", opts.loja);
  if (opts.page && opts.page > 1) p.set("page", String(opts.page));
  if (opts.impressoes) p.set("impressoes", "1");
  return `/admin/metricas?${p.toString()}`;
}

export function MetricsProductsToolbar({
  days,
  sort,
  storeId,
  page,
  totalPages,
  total,
  stores,
  showImpressions,
}: Props) {
  const base = { impressoes: showImpressions };

  return (
    <div className="mb-4 flex flex-wrap items-end gap-4">
      <div className="text-sm">
        <span className="mb-1 block text-xs text-zinc-500">Ordenar por</span>
        <div className="flex flex-wrap gap-1">
          {PRODUCT_SORT_OPTIONS.map((s) => (
            <Link
              key={s}
              href={buildQuery(days, { ...base, sort: s, loja: storeId })}
              className={`rounded-md px-2 py-1 text-xs no-underline ${
                sort === s
                  ? "bg-amber-500 font-semibold text-zinc-950"
                  : "bg-zinc-800 text-zinc-400 hover:text-white"
              }`}
            >
              {SORT_LABELS[s]}
            </Link>
          ))}
        </div>
      </div>
      <div className="text-sm">
        <span className="mb-1 block text-xs text-zinc-500">Loja</span>
        <div className="flex flex-wrap gap-1">
          <Link
            href={buildQuery(days, { ...base, sort, page: 1 })}
            className={`rounded-md px-2 py-1 text-xs no-underline ${
              !storeId
                ? "bg-zinc-700 text-white"
                : "bg-zinc-800 text-zinc-400 hover:text-white"
            }`}
          >
            Todas
          </Link>
          {stores.map((s) => (
            <Link
              key={s.id}
              href={buildQuery(days, { ...base, sort, loja: s.id, page: 1 })}
              className={`rounded-md px-2 py-1 text-xs no-underline ${
                storeId === s.id
                  ? "bg-zinc-700 text-white"
                  : "bg-zinc-800 text-zinc-400 hover:text-white"
              }`}
            >
              {s.name}
            </Link>
          ))}
        </div>
      </div>
      <p className="ml-auto text-xs text-zinc-500">
        {total} produto{total !== 1 ? "s" : ""} com atividade
        {totalPages > 1 ? ` · página ${page}/${totalPages}` : ""}
      </p>
    </div>
  );
}

export function MetricsProductsPagination({
  days,
  sort,
  storeId,
  page,
  totalPages,
  showImpressions,
}: Omit<Props, "stores" | "total">) {
  if (totalPages <= 1) return null;
  const base = { sort, loja: storeId, impressoes: showImpressions };

  return (
    <nav className="mt-4 flex flex-wrap gap-2" aria-label="Paginação">
      {page > 1 ? (
        <Link
          href={buildQuery(days, { ...base, page: page - 1 })}
          className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs text-zinc-400 no-underline hover:text-white"
        >
          ← Anterior
        </Link>
      ) : null}
      {Array.from({ length: totalPages }, (_, i) => i + 1)
        .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
        .map((p, idx, arr) => {
          const prev = arr[idx - 1];
          const gap = prev != null && p - prev > 1;
          return (
            <span key={p} className="flex items-center gap-2">
              {gap ? <span className="text-zinc-600">…</span> : null}
              <Link
                href={buildQuery(days, { ...base, page: p })}
                className={`rounded-lg px-3 py-1.5 text-xs no-underline ${
                  p === page
                    ? "bg-amber-500 font-semibold text-zinc-950"
                    : "border border-zinc-700 text-zinc-400 hover:text-white"
                }`}
              >
                {p}
              </Link>
            </span>
          );
        })}
      {page < totalPages ? (
        <Link
          href={buildQuery(days, { ...base, page: page + 1 })}
          className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs text-zinc-400 no-underline hover:text-white"
        >
          Próxima →
        </Link>
      ) : null}
    </nav>
  );
}
