import { prisma } from "@/lib/db";
import { daysAgo } from "@/lib/dates";

export const PERIOD_OPTIONS = [7, 30, 90] as const;
export type PeriodDays = (typeof PERIOD_OPTIONS)[number];

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

export type ListPathRow = {
  path: string;
  count: number;
};

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

export function parsePeriodDays(value: string | undefined): PeriodDays {
  const n = Number(value);
  if (n === 30 || n === 90) return n;
  return 7;
}

export function getPeriodBounds(days: PeriodDays, now = Date.now()) {
  const currentStart = daysAgo(days, now);
  const currentEnd = new Date(now);
  const previousStart = daysAgo(days * 2, now);
  const previousEnd = currentStart;
  return { currentStart, currentEnd, previousStart, previousEnd, days };
}

export async function getMetricTotalsBetween(
  start: Date,
  end: Date,
): Promise<MetricTotals> {
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

export async function getMetricTotals(since: Date): Promise<MetricTotals> {
  return getMetricTotalsBetween(since, new Date());
}

export async function getDailyMetricsSeries(
  days: PeriodDays,
): Promise<DailyMetricPoint[]> {
  const start = daysAgo(days);
  const dayKeys = buildDayKeys(days);

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

  const map = new Map<string, DailyMetricPoint>();
  for (const key of dayKeys) {
    map.set(key, { date: key, impressions: 0, views: 0, clicks: 0 });
  }

  for (const row of impRows) {
    const key = formatDayKey(row.day);
    const p = map.get(key);
    if (p) p.impressions = Number(row.count);
  }
  for (const row of viewRows) {
    const key = formatDayKey(row.day);
    const p = map.get(key);
    if (p) p.views = Number(row.count);
  }
  for (const row of clickRows) {
    const key = formatDayKey(row.day);
    const p = map.get(key);
    if (p) p.clicks = Number(row.count);
  }

  return dayKeys.map((key) => map.get(key)!);
}

function buildDayKeys(days: number): string[] {
  const keys: string[] = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    keys.push(formatDayKey(d));
  }
  return keys;
}

function formatDayKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export async function getTopProductsByMetrics(
  since: Date,
  limit = 15,
): Promise<ProductMetricRow[]> {
  const [impGroups, viewGroups, clickGroups] = await Promise.all([
    prisma.productImpressionEvent.groupBy({
      by: ["productId"],
      where: { impressedAt: { gte: since } },
      _count: { productId: true },
    }),
    prisma.productViewEvent.groupBy({
      by: ["productId"],
      where: { viewedAt: { gte: since } },
      _count: { productId: true },
    }),
    prisma.clickEvent.groupBy({
      by: ["productId"],
      where: { clickedAt: { gte: since } },
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

  const ranked = [...scores.values()]
    .map((m) => ({
      ...m,
      score: m.clicks * 3 + m.views * 2 + m.impressions,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  const products = await prisma.product.findMany({
    where: { id: { in: ranked.map((r) => r.productId) } },
    select: {
      id: true,
      title: true,
      slug: true,
      store: { select: { name: true } },
    },
  });
  const productMap = Object.fromEntries(products.map((p) => [p.id, p]));

  return ranked.map((r) => {
    const p = productMap[r.productId];
    return {
      productId: r.productId,
      title: p?.title ?? r.productId,
      slug: p?.slug ?? "",
      storeName: p?.store.name ?? "—",
      impressions: r.impressions,
      views: r.views,
      clicks: r.clicks,
    };
  });
}

export async function getProductsWithoutClicks(
  since: Date,
  minImpressions: number,
  limit = 10,
): Promise<ProductMetricRow[]> {
  const top = await getTopProductsByMetrics(since, 50);
  return top
    .filter((p) => p.impressions >= minImpressions && p.clicks === 0)
    .slice(0, limit);
}

export async function getTopListPaths(
  since: Date,
  limit = 10,
): Promise<ListPathRow[]> {
  const groups = await prisma.productImpressionEvent.groupBy({
    by: ["listPath"],
    where: {
      impressedAt: { gte: since },
      listPath: { not: null },
    },
    _count: { listPath: true },
    orderBy: { _count: { listPath: "desc" } },
    take: limit,
  });

  return groups
    .filter((g) => g.listPath)
    .map((g) => ({
      path: g.listPath!,
      count: g._count.listPath,
    }));
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
    select: {
      id: true,
      storeId: true,
      store: { select: { name: true } },
    },
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

  const published = await prisma.product.findMany({
    where: { isPublished: true },
    select: { id: true, isFeatured: true },
  });
  const publishedIds = published.map((p) => p.id);

  const [clickedIds, draftProducts, featuredImp] = await Promise.all([
    prisma.clickEvent.findMany({
      where: {
        clickedAt: { gte: since },
        productId: { in: publishedIds },
      },
      distinct: ["productId"],
      select: { productId: true },
    }),
    prisma.product.count({ where: { isPublished: false } }),
    prisma.productImpressionEvent.groupBy({
      by: ["productId"],
      where: {
        impressedAt: { gte: weekSince },
        productId: {
          in: published.filter((p) => p.isFeatured).map((p) => p.id),
        },
      },
      _count: { productId: true },
    }),
  ]);

  const clickedSet = new Set(clickedIds.map((c) => c.productId));
  const publishedWithoutClicks = publishedIds.filter(
    (id) => !clickedSet.has(id),
  ).length;

  const featuredWithImp = new Set(
    featuredImp.filter((f) => f._count.productId >= 5).map((f) => f.productId),
  );
  const featuredClicked = await prisma.clickEvent.findMany({
    where: {
      clickedAt: { gte: weekSince },
      productId: { in: [...featuredWithImp] },
    },
    distinct: ["productId"],
    select: { productId: true },
  });
  const featuredClickedSet = new Set(featuredClicked.map((c) => c.productId));
  const weakFeatured = [...featuredWithImp].filter(
    (id) => !featuredClickedSet.has(id),
  ).length;

  return {
    publishedWithoutClicks,
    draftProducts,
    weakFeatured,
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
