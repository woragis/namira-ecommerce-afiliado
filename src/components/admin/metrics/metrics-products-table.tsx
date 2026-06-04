import Link from "next/link";
import {
  ctrAffiliateClicks,
  ctrDetailViews,
  type ProductMetricRow,
} from "@/lib/analytics-stats";

type Props = {
  title: string;
  rows: ProductMetricRow[];
  showAlert?: boolean;
  highlightSlug?: string;
  days?: number;
};

export function MetricsProductsTable({
  title,
  rows,
  showAlert,
  highlightSlug,
  days = 30,
}: Props) {
  return (
    <section id="produtos">
      <h2 className="mb-3 font-semibold">{title}</h2>
      <div className="overflow-x-auto rounded-xl border border-zinc-800">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead className="text-zinc-400">
            <tr>
              <th className="p-3">Produto</th>
              <th className="p-3">Loja</th>
              <th className="p-3">Impressões</th>
              <th className="p-3">PDP</th>
              <th className="p-3">Cliques</th>
              <th className="p-3">CTR imp→PDP</th>
              <th className="p-3">CTR PDP→clique</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-4 text-zinc-500">
                  Sem dados no período.
                </td>
              </tr>
            ) : (
              rows.map((row) => {
                const noClicks =
                  showAlert && row.impressions >= 20 && row.clicks === 0;
                const highlighted = highlightSlug === row.slug;
                return (
                  <tr
                    key={row.productId}
                    id={highlighted ? `produto-${row.slug}` : undefined}
                    className={`border-t border-zinc-800 ${
                      highlighted ? "bg-amber-500/10" : ""
                    }`}
                  >
                    <td className="p-3">
                      <Link
                        href={`/produtos/${row.slug}`}
                        className="text-amber-400 no-underline hover:underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {row.title}
                      </Link>
                      {noClicks ? (
                        <span className="ml-2 rounded bg-red-950 px-1.5 py-0.5 text-[10px] text-red-300">
                          sem clique
                        </span>
                      ) : null}
                    </td>
                    <td className="p-3 text-zinc-400">{row.storeName}</td>
                    <td className="p-3">{row.impressions}</td>
                    <td className="p-3">{row.views}</td>
                    <td className="p-3 text-amber-400">{row.clicks}</td>
                    <td className="p-3 text-zinc-400">
                      {ctrDetailViews(row.impressions, row.views)}
                    </td>
                    <td className="p-3 text-zinc-400">
                      {ctrAffiliateClicks(row.views, row.clicks)}
                    </td>
                    <td className="p-3 text-right whitespace-nowrap">
                      <Link
                        href={`/admin/metricas?days=${days}&product=${row.slug}`}
                        className="mr-3 text-xs text-zinc-500 no-underline hover:text-amber-400"
                      >
                        Métricas
                      </Link>
                      <Link
                        href={`/admin/produtos/${row.productId}`}
                        className="text-xs text-zinc-500 no-underline hover:text-amber-400"
                      >
                        Editar
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
