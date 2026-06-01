import { notFound } from "next/navigation";
import { CatalogToolbar } from "@/components/catalog/catalog-toolbar";
import { Pagination } from "@/components/catalog/pagination";
import { ProductGrid } from "@/components/catalog/product-grid";
import { getProducts, getStoreBySlug } from "@/lib/catalog";
import { parseCatalogSearchParams } from "@/lib/filters";

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

  const extra: Record<string, string> = { loja: slug };
  if (filters.sort && filters.sort !== "recentes") extra.ordenar = filters.sort;

  return (
    <main className="px-6 py-9 md:px-10">
      <CatalogToolbar
        title={store.name}
        subtitle="Produtos com link de afiliado"
        total={total}
        basePath={`/lojas/${slug}`}
        currentSort={filters.sort}
        extraParams={extra}
      />
      <ProductGrid products={items} />
      <Pagination
        page={page}
        totalPages={totalPages}
        basePath={`/lojas/${slug}`}
        extraParams={extra}
      />
    </main>
  );
}
