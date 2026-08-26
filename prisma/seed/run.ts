import type { PrismaClient } from "@prisma/client";
import {
  BADGE_DEFS,
  CATEGORY_DEFS,
  COLLECTION_DEFS,
  DEMO_PRODUCT_DEFS,
  LEGACY_CATEGORY_SLUGS,
  LEGACY_CATEGORY_TO_PROMO,
  PAGE_DEFS,
  SETTING_DEFAULTS,
  STORE_DEFS,
} from "./data";
import { parseDestructiveSeed, parseSeedMode, parseSeedUpgrade } from "./mode";
import { SeedStats } from "./stats";

function discountPercent(current: number, original?: number | null): number | null {
  if (!original || original <= current) return null;
  return Math.round(((original - current) / original) * 100);
}

export async function runSeed(prisma: PrismaClient) {
  const mode = parseSeedMode();
  const upgrade = parseSeedUpgrade();
  const destructive = parseDestructiveSeed();
  const stats = new SeedStats();
  const includeDemo = mode === "demo";

  const stores = await ensureStores(prisma, stats, upgrade);
  const storeBySlug = Object.fromEntries(stores.map((s) => [s.slug, s]));

  const categories = await ensureCategories(prisma, stats, upgrade);
  const categoryBySlug = Object.fromEntries(categories.map((c) => [c.slug, c]));

  await hideLegacyCategories(prisma, stats);
  await migrateLegacyAndBadgesToTags(prisma, stats, categoryBySlug);

  const badges = await ensureBadges(prisma, stats, upgrade);
  const badgeBySlug = Object.fromEntries(badges.map((b) => [b.slug, b]));
  void badgeBySlug;

  const demoProducts = includeDemo
    ? await ensureDemoProducts(prisma, stats, upgrade, storeBySlug, categoryBySlug)
    : [];

  const productBySlug = Object.fromEntries(demoProducts.map((p) => [p.slug, p]));

  await ensureCollections(
    prisma,
    stats,
    upgrade,
    includeDemo,
    destructive,
    productBySlug,
  );

  await refreshStoreProductCounts(prisma, stats, stores);

  await ensureSettings(prisma, stats, upgrade, destructive);
  await ensurePages(prisma, stats, upgrade);

  return { stats, mode, upgrade, destructive, includeDemo };
}

async function ensureStores(
  prisma: PrismaClient,
  stats: SeedStats,
  upgrade: boolean,
) {
  const results = [];
  for (const def of STORE_DEFS) {
    const existing = await prisma.store.findUnique({ where: { slug: def.slug } });
    if (existing) {
      if (upgrade) {
        await prisma.store.update({
          where: { slug: def.slug },
          data: def.upgrade,
        });
        stats.bump(stats.stores, "updated");
      } else {
        stats.bump(stats.stores, "skipped");
      }
      results.push(existing);
      continue;
    }
    const created = await prisma.store.create({ data: def.create });
    stats.bump(stats.stores, "created");
    results.push(created);
  }
  return results;
}

async function ensureCategories(
  prisma: PrismaClient,
  stats: SeedStats,
  upgrade: boolean,
) {
  const results = [];
  for (const def of CATEGORY_DEFS) {
    const existing = await prisma.category.findUnique({
      where: { slug: def.slug },
    });
    const data = {
      name: def.name,
      icon: def.icon,
      sortOrder: def.sortOrder,
      kind: def.kind,
      style: def.style,
      showInNav: def.showInNav,
      isActive: def.isActive,
    };
    if (existing) {
      if (upgrade) {
        await prisma.category.update({
          where: { slug: def.slug },
          data,
        });
        stats.bump(stats.categories, "updated");
        results.push({ ...existing, ...data });
      } else {
        stats.bump(stats.categories, "skipped");
        results.push(existing);
      }
      continue;
    }
    const created = await prisma.category.create({
      data: { slug: def.slug, ...data },
    });
    stats.bump(stats.categories, "created");
    results.push(created);
  }
  return results;
}

async function hideLegacyCategories(prisma: PrismaClient, stats: SeedStats) {
  const result = await prisma.category.updateMany({
    where: { slug: { in: [...LEGACY_CATEGORY_SLUGS] } },
    data: { isActive: false, showInNav: false },
  });
  if (result.count > 0) stats.bump(stats.categories, "updated");
}

