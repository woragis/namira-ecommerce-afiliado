import {
  ctrAffiliateClicks,
  ctrDetailViews,
  ctrEndToEnd,
  type MetricTotals,
} from "@/lib/analytics-stats";

type Props = {
  totals: MetricTotals;
};

export function MetricsFunnel({ totals }: Props) {
  const { impressions, views, clicks } = totals;

  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
      <h2 className="mb-4 font-semibold text-white">Funil do período</h2>
      <div className="flex flex-col gap-4 md:flex-row md:items-stretch md:gap-2">
        <FunnelStep
          label="Impressões"
          value={impressions}
          sub="cards vistos na listagem"
          widthPct={100}
        />
        <FunnelArrow rate={ctrDetailViews(impressions, views)} />
        <FunnelStep
          label="Visualizações PDP"
          value={views}
          sub="página de detalhe"
          widthPct={impressions > 0 ? Math.min(100, (views / impressions) * 100) : 0}
        />
        <FunnelArrow rate={ctrAffiliateClicks(views, clicks)} />
        <FunnelStep
          label="Cliques afiliado"
          value={clicks}
          sub="saída para a loja"
          widthPct={impressions > 0 ? Math.min(100, (clicks / impressions) * 100) : 0}
          accent
        />
      </div>
      <p className="mt-4 text-xs text-zinc-500">
        CTR fim a fim (impressão → clique): {ctrEndToEnd(impressions, clicks)}
      </p>
    </section>
  );
}

function FunnelStep({
  label,
  value,
  sub,
  widthPct,
  accent,
}: {
  label: string;
  value: number;
  sub: string;
  widthPct: number;
  accent?: boolean;
}) {
  return (
    <div className="flex flex-1 flex-col justify-between rounded-lg border border-zinc-800 bg-zinc-950 p-4">
      <div>
        <p className="text-xs text-zinc-500">{label}</p>
        <p className={`text-2xl font-bold ${accent ? "text-amber-400" : "text-white"}`}>
          {value.toLocaleString("pt-BR")}
        </p>
        <p className="text-xs text-zinc-600">{sub}</p>
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-zinc-800">
        <div
          className={`h-full rounded-full ${accent ? "bg-amber-500" : "bg-violet-500"}`}
          style={{ width: `${Math.max(widthPct, value > 0 ? 8 : 0)}%` }}
        />
      </div>
    </div>
  );
}

function FunnelArrow({ rate }: { rate: string }) {
  return (
    <div className="flex items-center justify-center px-1 text-sm text-zinc-500 md:flex-col">
      <span className="hidden md:inline" aria-hidden>
        →
      </span>
      <span className="rounded bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400">{rate}</span>
    </div>
  );
}
