import Link from "next/link";
import type { ReactNode } from "react";
import { AdminDbSetup } from "@/components/admin/admin-db-setup";
import { DashboardOverview } from "@/components/admin/metrics/dashboard-overview";
import { prisma } from "@/lib/db";
import { isNamiraSchemaReady, safeDbQuery } from "@/lib/admin-db";
import { isAdminMetricsEnabled } from "@/lib/admin-metrics-flag";
import {
  getCatalogHealth,
  getMetricTotals,
  type CatalogHealth,
  type MetricTotals,
} from "@/lib/analytics-stats";
import { daysAgo } from "@/lib/dates";
import { isDatabaseConfigured } from "@/lib/safe-db";
import { unstable_cache } from "next/cache";

const getCachedDashboardMetrics = unstable_cache(
  async (): Promise<{ weekTotals: MetricTotals; health: CatalogHealth }> => {
    const since7 = daysAgo(7);
    const [weekTotals, health] = await Promise.all([
      getMetricTotals(since7),
      getCatalogHealth(30),
    ]);
    return { weekTotals, health };
  },
  ["admin-dashboard-metrics"],
  { revalidate: 120, tags: ["admin-metrics"] },
);

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

  const metricsEnabled = isAdminMetricsEnabled();

  const [products, published, stores, drafts, metrics] = await Promise.all([
    safeDbQuery(() => prisma.product.count(), 0),
    safeDbQuery(() => prisma.product.count({ where: { isPublished: true } }), 0),
    safeDbQuery(() => prisma.store.count({ where: { isActive: true } }), 0),
    safeDbQuery(() => prisma.product.count({ where: { isPublished: false } }), 0),
    metricsEnabled
      ? safeDbQuery(() => getCachedDashboardMetrics(), {
          weekTotals: { impressions: 0, views: 0, clicks: 0 },
          health: {
            publishedWithoutClicks: 0,
            draftProducts: 0,
            weakFeatured: 0,
          },
        })
      : Promise.resolve(null),
  ]);

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold">Dashboard</h1>
      <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Produtos" value={products} href="/admin/produtos" />
        <Stat label="Publicados" value={published} href="/admin/produtos" />
        <Stat label="Rascunhos" value={drafts} href="/admin/produtos" />
        <Stat label="Lojas ativas" value={stores} href="/admin/lojas" />
      </div>

      <section className="mb-10 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
        <h2 className="mb-4 text-sm font-semibold text-zinc-300">Atalhos</h2>
        <div className="flex flex-wrap gap-3">
          <QuickLink href="/admin/produtos/novo" primary>
            Novo produto
          </QuickLink>
          <QuickLink href="/admin/produtos">Ver produtos</QuickLink>
          <QuickLink href="/admin/lojas">Lojas</QuickLink>
          <QuickLink href="/admin/colecoes">Coleções</QuickLink>
          <QuickLink href="/admin/configuracoes">Configurações</QuickLink>
        </div>
      </section>

      {metricsEnabled && metrics ? (
        <DashboardOverview
          totals={metrics.weekTotals}
          health={metrics.health}
          days={7}
        />
      ) : (
        <p className="text-sm text-zinc-500">
          Métricas de tráfego desativadas no admin para manter o painel rápido.
          Para reativar, defina{" "}
          <code className="text-zinc-400">ADMIN_METRICS_ENABLED=true</code> no
          ambiente.
        </p>
      )}
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

function QuickLink({
  href,
  children,
  primary,
}: {
  href: string;
  children: ReactNode;
  primary?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`rounded-lg px-4 py-2 text-sm no-underline ${
        primary
          ? "bg-amber-500 font-semibold text-zinc-950 hover:bg-amber-400"
          : "border border-zinc-700 text-zinc-300 hover:border-zinc-500 hover:text-white"
      }`}
    >
      {children}
    </Link>
  );
}
