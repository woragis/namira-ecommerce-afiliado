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

import { createStore, deleteStore } from "@/actions/admin/stores";
import { importProductsFromCsv } from "@/actions/admin/import-products";
import { prisma } from "@/lib/db";
import {
  cleanupIntegrationProducts,
  cleanupIntegrationStores,
  getSeedStore,
  productFormData,
  TEST_PREFIX,
} from "../../helpers/db";

const dbAvailable = Boolean(process.env.DATABASE_URL?.trim());

describe.skipIf(!dbAvailable)("CRUD lojas e import CSV (integração DB)", () => {
  let connected = false;
  let storeId: string;
  const storeSlug = `${TEST_PREFIX}store-import`;

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
  });

  afterAll(async () => {
    if (connected) {
      await cleanupIntegrationProducts();
      await cleanupIntegrationStores();
    }
  });

  it("createStore persiste loja ativa", async () => {
    if (!connected) return;

    await expect(
      createStore(
        productFormData({
          name: `${TEST_PREFIX} Loja Teste`,
          slug: storeSlug,
          shortLabel: "TT",
          colorPrimary: "#112233",
          colorOnPrimary: "#ffffff",
          showInNav: "on",
        }),
      ),
    ).rejects.toThrow(/REDIRECT:/);

    const store = await prisma.store.findUnique({ where: { slug: storeSlug } });
    expect(store?.isActive).toBe(true);
    storeId = store!.id;
  });

  it("createStore rejeita cor inválida", async () => {
    if (!connected) return;

    await expect(
      createStore(
        productFormData({
          name: "Loja inválida",
          shortLabel: "X",
          colorPrimary: "red",
          colorOnPrimary: "#ffffff",
        }),
      ),
    ).rejects.toThrow("Dados inválidos");
  });

  it("importProductsFromCsv cria produto na loja seed", async () => {
    if (!connected) return;

    const shopee = await getSeedStore("shopee");
    const csv = [
      "title,affiliate_url,store_slug,price_current,published",
      `${TEST_PREFIX} Import CSV,https://example.com/i,shopee,25.00,true`,
    ].join("\n");

    const fd = new FormData();
    fd.set("csv", csv);

    const result = await importProductsFromCsv(fd);
    expect(result.created).toBe(1);
    expect(result.errors).toHaveLength(0);

    const imported = await prisma.product.findFirst({
      where: { title: { contains: `${TEST_PREFIX} Import CSV` } },
    });
    expect(imported).not.toBeNull();
    expect(imported!.storeId).toBe(shopee.id);
  });

  it("importProductsFromCsv reporta loja inexistente", async () => {
    if (!connected) return;

    const csv = [
      "title,affiliate_url,store_slug,price_current",
      "X,https://example.com/x,loja-fantasma,10",
    ].join("\n");

    const fd = new FormData();
    fd.set("csv", csv);

    const result = await importProductsFromCsv(fd);
    expect(result.skipped).toBe(1);
    expect(result.errors.some((e) => e.includes("loja-fantasma"))).toBe(true);
  });

  it("deleteStore desativa loja (soft delete)", async () => {
    if (!connected || !storeId) return;

    await deleteStore(storeId);
    const store = await prisma.store.findUnique({ where: { id: storeId } });
    expect(store?.isActive).toBe(false);
  });
});
