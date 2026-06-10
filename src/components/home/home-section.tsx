import { NavLink } from "@/components/ui/nav-link";
import { ProductGrid } from "@/components/catalog/product-grid";
import type { ProductListItem } from "@/lib/catalog";

type Props = {
  title: string;
  count: number;
  href: string;
  products: ProductListItem[];
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
        <NavLink
          href={href}
          className="flex items-center gap-1 text-[13px] font-medium text-[var(--roxo-escuro)] no-underline hover:text-[var(--dourado-escuro)]"
        >
          Ver todos →
        </NavLink>
      </div>
      <ProductGrid products={products} />
    </section>
  );
}
