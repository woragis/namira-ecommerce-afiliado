import { unstable_cache } from "next/cache";

export const CATALOG_CACHE_TAG = "catalog";

/** Cache entre requests em produção. Em testes (sem NEXT_RUNTIME) passa direto. */
export function cacheCatalog<Fn extends (...args: never[]) => Promise<unknown>>(
  fn: Fn,
  keyParts: string[],
  revalidate = 60,
): Fn {
  if (!process.env.NEXT_RUNTIME) return fn;
  return unstable_cache(fn as never, keyParts, {
    revalidate,
    tags: [CATALOG_CACHE_TAG],
  }) as unknown as Fn;
}
