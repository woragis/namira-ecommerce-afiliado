import { MetricsBreakdown } from "@/components/admin/metrics/metrics-breakdown";
import { MetricsDailyChart } from "@/components/admin/metrics/metrics-daily-chart";
import { MetricsEmptyBanner } from "@/components/admin/metrics/metrics-empty-banner";
import { KpiGrid } from "@/components/admin/metrics/kpi-grid";
import { MetricsFunnel } from "@/components/admin/metrics/metrics-funnel";
import { MetricsProductsTable } from "@/components/admin/metrics/metrics-products-table";
import {
  MetricsProductsPagination,
  MetricsProductsToolbar,
} from "@/components/admin/metrics/metrics-products-toolbar";
import { MetricsRecentEvents } from "@/components/admin/metrics/metrics-recent-events";
import { PeriodSelector } from "@/components/admin/metrics/period-selector";
import { loadAdminMetricsPage } from "@/lib/metrics-page-data";
import { buildMetricsHref } from "@/lib/metrics-query";
import { isDatabaseConfigured } from "@/lib/safe-db";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function normalizeSearch(
  raw: Record<string, string | string[] | undefined>,
) {
  const pick = (k: string) => {
    const v = raw[k];
    return Array.isArray(v) ? v[0] : v;
  };
  return {
    days: pick("days"),
    sort: pick("sort"),
    loja: pick("loja"),
    page: pick("page"),
    product: pick("product"),
    impressoes: pick("impressoes"),
  };
}

export default async function AdminMetricasPage({ searchParams }: Props) {
  if (!isDatabaseConfigured()) {
    return <p className="text-zinc-400">Banco não configurado.</p>;
  }

  const raw = await searchParams;
  const search = normalizeSearch(raw);
  const data = await loadAdminMetricsPage(search);

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
    "http://localhost:3000";

  const eventsBase = buildMetricsHref(search, {
    impressoes: data.showImpressions ? "0" : "1",
  });

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="mb-2 text-2xl font-bold">Métricas do catálogo</h1>
          <p className="text-sm text-zinc-400">
            Funil: impressão → visualização (PDP) → clique de afiliado
          </p>
          <nav className="mt-3 flex flex-wrap gap-3 text-xs text-zinc-500">
            <a href="#resumo" className="hover:text-amber-400">
              Resumo
            </a>
            <a href="#grafico" className="hover:text-amber-400">
              Gráfico
            </a>
            <a href="#produtos" className="hover:text-amber-400">
              Produtos
            </a>
            <a href="#atividade" className="hover:text-amber-400">
              Atividade
            </a>
          </nav>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <PeriodSelector days={data.days} />
          <a
            href={`/api/admin/export/metricas?days=${data.days}`}
            className="rounded-lg border border-zinc-600 px-4 py-2 text-sm text-zinc-300 no-underline hover:border-zinc-400"
          >
            Exportar CSV
          </a>
        </div>
      </div>

      {data.isEmpty ? (
        <MetricsEmptyBanner days={data.days} siteUrl={siteUrl} />
      ) : null}

      <div id="resumo" className="mb-10 scroll-mt-8">
        <KpiGrid
          label={`Últimos ${data.days} dias vs ${data.days} dias anteriores`}
          current={data.comparison.current}
          previous={data.comparison.previous}
          days={data.days}
        />
      </div>

      <div className="mb-10">
        <MetricsFunnel totals={data.comparison.current} />
      </div>

      <div id="grafico" className="mb-10 scroll-mt-8">
        <MetricsDailyChart series={data.series} days={data.days} />
      </div>

      <div className="mb-10">
        <MetricsBreakdown listPaths={data.listPaths} stores={data.topStores} />
      </div>

      <div className="mb-6">
        <MetricsProductsToolbar
          days={data.days}
          sort={data.sort}
          storeId={data.storeId}
          page={data.productsTable.page}
          totalPages={data.productsTable.totalPages}
          total={data.productsTable.total}
          stores={data.stores}
          showImpressions={data.showImpressions}
        />
      </div>
      <div className="mb-10">
        <MetricsProductsTable
          title="Produtos com atividade"
          rows={data.productsTable.rows}
          highlightSlug={data.highlightSlug}
          days={data.days}
        />
        <MetricsProductsPagination
          days={data.days}
          sort={data.sort}
          storeId={data.storeId}
          page={data.productsTable.page}
          totalPages={data.productsTable.totalPages}
          showImpressions={data.showImpressions}
        />
      </div>

      {data.staleProducts.length > 0 ? (
        <div className="mb-10">
          <MetricsProductsTable
            title="Atenção: impressões sem clique"
            rows={data.staleProducts}
            showAlert
            days={data.days}
          />
        </div>
      ) : null}

      <MetricsRecentEvents
        events={data.recentEvents}
        days={data.days}
        showImpressions={data.showImpressions}
        baseQuery={eventsBase}
      />

      <p className="mt-8 text-xs text-zinc-600">
        Dados agregados em cache por 60s. Rollup diário atualizado ao abrir esta
        página.
      </p>
    </div>
  );
}
