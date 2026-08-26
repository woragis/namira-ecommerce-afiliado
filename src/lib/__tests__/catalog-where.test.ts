import { describe, expect, it } from "vitest";
import { buildProductWhere } from "@/lib/catalog";

describe("buildProductWhere", () => {
  it("always requires published products", () => {
    expect(buildProductWhere({})).toEqual({
      AND: [{ isPublished: true }],
    });
  });

  it("filters by store and tag together", () => {
    const where = buildProductWhere({
      storeSlug: "shopee",
      tagSlug: "tech",
    });
    expect(where.AND).toEqual(
      expect.arrayContaining([
        { isPublished: true },
        { store: { slug: "shopee", isActive: true } },
        {
          categories: {
            some: { category: { slug: "tech", isActive: true } },
          },
        },
      ]),
    );
  });

  it("searches title, description, store name and tag name", () => {
    const where = buildProductWhere({ search: "Shopee" });
    const and = where.AND as object[];
    const searchClause = and.find(
      (clause) => clause && typeof clause === "object" && "OR" in clause,
    ) as { OR: object[] };
    expect(searchClause.OR).toEqual(
      expect.arrayContaining([
        { title: { contains: "Shopee", mode: "insensitive" } },
        { description: { contains: "Shopee", mode: "insensitive" } },
        { store: { name: { contains: "Shopee", mode: "insensitive" } } },
        {
          categories: {
            some: {
              category: { name: { contains: "Shopee", mode: "insensitive" } },
            },
          },
        },
      ]),
    );
  });
});
