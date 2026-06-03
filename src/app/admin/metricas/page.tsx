import Link from "next/link";
import { KpiGrid } from "@/components/admin/metrics/kpi-grid";
import { MetricsBreakdown } from "@/components/admin/metrics/metrics-breakdown";
import { MetricsDailyChart } from "@/components/admin/metrics/metrics-daily-chart";
import { MetricsFunnel } from "@/components/admin/metrics/metrics-funnel";
import { MetricsProductsTable } from "@/components/admin/metrics/metrics-products-table";
import { PeriodSelector } from "@/components/admin/metrics/period-selector";
import { prisma } from "@/lib/db";
import {
  daysAgo,
  getDailyMetricsSeries,
  getMetricsComparison,
  getProductsWithoutClicks,
  getTopListPaths,
  getTopProductsByMetrics,
  getTopStoresByClicks,
  parsePeriodDays,
} from "@/lib/analytics-stats";
import { isDatabaseConfigured } from "@/lib/safe-db";

type Props = {
  searchParams: Promise<{ days?: string }>;
};

export default async function AdminMetricasPage({ searchParams }: Props) {
  if (!isDatabaseConfigured()) {
    return <p className="text-zinc-400">Banco não configurado.</p>;
  }

  const params = await searchParams;
  const days = parsePeriodDays(params.days);
  const since = daysAgo(days);

  const [
    comparison,
    series,
    topProducts,
    staleProducts,
    listPaths,
    topStores,
    recentClicks,
  ] = await Promise.all([
    getMetricsComparison(days),
    getDailyMetricsSeries(days),
    getTopProductsByMetrics(since, 15),
    getProductsWithoutClicks(since, 20, 8),
    getTopListPaths(since, 10),
    getTopStoresByClicks(since, 8),
    prisma.clickEvent.findMany({
      take: 12,
      orderBy: { clickedAt: "desc" },
      include: { product: { select: { title: true, slug: true } } },
    }),
  ]);

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="mb-2 text-2xl font-bold">Métricas do catálogo</h1>
          <p className="text-sm text-zinc-400">
            Funil: impressão → visualização (PDP) → clique de afiliado
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <PeriodSelector days={days} />
          <a
            href={`/api/admin/export/metricas?days=${days}`}
            className="rounded-lg border border-zinc-600 px-4 py-2 text-sm text-zinc-300 no-underline hover:border-zinc-400"
          >
            Exportar CSV
          </a>
        </div>
      </div>

      <div className="mb-10">
        <KpiGrid
          label={`Últimos ${days} dias vs ${days} dias anteriores`}
          current={comparison.current}
          previous={comparison.previous}
        />
      </div>

      <div className="mb-10">
        <MetricsFunnel totals={comparison.current} />
      </div>

      <div className="mb-10">
        <MetricsDailyChart series={series} days={days} />
      </div>

      <div className="mb-10">
        <MetricsBreakdown listPaths={listPaths} stores={topStores} />
      </div>

      <div className="mb-10">
        <MetricsProductsTable title="Top produtos" rows={topProducts} />
      </div>

      {staleProducts.length > 0 ? (
        <div className="mb-10">
          <MetricsProductsTable
            title="Atenção: impressões sem clique"
            rows={staleProducts}
            showAlert
          />
        </div>
      ) : null}

      <section>
        <h2 className="mb-3 font-semibold">Últimos cliques de afiliado</h2>
        <table className="w-full text-left text-sm">
          <thead className="text-zinc-400">
            <tr>
              <th className="p-2">Quando</th>
              <th className="p-2">Produto</th>
            </tr>
          </thead>
          <tbody>
            {recentClicks.map((c) => (
              <tr key={c.id} className="border-t border-zinc-800">
                <td className="p-2 text-zinc-400">
                  {c.clickedAt.toLocaleString("pt-BR")}
                </td>
                <td className="p-2">
                  <Link
                    href={`/produtos/${c.product.slug}`}
                    className="text-amber-400 no-underline"
                  >
                    {c.product.title}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
