import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createHash } from "node:crypto";
import {
  adminToken,
  isAdminProtectionEnabled,
  verifyAdminToken,
} from "@/lib/admin-auth";

describe("admin-auth", () => {
  const originalSecret = process.env.ADMIN_SECRET;

  beforeEach(() => {
    delete process.env.ADMIN_SECRET;
  });

  afterEach(() => {
    if (originalSecret === undefined) {
      delete process.env.ADMIN_SECRET;
    } else {
      process.env.ADMIN_SECRET = originalSecret;
    }
  });

  it("disables protection when ADMIN_SECRET is missing", () => {
    expect(isAdminProtectionEnabled()).toBe(false);
    expect(verifyAdminToken(undefined)).toBe(true);
    expect(adminToken()).toBeNull();
  });

  it("hashes secret into admin token", () => {
    process.env.ADMIN_SECRET = "super-secret";
    const expected = createHash("sha256").update("super-secret").digest("hex");
    expect(adminToken()).toBe(expected);
  });

  it("verifies valid token with timing-safe compare", () => {
    process.env.ADMIN_SECRET = "super-secret";
    const token = adminToken()!;
    expect(verifyAdminToken(token)).toBe(true);
    expect(verifyAdminToken("wrong-token")).toBe(false);
  });
});
