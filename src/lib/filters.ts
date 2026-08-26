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
    tagSlug: get("tag") || get("categoria") || get("badge"),
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
  extra: Record<string, string | undefined | null>,
): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(extra)) {
    if (value) params.set(key, value);
  }
  const q = params.toString();
  return q ? `?${q}` : "";
}

export function catalogHref(parts: {
  storeSlug?: string | null;
  tagSlug?: string | null;
  search?: string | null;
  sort?: string | null;
  priceMin?: number | null;
  priceMax?: number | null;
}): string {
  return `/produtos${catalogQueryString({
    loja: parts.storeSlug ?? undefined,
    tag: parts.tagSlug ?? undefined,
    q: parts.search ?? undefined,
    ordenar:
      parts.sort && parts.sort !== "recentes" ? parts.sort : undefined,
    preco_min:
      parts.priceMin != null ? String(parts.priceMin) : undefined,
    preco_max:
      parts.priceMax != null ? String(parts.priceMax) : undefined,
  })}`;
}

export function catalogTitle(opts: {
  search?: string;
  storeName?: string;
  tagName?: string;
}): string {
  if (opts.search?.trim()) {
    return `Resultados para “${opts.search.trim()}”`;
  }
  const parts = [opts.storeName, opts.tagName].filter(Boolean);
  if (parts.length) return parts.join(" · ");
  return "Todos os achados";
}

export function priceChipLabel(
  priceMin?: number,
  priceMax?: number,
): string | null {
  if (priceMin != null && priceMax != null) return `R$ ${priceMin}–${priceMax}`;
  if (priceMin != null) return `A partir de R$ ${priceMin}`;
  if (priceMax != null) return `Até R$ ${priceMax}`;
  return null;
}
