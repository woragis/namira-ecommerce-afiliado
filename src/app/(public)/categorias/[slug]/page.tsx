import { notFound } from "next/navigation";
import { CatalogToolbar } from "@/components/catalog/catalog-toolbar";
import { ProductGrid } from "@/components/catalog/product-grid";
import { getCategoryBySlug, getProducts } from "@/lib/catalog";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function CategoriaPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const sp = await searchParams;
  const loja = typeof sp.loja === "string" ? sp.loja : undefined;
  const ordenar = typeof sp.ordenar === "string" ? sp.ordenar : "recentes";

  const { items, total } = await getProducts({
    categorySlug: slug,
    storeSlug: loja,
    sort: ordenar as "recentes",
  });

  const extra: Record<string, string> = { categoria: slug };
  if (loja) extra.loja = loja;

  return (
    <main className="px-6 py-9 md:px-10">
      <CatalogToolbar
        title={`${category.icon ?? ""} ${category.name}`.trim()}
        total={total}
        basePath={`/categorias/${slug}`}
        currentSort={ordenar}
        extraParams={extra}
      />
      <ProductGrid products={items} />
    </main>
  );
}
