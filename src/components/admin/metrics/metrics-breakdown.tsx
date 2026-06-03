import type { ListPathRow, StoreClickRow } from "@/lib/analytics-stats";

type Props = {
  listPaths: ListPathRow[];
  stores: StoreClickRow[];
};

export function MetricsBreakdown({ listPaths, stores }: Props) {
  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <section>
        <h2 className="mb-3 font-semibold">Top páginas (impressões)</h2>
        <ul className="space-y-2 rounded-xl border border-zinc-800 p-3">
          {listPaths.length === 0 ? (
            <li className="text-sm text-zinc-500">Sem impressões no período.</li>
          ) : (
            listPaths.map((row) => (
              <li
                key={row.path}
                className="flex justify-between gap-2 text-sm"
              >
                <code className="truncate text-zinc-300">{row.path}</code>
                <span className="shrink-0 text-amber-400">
                  {row.count.toLocaleString("pt-BR")}
                </span>
              </li>
            ))
          )}
        </ul>
      </section>
      <section>
        <h2 className="mb-3 font-semibold">Top lojas (cliques)</h2>
        <ul className="space-y-2 rounded-xl border border-zinc-800 p-3">
          {stores.length === 0 ? (
            <li className="text-sm text-zinc-500">Sem cliques no período.</li>
          ) : (
            stores.map((row) => (
              <li
                key={row.storeId}
                className="flex justify-between gap-2 text-sm"
              >
                <span className="text-zinc-300">{row.storeName}</span>
                <span className="shrink-0 text-amber-400">
                  {row.clicks.toLocaleString("pt-BR")}
                </span>
              </li>
            ))
          )}
        </ul>
      </section>
    </div>
  );
}
