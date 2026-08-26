import { notFound } from "next/navigation";
import { CatalogToolbar } from "@/components/catalog/catalog-toolbar";
import { Pagination } from "@/components/catalog/pagination";
import { PriceRangeFilter } from "@/components/catalog/price-range-filter";
import { ProductGrid } from "@/components/catalog/product-grid";
import { getProducts, getStoreBySlug } from "@/lib/catalog";
import { filtersToSearchParams } from "@/lib/catalog-params";
import { parseCatalogSearchParams, catalogQueryString } from "@/lib/filters";

export const revalidate = 60;

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function LojaPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const store = await getStoreBySlug(slug);
  if (!store) notFound();

  const sp = await searchParams;
  const filters = parseCatalogSearchParams(sp);
  const { items, total, page, totalPages } = await getProducts({
    ...filters,
    storeSlug: slug,
  });

  const extra = { ...filtersToSearchParams(filters), loja: slug };
  const extraWithPrice = {
    ...filtersToSearchParams(filters, ["page"]),
    loja: slug,
  };

  return (
    <main className="px-6 py-9 md:px-10">
      <CatalogToolbar
        title={store.name}
        subtitle="Produtos com link de afiliado"
        total={total}
        basePath={`/lojas/${slug}`}
        currentSort={filters.sort}
        extraParams={extraWithPrice}
      />
      <PriceRangeFilter
        action={`/lojas/${slug}`}
        priceMin={filters.priceMin}
        priceMax={filters.priceMax}
        hiddenParams={extra}
        clearHref={`/lojas/${slug}${catalogQueryString({
          tag: filters.tagSlug,
          q: filters.search,
          ordenar: filters.sort && filters.sort !== "recentes" ? filters.sort : undefined,
        })}`}
      />
      <ProductGrid
        products={items}
        emptyFilters={{
          storeSlug: slug,
          tagSlug: filters.tagSlug,
          search: filters.search,
        }}
      />
      <Pagination
        page={page}
        totalPages={totalPages}
        basePath={`/lojas/${slug}`}
        extraParams={extraWithPrice}
      />
    </main>
  );
}
