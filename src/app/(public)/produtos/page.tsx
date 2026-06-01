import { CatalogToolbar } from "@/components/catalog/catalog-toolbar";
import { ProductGrid } from "@/components/catalog/product-grid";
import { getProducts } from "@/lib/catalog";
import { parseCatalogSearchParams } from "@/lib/filters";

export const revalidate = 60;

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ProdutosPage({ searchParams }: Props) {
  const params = await searchParams;
  const filters = parseCatalogSearchParams(params);
  const { items, total } = await getProducts(filters);

  const extra: Record<string, string> = {};
  if (filters.storeSlug) extra.loja = filters.storeSlug;
  if (filters.categorySlug) extra.categoria = filters.categorySlug;
  if (filters.badgeSlug) extra.badge = filters.badgeSlug;

  return (
    <main className="px-6 py-9 md:px-10">
      <CatalogToolbar
        title="Todos os achados"
        total={total}
        basePath="/produtos"
        currentSort={filters.sort}
        extraParams={extra}
      />
      <ProductGrid products={items} />
    </main>
  );
}
