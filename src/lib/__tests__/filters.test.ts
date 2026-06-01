import { describe, expect, it } from "vitest";
import { catalogQueryString, parseCatalogSearchParams } from "@/lib/filters";

describe("parseCatalogSearchParams", () => {
  it("parses store, category, badge and search", () => {
    expect(
      parseCatalogSearchParams({
        loja: "shopee",
        categoria: "beleza",
        badge: "promo",
        q: "creme",
      }),
    ).toMatchObject({
      storeSlug: "shopee",
      categorySlug: "beleza",
      badgeSlug: "promo",
      search: "creme",
      sort: "recentes",
      page: 1,
      limit: 24,
    });
  });

  it("accepts valid sort values", () => {
    expect(parseCatalogSearchParams({ ordenar: "preco-asc" }).sort).toBe(
      "preco-asc",
    );
    expect(parseCatalogSearchParams({ ordenar: "invalid" }).sort).toBe(
      "recentes",
    );
  });

  it("parses Brazilian decimal prices", () => {
    expect(
      parseCatalogSearchParams({ preco_min: "10,50", preco_max: "99,99" }),
    ).toMatchObject({ priceMin: 10.5, priceMax: 99.99 });
  });

  it("ignores invalid prices and page", () => {
    expect(
      parseCatalogSearchParams({ preco_min: "abc", page: "0" }),
    ).toMatchObject({
      priceMin: undefined,
      page: 1,
    });
  });

  it("ignores array param values", () => {
    expect(parseCatalogSearchParams({ loja: ["a", "b"] }).storeSlug).toBeUndefined();
  });
});

describe("catalogQueryString", () => {
  it("builds query string with active filters", () => {
    expect(
      catalogQueryString({ loja: "shopee", categoria: undefined, q: "x" }),
    ).toBe("?loja=shopee&q=x");
  });

  it("returns empty string when no params", () => {
    expect(catalogQueryString({})).toBe("");
  });
});
