import { notFound } from "next/navigation";
import { BadgeStyle, CategoryKind } from "@prisma/client";
import { updateCategory } from "@/actions/admin/categories";
import { SubmitButton } from "@/components/ui/submit-button";
import { prisma } from "@/lib/db";
import { TAG_KIND_LABELS, TAG_STYLE_LABELS } from "@/lib/tags";

type Props = { params: Promise<{ id: string }> };

export default async function EditarTagPage({ params }: Props) {
  const { id } = await params;
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) notFound();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Editar tag</h1>
      <form action={updateCategory.bind(null, id)} className="max-w-md space-y-3">
        <input
          name="name"
          defaultValue={category.name}
          required
          className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2"
        />
        <input
          name="slug"
          defaultValue={category.slug}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2"
        />
        <input
          name="icon"
          defaultValue={category.icon ?? ""}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2"
        />
        <input
          name="sortOrder"
          type="number"
          defaultValue={category.sortOrder}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2"
        />
        <select
          name="kind"
          defaultValue={category.kind}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2"
        >
          {Object.entries(TAG_KIND_LABELS).map(([value, label]) => (
            <option key={value} value={value as CategoryKind}>
              {label}
            </option>
          ))}
        </select>
        <select
          name="style"
          defaultValue={category.style ?? ""}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2"
        >
          <option value="">Estilo (só promoção)</option>
          {Object.entries(TAG_STYLE_LABELS).map(([value, label]) => (
            <option key={value} value={value as BadgeStyle}>
              {label}
            </option>
          ))}
        </select>
        <label className="flex gap-2 text-sm">
          <input type="checkbox" name="showInNav" defaultChecked={category.showInNav} />
          Nav
        </label>
        <label className="flex gap-2 text-sm">
          <input type="checkbox" name="isActive" defaultChecked={category.isActive} />
          Ativa
        </label>
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
