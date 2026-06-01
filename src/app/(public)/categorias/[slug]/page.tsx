import { notFound } from "next/navigation";
import { CatalogToolbar } from "@/components/catalog/catalog-toolbar";
import { Pagination } from "@/components/catalog/pagination";
import { ProductGrid } from "@/components/catalog/product-grid";
import { getCategoryBySlug, getProducts } from "@/lib/catalog";
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

  const extra: Record<string, string> = { categoria: slug };
  if (filters.storeSlug) extra.loja = filters.storeSlug;
  if (filters.sort && filters.sort !== "recentes") extra.ordenar = filters.sort;

  return (
    <main className="px-6 py-9 md:px-10">
      <CatalogToolbar
        title={`${category.icon ?? ""} ${category.name}`.trim()}
        total={total}
        basePath={`/categorias/${slug}`}
        currentSort={filters.sort}
        extraParams={extra}
      />
      <ProductGrid products={items} />
      <Pagination
        page={page}
        totalPages={totalPages}
        basePath={`/categorias/${slug}`}
        extraParams={extra}
      />
    </main>
  );
}
