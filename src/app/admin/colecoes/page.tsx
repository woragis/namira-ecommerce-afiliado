import { CollectionType } from "@prisma/client";
import { createCollection, deactivateCollection } from "@/actions/admin/collections";
import { NavLink } from "@/components/ui/nav-link";
import { SubmitButton } from "@/components/ui/submit-button";
import { prisma } from "@/lib/db";
import { isDatabaseConfigured } from "@/lib/safe-db";

export default async function AdminColecoesPage() {
  if (!isDatabaseConfigured()) {
    return <p className="text-zinc-400">Banco não configurado.</p>;
  }

  const collections = await prisma.collection.findMany({
    orderBy: { homeSortOrder: "asc" },
    include: { _count: { select: { products: true } } },
  });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Coleções</h1>

      <form action={createCollection} className="mb-10 max-w-2xl space-y-3 rounded-xl border border-zinc-800 bg-zinc-900 p-4">
        <input name="name" placeholder="Nome" required className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm" />
        <input name="slug" placeholder="slug" className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm" />
        <textarea name="description" placeholder="Descrição" rows={2} className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm" />
        <select name="type" className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm">
          <option value={CollectionType.SECTION}>Seção (grid home)</option>
          <option value={CollectionType.BANNER}>Banner</option>
        </select>
        <label className="flex gap-2 text-sm">
          <input type="checkbox" name="showOnHome" />
          Mostrar na home
        </label>
        <input name="homeSortOrder" type="number" defaultValue={0} placeholder="Ordem na home" className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm" />
        <input name="maxProducts" type="number" defaultValue={12} className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm" />
        <SubmitButton
          pendingLabel="Criando…"
          className="rounded-lg bg-amber-500 py-2 text-sm font-semibold text-zinc-950 cursor-pointer"
        >
          Criar coleção
        </SubmitButton>
      </form>

      <ul className="space-y-2">
        {collections.map((c) => (
          <li key={c.id} className="flex items-center justify-between rounded-lg border border-zinc-800 px-4 py-3">
            <div>
              <span className="font-medium">{c.name}</span>
              <span className="ml-2 text-xs text-zinc-500">
                {c._count.products} produtos · {c.type}
              </span>
            </div>
            <div>
              <NavLink
                href={`/admin/colecoes/${c.id}`}
                showPendingIndicator
                className="text-amber-400 no-underline text-sm"
              >
                Gerenciar
              </NavLink>
              <form action={deactivateCollection.bind(null, c.id)} className="ml-3 inline">
                <SubmitButton
                  pendingLabel="…"
                  className="text-xs text-red-400 cursor-pointer"
                >
                  Desativar
                </SubmitButton>
              </form>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
