import Link from "next/link";
import { AdminDbSetup } from "@/components/admin/admin-db-setup";
import { ProductsAdminTable } from "@/components/admin/products-admin-table";
import { prisma } from "@/lib/db";
import { isNamiraSchemaReady, safeDbQuery } from "@/lib/admin-db";
import { isAdminMetricsEnabled } from "@/lib/admin-metrics-flag";
import { isDatabaseConfigured } from "@/lib/safe-db";
import type { Prisma } from "@prisma/client";

const PAGE_SIZE = 50;

type Props = {
  searchParams: Promise<{ q?: string; loja?: string; page?: string }>;
};

function buildPageHref(
  q: string | undefined,
  loja: string | undefined,
  page: number,
) {
  const params = new URLSearchParams();
  if (q?.trim()) params.set("q", q.trim());
  if (loja) params.set("loja", loja);
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `/admin/produtos?${qs}` : "/admin/produtos";
}

export default async function AdminProdutosPage({ searchParams }: Props) {
  if (!isDatabaseConfigured()) {
    return <p className="text-zinc-400">Banco não configurado.</p>;
  }

  if (!(await isNamiraSchemaReady())) {
    return (
      <div>
        <h1 className="mb-6 text-2xl font-bold">Produtos</h1>
        <AdminDbSetup />
      </div>
    );
  }

  const { q, loja, page: pageRaw } = await searchParams;
  const page = Math.max(1, Number(pageRaw) || 1);
  const skip = (page - 1) * PAGE_SIZE;

  const where: Prisma.ProductWhereInput = {};
  if (q?.trim()) {
    where.title = { contains: q.trim(), mode: "insensitive" };
  }
  if (loja) {
    where.store = { slug: loja };
  }

  const [products, total, stores] = await Promise.all([
    safeDbQuery(
      () =>
        prisma.product.findMany({
          where,
          include: { store: true },
          orderBy: { updatedAt: "desc" },
          skip,
          take: PAGE_SIZE,
        }),
      [],
    ),
    safeDbQuery(() => prisma.product.count({ where }), 0),
    safeDbQuery(
      () =>
        prisma.store.findMany({
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
        }),
      [],
    ),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const metricsEnabled = isAdminMetricsEnabled();

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Produtos</h1>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/produtos/importar"
            className="rounded-lg border border-zinc-600 px-4 py-2 text-sm text-zinc-300 no-underline hover:border-zinc-400"
          >
            Importar CSV
          </Link>
          <a
            href="/api/admin/export/products"
            className="rounded-lg border border-zinc-600 px-4 py-2 text-sm text-zinc-300 no-underline hover:border-zinc-400"
          >
            Exportar CSV
          </a>
          <Link
            href="/admin/produtos/novo"
            className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-zinc-950 no-underline"
          >
            Novo produto
          </Link>
        </div>
      </div>

      <form className="mb-6 flex flex-wrap gap-3">
        <input
          name="q"
          defaultValue={q ?? ""}
          placeholder="Buscar por título…"
          className="min-w-[200px] flex-1 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm"
        />
        <select
          name="loja"
          defaultValue={loja ?? ""}
          className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm"
        >
          <option value="">Todas as lojas</option>
          {stores.map((s) => (
            <option key={s.id} value={s.slug}>
              {s.name}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-lg bg-zinc-800 px-4 py-2 text-sm cursor-pointer hover:bg-zinc-700"
        >
          Filtrar
        </button>
      </form>

      <p className="mb-4 text-xs text-zinc-500">
        {total} produto{total !== 1 ? "s" : ""}
        {totalPages > 1
          ? ` · página ${safePage} de ${totalPages}`
          : null}
        {" · "}
        Selecione linhas para ações em lote (publicar, excluir, mover loja…)
      </p>

      <ProductsAdminTable
        products={products.map((p) => ({
          id: p.id,
          title: p.title,
          slug: p.slug,
          priceCurrent: p.priceCurrent,
          isFeatured: p.isFeatured,
          isPublished: p.isPublished,
          store: p.store,
        }))}
        stores={stores}
        metricsEnabled={metricsEnabled}
      />

      {totalPages > 1 ? (
        <nav className="mt-6 flex flex-wrap items-center justify-center gap-2 text-sm">
          {safePage > 1 ? (
            <Link
              href={buildPageHref(q, loja, safePage - 1)}
              className="rounded-lg border border-zinc-700 px-3 py-1.5 text-zinc-300 no-underline hover:border-zinc-500"
            >
              ← Anterior
            </Link>
          ) : null}
          <span className="px-2 text-zinc-500">
            {safePage} / {totalPages}
          </span>
          {safePage < totalPages ? (
            <Link
              href={buildPageHref(q, loja, safePage + 1)}
              className="rounded-lg border border-zinc-700 px-3 py-1.5 text-zinc-300 no-underline hover:border-zinc-500"
            >
              Próxima →
            </Link>
          ) : null}
        </nav>
      ) : null}
    </div>
  );
}
