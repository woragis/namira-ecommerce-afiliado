"use client";

import { useState } from "react";
import { deleteProduct } from "@/actions/admin/products";
import { SubmitButton } from "@/components/ui/submit-button";

type Props = {
  productId: string;
  productTitle: string;
};

export function DeleteProductButton({ productId, productTitle }: Props) {
  const [open, setOpen] = useState(false);
  const deleteAction = deleteProduct.bind(null, productId);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-lg border border-red-900/50 px-4 py-2 text-sm text-red-400 cursor-pointer hover:bg-red-950/50"
      >
        Excluir produto
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-title"
        >
          <form
            action={deleteAction}
            className="w-full max-w-md rounded-2xl border border-zinc-700 bg-zinc-900 p-6 shadow-xl"
          >
            <h2 id="delete-title" className="mb-2 text-lg font-bold text-white">
              Excluir produto?
            </h2>
            <p className="mb-6 text-sm text-zinc-400">
              <strong className="text-zinc-200">{productTitle}</strong> será removido
              permanentemente, incluindo cliques e vínculos com coleções. Esta ação não
              pode ser desfeita.
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg border border-zinc-600 px-4 py-2 text-sm text-zinc-300 cursor-pointer hover:bg-zinc-800"
              >
                Cancelar
              </button>
              <SubmitButton
                pendingLabel="Excluindo…"
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white cursor-pointer hover:bg-red-500"
              >
                Sim, excluir
              </SubmitButton>
            </div>
          </form>
        </div>
      ) : null}
    </>
  );
}
