"use client";

import { useMemo, useState } from "react";
import type { MediaPayload } from "@/lib/product-media";

type Props = {
  folder: string;
  initial: MediaPayload;
};

const IMAGE_ACCEPT = "image/png,image/jpeg,image/webp,image/svg+xml";
const VIDEO_ACCEPT = "video/mp4,video/webm";
const MAX_IMAGES = 10;

export function ProductMediaManager({ folder, initial }: Props) {
  const [images, setImages] = useState(initial.images);
  const [video, setVideo] = useState(initial.video);
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [videoUrlInput, setVideoUrlInput] = useState(video?.url ?? "");
  const [loadingKey, setLoadingKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const payload = useMemo<MediaPayload>(
    () => ({
      images,
      video: video?.url ? video : null,
    }),
    [images, video],
  );

  async function uploadFile(file: File, key: string) {
    setLoadingKey(key);
    setError(null);

    const fd = new FormData();
    fd.append("file", file);
    fd.append("bucket", "productImages");
    fd.append("folder", folder);

    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Falha no upload");
        return null;
      }
      return data as {
        publicUrl: string;
        storagePath: string;
        mediaType: "IMAGE" | "VIDEO";
      };
    } catch {
      setError("Erro de rede ao enviar arquivo");
      return null;
    } finally {
      setLoadingKey(null);
    }
  }

  async function handleImageFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (!files.length) return;

    const remaining = MAX_IMAGES - images.length;
    if (remaining <= 0) {
      setError(`Máximo de ${MAX_IMAGES} imagens.`);
      return;
    }

    for (const file of files.slice(0, remaining)) {
      const result = await uploadFile(file, `image-${file.name}`);
      if (!result || result.mediaType !== "IMAGE") continue;
      setImages((prev) => [
        ...prev,
        { type: "IMAGE", url: result.publicUrl, storagePath: result.storagePath },
      ]);
    }
  }

  async function handleVideoFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    const result = await uploadFile(file, `video-${file.name}`);
    if (!result || result.mediaType !== "VIDEO") return;
    const next = {
      type: "VIDEO" as const,
      url: result.publicUrl,
      storagePath: result.storagePath,
    };
    setVideo(next);
    setVideoUrlInput(next.url);
  }

  function addImageUrl() {
    const url = imageUrlInput.trim();
    if (!url) return;
    if (images.length >= MAX_IMAGES) {
      setError(`Máximo de ${MAX_IMAGES} imagens.`);
      return;
    }
    setImages((prev) => [...prev, { type: "IMAGE", url }]);
    setImageUrlInput("");
    setError(null);
  }

  function applyVideoUrl() {
    const url = videoUrlInput.trim();
    if (!url) {
      setVideo(null);
      return;
    }
    setVideo({ type: "VIDEO", url });
    setError(null);
  }

  function removeImage(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }

  function moveImage(index: number, direction: -1 | 1) {
    setImages((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  return (
    <div className="space-y-4">
      <input type="hidden" name="mediaPayload" value={JSON.stringify(payload)} />

      <fieldset className="rounded-lg border border-dashed border-zinc-600 p-4">
        <legend className="px-1 text-sm text-zinc-400">
          Galeria de imagens ({images.length}/{MAX_IMAGES})
        </legend>

        {images.length ? (
          <ul className="mb-4 space-y-2">
            {images.map((image, index) => (
              <li
                key={`${image.url}-${index}`}
                className="flex items-center gap-3 rounded-lg border border-zinc-700 bg-zinc-900/50 p-2"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image.url}
                  alt=""
                  className="h-14 w-14 shrink-0 rounded object-cover"
                />
                <span className="min-w-0 flex-1 truncate text-xs text-zinc-400">
                  {image.url}
                </span>
                <div className="flex shrink-0 gap-1">
                  <button
                    type="button"
                    onClick={() => moveImage(index, -1)}
                    disabled={index === 0}
                    className="rounded px-2 py-1 text-xs text-zinc-400 hover:bg-zinc-800 disabled:opacity-30"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => moveImage(index, 1)}
                    disabled={index === images.length - 1}
                    className="rounded px-2 py-1 text-xs text-zinc-400 hover:bg-zinc-800 disabled:opacity-30"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="rounded px-2 py-1 text-xs text-red-400 hover:bg-zinc-800"
                  >
                    Remover
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mb-3 text-xs text-zinc-500">Nenhuma imagem ainda.</p>
        )}

        <label className="mb-3 block cursor-pointer text-sm text-amber-400">
          {loadingKey?.startsWith("image-") ? "Enviando imagem…" : "Upload de imagens"}
          <input
            type="file"
            accept={IMAGE_ACCEPT}
            multiple
            className="hidden"
            onChange={handleImageFiles}
            disabled={Boolean(loadingKey) || images.length >= MAX_IMAGES}
          />
        </label>

        <div className="flex gap-2">
          <input
            type="url"
            value={imageUrlInput}
            onChange={(e) => setImageUrlInput(e.target.value)}
            placeholder="Ou cole URL da imagem"
            className="min-w-0 flex-1 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white"
          />
          <button
            type="button"
            onClick={addImageUrl}
            className="shrink-0 rounded-lg border border-zinc-600 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800"
          >
            Adicionar
          </button>
        </div>
      </fieldset>

      <fieldset className="rounded-lg border border-dashed border-zinc-600 p-4">
        <legend className="px-1 text-sm text-zinc-400">Vídeo (opcional)</legend>

        {video?.url ? (
          <div className="mb-3 rounded-lg border border-zinc-700 bg-zinc-900/50 p-2">
            <video
              src={video.url}
              controls
              className="mb-2 max-h-40 w-full rounded bg-black"
            />
            <button
              type="button"
              onClick={() => {
                setVideo(null);
                setVideoUrlInput("");
              }}
              className="text-xs text-red-400 hover:underline"
            >
              Remover vídeo
            </button>
          </div>
        ) : null}

        <label className="mb-3 block cursor-pointer text-sm text-amber-400">
          {loadingKey?.startsWith("video-") ? "Enviando vídeo…" : "Upload de vídeo (MP4/WebM, máx. 50MB)"}
          <input
            type="file"
            accept={VIDEO_ACCEPT}
            className="hidden"
            onChange={handleVideoFile}
            disabled={Boolean(loadingKey)}
          />
        </label>

        <div className="flex gap-2">
          <input
            type="url"
            value={videoUrlInput}
            onChange={(e) => setVideoUrlInput(e.target.value)}
            onBlur={applyVideoUrl}
            placeholder="Ou cole URL do vídeo"
            className="min-w-0 flex-1 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white"
          />
          <button
            type="button"
            onClick={applyVideoUrl}
            className="shrink-0 rounded-lg border border-zinc-600 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800"
          >
            Aplicar
          </button>
        </div>
      </fieldset>

      {error ? <p className="text-xs text-red-400">{error}</p> : null}
    </div>
  );
}
