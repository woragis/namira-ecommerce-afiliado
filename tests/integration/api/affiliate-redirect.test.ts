import { PrismaClient } from "@prisma/client";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { GET } from "@/app/r/[id]/route";
import { prisma } from "@/lib/db";
import {
  cleanupIntegrationProducts,
  getSeedStore,
  TEST_PREFIX,
} from "../../helpers/db";

const dbAvailable = Boolean(process.env.DATABASE_URL?.trim());

describe.skipIf(!dbAvailable)("GET /r/[id] (redirect afiliado)", () => {
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
        title: `${TEST_PREFIX} Redirect`,
        slug: `${TEST_PREFIX}redirect`,
        priceCurrent: 29.9,
        affiliateUrl: "https://affiliate.example.com/offer",
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

  it("redireciona para URL de afiliado e registra clique", async () => {
    if (!connected) return;

    const before = await prisma.clickEvent.count({
      where: { productId },
    });

    const res = await GET(
      new Request(`http://localhost/r/${productId}`, {
        headers: { referer: "http://localhost/produtos" },
      }),
      { params: Promise.resolve({ id: productId }) },
    );

    expect(res.status).toBe(302);
    expect(res.headers.get("location")).toBe("https://affiliate.example.com/offer");

    const after = await prisma.clickEvent.count({ where: { productId } });
    expect(after).toBe(before + 1);
  });

  it("produto inexistente redireciona para /produtos", async () => {
    if (!connected) return;

    const fakeId = "00000000-0000-4000-8000-000000000099";
    const res = await GET(
      new Request(`http://localhost/r/${fakeId}`),
      { params: Promise.resolve({ id: fakeId }) },
    );

    expect(res.status).toBe(307); // NextResponse.redirect default
    expect(res.headers.get("location")).toContain("/produtos");
  });
});
