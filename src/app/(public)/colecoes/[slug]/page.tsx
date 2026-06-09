import { notFound } from "next/navigation";
import { ProductGrid } from "@/components/catalog/product-grid";
import { getCollectionBySlug } from "@/lib/catalog";
import type { ProductListItem } from "@/lib/catalog";

type Props = { params: Promise<{ slug: string }> };

export default async function ColecaoPage({ params }: Props) {
  const { slug } = await params;
  const collection = await getCollectionBySlug(slug);
  if (!collection) notFound();

  const products = collection.products
    .map((cp) => cp.product)
    .filter((p) => p.isPublished) as ProductListItem[];

  return (
    <main className="px-6 py-9 md:px-10">
      <h1 className="font-display mb-2 text-3xl font-bold text-[var(--roxo-mais-escuro)]">
        {collection.name}
      </h1>
      {collection.description ? (
        <p className="mb-8 text-[var(--texto-suave)]">{collection.description}</p>
      ) : null}
      <ProductGrid products={products} />
    </main>
  );
}