async function migrateLegacyAndBadgesToTags(
  prisma: PrismaClient,
  stats: SeedStats,
  categoryBySlug: Record<string, { id: string }>,
) {
  for (const [legacySlug, promoSlug] of Object.entries(LEGACY_CATEGORY_TO_PROMO)) {
    const legacy = await prisma.category.findUnique({ where: { slug: legacySlug } });
    const promo = categoryBySlug[promoSlug];
    if (!legacy || !promo) continue;

    const links = await prisma.productCategory.findMany({
      where: { categoryId: legacy.id },
    });
    if (!links.length) continue;

    const created = await prisma.productCategory.createMany({
      data: links.map((link) => ({
        productId: link.productId,
        categoryId: promo.id,
      })),
      skipDuplicates: true,
    });
    if (created.count > 0) stats.bump(stats.products, "linked");
  }

  const badges = await prisma.badge.findMany({
    include: { products: true },
  });
  for (const badge of badges) {
    const promo = categoryBySlug[badge.slug];
    if (!promo || badge.products.length === 0) continue;
    const created = await prisma.productCategory.createMany({
      data: badge.products.map((row) => ({
        productId: row.productId,
        categoryId: promo.id,
      })),
      skipDuplicates: true,
    });
    if (created.count > 0) stats.bump(stats.products, "linked");
  }
}

async function ensureBadges(
  prisma: PrismaClient,
  stats: SeedStats,
  upgrade: boolean,
) {
  const results = [];
  for (const def of BADGE_DEFS) {
    const existing = await prisma.badge.findUnique({ where: { slug: def.slug } });
    if (existing) {
      if (upgrade) {
        await prisma.badge.update({
          where: { slug: def.slug },
          data: { label: def.label, style: def.style },
        });
        stats.bump(stats.badges, "updated");
      } else {
        stats.bump(stats.badges, "skipped");
      }
      results.push(existing);
      continue;
    }
    const created = await prisma.badge.create({ data: def });
    stats.bump(stats.badges, "created");
    results.push(created);
  }
  return results;
}

async function ensureDemoProducts(
  prisma: PrismaClient,
  stats: SeedStats,
  upgrade: boolean,
  storeBySlug: Record<string, { id: string }>,
  categoryBySlug: Record<string, { id: string }>,
) {
  const results = [];
  for (const def of DEMO_PRODUCT_DEFS) {
    const store = storeBySlug[def.storeSlug];
    if (!store) throw new Error(`Loja não encontrada: ${def.storeSlug}`);

    const categoryIds = def.tagSlugs
      .map((s) => categoryBySlug[s]?.id)
      .filter(Boolean) as string[];

    const existing = await prisma.product.findUnique({ where: { slug: def.slug } });
    const discount = discountPercent(def.priceCurrent, def.priceOriginal);

    if (existing) {
      if (upgrade) {
        await prisma.product.update({
          where: { slug: def.slug },
          data: {
            title: def.title,
            imageAlt: def.title,
            priceCurrent: def.priceCurrent,
            priceOriginal: def.priceOriginal,
            discountPercent: discount,
            affiliateUrl: def.affiliateUrl,
            storeId: store.id,
            isPublished: true,
            isFeatured: true,
            publishedAt: existing.publishedAt ?? new Date(),
          },
        });
        stats.bump(stats.products, "updated");
      } else {
        stats.bump(stats.products, "skipped");
      }
      await linkProductTags(prisma, stats, existing.id, categoryIds);
      results.push(existing);
      continue;
    }

    const created = await prisma.product.create({
      data: {
        slug: def.slug,
        title: def.title,
        imageAlt: def.title,
        priceCurrent: def.priceCurrent,
        priceOriginal: def.priceOriginal,
        discountPercent: discount,
        affiliateUrl: def.affiliateUrl,
        storeId: store.id,
        isPublished: true,
        isFeatured: true,
        publishedAt: new Date(),
        categories: {
          create: categoryIds.map((categoryId) => ({ categoryId })),
        },
      },
    });
    stats.bump(stats.products, "created");
    results.push(created);
  }
  return results;
}

