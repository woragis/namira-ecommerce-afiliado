import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  adminToken,
  isAdminProtectionEnabled,
  resetAdminTokenCache,
  verifyAdminToken,
} from "@/lib/admin-auth";

describe("admin-auth", () => {
  const originalSecret = process.env.ADMIN_SECRET;

  beforeEach(() => {
    resetAdminTokenCache();
    delete process.env.ADMIN_SECRET;
  });

  afterEach(() => {
    resetAdminTokenCache();
    if (originalSecret === undefined) {
      delete process.env.ADMIN_SECRET;
    } else {
      process.env.ADMIN_SECRET = originalSecret;
    }
  });

  it("disables protection when ADMIN_SECRET is missing", async () => {
    expect(isAdminProtectionEnabled()).toBe(false);
    expect(await verifyAdminToken(undefined)).toBe(true);
    expect(await adminToken()).toBeNull();
  });

  it("hashes secret into admin token", async () => {
    process.env.ADMIN_SECRET = "super-secret";
    const t1 = await adminToken();
    const t2 = await adminToken();
    expect(t1).toHaveLength(64);
    expect(t1).toBe(t2);
  });

  it("verifies valid token with timing-safe compare", async () => {
    process.env.ADMIN_SECRET = "super-secret";
    const token = (await adminToken())!;
    expect(await verifyAdminToken(token)).toBe(true);
    expect(await verifyAdminToken("wrong-token")).toBe(false);
  });
});
