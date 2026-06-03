import Link from "next/link";
import { prisma } from "@/lib/db";
import {
  ctrAffiliateClicks,
  ctrDetailViews,
  daysAgo,
  getMetricTotals,
  getTopProductsByMetrics,
} from "@/lib/analytics-stats";
import { isDatabaseConfigured } from "@/lib/safe-db";

export default async function AdminMetricasPage() {
  if (!isDatabaseConfigured()) {
    return <p className="text-zinc-400">Banco não configurado.</p>;
  }

  const since7 = daysAgo(7);
  const since30 = daysAgo(30);

  const [totals7, totals30, top, recentClicks] = await Promise.all([
    getMetricTotals(since7),
    getMetricTotals(since30),
    getTopProductsByMetrics(since30, 10),
    prisma.clickEvent.findMany({
      take: 15,
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
            Funil: impressão (card) → visualização (detalhe) → clique (afiliado)
          </p>
        </div>
        <a
          href="/api/admin/export/metricas?days=30"
          className="rounded-lg border border-zinc-600 px-4 py-2 text-sm text-zinc-300 no-underline hover:border-zinc-400"
        >
          Exportar CSV (30 dias)
        </a>
      </div>

      <section className="mb-10 grid gap-4 sm:grid-cols-3">
        <MetricCard label="Impressões (7d)" value={totals7.impressions} />
        <MetricCard label="Visualizações PDP (7d)" value={totals7.views} />
        <MetricCard label="Cliques afiliado (7d)" value={totals7.clicks} />
      </section>

      <p className="mb-10 text-sm text-zinc-500">
        30 dias: {totals30.impressions} impressões · {totals30.views} visualizações ·{" "}
        {totals30.clicks} cliques
      </p>

      <h2 className="mb-3 font-semibold">Top produtos (30 dias)</h2>
      <div className="mb-10 overflow-x-auto rounded-xl border border-zinc-800">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="text-zinc-400">
            <tr>
              <th className="p-3">Produto</th>
              <th className="p-3">Impressões</th>
              <th className="p-3">PDP</th>
              <th className="p-3">Cliques</th>
              <th className="p-3">CTR imp→PDP</th>
              <th className="p-3">CTR PDP→clique</th>
            </tr>
          </thead>
          <tbody>
            {top.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-4 text-zinc-500">
                  Sem dados no período.
                </td>
              </tr>
            ) : (
              top.map((row) => (
                <tr key={row.productId} className="border-t border-zinc-800">
                  <td className="p-3">
                    <Link
                      href={`/produtos/${row.slug}`}
                      className="text-amber-400 no-underline hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {row.title}
                    </Link>
                  </td>
                  <td className="p-3">{row.impressions}</td>
                  <td className="p-3">{row.views}</td>
                  <td className="p-3 text-amber-400">{row.clicks}</td>
                  <td className="p-3 text-zinc-400">
                    {ctrDetailViews(row.impressions, row.views)}
                  </td>
                  <td className="p-3 text-zinc-400">
                    {ctrAffiliateClicks(row.views, row.clicks)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

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
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
      <div className="text-3xl font-bold text-white">{value}</div>
      <div className="text-sm text-zinc-400">{label}</div>
    </div>
  );
}
