"use client";

import { NavLink } from "@/components/ui/nav-link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { SubmitButton } from "@/components/ui/submit-button";
import {
  batchDeleteProducts,
  batchSetFeatured,
  batchSetPublished,
  batchUpdateStore,
  toggleProductFeatured,
  toggleProductPublished,
} from "@/actions/admin/products";

type Store = { id: string; name: string; slug: string; colorPrimary: string };

type ProductRow = {
  id: string;
  title: string;
  slug: string;
  priceCurrent: string | number | { toString(): string };
  isFeatured: boolean;
  isPublished: boolean;
  store: Store;
};

type Props = {
  products: ProductRow[];
  stores: Store[];
  metricsEnabled: boolean;
};

export function ProductsAdminTable({ products, stores, metricsEnabled }: Props) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [batchStoreId, setBatchStoreId] = useState(stores[0]?.id ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const allSelected = products.length > 0 && selected.size === products.length;
  const someSelected = selected.size > 0;

  const selectedIds = useMemo(() => [...selected], [selected]);

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(products.map((p) => p.id)));
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function runBatch(action: (formData: FormData) => Promise<void>, extra?: Record<string, string>) {
    if (!someSelected) {
      setError("Selecione pelo menos um produto.");
      return;
    }
    setError(null);
    const formData = new FormData();
    for (const id of selectedIds) formData.append("productIds", id);
    if (extra) {
      for (const [key, value] of Object.entries(extra)) formData.set(key, value);
    }
    startTransition(async () => {
      try {
        await action(formData);
        setSelected(new Set());
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Erro na operação em lote");
      }
    });
  }

  return (
    <div>
      {someSelected ? (
        <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-amber-900/40 bg-amber-950/20 p-3">
          <span className="text-sm text-amber-200">
            {selected.size} selecionado{selected.size !== 1 ? "s" : ""}
          </span>
          <button
            type="button"
            disabled={pending}
            onClick={() => runBatch(batchSetPublished, { published: "true" })}
            className="rounded-lg border border-zinc-600 px-3 py-1.5 text-xs text-zinc-200 cursor-pointer hover:bg-zinc-800 disabled:opacity-50"
          >
            Publicar
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => runBatch(batchSetPublished, { published: "false" })}
            className="rounded-lg border border-zinc-600 px-3 py-1.5 text-xs text-zinc-200 cursor-pointer hover:bg-zinc-800 disabled:opacity-50"
          >
            Despublicar
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => runBatch(batchSetFeatured, { featured: "true" })}
            className="rounded-lg border border-zinc-600 px-3 py-1.5 text-xs text-zinc-200 cursor-pointer hover:bg-zinc-800 disabled:opacity-50"
          >
            Destacar
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => runBatch(batchSetFeatured, { featured: "false" })}
            className="rounded-lg border border-zinc-600 px-3 py-1.5 text-xs text-zinc-200 cursor-pointer hover:bg-zinc-800 disabled:opacity-50"
          >
            Remover destaque
          </button>
          {stores.length > 0 ? (
            <>
              <select
                value={batchStoreId}
                onChange={(e) => setBatchStoreId(e.target.value)}
                className="rounded-lg border border-zinc-600 bg-zinc-900 px-2 py-1.5 text-xs text-zinc-200"
              >
                {stores.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                disabled={pending || !batchStoreId}
                onClick={() => runBatch(batchUpdateStore, { storeId: batchStoreId })}
                className="rounded-lg border border-zinc-600 px-3 py-1.5 text-xs text-zinc-200 cursor-pointer hover:bg-zinc-800 disabled:opacity-50"
              >
                Mover loja
              </button>
            </>
          ) : null}
          <button
            type="button"
            disabled={pending}
            onClick={() => {
              if (!confirm(`Excluir ${selected.size} produto(s)? Esta ação não pode ser desfeita.`)) {
                return;
              }
              runBatch(batchDeleteProducts);
            }}
            className="rounded-lg border border-red-900/50 px-3 py-1.5 text-xs text-red-400 cursor-pointer hover:bg-red-950/50 disabled:opacity-50"
          >
            Excluir
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => setSelected(new Set())}
            className="ml-auto rounded-lg px-3 py-1.5 text-xs text-zinc-500 cursor-pointer hover:text-zinc-300"
          >
            Limpar seleção
          </button>
        </div>
      ) : null}

      {error ? (
        <p className="mb-4 rounded-lg border border-red-900/50 bg-red-950/30 px-3 py-2 text-sm text-red-300">
          {error}
        </p>
      ) : null}

      <div className="overflow-x-auto rounded-xl border border-zinc-800">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-zinc-900 text-zinc-400">
            <tr>
              <th className="w-10 p-3">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  aria-label="Selecionar todos"
                  className="cursor-pointer"
                />
              </th>
              <th className="p-3">Título</th>
              <th className="p-3">Loja</th>
              <th className="p-3">Preço</th>
              <th className="p-3">Destaque</th>
              <th className="p-3">Publicado</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-t border-zinc-800">
                <td className="p-3">
                  <input
                    type="checkbox"
                    checked={selected.has(p.id)}
                    onChange={() => toggleOne(p.id)}
                    aria-label={`Selecionar ${p.title}`}
                    className="cursor-pointer"
                  />
                </td>
                <td className="max-w-xs truncate p-3">
                  <NavLink
                    href={`/admin/produtos/${p.id}`}
                    showPendingIndicator
                    className="text-white no-underline hover:text-amber-400"
                  >
                    {p.title}
                  </NavLink>
                </td>
                <td className="p-3" style={{ color: p.store.colorPrimary }}>
                  {p.store.name}
                </td>
                <td className="p-3">R$ {Number(p.priceCurrent).toFixed(2)}</td>
                <td className="p-3">
                  <form
                    action={toggleProductFeatured.bind(null, p.id, !p.isFeatured)}
                  >
                    <SubmitButton
                      pendingLabel="…"
                      className={`cursor-pointer text-xs ${p.isFeatured ? "text-amber-400" : "text-zinc-500"}`}
                    >
                      {p.isFeatured ? "⭐ Sim" : "Não"}
                    </SubmitButton>
                  </form>
                </td>
                <td className="p-3">
                  <form
                    action={toggleProductPublished.bind(
                      null,
                      p.id,
                      !p.isPublished,
                    )}
                  >
                    <SubmitButton
                      pendingLabel="…"
                      className={`cursor-pointer text-xs ${p.isPublished ? "text-green-400" : "text-zinc-500"}`}
                    >
                      {p.isPublished ? "Sim" : "Não"}
                    </SubmitButton>
                  </form>
                </td>
                <td className="p-3 text-right whitespace-nowrap">
                  <NavLink
                    href={`/admin/produtos/${p.id}`}
                    showPendingIndicator
                    className="mr-3 text-xs text-zinc-500 no-underline hover:text-amber-400"
                  >
                    Editar
                  </NavLink>
                  {metricsEnabled ? (
                    <NavLink
                      href={`/admin/metricas?days=30&product=${p.slug}`}
                      showPendingIndicator
                      className="mr-3 text-xs text-zinc-500 no-underline hover:text-amber-400"
                    >
                      Métricas
                    </NavLink>
                  ) : null}
                  {p.isPublished ? (
                    <a
                      href={`/produtos/${p.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-zinc-500 no-underline hover:text-amber-400"
                    >
                      Ver na loja
                    </a>
                  ) : (
                    <span
                      className="text-xs text-zinc-600"
                      title="Marque Publicado como Sim para exibir na loja"
                    >
                      Rascunho
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
