import { PrismaClient } from "@prisma/client";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { POST as postImpression } from "@/app/api/analytics/impression/route";
import { prisma } from "@/lib/db";
import { recordProductView } from "@/lib/analytics";
import {
  cleanupIntegrationProducts,
  getSeedStore,
  TEST_PREFIX,
} from "../../helpers/db";

const dbAvailable = Boolean(process.env.DATABASE_URL?.trim());

describe.skipIf(!dbAvailable)("analytics events", () => {
  let productId: string;
  let connected = false;

  beforeAll(async () => {
    const client = new PrismaClient();
    try {
      await client.$queryRaw`SELECT 1`;
      connected = true;
    } catch {
      connected = false;
    } finally {
      await client.$disconnect();
    }

    if (!connected) return;

    const store = await getSeedStore();
    const product = await prisma.product.create({
      data: {
        title: `${TEST_PREFIX} Analytics`,
        slug: `${TEST_PREFIX}analytics`,
        priceCurrent: 19.9,
        affiliateUrl: "https://affiliate.example.com/x",
        storeId: store.id,
        isPublished: true,
        publishedAt: new Date(),
      },
    });
    productId = product.id;
  });

  afterAll(async () => {
    if (connected) await cleanupIntegrationProducts();
  });

  it("recordProductView persiste evento", async () => {
    if (!connected) return;

    const before = await prisma.productViewEvent.count({ where: { productId } });
    await recordProductView(productId, "/produtos/test");
    const after = await prisma.productViewEvent.count({ where: { productId } });
    expect(after).toBe(before + 1);
  });

  it("POST /api/analytics/impression registra impressão", async () => {
    if (!connected) return;

    const before = await prisma.productImpressionEvent.count({
      where: { productId },
    });

    const res = await postImpression(
      new Request("http://localhost/api/analytics/impression", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, listPath: "/produtos" }),
      }),
    );

    expect(res.status).toBe(200);

    const after = await prisma.productImpressionEvent.count({
      where: { productId },
    });
    expect(after).toBe(before + 1);
  });

  it("POST impression rejeita produto inexistente", async () => {
    if (!connected) return;

    const fakeId = "00000000-0000-4000-8000-000000000099";
    const res = await postImpression(
      new Request("http://localhost/api/analytics/impression", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: fakeId }),
      }),
    );
    expect(res.status).toBe(404);
  });
});
