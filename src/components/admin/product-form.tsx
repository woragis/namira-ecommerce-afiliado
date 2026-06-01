import { createProduct } from "@/actions/admin/products";
import type { Store } from "@prisma/client";

export function ProductForm({ stores }: { stores: Store[] }) {
  return (
    <form action={createProduct} className="max-w-lg space-y-4">
      <label className="block text-sm">
        <span className="mb-1 block text-zinc-400">Título</span>
        <input name="title" required className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-white" />
      </label>
      <label className="block text-sm">
        <span className="mb-1 block text-zinc-400">Loja</span>
        <select name="storeId" required className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-white">
          {stores.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-sm">
        <span className="mb-1 block text-zinc-400">Link de afiliado</span>
        <input name="affiliateUrl" type="url" required className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-white" />
      </label>
      <label className="block text-sm">
        <span className="mb-1 block text-zinc-400">Preço atual (R$)</span>
        <input name="priceCurrent" type="number" step="0.01" required className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-white" />
      </label>
      <label className="block text-sm">
        <span className="mb-1 block text-zinc-400">Preço original (opcional)</span>
        <input name="priceOriginal" type="number" step="0.01" className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-white" />
      </label>
      <label className="block text-sm">
        <span className="mb-1 block text-zinc-400">URL da imagem (Supabase)</span>
        <input name="imageUrl" type="url" className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-white" />
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="isPublished" />
        Publicar agora
      </label>
      <button type="submit" className="rounded-lg bg-amber-500 px-4 py-2 font-semibold text-zinc-950">
        Criar produto
      </button>
    </form>
  );
}
