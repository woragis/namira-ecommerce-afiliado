import { CatalogToolbar } from "@/components/catalog/catalog-toolbar";
import { Pagination } from "@/components/catalog/pagination";
import { ProductGrid } from "@/components/catalog/product-grid";
import { getProducts } from "@/lib/catalog";
import { parseCatalogSearchParams } from "@/lib/filters";

export const revalidate = 60;

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function BuscaPage({ searchParams }: Props) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q : "";
  const filters = parseCatalogSearchParams(params);

  const { items, total, page, totalPages } = await getProducts({
    search: q,
    page: filters.page,
    limit: 24,
    sort: filters.sort,
  });

  const extra: Record<string, string> = {};
  if (q) extra.q = q;

  return (
    <main className="px-6 py-9 md:px-10">
      <CatalogToolbar
        title={q ? `Resultados para “${q}”` : "Busca"}
        total={total}
        basePath="/busca"
        extraParams={extra}
      />
      <ProductGrid products={items} />
      <Pagination
        page={page}
        totalPages={totalPages}
        basePath="/busca"
        extraParams={extra}
      />
    </main>
  );
}
