import { describe, expect, it, vi } from "vitest";
import { daysAgo } from "@/lib/dates";

describe("daysAgo", () => {
  it("subtracts days from reference timestamp", () => {
    const now = Date.UTC(2026, 5, 1, 12, 0, 0);
    expect(daysAgo(7, now).toISOString()).toBe(
      new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString(),
    );
  });

  it("uses current time by default", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-01T00:00:00Z"));
    expect(daysAgo(1).toISOString()).toBe("2026-05-31T00:00:00.000Z");
    vi.useRealTimers();
  });
});