async function linkProductTags(
  prisma: PrismaClient,
  stats: SeedStats,
  productId: string,
  categoryIds: string[],
) {
  if (!categoryIds.length) return;
  const cat = await prisma.productCategory.createMany({
    data: categoryIds.map((categoryId) => ({ productId, categoryId })),
    skipDuplicates: true,
  });
  if (cat.count > 0) stats.bump(stats.products, "linked");
}

async function ensureCollections(
  prisma: PrismaClient,
  stats: SeedStats,
  upgrade: boolean,
  includeDemo: boolean,
  destructive: boolean,
  productBySlug: Record<string, { id: string }>,
) {
  for (const def of COLLECTION_DEFS) {
    const existing = await prisma.collection.findUnique({
      where: { slug: def.slug },
    });

    let collection = existing;
    if (existing) {
      if (upgrade) {
        await prisma.collection.update({
          where: { slug: def.slug },
          data: def.upgrade,
        });
        stats.bump(stats.collections, "updated");
      } else {
        stats.bump(stats.collections, "skipped");
      }
    } else {
      collection = await prisma.collection.create({ data: def.create });
      stats.bump(stats.collections, "created");
    }

    if (!includeDemo || !collection) continue;

    const demoIds = def.demoProductSlugs
      .map((slug) => productBySlug[slug]?.id)
      .filter(Boolean) as string[];

    if (demoIds.length === 0) continue;

    const linkCount = await prisma.collectionProduct.count({
      where: { collectionId: collection.id },
    });

    const shouldReset =
      destructive && def.slug === "viral-agora" && linkCount > 0;

    if (shouldReset) {
      await prisma.collectionProduct.deleteMany({
        where: { collectionId: collection.id },
      });
      await prisma.collectionProduct.createMany({
        data: demoIds.map((productId, i) => ({
          collectionId: collection!.id,
          productId,
          sortOrder: i,
        })),
        skipDuplicates: true,
      });
      stats.bump(stats.collectionLinks, "updated");
      continue;
    }

    if (linkCount === 0) {
      await prisma.collectionProduct.createMany({
        data: demoIds.map((productId, i) => ({
          collectionId: collection.id,
          productId,
          sortOrder: i,
        })),
        skipDuplicates: true,
      });
      stats.bump(stats.collectionLinks, "created");
      continue;
    }

    const linked = await prisma.collectionProduct.createMany({
      data: demoIds.map((productId, i) => ({
        collectionId: collection.id,
        productId,
        sortOrder: i,
      })),
      skipDuplicates: true,
    });
    if (linked.count > 0) stats.bump(stats.collectionLinks, "linked");
    else stats.bump(stats.collectionLinks, "skipped");
  }
}

async function refreshStoreProductCounts(
  prisma: PrismaClient,
  stats: SeedStats,
  stores: { id: string }[],
) {
  for (const store of stores) {
    const count = await prisma.product.count({
      where: { storeId: store.id, isPublished: true },
    });
    await prisma.store.update({
      where: { id: store.id },
      data: { productCountCached: count },
    });
    stats.bump(stats.storeCounts, "updated");
  }
}

async function ensureSettings(
  prisma: PrismaClient,
  stats: SeedStats,
  upgrade: boolean,
  destructive: boolean,
) {
  for (const [key, value] of Object.entries(SETTING_DEFAULTS)) {
    const existing = await prisma.siteSetting.findUnique({ where: { key } });
    if (!existing) {
      await prisma.siteSetting.create({ data: { key, value } });
      stats.bump(stats.settings, "created");
      continue;
    }
    if (upgrade && destructive) {
      await prisma.siteSetting.update({ where: { key }, data: { value } });
      stats.bump(stats.settings, "updated");
    } else {
      stats.bump(stats.settings, "skipped");
    }
  }
}

async function ensurePages(
  prisma: PrismaClient,
  stats: SeedStats,
  upgrade: boolean,
) {
  for (const def of PAGE_DEFS) {
    const existing = await prisma.page.findUnique({ where: { slug: def.slug } });
    if (existing) {
      if (upgrade) {
        await prisma.page.update({
          where: { slug: def.slug },
          data: { title: def.title, body: def.body },
        });
        stats.bump(stats.pages, "updated");
      } else {
        stats.bump(stats.pages, "skipped");
      }
      continue;
    }
    await prisma.page.create({ data: def });
    stats.bump(stats.pages, "created");
  }
}
