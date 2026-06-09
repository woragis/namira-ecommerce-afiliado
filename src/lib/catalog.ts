import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { safeDbQuery } from "@/lib/safe-db";

export const productListInclude = {
  store: true,
  badges: { include: { badge: true } },
  categories: { include: { category: true } },
} satisfies Prisma.ProductInclude;

export const productInclude = {
  ...productListInclude,
  media: { orderBy: { sortOrder: "asc" as const } },
} satisfies Prisma.ProductInclude;

export type ProductListItem = Prisma.ProductGetPayload<{
  include: typeof productListInclude;
}>;

export type ProductWithRelations = Prisma.ProductGetPayload<{
  include: typeof productInclude;
}>;

export type CatalogFilters = {
  storeSlug?: string;
  categorySlug?: string;
  badgeSlug?: string;
  search?: string;
  priceMin?: number;
  priceMax?: number;
  sort?: "recentes" | "preco-asc" | "preco-desc" | "desconto";
  page?: number;
  limit?: number;
};

const defaultSettings: Record<string, string> = {
  header_banner_text:
    "🔥 +3.200 achados com os melhores preços das maiores lojas do Brasil",
  hero_eyebrow: "🎯 Curadoria diária",
  hero_title: "Achados que viralizam de verdade",
  hero_subtitle:
    "A gente garimpou os produtos mais comentados do TikTok e Instagram, tudo numa loja só.",
  stats_products: "3.2k+",
  stats_stores: "3",
  stats_update_label: "diário",
  footer_disclaimer:
    "Este site contém links de afiliados. Ao clicar você será redirecionado à loja de origem.",
  whatsapp_phone: "",
};

export async function getSiteSettings(): Promise<Record<string, string>> {
  return safeDbQuery(async () => {
    const rows = await prisma.siteSetting.findMany();
    return {
      ...defaultSettings,
      ...Object.fromEntries(rows.map((r) => [r.key, r.value])),
    };
  }, defaultSettings);
}

export async function getSiteSetting(
  key: string,
  fallback = "",
): Promise<string> {
  return safeDbQuery(async () => {
    const row = await prisma.siteSetting.findUnique({ where: { key } });
    return row?.value ?? fallback;
  }, fallback);
}

export async function getActiveStores() {
  return safeDbQuery(
    () =>
      prisma.store.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
      }),
    [],
  );
}

export async function getBadges() {
  return safeDbQuery(
    () => prisma.badge.findMany({ orderBy: { label: "asc" } }),
    [],
  );
}

export async function getNavCategories() {
  return safeDbQuery(
    () =>
      prisma.category.findMany({
        where: { isActive: true, showInNav: true },
        orderBy: { sortOrder: "asc" },
      }),
    [],
  );
}

export async function getHomeCollections() {
  return safeDbQuery(
    () =>
      prisma.collection.findMany({
        where: { isActive: true, showOnHome: true },
        orderBy: { homeSortOrder: "asc" },
        include: {
          products: {
            orderBy: { sortOrder: "asc" },
            include: {
              product: { include: productListInclude },
            },
          },
        },
      }),
    [],
  );
}

function buildProductWhere(filters: CatalogFilters): Prisma.ProductWhereInput {
  const where: Prisma.ProductWhereInput = { isPublished: true };

  if (filters.storeSlug) {
    where.store = { slug: filters.storeSlug, isActive: true };
  }

  if (filters.categorySlug) {
    where.categories = {
      some: { category: { slug: filters.categorySlug, isActive: true } },
    };
  }

  if (filters.badgeSlug) {
    where.badges = {
      some: { badge: { slug: filters.badgeSlug } },
    };
  }

  if (filters.search?.trim()) {
    const q = filters.search.trim();
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
    ];
  }

  const priceFilter: Prisma.DecimalFilter<"Product"> = {};
  if (filters.priceMin != null && !Number.isNaN(filters.priceMin)) {
    priceFilter.gte = filters.priceMin;
  }
  if (filters.priceMax != null && !Number.isNaN(filters.priceMax)) {
    priceFilter.lte = filters.priceMax;
  }
  if (Object.keys(priceFilter).length > 0) {
    where.priceCurrent = priceFilter;
  }

  return where;
}

function buildProductOrderBy(
  sort?: CatalogFilters["sort"],
): Prisma.ProductOrderByWithRelationInput[] {
  switch (sort) {
    case "preco-asc":
      return [{ priceCurrent: "asc" }];
    case "preco-desc":
      return [{ priceCurrent: "desc" }];
    case "desconto":
      return [{ discountPercent: "desc" }];
    case "recentes":
    default:
      return [{ publishedAt: "desc" }, { createdAt: "desc" }];
  }
}

const emptyCatalog = {
  items: [] as ProductListItem[],
  total: 0,
  page: 1,
  limit: 24,
  totalPages: 0,
};

export async function getProducts(filters: CatalogFilters = {}) {
  return safeDbQuery(async () => {
    const page = Math.max(1, filters.page ?? 1);
    const limit = Math.min(48, Math.max(1, filters.limit ?? 24));
    const skip = (page - 1) * limit;
    const where = buildProductWhere(filters);

    const [items, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: productListInclude,
        orderBy: buildProductOrderBy(filters.sort),
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }, emptyCatalog);
}

export async function getFeaturedProducts(limit = 8) {
  return safeDbQuery(
    () =>
      prisma.product.findMany({
        where: { isPublished: true, isFeatured: true },
        include: productListInclude,
        orderBy: [{ sortPriority: "desc" }, { publishedAt: "desc" }],
        take: limit,
      }),
    [],
  );
}

export async function getProductBySlug(slug: string) {
  return safeDbQuery(
    () =>
      prisma.product.findFirst({
        where: { slug, isPublished: true },
        include: productInclude,
      }),
    null,
  );
}

export async function getStoreBySlug(slug: string) {
  return safeDbQuery(
    () =>
      prisma.store.findFirst({
        where: { slug, isActive: true },
      }),
    null,
  );
}

export async function getCollectionBySlug(slug: string) {
  return safeDbQuery(
    () =>
      prisma.collection.findFirst({
        where: { slug, isActive: true },
        include: {
          products: {
            orderBy: { sortOrder: "asc" },
            include: { product: { include: productInclude } },
          },
        },
      }),
    null,
  );
}

export async function getCategoryBySlug(slug: string) {
  return safeDbQuery(
    () =>
      prisma.category.findFirst({
        where: { slug, isActive: true },
      }),
    null,
  );
}

export async function getPublishedProductForRedirect(id: string) {
  return safeDbQuery(
    () =>
      prisma.product.findFirst({
        where: { id, isPublished: true },
        select: { id: true, affiliateUrl: true, title: true },
      }),
    null,
  );
}

export { recordProductClick } from "@/lib/analytics";

export function formatPrice(value: number | string): string {
  const n = typeof value === "string" ? parseFloat(value) : value;
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(n);
}
