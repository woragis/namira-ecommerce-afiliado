import Link from "next/link";
import { ProductGrid } from "@/components/catalog/product-grid";
import type { ProductWithRelations } from "@/lib/catalog";

type Props = {
  title: string;
  count: number;
  href: string;
  products: ProductWithRelations[];
};

export function HomeSection({ title, count, href, products }: Props) {
  return (
    <section className="mb-12">
      <div className="mb-5 flex items-baseline justify-between">
        <h2 className="font-display text-2xl font-bold text-[var(--roxo-mais-escuro)]">
          {title}{" "}
          <span className="font-sans text-[13px] font-normal text-[var(--texto-suave)]">
            {count} produtos
          </span>
        </h2>
        <Link
          href={href}
          className="flex items-center gap-1 text-[13px] font-medium text-[var(--roxo-escuro)] no-underline hover:text-[var(--dourado-escuro)]"
        >
          Ver todos →
        </Link>
      </div>
      <ProductGrid products={products} />
    </section>
  );
}
