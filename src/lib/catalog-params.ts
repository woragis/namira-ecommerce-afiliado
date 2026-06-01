import type { CatalogFilters } from "@/lib/catalog";

/** Params de URL para formulários de filtro (sem page). */
export function filtersToSearchParams(
  filters: CatalogFilters,
  omit: ("page" | "priceMin" | "priceMax")[] = ["page", "priceMin", "priceMax"],
): Record<string, string> {
  const params: Record<string, string> = {};
  if (filters.storeSlug) params.loja = filters.storeSlug;
  if (filters.categorySlug) params.categoria = filters.categorySlug;
  if (filters.badgeSlug) params.badge = filters.badgeSlug;
  if (filters.search) params.q = filters.search;
  if (filters.sort && filters.sort !== "recentes") params.ordenar = filters.sort;
  if (!omit.includes("priceMin") && filters.priceMin != null) {
    params.preco_min = String(filters.priceMin);
  }
  if (!omit.includes("priceMax") && filters.priceMax != null) {
    params.preco_max = String(filters.priceMax);
  }
  return params;
}
