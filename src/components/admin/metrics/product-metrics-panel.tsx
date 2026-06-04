import Link from "next/link";
import {
  ctrAffiliateClicks,
  ctrDetailViews,
  ctrEndToEnd,
  type MetricTotals,
  type PeriodDays,
} from "@/lib/analytics-stats";

type Props = {
  productId: string;
  productSlug: string;
  week: MetricTotals;
  month: MetricTotals;
};

export function ProductMetricsPanel({
  productId,
  productSlug,
  week,
  month,
}: Props) {
  return (
    <section className="mb-8 rounded-xl border border-zinc-800 bg-zinc-900/80 p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-zinc-300">Métricas do produto</h2>
        <Link
          href={`/admin/metricas?days=30&product=${productSlug}`}
          className="text-xs text-amber-400 no-underline hover:underline"
        >
          Ver no painel completo →
        </Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <MiniBlock label="Últimos 7 dias" totals={week} />
        <MiniBlock label="Últimos 30 dias" totals={month} />
      </div>
      <p className="mt-3 text-xs text-zinc-600">
        ID: {productId.slice(0, 8)}… · CTR fim a fim (30d):{" "}
        {ctrEndToEnd(month.impressions, month.clicks)}
      </p>
    </section>
  );
}

function MiniBlock({
  label,
  totals,
}: {
  label: string;
  totals: MetricTotals;
}) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
      <p className="mb-2 text-xs text-zinc-500">{label}</p>
      <dl className="grid grid-cols-3 gap-2 text-center text-sm">
        <div>
          <dt className="text-xs text-zinc-600">Imp.</dt>
          <dd className="font-semibold text-white">{totals.impressions}</dd>
        </div>
        <div>
          <dt className="text-xs text-zinc-600">PDP</dt>
          <dd className="font-semibold text-white">{totals.views}</dd>
        </div>
        <div>
          <dt className="text-xs text-zinc-600">Cliques</dt>
          <dd className="font-semibold text-amber-400">{totals.clicks}</dd>
        </div>
      </dl>
      <p className="mt-2 text-center text-[10px] text-zinc-500">
        CTR imp→PDP {ctrDetailViews(totals.impressions, totals.views)} · PDP→clique{" "}
        {ctrAffiliateClicks(totals.views, totals.clicks)}
      </p>
    </div>
  );
}
