import { describe, expect, it } from "vitest";
import { filtersToSearchParams } from "@/lib/catalog-params";
import type { CatalogFilters } from "@/lib/catalog";

const base: CatalogFilters = {
  sort: "recentes",
  page: 2,
  limit: 24,
};

describe("filtersToSearchParams", () => {
  it("maps filters to URL params without page by default", () => {
    expect(
      filtersToSearchParams({
        ...base,
        storeSlug: "amazon",
        categorySlug: "tech",
        search: "fone",
        priceMin: 50,
        priceMax: 200,
        sort: "preco-desc",
      }),
    ).toEqual({
      loja: "amazon",
      categoria: "tech",
      q: "fone",
      ordenar: "preco-desc",
    });
  });

  it("includes price filters when not omitted", () => {
    expect(
      filtersToSearchParams(
        { ...base, priceMin: 10, priceMax: 99 },
        ["page"],
      ),
    ).toEqual({
      preco_min: "10",
      preco_max: "99",
    });
  });
});
