import { describe, expect, it } from "vitest";
import { ctrAffiliateClicks, ctrDetailViews } from "@/lib/analytics-stats";

describe("analytics-stats CTR helpers", () => {
  it("ctrDetailViews calcula percentual", () => {
    expect(ctrDetailViews(100, 25)).toBe("25.0%");
    expect(ctrDetailViews(0, 10)).toBe("—");
  });

  it("ctrAffiliateClicks calcula percentual", () => {
    expect(ctrAffiliateClicks(50, 5)).toBe("10.0%");
    expect(ctrAffiliateClicks(0, 5)).toBe("—");
  });
});
