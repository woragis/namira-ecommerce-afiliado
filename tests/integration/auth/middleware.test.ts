import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { middleware } from "@/middleware";
import { ADMIN_COOKIE, adminToken } from "@/lib/admin-auth";

describe("middleware /admin auth", () => {
  it("permite /admin/login sem cookie", async () => {
    const res = await middleware(
      new NextRequest("http://localhost/admin/login"),
    );
    expect(res.status).toBe(200);
  });

  it("redireciona /admin/produtos sem cookie quando ADMIN_SECRET definido", async () => {
    const res = await middleware(
      new NextRequest("http://localhost/admin/produtos"),
    );
    expect(res.status).toBe(307);
    const location = res.headers.get("location") ?? "";
    expect(location).toContain("/admin/login");
    expect(location).toContain("next=%2Fadmin%2Fprodutos");
  });

  it("permite /admin com cookie válido", async () => {
    const token = await adminToken();
    expect(token).toBeTruthy();

    const req = new NextRequest("http://localhost/admin");
    req.cookies.set(ADMIN_COOKIE, token!);

    const res = await middleware(req);
    expect(res.headers.get("location")).toBeNull();
  });
});
