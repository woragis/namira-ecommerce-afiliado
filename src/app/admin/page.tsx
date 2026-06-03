import Link from "next/link";
import { AdminDbSetup } from "@/components/admin/admin-db-setup";
import { prisma } from "@/lib/db";
import { isNamiraSchemaReady, safeDbQuery } from "@/lib/admin-db";
import { daysAgo } from "@/lib/dates";
import { isDatabaseConfigured } from "@/lib/safe-db";

export default async function AdminDashboardPage() {
  if (!isDatabaseConfigured()) {
    return (
      <div>
        <h1 className="mb-4 text-2xl font-bold">Dashboard</h1>
        <p className="text-zinc-400">
          Configure <code className="text-amber-400">DATABASE_URL</code> na
          Vercel.
        </p>
      </div>
    );
  }

  const schemaReady = await isNamiraSchemaReady();
  if (!schemaReady) {
    return (
      <div>
        <h1 className="mb-6 text-2xl font-bold">Dashboard</h1>
        <AdminDbSetup />
      </div>
    );
  }

  const since7 = daysAgo(7);
  const [products, published, stores, impressions, views, clicks] =
    await Promise.all([
      safeDbQuery(() => prisma.product.count(), 0),
      safeDbQuery(() => prisma.product.count({ where: { isPublished: true } }), 0),
      safeDbQuery(() => prisma.store.count({ where: { isActive: true } }), 0),
      safeDbQuery(
        () =>
          prisma.productImpressionEvent.count({
            where: { impressedAt: { gte: since7 } },
          }),
        0,
      ),
      safeDbQuery(
        () =>
          prisma.productViewEvent.count({
            where: { viewedAt: { gte: since7 } },
          }),
        0,
      ),
      safeDbQuery(
        () =>
          prisma.clickEvent.count({
            where: { clickedAt: { gte: since7 } },
          }),
        0,
      ),
    ]);

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold">Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <Stat label="Produtos" value={products} href="/admin/produtos" />
        <Stat label="Publicados" value={published} href="/admin/produtos" />
        <Stat label="Lojas ativas" value={stores} href="/admin/lojas" />
        <Stat label="Impressões (7d)" value={impressions} href="/admin/metricas" />
        <Stat label="Visualizações (7d)" value={views} href="/admin/metricas" />
        <Stat label="Cliques (7d)" value={clicks} href="/admin/metricas" />
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  href,
}: {
  label: string;
  value: number;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 no-underline hover:border-zinc-600"
    >
      <div className="text-3xl font-bold text-white">{value}</div>
      <div className="text-sm text-zinc-400">{label}</div>
    </Link>
  );
}
