import { BadgeFilters } from "@/components/catalog/badge-filters";
import { CatalogToolbar } from "@/components/catalog/catalog-toolbar";
import { Pagination } from "@/components/catalog/pagination";
import { PriceRangeFilter } from "@/components/catalog/price-range-filter";
import { ProductGrid } from "@/components/catalog/product-grid";
import { getBadges, getProducts } from "@/lib/catalog";
import { filtersToSearchParams } from "@/lib/catalog-params";
import { parseCatalogSearchParams } from "@/lib/filters";

export const revalidate = 60;

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ProdutosPage({ searchParams }: Props) {
  const params = await searchParams;
  const filters = parseCatalogSearchParams(params);
  const [{ items, total, page, totalPages }, badges] = await Promise.all([
    getProducts(filters),
    getBadges(),
  ]);

  const extra = filtersToSearchParams(filters);

  return (
    <main className="px-6 py-9 md:px-10">
      <CatalogToolbar
        title="Todos os achados"
        total={total}
        basePath="/produtos"
        currentSort={filters.sort}
        extraParams={extra}
      />
      <PriceRangeFilter
        action="/produtos"
        priceMin={filters.priceMin}
        priceMax={filters.priceMax}
        hiddenParams={extra}
      />
      <BadgeFilters badges={badges} activeSlug={filters.badgeSlug} extraParams={extra} />
      <ProductGrid products={items} />
      <Pagination
        page={page}
        totalPages={totalPages}
        basePath="/produtos"
        extraParams={{
          ...extra,
          ...(filters.priceMin != null ? { preco_min: String(filters.priceMin) } : {}),
          ...(filters.priceMax != null ? { preco_max: String(filters.priceMax) } : {}),
        }}
      />
    </main>
  );
}
