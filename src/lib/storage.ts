import {
  BUCKETS,
  createSupabaseAdminClient,
  getPublicStorageUrl,
} from "@/lib/supabase";

export type UploadBucket = keyof typeof BUCKETS;

const ALLOWED_IMAGE_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/svg+xml",
]);

const ALLOWED_VIDEO_TYPES = new Set(["video/mp4", "video/webm"]);

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_VIDEO_BYTES = 50 * 1024 * 1024;

function isAllowedMediaType(type: string): "image" | "video" | null {
  if (ALLOWED_IMAGE_TYPES.has(type)) return "image";
  if (ALLOWED_VIDEO_TYPES.has(type)) return "video";
  return null;
}

export async function uploadMedia(
  bucketKey: UploadBucket,
  file: File,
  folder: string,
): Promise<{ publicUrl: string; storagePath: string; mediaType: "IMAGE" | "VIDEO" } | { error: string }> {
  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    return { error: "Supabase não configurado (URL e SERVICE_ROLE_KEY)" };
  }

  const kind = isAllowedMediaType(file.type);
  if (!kind) {
    return {
      error: "Tipo não permitido. Imagens: PNG, JPG, WebP, SVG. Vídeos: MP4, WebM.",
    };
  }

  const maxBytes = kind === "image" ? MAX_IMAGE_BYTES : MAX_VIDEO_BYTES;
  if (file.size > maxBytes) {
    return {
      error: kind === "image"
        ? "Imagem muito grande (máx. 5MB)"
        : "Vídeo muito grande (máx. 50MB)",
    };
  }

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "png";
  const safeFolder = folder.replace(/[^a-z0-9-]/gi, "");
  const path = `${safeFolder}/${Date.now()}.${ext}`;
  const bucket = BUCKETS[bucketKey];

  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await supabase.storage.from(bucket).upload(path, buffer, {
    contentType: file.type,
    upsert: true,
  });

  if (error) {
    return { error: error.message };
  }

  const publicUrl = getPublicStorageUrl(bucket, path);
  if (!publicUrl) {
    return { error: "Não foi possível gerar URL pública" };
  }

  return {
    publicUrl,
    storagePath: path,
    mediaType: kind === "image" ? "IMAGE" : "VIDEO",
  };
}

/** @deprecated Use uploadMedia */
export async function uploadImage(
  bucketKey: UploadBucket,
  file: File,
  folder: string,
): Promise<{ publicUrl: string; storagePath: string } | { error: string }> {
  const result = await uploadMedia(bucketKey, file, folder);
  if ("error" in result) return result;
  if (result.mediaType !== "IMAGE") {
    return { error: "Tipo de arquivo não permitido. Use PNG, JPG, WebP ou SVG." };
  }
  return { publicUrl: result.publicUrl, storagePath: result.storagePath };
}
