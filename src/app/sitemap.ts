import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";
import { isDatabaseConfigured, safeDbQuery } from "@/lib/safe-db";

const BASE =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
  "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE, changeFrequency: "daily", priority: 1 },
    { url: `${BASE}/produtos`, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE}/lojas`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE}/sobre`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE}/como-funciona`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE}/contato`, changeFrequency: "monthly", priority: 0.4 },
  ];

  if (!isDatabaseConfigured()) return staticRoutes;

  const [products, stores, categories, collections] = await safeDbQuery(
    () =>
      Promise.all([
        prisma.product.findMany({
          where: { isPublished: true },
          select: { slug: true, updatedAt: true },
        }),
        prisma.store.findMany({
          where: { isActive: true },
          select: { slug: true, updatedAt: true },
        }),
        prisma.category.findMany({
          where: { isActive: true },
          select: { slug: true, updatedAt: true },
        }),
        prisma.collection.findMany({
          where: { isActive: true },
          select: { slug: true, updatedAt: true },
        }),
      ]),
    [[], [], [], []] as [
      { slug: string; updatedAt: Date }[],
      { slug: string; updatedAt: Date }[],
      { slug: string; updatedAt: Date }[],
      { slug: string; updatedAt: Date }[],
    ],
  );

  return [
    ...staticRoutes,
    ...products.map((p) => ({
      url: `${BASE}/produtos/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...stores.map((s) => ({
      url: `${BASE}/lojas/${s.slug}`,
      lastModified: s.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
    ...categories.map((c) => ({
      url: `${BASE}/categorias/${c.slug}`,
      lastModified: c.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
    ...collections.map((c) => ({
      url: `${BASE}/colecoes/${c.slug}`,
      lastModified: c.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
