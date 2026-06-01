import Link from "next/link";
import { Logo } from "./logo";
import type { CategoryNavItem, StoreNavItem } from "@/types/catalog";

type Props = {
  stores: StoreNavItem[];
  categories: CategoryNavItem[];
  disclaimer?: string;
};

export function Footer({ stores, categories, disclaimer }: Props) {
  return (
    <footer className="mt-auto bg-[var(--roxo-mais-escuro)] text-white">
      <div className="grid gap-10 px-6 py-12 md:grid-cols-4 md:px-10">
        <div>
          <Logo className="mb-2 [&_.logo-achados]:text-white/30" />
          <p className="mt-2 max-w-xs text-sm text-white/50">
            Curadoria de produtos virais das maiores lojas do Brasil, tudo num só lugar.
          </p>
        </div>
        <div>
          <h4 className="mb-3 text-xs font-semibold tracking-wider text-white/40 uppercase">
            Lojas
          </h4>
          <ul className="space-y-2 text-sm">
            {stores.map((s) => (
              <li key={s.id}>
                <Link href={`/lojas/${s.slug}`} className="text-white/70 no-underline hover:text-white">
                  {s.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-xs font-semibold tracking-wider text-white/40 uppercase">
            Categorias
          </h4>
          <ul className="space-y-2 text-sm">
            {categories.slice(0, 5).map((c) => (
              <li key={c.id}>
                <Link href={`/categorias/${c.slug}`} className="text-white/70 no-underline hover:text-white">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-xs font-semibold tracking-wider text-white/40 uppercase">
            Info
          </h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/sobre" className="text-white/70 no-underline hover:text-white">Sobre</Link></li>
            <li><Link href="/como-funciona" className="text-white/70 no-underline hover:text-white">Como funciona</Link></li>
            <li><Link href="/contato" className="text-white/70 no-underline hover:text-white">Contato</Link></li>
          </ul>
        </div>
      </div>
      <div className="flex flex-col items-center justify-between gap-4 border-t border-white/10 px-6 py-5 text-xs text-white/40 md:flex-row md:px-10">
        <span className="max-w-xl text-center md:text-left">{disclaimer}</span>
        <div className="flex gap-2">
          {stores.map((s) => (
            <span
              key={s.id}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-[9px] font-extrabold"
              style={{ backgroundColor: s.colorPrimary, color: s.colorOnPrimary }}
              title={s.name}
            >
              {s.shortLabel}
            </span>
          ))}
        </div>
      </div>
    </footer>
  );
}
