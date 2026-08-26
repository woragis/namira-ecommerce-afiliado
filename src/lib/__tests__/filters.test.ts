import { describe, expect, it } from "vitest";
import {
  catalogHref,
  catalogQueryString,
  catalogTitle,
  parseCatalogSearchParams,
  priceChipLabel,
} from "@/lib/filters";

describe("parseCatalogSearchParams", () => {
  it("parses store, tag and search", () => {
    expect(
      parseCatalogSearchParams({
        loja: "shopee",
        tag: "beleza",
        q: "creme",
      }),
    ).toMatchObject({
      storeSlug: "shopee",
      tagSlug: "beleza",
      search: "creme",
      sort: "recentes",
      page: 1,
      limit: 24,
    });
  });

  it("uses tag over categoria/badge aliases", () => {
    expect(
      parseCatalogSearchParams({
        tag: "tech",
        categoria: "beleza",
        badge: "viral",
      }).tagSlug,
    ).toBe("tech");
  });

  it("falls back categoria then badge to tagSlug", () => {
    expect(parseCatalogSearchParams({ categoria: "beleza" }).tagSlug).toBe(
      "beleza",
    );
    expect(parseCatalogSearchParams({ badge: "viral" }).tagSlug).toBe("viral");
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
      catalogQueryString({ loja: "shopee", tag: undefined, q: "x" }),
    ).toBe("?loja=shopee&q=x");
  });

  it("returns empty string when no params", () => {
    expect(catalogQueryString({})).toBe("");
  });
});

describe("catalogHref", () => {
  it("builds canonical /produtos URL", () => {
    expect(
      catalogHref({ storeSlug: "shopee", tagSlug: "tech", search: "projetor" }),
    ).toBe("/produtos?loja=shopee&tag=tech&q=projetor");
  });

  it("omits empty filters", () => {
    expect(catalogHref({ storeSlug: null, tagSlug: null, search: null })).toBe(
      "/produtos",
    );
  });
});

describe("catalogTitle", () => {
  it("defaults to Todos os achados", () => {
    expect(catalogTitle({})).toBe("Todos os achados");
  });

  it("joins store and tag names", () => {
    expect(catalogTitle({ storeName: "Shopee", tagName: "Casa" })).toBe(
      "Shopee · Casa",
    );
  });

  it("prefers search over store/tag", () => {
    expect(
      catalogTitle({
        search: "projetor",
        storeName: "Shopee",
        tagName: "Tech",
      }),
    ).toBe("Resultados para “projetor”");
  });
});

describe("priceChipLabel", () => {
  it("formats min, max and range", () => {
    expect(priceChipLabel(10, undefined)).toBe("A partir de R$ 10");
    expect(priceChipLabel(undefined, 99)).toBe("Até R$ 99");
    expect(priceChipLabel(10, 50)).toBe("R$ 10–50");
  });
});
