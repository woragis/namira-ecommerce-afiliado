import type { MetricsPageSearch } from "@/lib/metrics-page-data";
import {
  parsePeriodDays,
  parseProductSort,
  parseShowImpressions,
  parseStoreId,
  parseTablePage,
} from "@/lib/analytics-stats";

/** Monta query string para /admin/metricas preservando filtros. */
export function buildMetricsHref(
  search: MetricsPageSearch,
  overrides: Partial<MetricsPageSearch> = {},
): string {
  const merged = { ...search, ...overrides };
  const days = parsePeriodDays(merged.days);
  const p = new URLSearchParams();
  p.set("days", String(days));
  const sort = parseProductSort(merged.sort);
  if (sort !== "cliques") p.set("sort", sort);
  const store = parseStoreId(merged.loja);
  if (store) p.set("loja", store);
  const page = parseTablePage(merged.page);
  if (page > 1) p.set("page", String(page));
  if (
    merged.impressoes !== "0" &&
    parseShowImpressions(merged.impressoes)
  ) {
    p.set("impressoes", "1");
  }
  if (merged.product?.trim()) p.set("product", merged.product.trim());
  const q = p.toString();
  return `/admin/metricas${q ? `?${q}` : ""}`;
}
