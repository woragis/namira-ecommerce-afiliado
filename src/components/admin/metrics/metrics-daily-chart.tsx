"use client";

import { useState } from "react";
import type { DailyMetricPoint } from "@/lib/analytics-stats";

type Props = {
  series: DailyMetricPoint[];
  days: number;
};

type MetricKey = "impressions" | "views" | "clicks";

const TABS: { key: MetricKey; label: string; color: string }[] = [
  { key: "impressions", label: "Impressões", color: "bg-violet-500" },
  { key: "views", label: "PDP", color: "bg-sky-500" },
  { key: "clicks", label: "Cliques", color: "bg-amber-500" },
];

export function MetricsDailyChart({ series, days }: Props) {
  const [active, setActive] = useState<MetricKey>("clicks");
  const tab = TABS.find((t) => t.key === active)!;

  const values = series.map((p) => p[active]);
  const max = Math.max(1, ...values);
  const labelEvery = days <= 14 ? 1 : days <= 30 ? 5 : 10;

  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-semibold text-white">Atividade por dia</h2>
        <div
          className="inline-flex rounded-lg border border-zinc-700 p-0.5"
          role="tablist"
        >
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={active === t.key}
              onClick={() => setActive(t.key)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                active === t.key
                  ? "bg-zinc-700 text-white"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
      <div className="overflow-x-auto">
        <div
          className="flex items-end gap-1"
          style={{
            minWidth: `${Math.max(series.length * 14, 280)}px`,
            height: 140,
          }}
        >
          {series.map((point, i) => {
            const v = point[active];
            const h = Math.round((v / max) * 120);
            return (
              <div
                key={point.date}
                className="flex flex-1 flex-col items-center justify-end"
                title={`${formatLabel(point.date)}: ${v} ${tab.label.toLowerCase()}`}
              >
                <div
                  className={`w-full max-w-[18px] rounded-t-sm ${tab.color}`}
                  style={{ height: v > 0 ? Math.max(h, 4) : 0 }}
                />
                {i % labelEvery === 0 || i === series.length - 1 ? (
                  <span className="mt-1 text-[10px] text-zinc-600">
                    {formatLabel(point.date)}
                  </span>
                ) : (
                  <span className="mt-1 h-3" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function formatLabel(isoDate: string): string {
  const [, m, d] = isoDate.split("-");
  return `${d}/${m}`;
}
