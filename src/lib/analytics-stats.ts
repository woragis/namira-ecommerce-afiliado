import { prisma } from "@/lib/db";
import { daysAgo } from "@/lib/dates";
import { formatMetricsDayKey } from "@/lib/analytics-rollup";

export const PERIOD_OPTIONS = [7, 30, 90] as const;
export type PeriodDays = (typeof PERIOD_OPTIONS)[number];

export const PRODUCT_SORT_OPTIONS = [
  "cliques",
  "pdp",
  "impressoes",
  "ctr_pdp",
  "ctr_clique",
] as const;
export type ProductSort = (typeof PRODUCT_SORT_OPTIONS)[number];

export const PRODUCTS_PAGE_SIZE = 15;

export type MetricTotals = {
  impressions: number;
  views: number;
  clicks: number;
};

export type ProductMetricRow = {
  productId: string;
  title: string;
  slug: string;
  storeName: string;
  storeId: string;
  impressions: number;
  views: number;
  clicks: number;
};

export type DailyMetricPoint = {
  date: string;
  impressions: number;
  views: number;
  clicks: number;
};

export type ListPathRow = { path: string; count: number };

export type StoreClickRow = {
  storeId: string;
  storeName: string;
  clicks: number;
};

export type CatalogHealth = {
  publishedWithoutClicks: number;
  draftProducts: number;
  weakFeatured: number;
};

export type ActivityEvent = {
  id: string;
  type: "clique" | "pdp" | "impressao";
  at: Date;
  productTitle: string;
  productSlug: string;
  path: string | null;
};

export type ProductsTableResult = {
  rows: ProductMetricRow[];
  total: number;
  page: number;
  totalPages: number;
  pageSize: number;
};

export function parsePeriodDays(value: string | undefined): PeriodDays {
  const n = Number(value);
  if (n === 30 || n === 90) return n;
  return 7;
}

export function parseProductSort(value: string | undefined): ProductSort {
  if (value && PRODUCT_SORT_OPTIONS.includes(value as ProductSort)) {
    return value as ProductSort;
  }
  return "cliques";
}

export function parseStoreId(value: string | undefined): string | undefined {
  const v = value?.trim();
  return v || undefined;
}

export function parseTablePage(value: string | undefined): number {
  const n = Number(value);
  return Number.isFinite(n) && n >= 1 ? Math.floor(n) : 1;
}

export function parseShowImpressions(value: string | undefined): boolean {
  return value === "1" || value === "true";
}

export function getPeriodBounds(days: PeriodDays, now = Date.now()) {
  const currentStart = daysAgo(days, now);
  const currentEnd = new Date(now);
  const previousStart = daysAgo(days * 2, now);
  const previousEnd = currentStart;
  return { currentStart, currentEnd, previousStart, previousEnd, days };
}

