import {
  BUCKETS,
  createSupabaseAdminClient,
  getPublicStorageUrl,
} from "@/lib/supabase";

export type UploadBucket = keyof typeof BUCKETS;

const ALLOWED_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/svg+xml",
]);

export async function uploadImage(
  bucketKey: UploadBucket,
  file: File,
  folder: string,
): Promise<{ publicUrl: string; storagePath: string } | { error: string }> {
  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    return { error: "Supabase não configurado (URL e SERVICE_ROLE_KEY)" };
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    return { error: "Tipo de arquivo não permitido. Use PNG, JPG, WebP ou SVG." };
  }

  if (file.size > 5 * 1024 * 1024) {
    return { error: "Arquivo muito grande (máx. 5MB)" };
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

  return { publicUrl, storagePath: path };
}
