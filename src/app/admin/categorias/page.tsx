import { createCategory, deactivateCategory } from "@/actions/admin/categories";
import { NavLink } from "@/components/ui/nav-link";
import { SubmitButton } from "@/components/ui/submit-button";
import { prisma } from "@/lib/db";
import { isDatabaseConfigured } from "@/lib/safe-db";

export default async function AdminCategoriasPage() {
  if (!isDatabaseConfigured()) {
    return <p className="text-zinc-400">Banco não configurado.</p>;
  }

  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Categorias</h1>

      <form action={createCategory} className="mb-10 grid max-w-2xl gap-3 rounded-xl border border-zinc-800 bg-zinc-900 p-4 sm:grid-cols-2">
        <input name="name" placeholder="Nome" required className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm" />
        <input name="slug" placeholder="slug (opcional)" className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm" />
        <input name="icon" placeholder="Emoji 🔥" className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm" />
        <input name="sortOrder" type="number" defaultValue={0} className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm" />
        <label className="flex items-center gap-2 text-sm sm:col-span-2">
          <input type="checkbox" name="showInNav" defaultChecked />
          Mostrar na navegação
        </label>
        <SubmitButton
          pendingLabel="Adicionando…"
          className="rounded-lg bg-amber-500 py-2 text-sm font-semibold text-zinc-950 cursor-pointer sm:col-span-2"
        >
          Adicionar categoria
        </SubmitButton>
      </form>

      <table className="w-full text-left text-sm">
        <thead className="text-zinc-400">
          <tr>
            <th className="p-2">Categoria</th>
            <th className="p-2">Slug</th>
            <th className="p-2">Nav</th>
            <th className="p-2" />
          </tr>
        </thead>
        <tbody>
          {categories.map((c) => (
            <tr key={c.id} className="border-t border-zinc-800">
              <td className="p-2">
                {c.icon} {c.name}
              </td>
              <td className="p-2 text-zinc-400">{c.slug}</td>
              <td className="p-2">{c.showInNav ? "Sim" : "Não"}</td>
              <td className="p-2 text-right">
                <NavLink
                  href={`/admin/categorias/${c.id}`}
                  showPendingIndicator
                  className="text-amber-400 no-underline"
                >
                  Editar
                </NavLink>
                <form action={deactivateCategory.bind(null, c.id)} className="ml-2 inline">
                  <SubmitButton
                    pendingLabel="…"
                    className="text-xs text-red-400 cursor-pointer"
                  >
                    Desativar
                  </SubmitButton>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
