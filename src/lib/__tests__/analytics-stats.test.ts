import { describe, expect, it } from "vitest";
import {
  ctrAffiliateClicks,
  ctrDetailViews,
  ctrEndToEnd,
  dailyAverage,
  parsePeriodDays,
  parseProductSort,
  percentChange,
} from "@/lib/analytics-stats";

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
