import { describe, expect, it } from "vitest";
import {
  ctrAffiliateClicks,
  ctrDetailViews,
  ctrEndToEnd,
  dailyAverage,
  filterProductsWithoutClicks,
  paginateProductMetricRows,
  parsePeriodDays,
  parseProductSort,
  percentChange,
  type ProductMetricRow,
} from "@/lib/analytics-stats";

const sampleRows: ProductMetricRow[] = [
  {
    productId: "1",
    title: "A",
    slug: "a",
    storeName: "Loja",
    storeId: "s1",
    impressions: 100,
    views: 10,
    clicks: 5,
  },
  {
    productId: "2",
    title: "B",
    slug: "b",
    storeName: "Loja",
    storeId: "s1",
    impressions: 50,
    views: 20,
    clicks: 0,
  },
  {
    productId: "3",
    title: "C",
    slug: "c",
    storeName: "Loja",
    storeId: "s1",
    impressions: 200,
    views: 5,
    clicks: 1,
  },
];

describe("analytics-stats period helpers", () => {
  it("parseProductSort e dailyAverage", () => {
    expect(parseProductSort("pdp")).toBe("pdp");
    expect(parseProductSort("x")).toBe("cliques");
    expect(dailyAverage(90, 30)).toBe("3.0");
    expect(dailyAverage(5, 7)).toBe("0.7");
  });

  it("parsePeriodDays aceita 7, 30 e 90", () => {
    expect(parsePeriodDays(undefined)).toBe(7);
    expect(parsePeriodDays("30")).toBe(30);
    expect(parsePeriodDays("90")).toBe(90);
    expect(parsePeriodDays("14")).toBe(7);
  });

  it("percentChange calcula variação", () => {
    expect(percentChange(110, 100)).toBe(10);
    expect(percentChange(0, 0)).toBe(null);
    expect(percentChange(5, 0)).toBe(100);
  });
});

describe("analytics-stats CTR helpers", () => {
  it("ctrDetailViews calcula percentual", () => {
    expect(ctrDetailViews(100, 25)).toBe("25.0%");
    expect(ctrDetailViews(0, 10)).toBe("—");
  });

  it("ctrAffiliateClicks calcula percentual", () => {
    expect(ctrAffiliateClicks(50, 5)).toBe("10.0%");
    expect(ctrAffiliateClicks(0, 5)).toBe("—");
  });

  it("ctrEndToEnd calcula percentual", () => {
    expect(ctrEndToEnd(1000, 25)).toBe("2.50%");
  });
});

describe("analytics-stats product table helpers", () => {
  it("paginateProductMetricRows ordena e pagina", () => {
    const page1 = paginateProductMetricRows(sampleRows, "cliques", 1, 2);
    expect(page1.total).toBe(3);
    expect(page1.totalPages).toBe(2);
    expect(page1.rows.map((r) => r.slug)).toEqual(["a", "c"]);

    const page2 = paginateProductMetricRows(sampleRows, "cliques", 2, 2);
    expect(page2.rows.map((r) => r.slug)).toEqual(["b"]);
  });

  it("filterProductsWithoutClicks retorna produtos com impressões e zero cliques", () => {
    const stale = filterProductsWithoutClicks(sampleRows, 20, 5);
    expect(stale.map((r) => r.slug)).toEqual(["b"]);
  });
});
