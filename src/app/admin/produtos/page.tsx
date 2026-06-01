import Link from "next/link";
import { prisma } from "@/lib/db";
import { isDatabaseConfigured } from "@/lib/safe-db";
import {
  toggleProductFeatured,
  toggleProductPublished,
} from "@/actions/admin/products";
import type { Prisma } from "@prisma/client";

type Props = {
  searchParams: Promise<{ q?: string; loja?: string }>;
};

export default async function AdminProdutosPage({ searchParams }: Props) {
  if (!isDatabaseConfigured()) {
    return <p className="text-zinc-400">Banco não configurado.</p>;
  }

  const { q, loja } = await searchParams;

  const where: Prisma.ProductWhereInput = {};
  if (q?.trim()) {
    where.title = { contains: q.trim(), mode: "insensitive" };
  }
  if (loja) {
    where.store = { slug: loja };
  }

  const [products, stores] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { store: true },
      orderBy: { updatedAt: "desc" },
      take: 200,
    }),
    prisma.store.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
  ]);

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
        {products.length} resultado{products.length !== 1 ? "s" : ""} (máx. 200)
      </p>

      <div className="overflow-x-auto rounded-xl border border-zinc-800">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-zinc-900 text-zinc-400">
            <tr>
              <th className="p-3">Título</th>
              <th className="p-3">Loja</th>
              <th className="p-3">Preço</th>
              <th className="p-3">Destaque</th>
              <th className="p-3">Publicado</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-t border-zinc-800">
                <td className="max-w-xs truncate p-3">
                  <Link
                    href={`/admin/produtos/${p.id}`}
                    className="text-white no-underline hover:text-amber-400"
                  >
                    {p.title}
                  </Link>
                </td>
                <td className="p-3" style={{ color: p.store.colorPrimary }}>
                  {p.store.name}
                </td>
                <td className="p-3">R$ {Number(p.priceCurrent).toFixed(2)}</td>
                <td className="p-3">
                  <form
                    action={toggleProductFeatured.bind(null, p.id, !p.isFeatured)}
                  >
                    <button
                      type="submit"
                      className={`cursor-pointer text-xs ${p.isFeatured ? "text-amber-400" : "text-zinc-500"}`}
                      title="Destaque na home"
                    >
                      {p.isFeatured ? "⭐ Sim" : "Não"}
                    </button>
                  </form>
                </td>
                <td className="p-3">
                  <form
                    action={toggleProductPublished.bind(
                      null,
                      p.id,
                      !p.isPublished,
                    )}
                  >
                    <button
                      type="submit"
                      className={`cursor-pointer text-xs ${p.isPublished ? "text-green-400" : "text-zinc-500"}`}
                    >
                      {p.isPublished ? "Sim" : "Não"}
                    </button>
                  </form>
                </td>
                <td className="p-3 text-right">
                  <Link
                    href={`/produtos/${p.slug}`}
                    className="text-xs text-zinc-500 no-underline hover:text-amber-400"
                  >
                    Ver
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