function startOfUtcDay(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

async function sumTotalsFromRollup(
  start: Date,
  end: Date,
): Promise<MetricTotals | null> {
  const hasRows = await prisma.productMetricsDaily.count({
    where: { date: { gte: startOfUtcDay(start), lt: end } },
  });
  if (hasRows === 0) return null;

  const agg = await prisma.productMetricsDaily.aggregate({
    where: { date: { gte: startOfUtcDay(start), lt: end } },
    _sum: { impressions: true, views: true, clicks: true },
  });

  return {
    impressions: agg._sum.impressions ?? 0,
    views: agg._sum.views ?? 0,
    clicks: agg._sum.clicks ?? 0,
  };
}

export async function getMetricTotalsBetween(
  start: Date,
  end: Date,
): Promise<MetricTotals> {
  const fromRollup = await sumTotalsFromRollup(start, end);
  if (fromRollup) return fromRollup;

  const [impressions, views, clicks] = await Promise.all([
    prisma.productImpressionEvent.count({
      where: { impressedAt: { gte: start, lt: end } },
    }),
    prisma.productViewEvent.count({
      where: { viewedAt: { gte: start, lt: end } },
    }),
    prisma.clickEvent.count({
      where: { clickedAt: { gte: start, lt: end } },
    }),
  ]);
  return { impressions, views, clicks };
}

export async function getMetricsComparison(days: PeriodDays) {
  const bounds = getPeriodBounds(days);
  const [current, previous] = await Promise.all([
    getMetricTotalsBetween(bounds.currentStart, bounds.currentEnd),
    getMetricTotalsBetween(bounds.previousStart, bounds.previousEnd),
  ]);
  return { current, previous, days };
}

export function percentChange(current: number, previous: number): number | null {
  if (previous === 0) return current > 0 ? 100 : null;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

export function dailyAverage(total: number, days: number): string {
  if (days <= 0) return "0";
  const avg = total / days;
  return avg >= 10 ? avg.toFixed(0) : avg.toFixed(1);
}

export async function getMetricTotals(since: Date): Promise<MetricTotals> {
  return getMetricTotalsBetween(since, new Date());
}

function buildDayKeys(days: number): string[] {
  const keys: string[] = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    keys.push(formatMetricsDayKey(d));
  }
  return keys;
}

export async function getDailyMetricsSeries(
  days: PeriodDays,
): Promise<DailyMetricPoint[]> {
  const start = daysAgo(days);
  const dayKeys = buildDayKeys(days);
  const map = new Map<string, DailyMetricPoint>();
  for (const key of dayKeys) {
    map.set(key, { date: key, impressions: 0, views: 0, clicks: 0 });
  }

  const rollupRows = await prisma.productMetricsDaily.groupBy({
    by: ["date"],
    where: { date: { gte: startOfUtcDay(start) } },
    _sum: { impressions: true, views: true, clicks: true },
  });

  if (rollupRows.length > 0) {
    for (const row of rollupRows) {
      const key = formatMetricsDayKey(row.date);
      const p = map.get(key);
      if (p) {
        p.impressions = row._sum.impressions ?? 0;
        p.views = row._sum.views ?? 0;
        p.clicks = row._sum.clicks ?? 0;
      }
    }
    return dayKeys.map((key) => map.get(key)!);
  }

  const [impRows, viewRows, clickRows] = await Promise.all([
    prisma.$queryRaw<{ day: Date; count: bigint }[]>`
      SELECT DATE(impressed_at) AS day, COUNT(*)::bigint AS count
      FROM product_impression_events
      WHERE impressed_at >= ${start}
      GROUP BY DATE(impressed_at)
      ORDER BY day
    `,
    prisma.$queryRaw<{ day: Date; count: bigint }[]>`
      SELECT DATE(viewed_at) AS day, COUNT(*)::bigint AS count
      FROM product_view_events
      WHERE viewed_at >= ${start}
      GROUP BY DATE(viewed_at)
      ORDER BY day
    `,
    prisma.$queryRaw<{ day: Date; count: bigint }[]>`
      SELECT DATE(clicked_at) AS day, COUNT(*)::bigint AS count
      FROM click_events
      WHERE clicked_at >= ${start}
      GROUP BY DATE(clicked_at)
      ORDER BY day
    `,
  ]);

  for (const row of impRows) {
    const key = formatMetricsDayKey(row.day);
    const p = map.get(key);
    if (p) p.impressions = Number(row.count);
  }
  for (const row of viewRows) {
    const key = formatMetricsDayKey(row.day);
    const p = map.get(key);
    if (p) p.views = Number(row.count);
  }
  for (const row of clickRows) {
    const key = formatMetricsDayKey(row.day);
    const p = map.get(key);
    if (p) p.clicks = Number(row.count);
  }

  return dayKeys.map((key) => map.get(key)!);
}

async function aggregateProductRowsFromRollup(
  since: Date,
  storeId?: string,
): Promise<Map<string, MetricTotals & { productId: string }>> {
  const scores = new Map<string, MetricTotals & { productId: string }>();
  const groups = await prisma.productMetricsDaily.groupBy({
    by: ["productId"],
    where: {
      date: { gte: startOfUtcDay(since) },
      ...(storeId ? { product: { storeId } } : {}),
    },
    _sum: { impressions: true, views: true, clicks: true },
  });

  for (const g of groups) {
    scores.set(g.productId, {
      productId: g.productId,
      impressions: g._sum.impressions ?? 0,
      views: g._sum.views ?? 0,
      clicks: g._sum.clicks ?? 0,
    });
  }
  return scores;
}

async function aggregateProductRowsFromEvents(
  since: Date,
  storeId?: string,
): Promise<Map<string, MetricTotals & { productId: string }>> {
  const productFilter = storeId
    ? { product: { storeId } }
    : undefined;

  const [impGroups, viewGroups, clickGroups] = await Promise.all([
    prisma.productImpressionEvent.groupBy({
      by: ["productId"],
      where: { impressedAt: { gte: since }, ...productFilter },
      _count: { productId: true },
    }),
    prisma.productViewEvent.groupBy({
      by: ["productId"],
      where: { viewedAt: { gte: since }, ...productFilter },
      _count: { productId: true },
    }),
    prisma.clickEvent.groupBy({
      by: ["productId"],
      where: { clickedAt: { gte: since }, ...productFilter },
      _count: { productId: true },
    }),
  ]);

  const scores = new Map<string, MetricTotals & { productId: string }>();

  for (const g of impGroups) {
    const row = scores.get(g.productId) ?? {
      productId: g.productId,
      impressions: 0,
      views: 0,
      clicks: 0,
    };
    row.impressions = g._count.productId;
    scores.set(g.productId, row);
  }
  for (const g of viewGroups) {
    const row = scores.get(g.productId) ?? {
      productId: g.productId,
      impressions: 0,
      views: 0,
      clicks: 0,
    };
    row.views = g._count.productId;
    scores.set(g.productId, row);
  }
  for (const g of clickGroups) {
    const row = scores.get(g.productId) ?? {
      productId: g.productId,
      impressions: 0,
      views: 0,
      clicks: 0,
    };
    row.clicks = g._count.productId;
    scores.set(g.productId, row);
  }
  return scores;
}

export async function loadProductMetricRows(
  since: Date,
  storeId?: string,
): Promise<ProductMetricRow[]> {
  let scores = await aggregateProductRowsFromRollup(since, storeId);
  if (scores.size === 0) {
    scores = await aggregateProductRowsFromEvents(since, storeId);
  }

  const products = await prisma.product.findMany({
    where: {
      id: { in: [...scores.keys()] },
      ...(storeId ? { storeId } : {}),
    },
    select: {
      id: true,
      title: true,
      slug: true,
      storeId: true,
      store: { select: { name: true } },
    },
  });
  const productMap = Object.fromEntries(products.map((p) => [p.id, p]));

  return [...scores.values()]
    .map((m) => {
      const p = productMap[m.productId];
      if (!p) return null;
      return {
        productId: m.productId,
        title: p.title,
        slug: p.slug,
        storeName: p.store.name,
        storeId: p.storeId,
        impressions: m.impressions,
        views: m.views,
        clicks: m.clicks,
      };
    })
    .filter((r): r is ProductMetricRow => r !== null);
}

function sortProductRows(rows: ProductMetricRow[], sort: ProductSort) {
  const cmp = (a: ProductMetricRow, b: ProductMetricRow) => {
    switch (sort) {
      case "impressoes":
        return b.impressions - a.impressions;
      case "pdp":
        return b.views - a.views;
      case "ctr_pdp": {
        const ar = a.impressions ? a.views / a.impressions : 0;
        const br = b.impressions ? b.views / b.impressions : 0;
        return br - ar;
      }
      case "ctr_clique": {
        const ar = a.views ? a.clicks / a.views : 0;
        const br = b.views ? b.clicks / b.views : 0;
        return br - ar;
      }
      case "cliques":
      default:
        return b.clicks - a.clicks;
    }
  };
  return [...rows].sort(cmp);
}

export function paginateProductMetricRows(
  rows: ProductMetricRow[],
  sort: ProductSort,
  page: number,
  pageSize = PRODUCTS_PAGE_SIZE,
): ProductsTableResult {
  const all = sortProductRows(rows, sort);
  const total = all.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * pageSize;

  return {
    rows: all.slice(start, start + pageSize),
    total,
    page: safePage,
    totalPages,
    pageSize,
  };
}

export function filterProductsWithoutClicks(
  rows: ProductMetricRow[],
  minImpressions: number,
  limit = 10,
): ProductMetricRow[] {
  return rows
    .filter((p) => p.impressions >= minImpressions && p.clicks === 0)
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, limit);
}

