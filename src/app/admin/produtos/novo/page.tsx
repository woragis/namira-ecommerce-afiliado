import { ProductForm } from "@/components/admin/product-form";
import { prisma } from "@/lib/db";
import { isDatabaseConfigured } from "@/lib/safe-db";

export default async function NovoProdutoPage() {
  if (!isDatabaseConfigured()) {
    return <p className="text-zinc-400">Banco não configurado.</p>;
  }

  const [stores, categories] = await Promise.all([
    prisma.store.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
    prisma.category.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
  ]);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Novo produto</h1>
      {stores.length === 0 ? (
        <p className="text-zinc-400">Cadastre uma loja antes de criar produtos.</p>
      ) : (
        <ProductForm stores={stores} categories={categories} />
      )}
    </div>
  );
}
