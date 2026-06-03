import { prisma } from "@/lib/db";
import { daysAgo } from "@/lib/dates";

export type ProductMetricRow = {
  productId: string;
  title: string;
  slug: string;
  impressions: number;
  views: number;
  clicks: number;
};

export async function getMetricTotals(since: Date) {
  const [impressions, views, clicks] = await Promise.all([
    prisma.productImpressionEvent.count({
      where: { impressedAt: { gte: since } },
    }),
    prisma.productViewEvent.count({
      where: { viewedAt: { gte: since } },
    }),
    prisma.clickEvent.count({
      where: { clickedAt: { gte: since } },
    }),
  ]);
  return { impressions, views, clicks };
}

export async function getTopProductsByMetrics(
  since: Date,
  limit = 10,
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

  const scores = new Map<string, { impressions: number; views: number; clicks: number }>();

  for (const g of impGroups) {
    const row = scores.get(g.productId) ?? { impressions: 0, views: 0, clicks: 0 };
    row.impressions = g._count.productId;
    scores.set(g.productId, row);
  }
  for (const g of viewGroups) {
    const row = scores.get(g.productId) ?? { impressions: 0, views: 0, clicks: 0 };
    row.views = g._count.productId;
    scores.set(g.productId, row);
  }
  for (const g of clickGroups) {
    const row = scores.get(g.productId) ?? { impressions: 0, views: 0, clicks: 0 };
    row.clicks = g._count.productId;
    scores.set(g.productId, row);
  }

  const ranked = [...scores.entries()]
    .map(([productId, m]) => ({
      productId,
      score: m.clicks * 3 + m.views * 2 + m.impressions,
      ...m,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  const products = await prisma.product.findMany({
    where: { id: { in: ranked.map((r) => r.productId) } },
    select: { id: true, title: true, slug: true },
  });
  const productMap = Object.fromEntries(products.map((p) => [p.id, p]));

  return ranked.map((r) => {
    const p = productMap[r.productId];
    return {
      productId: r.productId,
      title: p?.title ?? r.productId,
      slug: p?.slug ?? "",
      impressions: r.impressions,
      views: r.views,
      clicks: r.clicks,
    };
  });
}

export function ctrDetailViews(impressions: number, views: number): string {
  if (impressions === 0) return "—";
  return `${((views / impressions) * 100).toFixed(1)}%`;
}

export function ctrAffiliateClicks(views: number, clicks: number): string {
  if (views === 0) return "—";
  return `${((clicks / views) * 100).toFixed(1)}%`;
}

export { daysAgo };