export async function getProductsMetricsTable(opts: {
  since: Date;
  sort: ProductSort;
  storeId?: string;
  page: number;
  pageSize?: number;
}): Promise<ProductsTableResult> {
  const rows = await loadProductMetricRows(opts.since, opts.storeId);
  return paginateProductMetricRows(
    rows,
    opts.sort,
    opts.page,
    opts.pageSize,
  );
}

export async function getTopProductsByMetrics(
  since: Date,
  limit = 15,
): Promise<ProductMetricRow[]> {
  const table = await getProductsMetricsTable({
    since,
    sort: "cliques",
    page: 1,
    pageSize: limit,
  });
  return table.rows;
}

export async function getProductsWithoutClicks(
  since: Date,
  minImpressions: number,
  limit = 10,
): Promise<ProductMetricRow[]> {
  const rows = await loadProductMetricRows(since);
  return filterProductsWithoutClicks(rows, minImpressions, limit);
}

export async function getProductMetricsSummary(
  productId: string,
  days: PeriodDays,
): Promise<MetricTotals> {
  const since = daysAgo(days);
  const rollupRows = await prisma.productMetricsDaily.count({
    where: { productId, date: { gte: startOfUtcDay(since) } },
  });

  if (rollupRows > 0) {
    const agg = await prisma.productMetricsDaily.aggregate({
      where: { productId, date: { gte: startOfUtcDay(since) } },
      _sum: { impressions: true, views: true, clicks: true },
    });
    return {
      impressions: agg._sum.impressions ?? 0,
      views: agg._sum.views ?? 0,
      clicks: agg._sum.clicks ?? 0,
    };
  }

  const [impressions, views, clicks] = await Promise.all([
    prisma.productImpressionEvent.count({
      where: { productId, impressedAt: { gte: since } },
    }),
    prisma.productViewEvent.count({
      where: { productId, viewedAt: { gte: since } },
    }),
    prisma.clickEvent.count({
      where: { productId, clickedAt: { gte: since } },
    }),
  ]);
  return { impressions, views, clicks };
}

