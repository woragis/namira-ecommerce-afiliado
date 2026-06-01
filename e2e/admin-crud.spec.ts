import { test, expect, type Page } from "@playwright/test";

const ADMIN_SECRET = process.env.ADMIN_SECRET ?? "dev-admin-secret";
const testTitle = `E2E Produto ${Date.now()}`;

async function loginAdmin(page: Page) {
  await page.goto("/admin/login");
  await page.locator('input[name="secret"]').fill(ADMIN_SECRET);
  await page.getByRole("button", { name: /Entrar/i }).click();
  await page.waitForURL((url) => !url.pathname.includes("/admin/login"));
}

test.describe.configure({ mode: "serial" });

test.describe("Admin CRUD", () => {
  test("login incorreto exibe erro", async ({ page }) => {
    await page.goto("/admin/login");
    await page.locator('input[name="secret"]').fill("senha-errada");
    await page.getByRole("button", { name: /Entrar/i }).click();
    await expect(page).toHaveURL(/error=1/);
    await expect(page.getByText(/Senha incorreta/i)).toBeVisible();
  });

  test("login correto acessa painel e lista produtos", async ({ page }) => {
    await loginAdmin(page);
    await page.goto("/admin/produtos");
    await expect(page.getByRole("heading", { name: /^Produtos$/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Novo produto/i })).toBeVisible();
  });

  test("criar produto publicado aparece no catálogo público", async ({ page }) => {
    await loginAdmin(page);
    await page.goto("/admin/produtos/novo");

    await page.locator('input[name="title"]').fill(testTitle);
    await page.locator('input[name="affiliateUrl"]').fill("https://example.com/e2e-offer");
    await page.locator('input[name="priceCurrent"]').fill("19.99");
    await page.locator('input[name="isPublished"]').check();

    await page.getByRole("button", { name: /^Salvar$/i }).click();
    await expect(page).toHaveURL(/\/admin\/produtos/, { timeout: 15_000 });
    await expect(page.getByText(testTitle)).toBeVisible();

    await page.goto(`/busca?q=${encodeURIComponent(testTitle)}`);
    await expect(page.locator("h3", { hasText: testTitle })).toBeVisible({
      timeout: 15_000,
    });
  });

  test("toggle publicar oculta produto do catálogo", async ({ page }) => {
    await loginAdmin(page);
    await page.goto("/admin/produtos");
    const row = page.getByRole("row").filter({ hasText: testTitle });
    await expect(row).toBeVisible({ timeout: 15_000 });

    await row.locator("td").nth(4).getByRole("button").click();
    await page.waitForTimeout(1000);

    await page.goto(`/busca?q=${encodeURIComponent(testTitle)}`);
    await expect(page.locator("h3", { hasText: testTitle })).not.toBeVisible({
      timeout: 10_000,
    });

    await page.goto("/admin/produtos");
    const row2 = page.getByRole("row").filter({ hasText: testTitle });
    await row2.locator("td").nth(4).getByRole("button").click();
  });

  test("export CSV requer auth e retorna arquivo", async ({ page, request }) => {
    const unauth = await request.get("/api/admin/export/products");
    expect(unauth.status()).toBe(401);

    await loginAdmin(page);

    const cookies = await page.context().cookies();
    const cookieHeader = cookies.map((c) => `${c.name}=${c.value}`).join("; ");

    const authed = await request.get("/api/admin/export/products", {
      headers: { cookie: cookieHeader },
    });
    expect(authed.status()).toBe(200);
    expect(authed.headers()["content-type"]).toContain("text/csv");
    const csv = await authed.text();
    expect(csv).toContain("title");
  });
});
