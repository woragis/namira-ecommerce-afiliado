import { unstable_cache } from "next/cache";
import { syncMetricsRollup } from "@/lib/analytics-rollup";
import {
  getMetricsComparison,
  getDailyMetricsSeries,
  getProductsMetricsTable,
  getProductsWithoutClicks,
  getTopListPaths,
  getTopStoresByClicks,
  getRecentActivityEvents,
  parsePeriodDays,
  parseProductSort,
  parseStoreId,
  parseTablePage,
  parseShowImpressions,
  type PeriodDays,
  type ProductSort,
} from "@/lib/analytics-stats";
import { daysAgo } from "@/lib/dates";
import { prisma } from "@/lib/db";

export type MetricsPageSearch = {
  days?: string;
  sort?: string;
  loja?: string;
  page?: string;
  product?: string;
  impressoes?: string;
};

async function fetchMetricsPageData(
  days: PeriodDays,
  sort: ProductSort,
  storeId: string | undefined,
  page: number,
  showImpressions: boolean,
) {
  const since = daysAgo(days);
  const [
    comparison,
    series,
    productsTable,
    staleProducts,
    listPaths,
    topStores,
    recentEvents,
    stores,
  ] = await Promise.all([
    getMetricsComparison(days),
    getDailyMetricsSeries(days),
    getProductsMetricsTable({ since, sort, storeId, page }),
    getProductsWithoutClicks(since, 20, 8),
    getTopListPaths(since, 10),
    getTopStoresByClicks(since, 8),
    getRecentActivityEvents(since, 25, showImpressions),
    prisma.store.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true, slug: true },
    }),
  ]);

  const totals = comparison.current;
  const isEmpty =
    totals.impressions === 0 &&
    totals.views === 0 &&
    totals.clicks === 0;

  return {
    days,
    sort,
    storeId,
    page,
    showImpressions,
    comparison,
    series,
    productsTable,
    staleProducts,
    listPaths,
    topStores,
    recentEvents,
    stores,
    isEmpty,
  };
}

const getCachedMetricsPage = unstable_cache(
  fetchMetricsPageData,
  ["admin-metrics-page"],
  { revalidate: 60, tags: ["admin-metrics"] },
);

export async function loadAdminMetricsPage(search: MetricsPageSearch) {
  const days = parsePeriodDays(search.days);
  const sort = parseProductSort(search.sort);
  const storeId = parseStoreId(search.loja);
  const page = parseTablePage(search.page);
  const showImpressions = parseShowImpressions(search.impressoes);
  const highlightSlug = search.product?.trim() || undefined;

  await syncMetricsRollup(days);

  const data = await getCachedMetricsPage(
    days,
    sort,
    storeId,
    page,
    showImpressions,
  );

  return { ...data, highlightSlug };
}
