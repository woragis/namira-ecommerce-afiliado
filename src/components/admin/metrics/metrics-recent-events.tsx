import Link from "next/link";
import type { ActivityEvent } from "@/lib/analytics-stats";

type Props = {
  events: ActivityEvent[];
  days: number;
  showImpressions: boolean;
  baseQuery: string;
};

const TYPE_LABEL: Record<ActivityEvent["type"], string> = {
  clique: "Clique afiliado",
  pdp: "Visualização PDP",
  impressao: "Impressão",
};

const TYPE_CLASS: Record<ActivityEvent["type"], string> = {
  clique: "text-amber-400",
  pdp: "text-sky-400",
  impressao: "text-violet-400",
};

export function MetricsRecentEvents({
  events,
  days,
  showImpressions,
  baseQuery,
}: Props) {
  const toggleHref = baseQuery;

  return (
    <section id="atividade">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-semibold">Atividade recente ({days}d)</h2>
        <Link
          href={toggleHref}
          className="text-xs text-zinc-500 no-underline hover:text-amber-400"
        >
          {showImpressions ? "Ocultar impressões" : "Incluir impressões"}
        </Link>
      </div>
      <div className="overflow-x-auto rounded-xl border border-zinc-800">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="text-zinc-400">
            <tr>
              <th className="p-3">Quando</th>
              <th className="p-3">Tipo</th>
              <th className="p-3">Produto</th>
              <th className="p-3">Página</th>
            </tr>
          </thead>
          <tbody>
            {events.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-4 text-zinc-500">
                  Nenhum evento no período.
                </td>
              </tr>
            ) : (
              events.map((e) => (
                <tr key={`${e.type}-${e.id}`} className="border-t border-zinc-800">
                  <td className="p-3 text-zinc-400">
                    {e.at.toLocaleString("pt-BR")}
                  </td>
                  <td className={`p-3 text-xs ${TYPE_CLASS[e.type]}`}>
                    {TYPE_LABEL[e.type]}
                  </td>
                  <td className="p-3">
                    <Link
                      href={`/produtos/${e.productSlug}`}
                      className="text-amber-400 no-underline hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {e.productTitle}
                    </Link>
                  </td>
                  <td className="max-w-[200px] truncate p-3 text-zinc-500">
                    {e.path ? (
                      <code className="text-xs">{e.path}</code>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
