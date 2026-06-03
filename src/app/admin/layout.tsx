import { AdminShell } from "@/components/admin/admin-shell";

/** Admin depende do banco em runtime — não pré-renderizar no build. */
export const dynamic = "force-dynamic";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminShell>{children}</AdminShell>;
}
