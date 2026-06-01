import type { CatalogFilters } from "@/lib/catalog";

export function parseCatalogSearchParams(
  params: Record<string, string | string[] | undefined>,
): CatalogFilters {
  const get = (key: string) => {
    const v = params[key];
    return typeof v === "string" ? v : undefined;
  };

  const sort = get("ordenar");
  const validSort = ["recentes", "preco-asc", "preco-desc", "desconto"] as const;

  const precoMinRaw = get("preco_min");
  const precoMaxRaw = get("preco_max");
  const priceMin = precoMinRaw
    ? parseFloat(precoMinRaw.replace(",", "."))
    : undefined;
  const priceMax = precoMaxRaw
    ? parseFloat(precoMaxRaw.replace(",", "."))
    : undefined;

  return {
    storeSlug: get("loja"),
    categorySlug: get("categoria"),
    badgeSlug: get("badge"),
    search: get("q"),
    priceMin: priceMin != null && !Number.isNaN(priceMin) ? priceMin : undefined,
    priceMax: priceMax != null && !Number.isNaN(priceMax) ? priceMax : undefined,
    sort: validSort.includes(sort as (typeof validSort)[number])
      ? (sort as CatalogFilters["sort"])
      : "recentes",
    page: parseInt(get("page") ?? "1", 10) || 1,
    limit: 24,
  };
}

/** Monta query string preservando filtros ativos (sem page). */
export function catalogQueryString(
  extra: Record<string, string | undefined>,
): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(extra)) {
    if (value) params.set(key, value);
  }
  const q = params.toString();
  return q ? `?${q}` : "";
}
