import Link from "next/link";
import { prisma } from "@/lib/db";
import { isDatabaseConfigured } from "@/lib/safe-db";
import { toggleProductPublished } from "@/actions/admin/products";

export default async function AdminProdutosPage() {
  if (!isDatabaseConfigured()) {
    return <p className="text-zinc-400">Banco não configurado.</p>;
  }

  const products = await prisma.product.findMany({
    include: { store: true },
    orderBy: { updatedAt: "desc" },
    take: 100,
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Produtos</h1>
        <Link
          href="/admin/produtos/novo"
          className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-zinc-950 no-underline"
        >
          Novo produto
        </Link>
      </div>
      <div className="overflow-hidden rounded-xl border border-zinc-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-900 text-zinc-400">
            <tr>
              <th className="p-3">Título</th>
              <th className="p-3">Loja</th>
              <th className="p-3">Preço</th>
              <th className="p-3">Publicado</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-t border-zinc-800">
                <td className="p-3 max-w-xs truncate">
                  <Link href={`/admin/produtos/${p.id}`} className="text-white no-underline hover:text-amber-400">
                    {p.title}
                  </Link>
                </td>
                <td className="p-3" style={{ color: p.store.colorPrimary }}>
                  {p.store.name}
                </td>
                <td className="p-3">R$ {Number(p.priceCurrent).toFixed(2)}</td>
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
                      className={`text-xs cursor-pointer ${p.isPublished ? "text-green-400" : "text-zinc-500"}`}
                    >
                      {p.isPublished ? "Sim" : "Não"}
                    </button>
                  </form>
                </td>
                <td className="p-3 text-right">
                  <Link href={`/produtos/${p.slug}`} className="text-xs text-zinc-500 no-underline hover:text-amber-400">
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
