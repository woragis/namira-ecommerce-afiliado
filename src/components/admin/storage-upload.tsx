"use client";

import { useState } from "react";

type Props = {
  bucket: "storeLogos" | "productImages";
  folder: string;
  label?: string;
  onUploaded: (url: string, storagePath: string) => void;
};

export function StorageUpload({
  bucket,
  folder,
  label = "Enviar imagem",
  onUploaded,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    const fd = new FormData();
    fd.append("file", file);
    fd.append("bucket", bucket);
    fd.append("folder", folder);

    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Falha no upload");
        return;
      }
      setPreview(data.publicUrl);
      onUploaded(data.publicUrl, data.storagePath);
    } catch {
      setError("Erro de rede ao enviar arquivo");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-lg border border-dashed border-zinc-600 p-4">
      <label className="block cursor-pointer text-sm text-amber-400">
        {loading ? "Enviando…" : label}
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp,image/svg+xml"
          className="hidden"
          onChange={handleChange}
          disabled={loading}
        />
      </label>
      {error ? <p className="mt-2 text-xs text-red-400">{error}</p> : null}
      {preview ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={preview} alt="Preview" className="mt-3 h-16 w-16 rounded-lg object-contain" />
      ) : null}
    </div>
  );
}
