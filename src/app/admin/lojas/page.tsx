import Link from "next/link";
import { AdminDbSetup } from "@/components/admin/admin-db-setup";
import { prisma } from "@/lib/db";
import { isNamiraSchemaReady, safeDbQuery } from "@/lib/admin-db";
import { isDatabaseConfigured } from "@/lib/safe-db";
import { deleteStore } from "@/actions/admin/stores";

export default async function AdminLojasPage() {
  if (!isDatabaseConfigured()) {
    return <p className="text-zinc-400">Banco não configurado.</p>;
  }

  if (!(await isNamiraSchemaReady())) {
    return (
      <div>
        <h1 className="mb-6 text-2xl font-bold">Lojas</h1>
        <AdminDbSetup />
      </div>
    );
  }

  const stores = await safeDbQuery(
    () => prisma.store.findMany({ orderBy: { sortOrder: "asc" } }),
    [],
  );

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Lojas</h1>
        <Link
          href="/admin/lojas/nova"
          className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-zinc-950 no-underline"
        >
          Nova loja
        </Link>
      </div>
      <div className="overflow-hidden rounded-xl border border-zinc-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-900 text-zinc-400">
            <tr>
              <th className="p-3">Loja</th>
              <th className="p-3">Slug</th>
              <th className="p-3">Cor</th>
              <th className="p-3">Produtos</th>
              <th className="p-3">Nav</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {stores.map((s) => (
              <tr key={s.id} className="border-t border-zinc-800">
                <td className="p-3 font-medium">{s.name}</td>
                <td className="p-3 text-zinc-400">{s.slug}</td>
                <td className="p-3">
                  <span
                    className="inline-block h-6 w-6 rounded"
                    style={{ backgroundColor: s.colorPrimary }}
                  />
                </td>
                <td className="p-3">{s.productCountCached}</td>
                <td className="p-3">{s.showInNav ? "Sim" : "Não"}</td>
                <td className="p-3 text-right">
                  <Link href={`/admin/lojas/${s.id}`} className="text-amber-400 no-underline">
                    Editar
                  </Link>
                  <form action={deleteStore.bind(null, s.id)} className="ml-3 inline">
                    <button type="submit" className="text-red-400 text-xs cursor-pointer">
                      Desativar
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
