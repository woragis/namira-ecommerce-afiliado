import type { ProductWithRelations } from "@/lib/catalog";
import { ProductCard } from "./product-card";

export function ProductGrid({ products }: { products: ProductWithRelations[] }) {
  if (products.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-[var(--borda)] bg-white px-6 py-16 text-center text-[var(--texto-suave)]">
        Nenhum produto encontrado. Configure o banco e rode o seed — veja{" "}
        <code className="text-sm">docs/setup-sem-npm.md</code>.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-5">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
