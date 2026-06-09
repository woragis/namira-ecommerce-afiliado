import { notFound } from "next/navigation";
import { DeleteProductButton } from "@/components/admin/delete-product-button";
import { ProductMetricsPanel } from "@/components/admin/metrics/product-metrics-panel";
import { ProductForm } from "@/components/admin/product-form";
import { syncMetricsRollup } from "@/lib/analytics-rollup";
import { getProductMetricsSummary } from "@/lib/analytics-stats";
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
        media: { orderBy: { sortOrder: "asc" } },
      },
    }),
    prisma.store.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
    prisma.category.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
    prisma.badge.findMany(),
  ]);

  if (!product) notFound();

  await syncMetricsRollup(30);
  const [week, month] = await Promise.all([
    getProductMetricsSummary(product.id, 7),
    getProductMetricsSummary(product.id, 30),
  ]);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <h1 className="text-2xl font-bold">Editar produto</h1>
        <DeleteProductButton productId={product.id} productTitle={product.title} />
      </div>
      <ProductMetricsPanel
        productId={product.id}
        productSlug={product.slug}
        week={week}
        month={month}
      />
      <ProductForm
        product={product}
        stores={stores}
        categories={categories}
        badges={badges}
      />
    </div>
  );
}
