import type { MediaType, ProductMedia } from "@prisma/client";

export type MediaDraft = {
  type: MediaType;
  url: string;
  storagePath?: string;
};

export type MediaPayload = {
  images: MediaDraft[];
  video: MediaDraft | null;
};

const mediaDraftSchema = {
  parse(raw: unknown): MediaDraft | null {
    if (!raw || typeof raw !== "object") return null;
    const item = raw as Record<string, unknown>;
    const type = item.type === "VIDEO" ? "VIDEO" : item.type === "IMAGE" ? "IMAGE" : null;
    const url = typeof item.url === "string" ? item.url.trim() : "";
    if (!type || !url) return null;
    const storagePath =
      typeof item.storagePath === "string" && item.storagePath.trim()
        ? item.storagePath.trim()
        : undefined;
    return { type, url, storagePath };
  },
};

export function parseMediaPayload(raw: string | null | undefined): MediaPayload {
  if (!raw?.trim()) return { images: [], video: null };
  try {
    const data = JSON.parse(raw) as {
      images?: unknown[];
      video?: unknown;
    };
    const images = (data.images ?? [])
      .map((item) => mediaDraftSchema.parse(item))
      .filter((item): item is MediaDraft => item !== null && item.type === "IMAGE");
    const video = mediaDraftSchema.parse(data.video);
    return {
      images,
      video: video?.type === "VIDEO" ? video : null,
    };
  } catch {
    return { images: [], video: null };
  }
}

export function mediaToDrafts(media: ProductMedia[]): MediaPayload {
  const images = media
    .filter((m) => m.type === "IMAGE")
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((m) => ({
      type: "IMAGE" as const,
      url: m.url,
      storagePath: m.storagePath ?? undefined,
    }));
  const videoItem = media.find((m) => m.type === "VIDEO");
  const video = videoItem
    ? {
        type: "VIDEO" as const,
        url: videoItem.url,
        storagePath: videoItem.storagePath ?? undefined,
      }
    : null;
  return { images, video };
}

export function legacyMediaPayload(
  imageUrl?: string | null,
  imageStoragePath?: string | null,
): MediaPayload {
  if (!imageUrl?.trim()) return { images: [], video: null };
  return {
    images: [
      {
        type: "IMAGE",
        url: imageUrl.trim(),
        storagePath: imageStoragePath?.trim() || undefined,
      },
    ],
    video: null,
  };
}

export function primaryImageFromPayload(payload: MediaPayload) {
  const first = payload.images[0];
  if (!first) return { imageUrl: null, imageStoragePath: null };
  return {
    imageUrl: first.url,
    imageStoragePath: first.storagePath ?? null,
  };
}

export function payloadToCreateRows(payload: MediaPayload) {
  const rows: Array<{
    type: MediaType;
    url: string;
    storagePath: string | null;
    sortOrder: number;
  }> = [];

  payload.images.forEach((image, index) => {
    rows.push({
      type: "IMAGE",
      url: image.url,
      storagePath: image.storagePath ?? null,
      sortOrder: index,
    });
  });

  if (payload.video) {
    rows.push({
      type: "VIDEO",
      url: payload.video.url,
      storagePath: payload.video.storagePath ?? null,
      sortOrder: payload.images.length,
    });
  }

  return rows;
}
