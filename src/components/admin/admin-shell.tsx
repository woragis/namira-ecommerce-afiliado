"use client";

import { usePathname } from "next/navigation";
import { logoutAdmin } from "@/actions/admin/auth";
import { NavLink } from "@/components/ui/nav-link";
import { SubmitButton } from "@/components/ui/submit-button";

const baseLinks = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/lojas", label: "Lojas" },
  { href: "/admin/produtos", label: "Produtos" },
  { href: "/admin/categorias", label: "Categorias" },
  { href: "/admin/badges", label: "Badges" },
  { href: "/admin/colecoes", label: "Coleções" },
  { href: "/admin/paginas", label: "Páginas" },
  { href: "/admin/configuracoes", label: "Configurações" },
];

const metricsLink = { href: "/admin/metricas", label: "Métricas" };

type Props = {
  children: React.ReactNode;
  metricsEnabled?: boolean;
};

function isNavActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminShell({ children, metricsEnabled = false }: Props) {
  const pathname = usePathname();
  const links = metricsEnabled ? [...baseLinks, metricsLink] : baseLinks;

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-zinc-950 text-zinc-100">
      <aside className="flex w-56 shrink-0 flex-col border-r border-zinc-800 p-4">
        <NavLink
          href="/"
          showPendingIndicator
          className="mb-6 inline-flex items-center gap-1 text-sm font-semibold text-amber-400 no-underline"
        >
          Ver loja pública ↗
        </NavLink>
        <p className="mb-4 text-xs tracking-wider text-zinc-500 uppercase">
          Admin
        </p>
        <nav className="flex flex-1 flex-col gap-1">
          {links.map((l) => {
            const active = isNavActive(pathname, l.href);
            return (
              <NavLink
                key={l.href}
                href={l.href}
                showPendingIndicator
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm no-underline ${
                  active
                    ? "bg-zinc-800 text-white"
                    : "text-zinc-300 hover:bg-zinc-800 hover:text-white"
                }`}
              >
                {l.label}
              </NavLink>
            );
          })}
        </nav>
        <form action={logoutAdmin} className="mt-4">
          <SubmitButton
            pendingLabel="Saindo…"
            className="w-full rounded-lg border border-zinc-700 px-3 py-2 text-xs text-zinc-400 cursor-pointer hover:text-white hover:bg-zinc-900"
          >
            Sair
          </SubmitButton>
        </form>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
