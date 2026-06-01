import Link from "next/link";
import { prisma } from "@/lib/db";
import { isDatabaseConfigured } from "@/lib/safe-db";

const PUBLIC_PATHS: Record<string, string> = {
  sobre: "/sobre",
  "como-funciona": "/como-funciona",
  contato: "/contato",
};

export default async function AdminPaginasPage() {
  if (!isDatabaseConfigured()) {
    return <p className="text-zinc-400">Banco não configurado.</p>;
  }

  const pages = await prisma.page.findMany({ orderBy: { slug: "asc" } });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Páginas estáticas</h1>
      <ul className="space-y-3">
        {pages.map((p) => (
          <li
            key={p.id}
            className="flex items-center justify-between rounded-lg border border-zinc-800 px-4 py-3"
          >
            <div>
              <div className="font-medium">{p.title}</div>
              <div className="text-xs text-zinc-500">
                {PUBLIC_PATHS[p.slug] ?? `/${p.slug}`} ·{" "}
                {p.isPublished ? "publicada" : "rascunho"}
              </div>
            </div>
            <Link href={`/admin/paginas/${p.slug}`} className="text-amber-400 no-underline text-sm">
              Editar
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
