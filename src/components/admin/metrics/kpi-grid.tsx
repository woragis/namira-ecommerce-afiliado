import {
  dailyAverage,
  percentChange,
  type MetricTotals,
} from "@/lib/analytics-stats";

type Props = {
  label: string;
  current: MetricTotals;
  previous: MetricTotals;
  days: number;
};

export function KpiGrid({ label, current, previous, days }: Props) {
  const items = [
    {
      key: "impressions" as const,
      title: "Impressões",
      value: current.impressions,
      prev: previous.impressions,
    },
    {
      key: "views" as const,
      title: "Visualizações PDP",
      value: current.views,
      prev: previous.views,
    },
    {
      key: "clicks" as const,
      title: "Cliques afiliado",
      value: current.clicks,
      prev: previous.clicks,
    },
  ];

  return (
    <section>
      <p className="mb-3 text-xs tracking-wider text-zinc-500 uppercase">{label}</p>
      <div className="grid gap-4 sm:grid-cols-3">
        {items.map((item) => (
          <KpiCard
            key={item.key}
            title={item.title}
            value={item.value}
            delta={percentChange(item.value, item.prev)}
            dailyAvg={dailyAverage(item.value, days)}
          />
        ))}
      </div>
    </section>
  );
}

function KpiCard({
  title,
  value,
  delta,
  dailyAvg,
}: {
  title: string;
  value: number;
  delta: number | null;
  dailyAvg: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
      <div className="text-3xl font-bold text-white">
        {value.toLocaleString("pt-BR")}
      </div>
      <div className="mt-1 text-sm text-zinc-400">{title}</div>
      <p className="mt-2 text-xs text-zinc-500">
        Média/dia: {dailyAvg}
      </p>
      <DeltaBadge delta={delta} />
    </div>
  );
}

function DeltaBadge({ delta }: { delta: number | null }) {
  if (delta === null) {
    return <p className="mt-1 text-xs text-zinc-600">vs período anterior: —</p>;
  }
  const up = delta > 0;
  const down = delta < 0;
  const color = up ? "text-green-400" : down ? "text-red-400" : "text-zinc-500";
  const sign = up ? "+" : "";
  return (
    <p className={`mt-1 text-xs ${color}`}>
      vs período anterior: {sign}
      {delta}%
    </p>
  );
}
