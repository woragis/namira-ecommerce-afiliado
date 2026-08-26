import { cache } from "react";
import type { Prisma } from "@prisma/client";
import { cacheCatalog } from "@/lib/catalog-cache";
import { prisma } from "@/lib/db";
import { safeDbQuery } from "@/lib/safe-db";
import { sortNavTags } from "@/lib/tags";

export const productListInclude = {
  store: true,
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
  tagSlug?: string;
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

const fetchSiteSettings = cacheCatalog(async function fetchSiteSettings(): Promise<
  Record<string, string>
> {
  return safeDbQuery(async () => {
    const rows = await prisma.siteSetting.findMany();
    return {
      ...defaultSettings,
      ...Object.fromEntries(rows.map((r) => [r.key, r.value])),
    };
  }, defaultSettings);
}, ["site-settings"], 120);

export const getSiteSettings = cache(fetchSiteSettings);

export const getSiteSetting = cache(async function getSiteSetting(
  key: string,
  fallback = "",
): Promise<string> {
  return safeDbQuery(async () => {
    const row = await prisma.siteSetting.findUnique({ where: { key } });
    return row?.value ?? fallback;
  }, fallback);
});

const fetchActiveStores = cacheCatalog(
  async function fetchActiveStores() {
    return safeDbQuery(
      () =>
        prisma.store.findMany({
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
        }),
      [],
    );
  },
  ["active-stores"],
  120,
);

export const getActiveStores = cache(fetchActiveStores);

const fetchNavTags = cacheCatalog(async function fetchNavTags() {
  return safeDbQuery(async () => {
    const tags = await prisma.category.findMany({
      where: { isActive: true, showInNav: true },
      orderBy: { sortOrder: "asc" },
    });
    return sortNavTags(tags);
  }, []);
}, ["nav-tags"], 120);

export const getNavTags = cache(fetchNavTags);

const fetchHomeCollections = cacheCatalog(
  async function fetchHomeCollections() {
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
  },
  ["home-collections"],
  60,
);

export async function getHomeCollections() {
  return fetchHomeCollections();
}

export function buildProductWhere(filters: CatalogFilters): Prisma.ProductWhereInput {
  const and: Prisma.ProductWhereInput[] = [{ isPublished: true }];

  if (filters.storeSlug) {
    and.push({ store: { slug: filters.storeSlug, isActive: true } });
  }

  if (filters.tagSlug) {
    and.push({
      categories: {
        some: { category: { slug: filters.tagSlug, isActive: true } },
      },
    });
  }

  if (filters.search?.trim()) {
    const q = filters.search.trim();
    and.push({
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { store: { name: { contains: q, mode: "insensitive" } } },
        {
          categories: {
            some: { category: { name: { contains: q, mode: "insensitive" } } },
          },
        },
      ],
    });
  }

  const priceFilter: Prisma.DecimalFilter<"Product"> = {};
  if (filters.priceMin != null && !Number.isNaN(filters.priceMin)) {
    priceFilter.gte = filters.priceMin;
  }
  if (filters.priceMax != null && !Number.isNaN(filters.priceMax)) {
    priceFilter.lte = filters.priceMax;
  }
  if (Object.keys(priceFilter).length > 0) {
    and.push({ priceCurrent: priceFilter });
  }

  return { AND: and };
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

const fetchProducts = cacheCatalog(async function fetchProducts(
  filters: CatalogFilters = {},
) {
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
}, ["catalog-products"], 60);

export async function getProducts(filters: CatalogFilters = {}) {
  return fetchProducts(filters);
}

const fetchFeaturedProducts = cacheCatalog(
  async function fetchFeaturedProducts(limit: number = 8) {
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
  },
  ["featured-products"],
  60,
);

export async function getFeaturedProducts(limit = 8) {
  return fetchFeaturedProducts(limit);
}

const fetchProductBySlug = cacheCatalog(
  async function fetchProductBySlug(
    slug: string,
  ): Promise<ProductWithRelations | null> {
    return safeDbQuery(
      () =>
        prisma.product.findFirst({
          where: { slug, isPublished: true },
          include: productInclude,
        }),
      null,
    );
  },
  ["product-by-slug"],
  60,
);

export const getProductBySlug = cache(fetchProductBySlug);

const fetchStoreBySlug = cacheCatalog(
  async function fetchStoreBySlug(slug: string) {
    return safeDbQuery(
      () =>
        prisma.store.findFirst({
          where: { slug, isActive: true },
        }),
      null,
    );
  },
  ["store-by-slug"],
  120,
);

export async function getStoreBySlug(slug: string) {
  return fetchStoreBySlug(slug);
}

const fetchCollectionBySlug = cacheCatalog(
  async function fetchCollectionBySlug(slug: string) {
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
  },
  ["collection-by-slug"],
  60,
);

export async function getCollectionBySlug(slug: string) {
  return fetchCollectionBySlug(slug);
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

export async function getPublishedProductForRedirect(key: string) {
  return safeDbQuery(
    () =>
      prisma.product.findFirst({
        where: {
          isPublished: true,
          OR: [{ id: key }, { shareCode: key }, { slug: key }],
        },
        select: { id: true, affiliateUrl: true, title: true, slug: true, shareCode: true },
      }),
    null,
  );
}

export async function getPublishedProductByShareCode(code: string) {
  return safeDbQuery(
    () =>
      prisma.product.findFirst({
        where: {
          isPublished: true,
          OR: [{ shareCode: code }, { slug: code }],
        },
        select: { id: true, slug: true, shareCode: true },
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
