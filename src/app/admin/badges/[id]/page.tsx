import { notFound } from "next/navigation";
import { BadgeStyle } from "@prisma/client";
import { updateBadge } from "@/actions/admin/badges";
import { SubmitButton } from "@/components/ui/submit-button";
import { prisma } from "@/lib/db";

const STYLE_LABELS: Record<BadgeStyle, string> = {
  VIRAL: "Viral (dourado)",
  OFF: "Oferta (roxo)",
  NOVO: "Novo (escuro)",
};

type Props = { params: Promise<{ id: string }> };

export default async function EditarBadgePage({ params }: Props) {
  const { id } = await params;
  const badge = await prisma.badge.findUnique({ where: { id } });
  if (!badge) notFound();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Editar badge</h1>
      <form action={updateBadge.bind(null, id)} className="max-w-md space-y-3">
        <input
          name="label"
          defaultValue={badge.label}
          required
          className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2"
        />
        <input
          name="slug"
          defaultValue={badge.slug}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2"
        />
        <select
          name="style"
          defaultValue={badge.style}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2"
        >
          {Object.entries(STYLE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <SubmitButton
          pendingLabel="Salvando…"
          className="rounded-lg bg-amber-500 px-4 py-2 font-semibold text-zinc-950 cursor-pointer"
        >
          Salvar
        </SubmitButton>
      </form>
    </div>
  );
}