export async function getRecentActivityEvents(
  since: Date,
  limit: number,
  includeImpressions: boolean,
): Promise<ActivityEvent[]> {
  const [clicks, views, impressions] = await Promise.all([
    prisma.clickEvent.findMany({
      where: { clickedAt: { gte: since } },
      take: 40,
      orderBy: { clickedAt: "desc" },
      include: { product: { select: { title: true, slug: true } } },
    }),
    prisma.productViewEvent.findMany({
      where: { viewedAt: { gte: since } },
      take: 40,
      orderBy: { viewedAt: "desc" },
      include: { product: { select: { title: true, slug: true } } },
    }),
    includeImpressions
      ? prisma.productImpressionEvent.findMany({
          where: { impressedAt: { gte: since } },
          take: 20,
          orderBy: { impressedAt: "desc" },
          include: { product: { select: { title: true, slug: true } } },
        })
      : Promise.resolve([]),
  ]);

  const merged: ActivityEvent[] = [
    ...clicks.map((c) => ({
      id: c.id,
      type: "clique" as const,
      at: c.clickedAt,
      productTitle: c.product.title,
      productSlug: c.product.slug,
      path: c.referrerPath,
    })),
    ...views.map((v) => ({
      id: v.id,
      type: "pdp" as const,
      at: v.viewedAt,
      productTitle: v.product.title,
      productSlug: v.product.slug,
      path: v.sourcePath,
    })),
    ...impressions.map((i) => ({
      id: i.id,
      type: "impressao" as const,
      at: i.impressedAt,
      productTitle: i.product.title,
      productSlug: i.product.slug,
      path: i.listPath,
    })),
  ];

  return merged
    .sort((a, b) => b.at.getTime() - a.at.getTime())
    .slice(0, limit);
}

