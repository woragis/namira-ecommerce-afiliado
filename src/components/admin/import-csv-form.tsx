"use client";

import { useState } from "react";
import {
  importProductsFromCsv,
  type ImportResult,
} from "@/actions/admin/import-products";

export function ImportCsvForm() {
  const [result, setResult] = useState<ImportResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    const form = e.currentTarget;
    const fileInput = form.elements.namedItem("file") as HTMLInputElement;
    const file = fileInput.files?.[0];

    if (!file) {
      setResult({
        created: 0,
        updated: 0,
        skipped: 0,
        errors: ["Selecione um arquivo CSV."],
      });
      setLoading(false);
      return;
    }

    const csv = await file.text();
    const fd = new FormData(form);
    fd.set("csv", csv);

    try {
      const res = await importProductsFromCsv(fd);
      setResult(res);
    } catch (err) {
      setResult({
        created: 0,
        updated: 0,
        skipped: 0,
        errors: [err instanceof Error ? err.message : "Falha na importação"],
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-900 p-6">
        <label className="block text-sm">
          <span className="mb-2 block text-zinc-400">Arquivo CSV</span>
          <input
            type="file"
            name="file"
            accept=".csv,text/csv"
            required
            className="w-full text-sm text-zinc-300 file:mr-4 file:rounded-lg file:border-0 file:bg-amber-500 file:px-4 file:py-2 file:text-zinc-950"
          />
        </label>
        <label className="flex items-center gap-2 text-sm text-zinc-300">
          <input type="checkbox" name="updateExisting" />
          Atualizar produtos com o mesmo slug
        </label>
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-amber-500 px-4 py-2 font-semibold text-zinc-950 disabled:opacity-50"
        >
          {loading ? "Importando…" : "Importar produtos"}
        </button>
      </form>

      {result ? (
        <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900 p-4 text-sm">
          <p className="mb-2 text-green-400">
            Criados: {result.created} · Atualizados: {result.updated} · Ignorados:{" "}
            {result.skipped}
          </p>
          {result.errors.length > 0 ? (
            <ul className="max-h-48 list-inside list-disc overflow-y-auto text-red-400">
              {result.errors.slice(0, 20).map((err, i) => (
                <li key={i}>{err}</li>
              ))}
              {result.errors.length > 20 ? (
                <li>… e mais {result.errors.length - 20} avisos</li>
              ) : null}
            </ul>
          ) : null}
        </div>
      ) : null}

      <div className="mt-8 rounded-xl border border-zinc-800 p-4 text-xs text-zinc-400">
        <p className="mb-2 font-semibold text-zinc-300">Colunas esperadas (primeira linha = cabeçalho):</p>
        <code className="block whitespace-pre-wrap text-amber-400/90">
          title,affiliate_url,store_slug,price_current,price_original,image_url,categories,badges,published,is_featured
        </code>
        <p className="mt-3">
          <strong>store_slug:</strong> shopee, mercado-livre, amazon ·{" "}
          <strong>categories/badges:</strong> slugs separados por | ·{" "}
          <strong>published:</strong> true/false
        </p>
        <p className="mt-3 flex flex-wrap gap-4">
          <a
            href="/templates/produtos-exemplo.csv"
            download
            className="text-amber-400 no-underline hover:underline"
          >
            Template vazio →
          </a>
          <a
            href="/api/admin/export/products"
            className="text-amber-400 no-underline hover:underline"
          >
            Exportar catálogo atual →
          </a>
        </p>
      </div>
    </div>
  );
}
