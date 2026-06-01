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

  return {
    storeSlug: get("loja"),
    categorySlug: get("categoria"),
    badgeSlug: get("badge"),
    search: get("q"),
    sort: validSort.includes(sort as (typeof validSort)[number])
      ? (sort as CatalogFilters["sort"])
      : "recentes",
    page: parseInt(get("page") ?? "1", 10) || 1,
    limit: 24,
  };
}
