import { notFound } from "next/navigation";
import { CatalogToolbar } from "@/components/catalog/catalog-toolbar";
import { Pagination } from "@/components/catalog/pagination";
import { PriceRangeFilter } from "@/components/catalog/price-range-filter";
import { ProductGrid } from "@/components/catalog/product-grid";
import { getCategoryBySlug, getProducts } from "@/lib/catalog";
import { filtersToSearchParams } from "@/lib/catalog-params";
import { parseCatalogSearchParams } from "@/lib/filters";

export const revalidate = 60;

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function CategoriaPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const sp = await searchParams;
  const filters = parseCatalogSearchParams(sp);
  const { items, total, page, totalPages } = await getProducts({
    ...filters,
    categorySlug: slug,
  });

  const extra = { ...filtersToSearchParams(filters), categoria: slug };

  return (
    <main className="px-6 py-9 md:px-10">
      <CatalogToolbar
        title={`${category.icon ?? ""} ${category.name}`.trim()}
        total={total}
        basePath={`/categorias/${slug}`}
        currentSort={filters.sort}
        extraParams={extra}
      />
      <PriceRangeFilter
        action={`/categorias/${slug}`}
        priceMin={filters.priceMin}
        priceMax={filters.priceMax}
        hiddenParams={extra}
      />
      <ProductGrid products={items} />
      <Pagination
        page={page}
        totalPages={totalPages}
        basePath={`/categorias/${slug}`}
        extraParams={{
          ...extra,
          ...(filters.priceMin != null ? { preco_min: String(filters.priceMin) } : {}),
          ...(filters.priceMax != null ? { preco_max: String(filters.priceMax) } : {}),
        }}
      />
    </main>
  );
}
