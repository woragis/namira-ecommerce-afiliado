import { CatalogToolbar } from "@/components/catalog/catalog-toolbar";
import type { CatalogFilterChip } from "@/components/catalog/catalog-toolbar";
import { Pagination } from "@/components/catalog/pagination";
import { PriceRangeFilter } from "@/components/catalog/price-range-filter";
import { ProductGrid } from "@/components/catalog/product-grid";
import { getActiveStores, getNavTags, getProducts } from "@/lib/catalog";
import { filtersToSearchParams } from "@/lib/catalog-params";
import {
  catalogHref,
  catalogTitle,
  parseCatalogSearchParams,
  priceChipLabel,
} from "@/lib/filters";

export const revalidate = 60;

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ProdutosPage({ searchParams }: Props) {
  const params = await searchParams;
  const filters = parseCatalogSearchParams(params);
  const [{ items, total, page, totalPages }, stores, tags] = await Promise.all([
    getProducts(filters),
    getActiveStores(),
    getNavTags(),
  ]);

  const extra = filtersToSearchParams(filters);
  const extraWithPrice = filtersToSearchParams(filters, ["page"]);
  const storeName = stores.find((s) => s.slug === filters.storeSlug)?.name;
  const tagName = tags.find((t) => t.slug === filters.tagSlug)?.name;
  const title = catalogTitle({
    search: filters.search,
    storeName,
    tagName,
  });

  const chips: CatalogFilterChip[] = [];
  if (filters.storeSlug) {
    chips.push({
      key: "loja",
      label: storeName ?? filters.storeSlug,
      href: catalogHref({
        tagSlug: filters.tagSlug,
        search: filters.search,
        sort: filters.sort,
        priceMin: filters.priceMin,
        priceMax: filters.priceMax,
      }),
    });
  }
  if (filters.tagSlug) {
    chips.push({
      key: "tag",
      label: tagName ?? filters.tagSlug,
      href: catalogHref({
        storeSlug: filters.storeSlug,
        search: filters.search,
        sort: filters.sort,
        priceMin: filters.priceMin,
        priceMax: filters.priceMax,
      }),
    });
  }
  if (filters.search) {
    chips.push({
      key: "q",
      label: `“${filters.search}”`,
      href: catalogHref({
        storeSlug: filters.storeSlug,
        tagSlug: filters.tagSlug,
        sort: filters.sort,
        priceMin: filters.priceMin,
        priceMax: filters.priceMax,
      }),
    });
  }
  const priceLabel = priceChipLabel(filters.priceMin, filters.priceMax);
  if (priceLabel) {
    chips.push({
      key: "preco",
      label: priceLabel,
      href: catalogHref({
        storeSlug: filters.storeSlug,
        tagSlug: filters.tagSlug,
        search: filters.search,
        sort: filters.sort,
      }),
    });
  }

  return (
    <main className="px-6 py-9 md:px-10">
      <CatalogToolbar
        title={title}
        total={total}
        basePath="/produtos"
        currentSort={filters.sort}
        extraParams={extraWithPrice}
        chips={chips}
      />
      <PriceRangeFilter
        action="/produtos"
        priceMin={filters.priceMin}
        priceMax={filters.priceMax}
        hiddenParams={extra}
        clearHref={catalogHref({
          storeSlug: filters.storeSlug,
          tagSlug: filters.tagSlug,
          search: filters.search,
          sort: filters.sort,
        })}
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
        extraParams={extraWithPrice}
      />
    </main>
  );
}
