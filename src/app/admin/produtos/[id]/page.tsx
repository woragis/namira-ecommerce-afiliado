import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/product-form";
import { prisma } from "@/lib/db";

type Props = { params: Promise<{ id: string }> };

export default async function EditarProdutoPage({ params }: Props) {
  const { id } = await params;

  const [product, stores, categories, badges] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: {
        categories: { select: { categoryId: true } },
        badges: { select: { badgeId: true } },
      },
    }),
    prisma.store.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
    prisma.category.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
    prisma.badge.findMany(),
  ]);

  if (!product) notFound();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Editar produto</h1>
      <ProductForm
        product={product}
        stores={stores}
        categories={categories}
        badges={badges}
      />
    </div>
  );
}
