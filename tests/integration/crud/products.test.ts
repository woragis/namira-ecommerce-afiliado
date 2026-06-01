import { PrismaClient } from "@prisma/client";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { RedirectError } from "../../helpers/next-mocks";

vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new RedirectError(url);
  },
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

import {
  createProduct,
  deleteProduct,
  toggleProductFeatured,
  toggleProductPublished,
  updateProduct,
} from "@/actions/admin/products";
import { prisma } from "@/lib/db";
import {
  cleanupIntegrationProducts,
  getSeedCategory,
  getSeedStore,
  productFormData,
  TEST_PREFIX,
} from "../../helpers/db";

const dbAvailable = Boolean(process.env.DATABASE_URL?.trim());

describe.skipIf(!dbAvailable)("CRUD produtos (server actions + DB)", () => {
  let connected = false;
  let storeId: string;
  let categoryId: string;
  let productId: string;
  const slug = `${TEST_PREFIX}crud-produto`;

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

    const store = await getSeedStore();
    const category = await getSeedCategory("beleza");
    storeId = store.id;
    categoryId = category.id;
  });

  afterAll(async () => {
    if (connected) await cleanupIntegrationProducts();
  });

  it("createProduct persiste produto publicado com categoria", async () => {
    if (!connected) return;

    await expect(
      createProduct(
        productFormData({
          title: `${TEST_PREFIX} CRUD Produto`,
          slug,
          storeId,
          affiliateUrl: "https://example.com/aff",
          priceCurrent: "49.90",
          priceOriginal: "99.90",
          isPublished: "on",
          categoryIds: [categoryId],
        }),
      ),
    ).rejects.toThrow(/REDIRECT:/);

    const product = await prisma.product.findUnique({
      where: { slug },
      include: { categories: true },
    });

    expect(product).not.toBeNull();
    expect(product!.isPublished).toBe(true);
    expect(product!.discountPercent).toBe(50);
    expect(product!.categories).toHaveLength(1);
    productId = product!.id;
  });

  it("updateProduct altera título e preço", async () => {
    if (!connected || !productId) return;

    await expect(
      updateProduct(
        productId,
        productFormData({
          title: `${TEST_PREFIX} CRUD Atualizado`,
          slug,
          storeId,
          affiliateUrl: "https://example.com/aff",
          priceCurrent: "39.90",
          isPublished: "on",
        }),
      ),
    ).rejects.toThrow(/REDIRECT:/);

    const updated = await prisma.product.findUnique({ where: { id: productId } });
    expect(updated?.title).toContain("Atualizado");
    expect(Number(updated?.priceCurrent)).toBe(39.9);
  });

  it("toggleProductPublished oculta do catálogo público", async () => {
    if (!connected || !productId) return;

    await toggleProductPublished(productId, false);
    let product = await prisma.product.findUnique({ where: { id: productId } });
    expect(product?.isPublished).toBe(false);

    await toggleProductPublished(productId, true);
    product = await prisma.product.findUnique({ where: { id: productId } });
    expect(product?.isPublished).toBe(true);
    expect(product?.publishedAt).not.toBeNull();
  });

  it("toggleProductFeatured marca destaque", async () => {
    if (!connected || !productId) return;

    await toggleProductFeatured(productId, true);
    const product = await prisma.product.findUnique({ where: { id: productId } });
    expect(product?.isFeatured).toBe(true);
  });

  it("createProduct rejeita dados inválidos", async () => {
    if (!connected) return;

    await expect(
      createProduct(
        productFormData({
          title: "ab",
          storeId,
          affiliateUrl: "not-a-url",
          priceCurrent: "-1",
        }),
      ),
    ).rejects.toThrow("Dados inválidos");
  });

  it("deleteProduct remove do banco", async () => {
    if (!connected || !productId) return;

    await expect(deleteProduct(productId)).rejects.toThrow(/REDIRECT:/);

    const gone = await prisma.product.findUnique({ where: { id: productId } });
    expect(gone).toBeNull();
    productId = "";
  });
});
