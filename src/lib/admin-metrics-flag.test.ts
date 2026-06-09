import { afterEach, describe, expect, it } from "vitest";
import { isAdminMetricsEnabled } from "./admin-metrics-flag";

describe("admin-metrics-flag", () => {
  const original = process.env.ADMIN_METRICS_ENABLED;

  afterEach(() => {
    if (original === undefined) {
      delete process.env.ADMIN_METRICS_ENABLED;
    } else {
      process.env.ADMIN_METRICS_ENABLED = original;
    }
  });

  it("desligado por padrão", () => {
    delete process.env.ADMIN_METRICS_ENABLED;
    expect(isAdminMetricsEnabled()).toBe(false);
  });

  it("ligado apenas com true explícito", () => {
    process.env.ADMIN_METRICS_ENABLED = "true";
    expect(isAdminMetricsEnabled()).toBe(true);

    process.env.ADMIN_METRICS_ENABLED = "1";
    expect(isAdminMetricsEnabled()).toBe(false);
  });
});
