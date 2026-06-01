import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("whatsapp helpers", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
  });

  it("builds share URL with phone digits only", async () => {
    const { buildWhatsAppUrl } = await import("@/lib/whatsapp");
    expect(buildWhatsAppUrl("Olá", "+55 (11) 99999-0000")).toBe(
      "https://wa.me/5511999990000?text=Ol%C3%A1",
    );
  });

  it("builds generic wa.me link without phone", async () => {
    const { buildWhatsAppUrl } = await import("@/lib/whatsapp");
    expect(buildWhatsAppUrl("Teste")).toBe("https://wa.me/?text=Teste");
  });

  it("builds product share message with site URL", async () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://namira.example/";
    const { buildProductShareMessage, buildProductShareUrl } = await import(
      "@/lib/whatsapp"
    );

    const message = buildProductShareMessage(
      "Fone Bluetooth",
      "/produtos/fone-bluetooth",
    );
    expect(message).toContain("Fone Bluetooth");
    expect(message).toContain("https://namira.example/produtos/fone-bluetooth");

    expect(buildProductShareUrl("Fone", "produtos/fone")).toContain(
      encodeURIComponent("https://namira.example/produtos/fone"),
    );
  });
});
