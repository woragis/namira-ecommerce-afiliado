import { PrismaClient } from "@prisma/client";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { POST } from "@/app/api/favorites/resolve/route";
import { prisma } from "@/lib/db";
import {
  cleanupIntegrationProducts,
  getSeedStore,
  TEST_PREFIX,
} from "../../helpers/db";

const dbAvailable = Boolean(process.env.DATABASE_URL?.trim());

describe.skipIf(!dbAvailable)("POST /api/favorites/resolve (integração DB)", () => {
  let publishedId: string;
  let unpublishedId: string;
  let connected = false;

  beforeAll(async () => {
    if (!dbAvailable) return;
    const client = new PrismaClient();
    try {
      await client.$queryRaw`SELECT 1`;
      connected = true;
    } catch {
      return;
    } finally {
      await client.$disconnect();
    }

    if (!connected) return;
    const store = await getSeedStore();
    const published = await prisma.product.create({
      data: {
        title: `${TEST_PREFIX} Favorito publicado`,
        slug: `${TEST_PREFIX}fav-pub`,
        priceCurrent: 10,
        affiliateUrl: "https://example.com/p",
        storeId: store.id,
        isPublished: true,
        publishedAt: new Date(),
      },
    });
    const unpublished = await prisma.product.create({
      data: {
        title: `${TEST_PREFIX} Favorito rascunho`,
        slug: `${TEST_PREFIX}fav-draft`,
        priceCurrent: 10,
        affiliateUrl: "https://example.com/d",
        storeId: store.id,
        isPublished: false,
      },
    });
    publishedId = published.id;
    unpublishedId = unpublished.id;
  });

  afterAll(async () => {
    await cleanupIntegrationProducts();
  });

  it("retorna produtos publicados com relações", async () => {
    const res = await POST(
      new Request("http://localhost/api/favorites/resolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: [publishedId, unpublishedId] }),
      }),
    );

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.products).toHaveLength(1);
    expect(body.products[0].id).toBe(publishedId);
    expect(body.products[0].store).toBeDefined();
  });

  it("limita a 50 ids", async () => {
    const ids = Array.from({ length: 55 }, (_, i) => `fake-${i}`);
    ids[0] = publishedId;

    const res = await POST(
      new Request("http://localhost/api/favorites/resolve", {
        method: "POST",
        body: JSON.stringify({ ids }),
      }),
    );

    const body = await res.json();
    expect(body.products.length).toBeLessThanOrEqual(1);
  });
});
