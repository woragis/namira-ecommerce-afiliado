import { CatalogToolbar } from "@/components/catalog/catalog-toolbar";
import { ProductGrid } from "@/components/catalog/product-grid";
import { getProducts } from "@/lib/catalog";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function BuscaPage({ searchParams }: Props) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q : "";
  const { items, total } = await getProducts({ search: q, limit: 48 });

  return (
    <main className="px-6 py-9 md:px-10">
      <CatalogToolbar
        title={q ? `Resultados para “${q}”` : "Busca"}
        total={total}
        basePath="/busca"
        extraParams={q ? { q } : {}}
      />
      <ProductGrid products={items} />
    </main>
  );
}
