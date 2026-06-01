import Link from "next/link";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/lojas", label: "Lojas" },
  { href: "/admin/produtos", label: "Produtos" },
  { href: "/admin/configuracoes", label: "Configurações" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-zinc-950 text-zinc-100">
      <aside className="w-56 shrink-0 border-r border-zinc-800 p-4">
        <Link href="/" className="mb-6 block text-sm font-semibold text-amber-400 no-underline">
          ← NaMira Achados
        </Link>
        <p className="mb-4 text-xs tracking-wider text-zinc-500 uppercase">Admin</p>
        <nav className="flex flex-col gap-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-lg px-3 py-2 text-sm text-zinc-300 no-underline hover:bg-zinc-800 hover:text-white"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
