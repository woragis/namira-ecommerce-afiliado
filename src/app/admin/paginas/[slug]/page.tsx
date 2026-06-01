import { notFound } from "next/navigation";
import { updatePage } from "@/actions/admin/pages";
import { prisma } from "@/lib/db";

type Props = { params: Promise<{ slug: string }> };

export default async function EditarPaginaPage({ params }: Props) {
  const { slug } = await params;
  const page = await prisma.page.findUnique({ where: { slug } });
  if (!page) notFound();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Editar: {page.title}</h1>
      <form action={updatePage.bind(null, slug)} className="max-w-2xl space-y-4">
        <label className="block text-sm">
          <span className="mb-1 block text-zinc-400">Título</span>
          <input name="title" defaultValue={page.title} required className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2" />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-zinc-400">Conteúdo</span>
          <textarea
            name="body"
            rows={12}
            defaultValue={page.body}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2"
          />
        </label>
        <label className="flex gap-2 text-sm">
          <input type="checkbox" name="isPublished" defaultChecked={page.isPublished} />
          Publicada
        </label>
        <button type="submit" className="rounded-lg bg-amber-500 px-4 py-2 font-semibold text-zinc-950">
          Salvar página
        </button>
      </form>
    </div>
  );
}
