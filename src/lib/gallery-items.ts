export type GalleryItem =
  | { type: "IMAGE"; url: string; alt: string }
  | { type: "VIDEO"; url: string };

function isValidMediaUrl(url: string | null | undefined): url is string {
  if (!url?.trim()) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export function buildGalleryItems(
  media: Array<{ type: "IMAGE" | "VIDEO"; url: string }>,
  fallbackImageUrl: string | null | undefined,
  alt: string,
): GalleryItem[] {
  const fromMedia: GalleryItem[] = [];
  for (const item of media) {
    if (!isValidMediaUrl(item.url)) continue;
    if (item.type === "VIDEO") {
      fromMedia.push({ type: "VIDEO", url: item.url });
    } else {
      fromMedia.push({ type: "IMAGE", url: item.url, alt });
    }
  }

  if (fromMedia.length) return fromMedia;

  if (isValidMediaUrl(fallbackImageUrl)) {
    return [{ type: "IMAGE", url: fallbackImageUrl, alt }];
  }

  return [];
}
