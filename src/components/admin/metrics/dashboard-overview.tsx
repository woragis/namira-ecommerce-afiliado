import Link from "next/link";
import {
  ctrEndToEnd,
  type CatalogHealth,
  type MetricTotals,
} from "@/lib/analytics-stats";

type Props = {
  totals: MetricTotals;
  health: CatalogHealth;
  days?: number;
};

export function DashboardOverview({ totals, health, days = 7 }: Props) {
  const { impressions, views, clicks } = totals;

  return (
    <div className="space-y-8">
      <section>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Performance ({days}d)</h2>
          <Link
            href={`/admin/metricas?days=${days}`}
            className="text-sm text-amber-400 no-underline hover:underline"
          >
            Ver análise completa →
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <MiniStat label="Impressões" value={impressions} />
          <MiniStat label="Visualizações PDP" value={views} />
          <MiniStat label="Cliques" value={clicks} accent />
        </div>
        <p className="mt-2 text-xs text-zinc-500">
          CTR fim a fim: {ctrEndToEnd(impressions, clicks)}
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Saúde do catálogo</h2>
        <ul className="grid gap-3 sm:grid-cols-3">
          <HealthItem
            label="Publicados sem clique (30d)"
            value={health.publishedWithoutClicks}
            href="/admin/produtos"
            warn={health.publishedWithoutClicks > 0}
          />
          <HealthItem
            label="Rascunhos"
            value={health.draftProducts}
            href="/admin/produtos"
          />
          <HealthItem
            label="Destaques fracos (7d)"
            value={health.weakFeatured}
            href="/admin/metricas?days=7"
            warn={health.weakFeatured > 0}
            hint="Em destaque, com impressões e sem clique"
          />
        </ul>
      </section>
    </div>
  );
}

function MiniStat({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3">
      <div
        className={`text-2xl font-bold ${accent ? "text-amber-400" : "text-white"}`}
      >
        {value.toLocaleString("pt-BR")}
      </div>
      <div className="text-xs text-zinc-400">{label}</div>
    </div>
  );
}

function HealthItem({
  label,
  value,
  href,
  warn,
  hint,
}: {
  label: string;
  value: number;
  href: string;
  warn?: boolean;
  hint?: string;
}) {
  return (
    <li>
      <Link
        href={href}
        className="block rounded-xl border border-zinc-800 bg-zinc-900 p-4 no-underline hover:border-zinc-600"
        title={hint}
      >
        <div
          className={`text-2xl font-bold ${warn ? "text-amber-400" : "text-white"}`}
        >
          {value}
        </div>
        <div className="text-xs text-zinc-400">{label}</div>
      </Link>
    </li>
  );
}
