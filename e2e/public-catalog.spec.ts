import { test, expect } from "@playwright/test";

test.describe("Catálogo público", () => {
  test("home carrega hero e produtos do seed", async ({ page }) => {
    await page.goto("/");

    await expect(
      page.getByRole("heading", { name: /Achados que viralizam/i }),
    ).toBeVisible();

    await expect(page.getByRole("heading", { name: /Destaques/i })).toBeVisible();
    await expect(
      page.getByText(/Purificador de ar|Mini projetor|Organizador de maquiagem/i).first(),
    ).toBeVisible();
    await expect(
      page.locator("section a[href='/produtos?loja=shopee']").first(),
    ).toBeVisible();
  });

  test("listagem /produtos exibe produtos publicados", async ({ page }) => {
    await page.goto("/produtos");

    await expect(page.getByRole("heading", { name: /Todos os achados/i })).toBeVisible();
    const cards = page.locator('a[href^="/produtos/"]');
    await expect(cards.first()).toBeVisible();
    expect(await cards.count()).toBeGreaterThan(0);
  });

  test("filtro por loja shopee funciona na URL", async ({ page }) => {
    await page.goto("/produtos?loja=shopee");

    await expect(page).toHaveURL(/loja=shopee/);
    await expect(page.getByRole("heading", { name: /^Shopee$/ })).toBeVisible();
    await expect(page.locator("article").first()).toBeVisible();
  });

  test("chips de loja e tag são independentes", async ({ page }) => {
    await page.goto("/produtos?loja=shopee&tag=casa");

    await expect(page.getByRole("heading", { name: /Shopee · Casa/ })).toBeVisible();
    await page.getByRole("link", { name: /Remover filtro Shopee/ }).click();
    await expect(page).not.toHaveURL(/loja=/);
    await expect(page).toHaveURL(/tag=casa/);
    await expect(page.getByRole("heading", { name: /^Casa$/ })).toBeVisible();
  });

  test("limpar preço preserva loja e tag", async ({ page }) => {
    await page.goto("/produtos?loja=shopee&tag=casa&preco_min=10&preco_max=200");
    await page.getByRole("link", { name: "Limpar preço" }).click();
    await expect(page).toHaveURL(/loja=shopee/);
    await expect(page).toHaveURL(/tag=casa/);
    await expect(page).not.toHaveURL(/preco_/);
  });

  test("mobile mostra favoritos, esconde Ver lojas e gruda CTA no PDP", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/produtos");

    await expect(page.getByRole("link", { name: "Favoritos" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Ver lojas" })).toBeHidden();

    await page.locator('a[href^="/produtos/"]').first().click();
    await expect(page).toHaveURL(/\/produtos\/[^/?]+/);
    await expect(page.locator("div.fixed.bottom-0 a", { hasText: /Comprar na/ })).toBeVisible();
  });

  test("tabs de loja e tag mostram produtos", async ({ page }) => {
    await page.goto("/produtos");
    await expect(page.locator("article").first()).toBeVisible();

    await page.locator('nav a[href*="loja=shopee"]').first().click();
    await expect(page).toHaveURL(/loja=shopee/);
    await expect(page.locator("article").first()).toBeVisible();

    await page.locator("nav").getByRole("link", { name: "Todos", exact: true }).click();
    await expect(page).not.toHaveURL(/loja=/);

    await page.locator('nav a[href*="tag=casa"]').first().click();
    await expect(page).toHaveURL(/tag=casa/);
    await expect(page.locator("article").first()).toBeVisible();

    await page.locator("nav").getByRole("link", { name: "Todas", exact: true }).click();
    await expect(page).not.toHaveURL(/tag=/);
    await expect(page.locator("article").first()).toBeVisible();
  });

  test("página de produto exibe título e link de compra", async ({ page }) => {
    await page.goto("/produtos");

    const firstProduct = page.locator('a[href^="/produtos/"]').first();
    const href = await firstProduct.getAttribute("href");
    expect(href).toBeTruthy();

    await firstProduct.click();
    await expect(page).toHaveURL(/\/produtos\/.+/);

    await expect(
      page.getByRole("link", { name: /Comprar na/i }).first(),
    ).toBeVisible();
  });

  test("favoritos resolve produtos via API", async ({ page }) => {
    await page.goto("/produtos");
    const href = await page.locator('a[href^="/produtos/"]').first().getAttribute("href");
    expect(href).toBeTruthy();

    await page.goto(href!);
    const productUrl = page.url();

    const apiRes = await page.request.post("/api/favorites/resolve", {
      data: { ids: ["00000000-0000-4000-8000-000000000001"] },
    });
    expect(apiRes.ok()).toBeTruthy();
    const body = await apiRes.json();
    expect(body).toHaveProperty("products");
    expect(Array.isArray(body.products)).toBe(true);

    await page.goto("/favoritos");
    await expect(page.getByRole("heading", { name: /Favoritos/i })).toBeVisible();

    await page.evaluate(() => {
      localStorage.setItem("namira_favorites", "[]");
    });
    await page.reload();
    await expect(page.getByText(/Nenhum favorito/i)).toBeVisible();

    void productUrl;
  });
});
