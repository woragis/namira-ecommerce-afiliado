import { CatalogToolbar } from "@/components/catalog/catalog-toolbar";
import { Pagination } from "@/components/catalog/pagination";
import { PriceRangeFilter } from "@/components/catalog/price-range-filter";
import { ProductGrid } from "@/components/catalog/product-grid";
import { getProducts } from "@/lib/catalog";
import { filtersToSearchParams } from "@/lib/catalog-params";
import { parseCatalogSearchParams } from "@/lib/filters";

export const revalidate = 60;

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ProdutosPage({ searchParams }: Props) {
  const params = await searchParams;
  const filters = parseCatalogSearchParams(params);
  const { items, total, page, totalPages } = await getProducts(filters);

  const extra = filtersToSearchParams(filters);
  const title = filters.search
    ? `Resultados para “${filters.search}”`
    : "Todos os achados";

  return (
    <main className="px-6 py-9 md:px-10">
      <CatalogToolbar
        title={title}
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
      <ProductGrid
        products={items}
        emptyFilters={{
          storeSlug: filters.storeSlug,
          tagSlug: filters.tagSlug,
          search: filters.search,
        }}
      />
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
