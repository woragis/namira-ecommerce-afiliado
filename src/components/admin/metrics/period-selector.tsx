import Link from "next/link";
import { PERIOD_OPTIONS, type PeriodDays } from "@/lib/analytics-stats";

type Props = {
  days: PeriodDays;
  basePath?: string;
};

export function PeriodSelector({ days, basePath = "/admin/metricas" }: Props) {
  return (
    <div
      className="inline-flex rounded-lg border border-zinc-700 p-0.5"
      role="group"
      aria-label="Período"
    >
      {PERIOD_OPTIONS.map((d) => (
        <Link
          key={d}
          href={`${basePath}?days=${d}`}
          className={`rounded-md px-3 py-1.5 text-sm no-underline transition ${
            days === d
              ? "bg-amber-500 font-semibold text-zinc-950"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          {d} dias
        </Link>
      ))}
    </div>
  );
}
