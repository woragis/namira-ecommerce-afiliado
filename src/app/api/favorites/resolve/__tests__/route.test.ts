import { beforeEach, describe, expect, it, vi } from "vitest";

const { findMany } = vi.hoisted(() => ({
  findMany: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  prisma: {
    product: { findMany },
  },
}));

vi.mock("@/lib/safe-db", () => ({
  isDatabaseConfigured: vi.fn(),
}));

vi.mock("@/lib/catalog", () => ({
  productListInclude: {},
}));

import { POST } from "@/app/api/favorites/resolve/route";
import { isDatabaseConfigured } from "@/lib/safe-db";

describe("POST /api/favorites/resolve", () => {
  beforeEach(() => {
    vi.mocked(isDatabaseConfigured).mockReset();
    findMany.mockReset();
  });

  it("returns empty list when database is not configured", async () => {
    vi.mocked(isDatabaseConfigured).mockReturnValue(false);

    const res = await POST(
      new Request("http://localhost/api/favorites/resolve", {
        method: "POST",
        body: JSON.stringify({ ids: ["a", "b"] }),
      }),
    );

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ products: [] });
    expect(findMany).not.toHaveBeenCalled();
  });

  it("returns empty list for missing ids", async () => {
    vi.mocked(isDatabaseConfigured).mockReturnValue(true);

    const res = await POST(
      new Request("http://localhost/api/favorites/resolve", {
        method: "POST",
        body: JSON.stringify({ ids: [] }),
      }),
    );

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ products: [] });
    expect(findMany).not.toHaveBeenCalled();
  });

  it("queries published products by id (max 50)", async () => {
    vi.mocked(isDatabaseConfigured).mockReturnValue(true);
    const products = [{ id: "p1", title: "Produto" }];
    findMany.mockResolvedValue(products);

    const ids = Array.from({ length: 60 }, (_, i) => `id-${i}`);
    const res = await POST(
      new Request("http://localhost/api/favorites/resolve", {
        method: "POST",
        body: JSON.stringify({ ids }),
      }),
    );

    expect(findMany).toHaveBeenCalledWith({
      where: { id: { in: ids.slice(0, 50) }, isPublished: true },
      include: {},
    });
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ products });
  });
});
