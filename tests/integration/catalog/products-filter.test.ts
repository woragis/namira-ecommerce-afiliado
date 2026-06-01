import { PrismaClient } from "@prisma/client";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { getProducts, getProductBySlug } from "@/lib/catalog";
import {
  cleanupIntegrationProducts,
  getSeedCategory,
  getSeedStore,
  TEST_PREFIX,
} from "../../helpers/db";
import { prisma } from "@/lib/db";

const dbAvailable = Boolean(process.env.DATABASE_URL?.trim());

describe.skipIf(!dbAvailable)("Catálogo getProducts (integração DB)", () => {
  let connected = false;

  beforeAll(async () => {
    const client = new PrismaClient();
    try {
      await client.$queryRaw`SELECT 1`;
      connected = true;
    } catch {
      return;
    } finally {
      await client.$disconnect();
    }

    const store = await getSeedStore("amazon");
    const category = await getSeedCategory("tech");

    await prisma.product.createMany({
      data: [
        {
          title: `${TEST_PREFIX} Barato`,
          slug: `${TEST_PREFIX}barato`,
          priceCurrent: 10,
          affiliateUrl: "https://example.com/a",
          storeId: store.id,
          isPublished: true,
          publishedAt: new Date(),
        },
        {
          title: `${TEST_PREFIX} Caro`,
          slug: `${TEST_PREFIX}caro`,
          priceCurrent: 100,
          affiliateUrl: "https://example.com/b",
          storeId: store.id,
          isPublished: true,
          publishedAt: new Date(),
        },
        {
          title: `${TEST_PREFIX} Rascunho`,
          slug: `${TEST_PREFIX}draft`,
          priceCurrent: 50,
          affiliateUrl: "https://example.com/c",
          storeId: store.id,
          isPublished: false,
        },
      ],
    });

    const cheap = await prisma.product.findUnique({
      where: { slug: `${TEST_PREFIX}barato` },
    });
    if (cheap) {
      await prisma.productCategory.create({
        data: { productId: cheap.id, categoryId: category.id },
      });
    }
  });

  afterAll(async () => {
    if (connected) await cleanupIntegrationProducts();
  });

  it("filtra por loja e faixa de preço", async () => {
    if (!connected) return;

    const result = await getProducts({
      storeSlug: "amazon",
      priceMin: 20,
      priceMax: 150,
      limit: 48,
    });

    const testSlugs = result.items
      .filter((p) => p.slug.startsWith(TEST_PREFIX))
      .map((p) => p.slug);

    expect(testSlugs).toContain(`${TEST_PREFIX}caro`);
    expect(testSlugs).not.toContain(`${TEST_PREFIX}barato`);
    expect(testSlugs).not.toContain(`${TEST_PREFIX}draft`);
  });

  it("ordena por preço ascendente", async () => {
    if (!connected) return;

    const { items } = await getProducts({
      storeSlug: "amazon",
      sort: "preco-asc",
      limit: 48,
    });

    const testItems = items.filter((p) => p.slug.startsWith(TEST_PREFIX));
    const prices = testItems.map((p) => Number(p.priceCurrent));
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
  });

  it("filtra por categoria", async () => {
    if (!connected) return;

    const { items } = await getProducts({
      categorySlug: "tech",
      limit: 48,
    });

    expect(items.some((p) => p.slug === `${TEST_PREFIX}barato`)).toBe(true);
  });

  it("getProductBySlug oculta não publicados", async () => {
    if (!connected) return;

    expect(await getProductBySlug(`${TEST_PREFIX}barato`)).not.toBeNull();
    expect(await getProductBySlug(`${TEST_PREFIX}draft`)).toBeNull();
  });
});
