import { prisma } from "@/lib/db";
import { daysAgo } from "@/lib/dates";

function startOfUtcDay(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

function addUtcDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setUTCDate(x.getUTCDate() + n);
  return x;
}

export function formatMetricsDayKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function listUtcDaysBetween(start: Date, end: Date): Date[] {
  const days: Date[] = [];
  let cur = startOfUtcDay(start);
  const last = startOfUtcDay(end);
  while (cur <= last) {
    days.push(new Date(cur));
    cur = addUtcDays(cur, 1);
  }
  return days;
}

/** Agrega eventos brutos de um dia (UTC) em product_metrics_daily. */
export async function rollupMetricsForDay(day: Date) {
  const dayStart = startOfUtcDay(day);
  const dayEnd = addUtcDays(dayStart, 1);

  const [imps, views, clicks] = await Promise.all([
    prisma.productImpressionEvent.groupBy({
      by: ["productId"],
      where: { impressedAt: { gte: dayStart, lt: dayEnd } },
      _count: { productId: true },
    }),
    prisma.productViewEvent.groupBy({
      by: ["productId"],
      where: { viewedAt: { gte: dayStart, lt: dayEnd } },
      _count: { productId: true },
    }),
    prisma.clickEvent.groupBy({
      by: ["productId"],
      where: { clickedAt: { gte: dayStart, lt: dayEnd } },
      _count: { productId: true },
    }),
  ]);

  const totals = new Map<
    string,
    { impressions: number; views: number; clicks: number }
  >();

  for (const row of imps) {
    const t = totals.get(row.productId) ?? {
      impressions: 0,
      views: 0,
      clicks: 0,
    };
    t.impressions = row._count.productId;
    totals.set(row.productId, t);
  }
  for (const row of views) {
    const t = totals.get(row.productId) ?? {
      impressions: 0,
      views: 0,
      clicks: 0,
    };
    t.views = row._count.productId;
    totals.set(row.productId, t);
  }
  for (const row of clicks) {
    const t = totals.get(row.productId) ?? {
      impressions: 0,
      views: 0,
      clicks: 0,
    };
    t.clicks = row._count.productId;
    totals.set(row.productId, t);
  }

  const dateOnly = dayStart;

  if (totals.size === 0) {
    await prisma.productMetricsDaily.deleteMany({
      where: { date: dateOnly },
    });
    return 0;
  }

  await prisma.$transaction([
    prisma.productMetricsDaily.deleteMany({ where: { date: dateOnly } }),
    prisma.productMetricsDaily.createMany({
      data: [...totals.entries()].map(([productId, m]) => ({
        productId,
        date: dateOnly,
        impressions: m.impressions,
        views: m.views,
        clicks: m.clicks,
      })),
    }),
  ]);

  return totals.size;
}

/** Preenche dias ausentes (e reprocessa o dia atual). */
export async function syncMetricsRollup(periodDays: number) {
  const start = daysAgo(periodDays);
  const today = startOfUtcDay(new Date());
  const days = listUtcDaysBetween(start, today);

  const existing = await prisma.productMetricsDaily.findMany({
    where: { date: { gte: startOfUtcDay(start) } },
    select: { date: true },
    distinct: ["date"],
  });
  const existingKeys = new Set(
    existing.map((r) => formatMetricsDayKey(r.date)),
  );

  let rolled = 0;
  for (const day of days) {
    const key = formatMetricsDayKey(day);
    const isToday = key === formatMetricsDayKey(today);
    if (!existingKeys.has(key) || isToday) {
      await rollupMetricsForDay(day);
      rolled += 1;
    }
  }
  return rolled;
}

export async function rollupMetricsRecentDays(days: number) {
  const start = daysAgo(days);
  const list = listUtcDaysBetween(start, new Date());
  let count = 0;
  for (const day of list) {
    await rollupMetricsForDay(day);
    count += 1;
  }
  return count;
}
