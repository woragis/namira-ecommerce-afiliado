import { notFound } from "next/navigation";
import { CatalogToolbar } from "@/components/catalog/catalog-toolbar";
import { ProductGrid } from "@/components/catalog/product-grid";
import { getProducts, getStoreBySlug } from "@/lib/catalog";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function LojaPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const store = await getStoreBySlug(slug);
  if (!store) notFound();

  const sp = await searchParams;
  const ordenar = typeof sp.ordenar === "string" ? sp.ordenar : "recentes";
  const { items, total } = await getProducts({
    storeSlug: slug,
    sort: ordenar as "recentes",
  });

  return (
    <main className="px-6 py-9 md:px-10">
      <CatalogToolbar
        title={store.name}
        subtitle="Produtos com link de afiliado"
        total={total}
        basePath={`/lojas/${slug}`}
        currentSort={ordenar}
      />
      <ProductGrid products={items} />
    </main>
  );
}
