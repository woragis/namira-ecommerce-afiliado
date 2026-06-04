import Link from "next/link";

type Props = {
  days: number;
  siteUrl: string;
};

export function MetricsEmptyBanner({ days, siteUrl }: Props) {
  return (
    <div
      className="mb-8 rounded-xl border border-amber-500/30 bg-amber-500/10 px-5 py-4"
      role="status"
    >
      <p className="font-medium text-amber-200">
        Sem eventos nos últimos {days} dias
      </p>
      <p className="mt-1 text-sm text-zinc-400">
        Impressões, visualizações e cliques aparecem quando alguém navega na loja.
        Abra o site, role o catálogo e clique em &quot;Comprar&quot; em um produto para
        gerar os primeiros dados.
      </p>
      <div className="mt-3 flex flex-wrap gap-3">
        <Link
          href={siteUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-zinc-950 no-underline hover:bg-amber-400"
        >
          Abrir loja →
        </Link>
        <Link
          href="/admin/produtos"
          className="rounded-lg border border-zinc-600 px-4 py-2 text-sm text-zinc-300 no-underline hover:border-zinc-400"
        >
          Ver produtos no admin
        </Link>
      </div>
    </div>
  );
}