export async function getTopListPaths(
  since: Date,
  limit = 10,
): Promise<ListPathRow[]> {
  const groups = await prisma.productImpressionEvent.groupBy({
    by: ["listPath"],
    where: { impressedAt: { gte: since }, listPath: { not: null } },
    _count: { listPath: true },
    orderBy: { _count: { listPath: "desc" } },
    take: limit,
  });
  return groups
    .filter((g) => g.listPath)
    .map((g) => ({ path: g.listPath!, count: g._count.listPath }));
}

export async function getTopStoresByClicks(
  since: Date,
  limit = 8,
): Promise<StoreClickRow[]> {
  const clickGroups = await prisma.clickEvent.groupBy({
    by: ["productId"],
    where: { clickedAt: { gte: since } },
    _count: { productId: true },
  });
  if (clickGroups.length === 0) return [];

  const products = await prisma.product.findMany({
    where: { id: { in: clickGroups.map((g) => g.productId) } },
    select: { id: true, storeId: true, store: { select: { name: true } } },
  });
  const productStore = Object.fromEntries(
    products.map((p) => [p.id, { storeId: p.storeId, name: p.store.name }]),
  );

  const byStore = new Map<string, { name: string; clicks: number }>();
  for (const g of clickGroups) {
    const info = productStore[g.productId];
    if (!info) continue;
    const cur = byStore.get(info.storeId) ?? { name: info.name, clicks: 0 };
    cur.clicks += g._count.productId;
    byStore.set(info.storeId, cur);
  }

  return [...byStore.entries()]
    .map(([storeId, v]) => ({
      storeId,
      storeName: v.name,
      clicks: v.clicks,
    }))
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, limit);
}

export async function getCatalogHealth(
  periodDays: PeriodDays = 30,
): Promise<CatalogHealth> {
  const since = daysAgo(periodDays);
  const weekSince = daysAgo(7);

  const [withoutClicksRow, draftProducts, weakFeaturedRow] = await Promise.all([
    prisma.$queryRaw<[{ count: bigint }]>`
      SELECT COUNT(*)::bigint AS count
      FROM products p
      WHERE p.is_published = true
        AND NOT EXISTS (
          SELECT 1 FROM click_events c
          WHERE c.product_id = p.id AND c.clicked_at >= ${since}
        )
    `,
    prisma.product.count({ where: { isPublished: false } }),
    prisma.$queryRaw<[{ count: bigint }]>`
      SELECT COUNT(*)::bigint AS count
      FROM products p
      WHERE p.is_featured = true
        AND p.is_published = true
        AND (
          SELECT COUNT(*)::int FROM product_impression_events i
          WHERE i.product_id = p.id AND i.impressed_at >= ${weekSince}
        ) >= 5
        AND NOT EXISTS (
          SELECT 1 FROM click_events c
          WHERE c.product_id = p.id AND c.clicked_at >= ${weekSince}
        )
    `,
  ]);

  return {
    publishedWithoutClicks: Number(withoutClicksRow[0]?.count ?? 0),
    draftProducts,
    weakFeatured: Number(weakFeaturedRow[0]?.count ?? 0),
  };
}

export function ctrDetailViews(impressions: number, views: number): string {
  if (impressions === 0) return "—";
  return `${((views / impressions) * 100).toFixed(1)}%`;
}

export function ctrAffiliateClicks(views: number, clicks: number): string {
  if (views === 0) return "—";
  return `${((clicks / views) * 100).toFixed(1)}%`;
}

export function ctrEndToEnd(impressions: number, clicks: number): string {
  if (impressions === 0) return "—";
  return `${((clicks / impressions) * 100).toFixed(2)}%`;
}

export { daysAgo };
