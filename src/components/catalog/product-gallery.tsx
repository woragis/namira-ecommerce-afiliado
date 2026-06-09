"use client";

import Image from "next/image";
import { useState } from "react";

type GalleryItem =
  | { type: "IMAGE"; url: string; alt: string }
  | { type: "VIDEO"; url: string };

type Props = {
  items: GalleryItem[];
  fallbackAlt?: string;
};

export function ProductGallery({ items, fallbackAlt }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!items.length) {
    return (
      <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-2xl bg-[var(--roxo-claro)]">
        <span className="text-8xl">📦</span>
      </div>
    );
  }

  const active = items[activeIndex] ?? items[0];

  return (
    <div className="space-y-3">
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-[var(--roxo-claro)]">
        {active.type === "VIDEO" ? (
          <video
            key={active.url}
            src={active.url}
            controls
            playsInline
            className="h-full w-full bg-black object-contain"
          />
        ) : (
          <Image
            key={active.url}
            src={active.url}
            alt={active.alt}
            fill
            className="object-cover"
            priority={activeIndex === 0}
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        )}
      </div>

      {items.length > 1 ? (
        <div className="flex flex-wrap gap-2">
          {items.map((item, index) => {
            const isActive = index === activeIndex;
            return (
              <button
                key={`${item.type}-${item.url}`}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={`relative h-16 w-16 overflow-hidden rounded-lg border-2 transition ${
                  isActive
                    ? "border-[var(--roxo-escuro)]"
                    : "border-transparent opacity-70 hover:opacity-100"
                }`}
                aria-label={
                  item.type === "VIDEO"
                    ? `Ver vídeo ${index + 1}`
                    : `Ver imagem ${index + 1}`
                }
              >
                {item.type === "VIDEO" ? (
                  <span className="flex h-full w-full items-center justify-center bg-zinc-900 text-lg text-white">
                    ▶
                  </span>
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.url}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                )}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

export function buildGalleryItems(
  media: Array<{ type: "IMAGE" | "VIDEO"; url: string }>,
  fallbackImageUrl: string | null | undefined,
  alt: string,
): GalleryItem[] {
  if (media.length) {
    return media.map((item) =>
      item.type === "VIDEO"
        ? { type: "VIDEO" as const, url: item.url }
        : { type: "IMAGE" as const, url: item.url, alt },
    );
  }

  if (fallbackImageUrl) {
    return [{ type: "IMAGE", url: fallbackImageUrl, alt }];
  }

  return [];
}
