import Link from "next/link";
import { prisma } from "@/lib/db";
import { isDatabaseConfigured } from "@/lib/safe-db";

export default async function AdminCliquesPage() {
  if (!isDatabaseConfigured()) {
    return <p className="text-zinc-400">Banco não configurado.</p>;
  }

  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [total, recent, topProducts] = await Promise.all([
    prisma.clickEvent.count(),
    prisma.clickEvent.findMany({
      take: 30,
      orderBy: { clickedAt: "desc" },
      include: { product: { select: { title: true, slug: true } } },
    }),
    prisma.clickEvent.groupBy({
      by: ["productId"],
      where: { clickedAt: { gte: since } },
      _count: { productId: true },
      orderBy: { _count: { productId: "desc" } },
      take: 10,
    }),
  ]);

  const productIds = topProducts.map((t) => t.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, title: true, slug: true },
  });
  const productMap = Object.fromEntries(products.map((p) => [p.id, p]));

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold">Cliques em links de afiliado</h1>
      <p className="mb-8 text-sm text-zinc-400">Total histórico: {total}</p>

      <h2 className="mb-3 font-semibold">Top 10 (30 dias)</h2>
      <ul className="mb-10 space-y-2">
        {topProducts.map((t) => {
          const p = productMap[t.productId];
          return (
            <li key={t.productId} className="flex justify-between rounded-lg border border-zinc-800 px-3 py-2 text-sm">
              <span>{p?.title ?? t.productId}</span>
              <span className="text-amber-400">{t._count.productId} cliques</span>
            </li>
          );
        })}
      </ul>

      <h2 className="mb-3 font-semibold">Últimos cliques</h2>
      <table className="w-full text-left text-sm">
        <thead className="text-zinc-400">
          <tr>
            <th className="p-2">Quando</th>
            <th className="p-2">Produto</th>
          </tr>
        </thead>
        <tbody>
          {recent.map((c) => (
            <tr key={c.id} className="border-t border-zinc-800">
              <td className="p-2 text-zinc-400">
                {c.clickedAt.toLocaleString("pt-BR")}
              </td>
              <td className="p-2">
                <Link href={`/produtos/${c.product.slug}`} className="text-amber-400 no-underline">
                  {c.product.title}
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
