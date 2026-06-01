import { notFound } from "next/navigation";
import {
  addProductToCollection,
  moveCollectionProduct,
  removeProductFromCollection,
  updateCollection,
} from "@/actions/admin/collections";
import { prisma } from "@/lib/db";
import { CollectionType } from "@prisma/client";

type Props = { params: Promise<{ id: string }> };

export default async function AdminColecaoDetailPage({ params }: Props) {
  const { id } = await params;

  const collection = await prisma.collection.findUnique({
    where: { id },
    include: {
      products: {
        orderBy: { sortOrder: "asc" },
        include: { product: { include: { store: true } } },
      },
    },
  });

  if (!collection) notFound();

  const available = await prisma.product.findMany({
    where: {
      isPublished: true,
      id: { notIn: collection.products.map((p) => p.productId) },
    },
    take: 50,
    orderBy: { title: "asc" },
  });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">{collection.name}</h1>

      <form action={updateCollection.bind(null, id)} className="mb-10 max-w-xl space-y-3 rounded-xl border border-zinc-800 p-4">
        <input name="name" defaultValue={collection.name} required className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm" />
        <input name="slug" defaultValue={collection.slug} className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm" />
        <textarea name="description" defaultValue={collection.description ?? ""} rows={2} className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm" />
        <select name="type" defaultValue={collection.type} className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm">
          <option value={CollectionType.SECTION}>Seção</option>
          <option value={CollectionType.BANNER}>Banner</option>
        </select>
        <label className="flex gap-2 text-sm">
          <input type="checkbox" name="showOnHome" defaultChecked={collection.showOnHome} />
          Home
        </label>
        <input name="homeSortOrder" type="number" defaultValue={collection.homeSortOrder} className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm" />
        <input name="maxProducts" type="number" defaultValue={collection.maxProducts ?? 12} className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm" />
        <label className="flex gap-2 text-sm">
          <input type="checkbox" name="isActive" defaultChecked={collection.isActive} />
          Ativa
        </label>
        <button type="submit" className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-zinc-950">
          Salvar coleção
        </button>
      </form>

      <h2 className="mb-3 font-semibold">Produtos na coleção</h2>
      <ul className="mb-8 space-y-2">
        {collection.products.map((cp, i) => (
          <li
            key={cp.productId}
            className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-zinc-800 px-3 py-2 text-sm"
          >
            <span className="min-w-0 flex-1">
              {i + 1}. {cp.product.title}{" "}
              <span style={{ color: cp.product.store.colorPrimary }}>
                ({cp.product.store.name})
              </span>
            </span>
            <div className="flex shrink-0 items-center gap-1">
              <form action={moveCollectionProduct.bind(null, id, cp.productId, "up")}>
                <button
                  type="submit"
                  disabled={i === 0}
                  className="rounded border border-zinc-700 px-2 py-0.5 text-xs cursor-pointer disabled:opacity-30"
                  title="Subir"
                >
                  ↑
                </button>
              </form>
              <form action={moveCollectionProduct.bind(null, id, cp.productId, "down")}>
                <button
                  type="submit"
                  disabled={i === collection.products.length - 1}
                  className="rounded border border-zinc-700 px-2 py-0.5 text-xs cursor-pointer disabled:opacity-30"
                  title="Descer"
                >
                  ↓
                </button>
              </form>
              <form action={removeProductFromCollection.bind(null, id, cp.productId)}>
                <button type="submit" className="ml-1 text-xs text-red-400 cursor-pointer">
                  Remover
                </button>
              </form>
            </div>
          </li>
        ))}
      </ul>

      <h2 className="mb-3 font-semibold">Adicionar produto</h2>
      <ul className="space-y-2">
        {available.map((p) => (
          <li key={p.id} className="flex items-center justify-between rounded-lg border border-zinc-800 px-3 py-2 text-sm">
            <span className="truncate">{p.title}</span>
            <form action={addProductToCollection.bind(null, id, p.id)}>
              <button type="submit" className="text-xs text-amber-400 cursor-pointer">
                Adicionar
              </button>
            </form>
          </li>
        ))}
      </ul>
    </div>
  );
}
