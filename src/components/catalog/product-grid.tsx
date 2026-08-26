import type { ProductListItem } from "@/lib/catalog";
import { catalogHref } from "@/lib/filters";
import { ProductCard } from "./product-card";

export type CatalogEmptyFilters = {
  storeSlug?: string;
  tagSlug?: string;
  search?: string;
};

export function ProductGrid({
  products,
  emptyFilters,
}: {
  products: ProductListItem[];
  emptyFilters?: CatalogEmptyFilters;
}) {
  if (products.length === 0) {
    const hasFilters = Boolean(
      emptyFilters?.storeSlug || emptyFilters?.tagSlug || emptyFilters?.search,
    );

    return (
      <div className="rounded-2xl border border-dashed border-[var(--borda)] bg-white px-6 py-16 text-center">
        <p className="text-[var(--texto-suave)]">
          {hasFilters
            ? "Nenhum achado nesta combinação."
            : "Nenhum produto encontrado."}
        </p>
        {hasFilters ? (
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            {emptyFilters?.tagSlug ? (
              <a
                href={catalogHref({
                  storeSlug: emptyFilters.storeSlug,
                  search: emptyFilters.search,
                })}
                className="text-sm font-medium text-[var(--roxo-escuro)] no-underline hover:underline"
              >
                Limpar tag
              </a>
            ) : null}
            {emptyFilters?.storeSlug ? (
              <a
                href={catalogHref({ storeSlug: emptyFilters.storeSlug })}
                className="text-sm font-medium text-[var(--roxo-escuro)] no-underline hover:underline"
              >
                Ver todos da loja
              </a>
            ) : null}
            <a
              href="/produtos"
              className="text-sm font-medium text-[var(--roxo-escuro)] no-underline hover:underline"
            >
              Ver todos os achados
            </a>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-5">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
