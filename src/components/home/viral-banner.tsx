import Link from "next/link";
import type { ProductWithRelations } from "@/lib/catalog";

type Props = {
  title: string;
  description: string;
  href: string;
  products: ProductWithRelations[];
};

export function ViralBanner({ title, description, href, products }: Props) {
  return (
    <div className="mb-10 flex flex-col items-center justify-between gap-6 rounded-2xl bg-gradient-to-br from-[var(--roxo-mais-escuro)] to-[var(--roxo-escuro)] p-6 md:flex-row md:p-8">
      <div>
        <h2 className="font-display text-2xl font-bold text-white">
          {title.includes("agora") ? (
            <>
              Tendência <em className="text-[var(--dourado)] not-italic">agora</em>
            </>
          ) : (
            title
          )}
        </h2>
        <p className="mt-1 text-sm text-white/55">{description}</p>
      </div>
      <div className="flex gap-2">
        {products.slice(0, 3).map((p) => (
          <div
            key={p.id}
            className="flex h-16 w-16 items-center justify-center rounded-xl bg-white/10 text-3xl"
          >
            📦
          </div>
        ))}
      </div>
      <Link
        href={href}
        className="flex items-center gap-1 rounded-full bg-[var(--dourado)] px-5 py-2.5 text-sm font-semibold text-[var(--dourado-escuro)] no-underline"
      >
        Ver tudo →
      </Link>
    </div>
  );
}
