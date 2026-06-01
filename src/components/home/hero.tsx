import Link from "next/link";
import type { StoreNavItem } from "@/types/catalog";

type Props = {
  eyebrow: string;
  title: string;
  subtitle: string;
  stats: { products: string; stores: string; update: string };
  stores: StoreNavItem[];
};

export function Hero({ eyebrow, title, subtitle, stats, stores }: Props) {
  return (
    <section className="relative flex flex-col gap-10 overflow-hidden bg-[var(--roxo-mais-escuro)] px-6 py-14 md:flex-row md:items-center md:px-10">
      <div
        className="pointer-events-none absolute -top-20 -right-20 h-[400px] w-[400px] rounded-full bg-[rgba(127,119,221,0.18)]"
        aria-hidden
      />
      <div className="relative z-10 flex-1">
        <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-[rgba(239,159,39,0.3)] bg-[rgba(239,159,39,0.15)] px-3 py-1 text-[11px] font-semibold tracking-wider text-[var(--dourado)] uppercase">
          {eyebrow}
        </div>
        <h1 className="font-display mb-3 text-4xl leading-tight font-black text-white md:text-[46px]">
          {title.includes("viralizam") ? (
            <>
              Achados que
              <br />
              <em className="text-[var(--dourado)] not-italic">viralizam</em>
              <br />
              de verdade
            </>
          ) : (
            title
          )}
        </h1>
        <p className="mb-7 max-w-md text-[15px] leading-relaxed text-white/60">
          {subtitle}
        </p>
        <div className="flex gap-7">
          <Stat value={stats.products} label="produtos" />
          <Stat value={stats.stores} label="lojas parceiras" />
          <Stat value={stats.update} label="atualização" />
        </div>
      </div>
      <div className="relative z-10 flex flex-col gap-3">
        {stores.map((store) => (
          <Link
            key={store.id}
            href={`/lojas/${store.slug}`}
            className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 px-4 py-3 no-underline transition hover:translate-x-1 hover:bg-white/10"
          >
            <span
              className="flex h-7 w-7 items-center justify-center rounded-lg text-[11px] font-extrabold"
              style={{
                backgroundColor: store.colorPrimary,
                color: store.colorOnPrimary,
              }}
            >
              {store.shortLabel}
            </span>
            <div className="flex-1">
              <div className="text-[13px] font-semibold text-white">{store.name}</div>
              <div className="text-[11px] text-white/45">
                {store.productCountCached.toLocaleString("pt-BR")} produtos
              </div>
            </div>
            <span className="text-white/35">›</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <strong className="block text-[22px] font-bold text-white">{value}</strong>
      <span className="text-xs text-white/45">{label}</span>
    </div>
  );
}
