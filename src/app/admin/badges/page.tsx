import Link from "next/link";
import { BadgeStyle } from "@prisma/client";
import { createBadge, deleteBadge } from "@/actions/admin/badges";
import { prisma } from "@/lib/db";
import { isDatabaseConfigured } from "@/lib/safe-db";

const STYLE_LABELS: Record<BadgeStyle, string> = {
  VIRAL: "Viral (dourado)",
  OFF: "Oferta (roxo)",
  NOVO: "Novo (escuro)",
};

export default async function AdminBadgesPage() {
  if (!isDatabaseConfigured()) {
    return <p className="text-zinc-400">Banco não configurado.</p>;
  }

  const badges = await prisma.badge.findMany({
    orderBy: { label: "asc" },
    include: { _count: { select: { products: true } } },
  });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Badges / selos</h1>

      <form
        action={createBadge}
        className="mb-10 grid max-w-2xl gap-3 rounded-xl border border-zinc-800 bg-zinc-900 p-4 sm:grid-cols-2"
      >
        <input
          name="label"
          placeholder="🔥 Viral"
          required
          className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm sm:col-span-2"
        />
        <input
          name="slug"
          placeholder="slug (opcional)"
          className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
        />
        <select
          name="style"
          defaultValue={BadgeStyle.VIRAL}
          className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
        >
          {Object.entries(STYLE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-lg bg-amber-500 py-2 text-sm font-semibold text-zinc-950 sm:col-span-2"
        >
          Adicionar badge
        </button>
      </form>

      <table className="w-full text-left text-sm">
        <thead className="text-zinc-400">
          <tr>
            <th className="p-2">Label</th>
            <th className="p-2">Slug</th>
            <th className="p-2">Estilo</th>
            <th className="p-2">Produtos</th>
            <th className="p-2" />
          </tr>
        </thead>
        <tbody>
          {badges.map((b) => (
            <tr key={b.id} className="border-t border-zinc-800">
              <td className="p-2">{b.label}</td>
              <td className="p-2 font-mono text-xs text-zinc-500">{b.slug}</td>
              <td className="p-2">{b.style}</td>
              <td className="p-2">{b._count.products}</td>
              <td className="p-2 text-right">
                <Link href={`/admin/badges/${b.id}`} className="text-amber-400 no-underline">
                  Editar
                </Link>
                {b._count.products === 0 ? (
                  <form action={deleteBadge.bind(null, b.id)} className="ml-2 inline">
                    <button type="submit" className="text-xs text-red-400 cursor-pointer">
                      Excluir
                    </button>
                  </form>
                ) : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
