"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAdmin } from "@/actions/admin/auth";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/lojas", label: "Lojas" },
  { href: "/admin/produtos", label: "Produtos" },
  { href: "/admin/categorias", label: "Categorias" },
  { href: "/admin/colecoes", label: "Coleções" },
  { href: "/admin/paginas", label: "Páginas" },
  { href: "/admin/configuracoes", label: "Configurações" },
  { href: "/admin/cliques", label: "Cliques" },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-zinc-950 text-zinc-100">
      <aside className="flex w-56 shrink-0 flex-col border-r border-zinc-800 p-4">
        <Link
          href="/"
          className="mb-6 block text-sm font-semibold text-amber-400 no-underline"
        >
          ← NaMira Achados
        </Link>
        <p className="mb-4 text-xs tracking-wider text-zinc-500 uppercase">
          Admin
        </p>
        <nav className="flex flex-1 flex-col gap-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`rounded-lg px-3 py-2 text-sm no-underline ${
                pathname === l.href
                  ? "bg-zinc-800 text-white"
                  : "text-zinc-300 hover:bg-zinc-800 hover:text-white"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <form action={logoutAdmin} className="mt-4">
          <button
            type="submit"
            className="w-full rounded-lg border border-zinc-700 px-3 py-2 text-xs text-zinc-400 cursor-pointer hover:text-white"
          >
            Sair
          </button>
        </form>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
