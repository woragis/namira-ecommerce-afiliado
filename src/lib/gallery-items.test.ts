import { describe, expect, it } from "vitest";
import { buildGalleryItems } from "./gallery-items";

describe("buildGalleryItems", () => {
  it("usa mídia válida quando existir", () => {
    const items = buildGalleryItems(
      [{ type: "IMAGE", url: "https://cdn.example.com/a.jpg" }],
      null,
      "Produto",
    );
    expect(items).toHaveLength(1);
    expect(items[0]).toEqual({
      type: "IMAGE",
      url: "https://cdn.example.com/a.jpg",
      alt: "Produto",
    });
  });

  it("cai no imageUrl legado quando mídia vazia", () => {
    const items = buildGalleryItems([], "https://cdn.example.com/legacy.jpg", "Legado");
    expect(items[0]?.url).toBe("https://cdn.example.com/legacy.jpg");
  });

  it("ignora URLs inválidas", () => {
    expect(buildGalleryItems([{ type: "IMAGE", url: "not-a-url" }], null, "X")).toEqual([]);
  });
});
