import type { DailyMetricPoint } from "@/lib/analytics-stats";

type Props = {
  series: DailyMetricPoint[];
  days: number;
};

const SERIES = [
  { key: "impressions" as const, label: "Impressões", color: "bg-violet-500" },
  { key: "views" as const, label: "PDP", color: "bg-sky-500" },
  { key: "clicks" as const, label: "Cliques", color: "bg-amber-500" },
];

export function MetricsDailyChart({ series, days }: Props) {
  const max = Math.max(
    1,
    ...series.flatMap((p) => [p.impressions, p.views, p.clicks]),
  );

  const labelEvery = days <= 14 ? 1 : days <= 30 ? 5 : 10;

  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
      <h2 className="mb-4 font-semibold text-white">Atividade por dia</h2>
      <div className="mb-4 flex flex-wrap gap-4 text-xs text-zinc-400">
        {SERIES.map((s) => (
          <span key={s.key} className="flex items-center gap-1.5">
            <span className={`inline-block h-2 w-2 rounded-full ${s.color}`} />
            {s.label}
          </span>
        ))}
      </div>
      <div className="overflow-x-auto">
        <div
          className="flex items-end gap-1"
          style={{ minWidth: `${Math.max(series.length * 12, 280)}px`, height: 160 }}
        >
          {series.map((point, i) => (
            <div
              key={point.date}
              className="flex flex-1 flex-col items-center justify-end gap-0.5"
              title={`${formatLabel(point.date)}: ${point.impressions} imp · ${point.views} pdp · ${point.clicks} cliques`}
            >
              <div className="flex w-full max-w-[14px] flex-col justify-end gap-px" style={{ height: 120 }}>
                {SERIES.map((s) => {
                  const v = point[s.key];
                  const h = Math.round((v / max) * 120);
                  return (
                    <div
                      key={s.key}
                      className={`w-full rounded-sm ${s.color} opacity-90`}
                      style={{ height: v > 0 ? Math.max(h, 2) : 0 }}
                    />
                  );
                })}
              </div>
              {i % labelEvery === 0 || i === series.length - 1 ? (
                <span className="mt-1 text-[10px] text-zinc-600">
                  {formatLabel(point.date)}
                </span>
              ) : (
                <span className="mt-1 h-3" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function formatLabel(isoDate: string): string {
  const [, m, d] = isoDate.split("-");
  return `${d}/${m}`;
}
