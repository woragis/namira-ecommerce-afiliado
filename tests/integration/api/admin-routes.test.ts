import { PrismaClient } from "@prisma/client";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { GET as exportProducts } from "@/app/api/admin/export/products/route";
import { GET as exportClicks } from "@/app/api/admin/export/cliques/route";
import { POST as upload } from "@/app/api/admin/upload/route";
import { prisma } from "@/lib/db";
import { parseCsv } from "@/lib/csv";
import {
  adminNextRequest,
  authedAdminRequest,
} from "../../helpers/http";

const dbAvailable = Boolean(process.env.DATABASE_URL?.trim());

async function canConnect(): Promise<boolean> {
  if (!dbAvailable) return false;
  const client = new PrismaClient();
  try {
    await client.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  } finally {
    await client.$disconnect();
  }
}

describe.skipIf(!dbAvailable)("APIs admin (integração)", () => {
  let connected = false;

  beforeAll(async () => {
    connected = await canConnect();
  });

  it("export/products exige cookie quando ADMIN_SECRET está definido", async () => {
    if (!connected) return;
    const res = await exportProducts(
      await adminNextRequest("http://localhost/api/admin/export/products"),
    );
    expect(res.status).toBe(401);
  });

  it("export/products retorna CSV com cookie válido", async () => {
    if (!connected) return;
    const res = await exportProducts(
      await authedAdminRequest("http://localhost/api/admin/export/products"),
    );
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toContain("text/csv");
    const csv = await res.text();
    const rows = parseCsv(csv);
    expect(rows[0]).toContain("title");
    expect(rows.length).toBeGreaterThan(1);

    const count = await prisma.product.count();
    expect(rows.length - 1).toBe(count);
  });

  it("export/cliques retorna cabeçalho correto", async () => {
    if (!connected) return;
    const res = await exportClicks(
      await authedAdminRequest("http://localhost/api/admin/export/cliques?days=7"),
    );
    expect(res.status).toBe(200);
    const rows = parseCsv(await res.text());
    expect(rows[0]).toEqual([
      "clicked_at",
      "product_title",
      "product_slug",
      "store",
      "referrer_path",
    ]);
  });

  it("upload rejeita sem arquivo", async () => {
    if (!connected) return;
    const fd = new FormData();
    fd.set("bucket", "productImages");
    const res = await upload(
      await authedAdminRequest("http://localhost/api/admin/upload", {
        method: "POST",
        body: fd,
      }),
    );
    expect(res.status).toBe(400);
    expect(await res.json()).toMatchObject({ error: "Arquivo obrigatório" });
  });

  it("upload rejeita bucket inválido", async () => {
    if (!connected) return;
    const fd = new FormData();
    fd.set("bucket", "invalid");
    fd.set("file", new File(["x"], "x.png", { type: "image/png" }));
    const res = await upload(
      await authedAdminRequest("http://localhost/api/admin/upload", {
        method: "POST",
        body: fd,
      }),
    );
    expect(res.status).toBe(400);
    expect(await res.json()).toMatchObject({ error: "Bucket inválido" });
  });

  it("upload sem Supabase retorna erro configurável", async () => {
    if (!connected) return;
    const fd = new FormData();
    fd.set("bucket", "productImages");
    fd.set("file", new File(["fake"], "photo.png", { type: "image/png" }));
    const res = await upload(
      await authedAdminRequest("http://localhost/api/admin/upload", {
        method: "POST",
        body: fd,
      }),
    );
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/Supabase|não configurado/i);
  });
});
