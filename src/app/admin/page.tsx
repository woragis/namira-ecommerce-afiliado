import Link from "next/link";
import { prisma } from "@/lib/db";
import { daysAgo } from "@/lib/dates";
import { isDatabaseConfigured } from "@/lib/safe-db";

export default async function AdminDashboardPage() {
  if (!isDatabaseConfigured()) {
    return (
      <div>
        <h1 className="mb-4 text-2xl font-bold">Dashboard</h1>
        <p className="text-zinc-400">
          Configure <code className="text-amber-400">DATABASE_URL</code> no{" "}
          <code>.env</code> e rode <code>npm install && npm run db:push && npm run db:seed</code>.
          Veja <code>docs/setup-sem-npm.md</code>.
        </p>
      </div>
    );
  }

  const [products, published, stores, clicks] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({ where: { isPublished: true } }),
    prisma.store.count({ where: { isActive: true } }),
    prisma.clickEvent.count({
      where: {
        clickedAt: { gte: daysAgo(7) },
      },
    }),
  ]);

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold">Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Produtos" value={products} href="/admin/produtos" />
        <Stat label="Publicados" value={published} href="/admin/produtos" />
        <Stat label="Lojas ativas" value={stores} href="/admin/lojas" />
        <Stat label="Cliques (7d)" value={clicks} href="/admin/cliques" />
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
