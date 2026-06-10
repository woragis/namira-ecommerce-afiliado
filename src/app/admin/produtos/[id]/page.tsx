import { notFound } from "next/navigation";
import { AdminProductShareLinks } from "@/components/admin/admin-product-share-links";
import { AdminDbSetup } from "@/components/admin/admin-db-setup";
import { DeleteProductButton } from "@/components/admin/delete-product-button";
import { ProductMetricsPanel } from "@/components/admin/metrics/product-metrics-panel";
import { ProductForm } from "@/components/admin/product-form";
import { isNamiraSchemaReady, safeDbQuery } from "@/lib/admin-db";
import { isAdminMetricsEnabled } from "@/lib/admin-metrics-flag";
import { getProductMetricsSummary } from "@/lib/analytics-stats";
import { prisma } from "@/lib/db";
import { toProductFormInput } from "@/lib/product-form-data";
import { isDatabaseConfigured } from "@/lib/safe-db";

type Props = { params: Promise<{ id: string }> };

export default async function EditarProdutoPage({ params }: Props) {
  const { id } = await params;

  if (!isDatabaseConfigured()) {
    return <p className="text-zinc-400">Banco não configurado.</p>;
  }

  if (!(await isNamiraSchemaReady())) {
    return (
      <div>
        <h1 className="mb-6 text-2xl font-bold">Editar produto</h1>
        <AdminDbSetup />
      </div>
    );
  }

  const metricsEnabled = isAdminMetricsEnabled();

  const [product, stores, categories, badges, metrics] = await Promise.all([
    safeDbQuery(
      () =>
        prisma.product.findUnique({
          where: { id },
          include: {
            categories: { select: { categoryId: true } },
            badges: { select: { badgeId: true } },
            media: { orderBy: { sortOrder: "asc" } },
          },
        }),
      null,
    ),
    safeDbQuery(
      () =>
        prisma.store.findMany({
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
        }),
      [],
    ),
    safeDbQuery(
      () =>
        prisma.category.findMany({
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
        }),
      [],
    ),
    safeDbQuery(() => prisma.badge.findMany(), []),
    metricsEnabled
      ? safeDbQuery(
          () =>
            Promise.all([
              getProductMetricsSummary(id, 7),
              getProductMetricsSummary(id, 30),
            ]),
          null,
        )
      : Promise.resolve(null),
  ]);

  if (!product) notFound();

  const productFormInput = toProductFormInput(product);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <h1 className="text-2xl font-bold">Editar produto</h1>
        <DeleteProductButton productId={product.id} productTitle={product.title} />
      </div>
      {product.shareCode ? (
        <AdminProductShareLinks shareCode={product.shareCode} slug={product.slug} />
      ) : (
        <p className="mb-6 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 text-sm text-zinc-400">
          O link curto será gerado automaticamente ao salvar o produto.
        </p>
      )}
      {metricsEnabled && metrics ? (
        <ProductMetricsPanel
          productId={product.id}
          productSlug={product.slug}
          week={metrics[0]}
          month={metrics[1]}
        />
      ) : null}
      <ProductForm
        product={productFormInput}
        stores={stores}
        categories={categories}
        badges={badges}
      />
    </div>
  );
}
