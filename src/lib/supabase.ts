import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

export const BUCKETS = {
  storeLogos: process.env.NEXT_PUBLIC_BUCKET_STORE_LOGOS ?? "store-logos",
  productImages:
    process.env.NEXT_PUBLIC_BUCKET_PRODUCT_IMAGES ?? "product-images",
} as const;

/** Cliente público (browser / leitura de assets) */
export function createSupabaseBrowserClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }
  return createClient(supabaseUrl, supabaseAnonKey);
}

/** Cliente servidor com service role (upload admin) */
export function createSupabaseAdminClient() {
  const key = supabaseServiceKey || supabaseAnonKey;
  if (!supabaseUrl || !key) {
    return null;
  }
  return createClient(supabaseUrl, key);
}

export function getPublicStorageUrl(
  bucket: string,
  path: string,
): string | null {
  if (!supabaseUrl) return null;
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`;
}
