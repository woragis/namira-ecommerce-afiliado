import { revalidatePath, revalidateTag } from "next/cache";
import { CATALOG_CACHE_TAG } from "@/lib/catalog-cache";

export function revalidateCatalog(extraPaths: string[] = []) {
  revalidateTag(CATALOG_CACHE_TAG, "max");
  const paths = new Set(["/", "/produtos", "/lojas", ...extraPaths]);
  for (const path of paths) revalidatePath(path);
}
