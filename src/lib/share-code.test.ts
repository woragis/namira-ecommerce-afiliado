import { describe, expect, it } from "vitest";
import {
  buildProductSharePath,
  generateShareCode,
} from "./share-code";

describe("share-code", () => {
  it("generateShareCode produz 8 caracteres do alfabeto permitido", () => {
    const code = generateShareCode();
    expect(code).toMatch(/^[abcdefghjkmnpqrstuvwxyz23456789]{8}$/);
  });

  it("buildProductSharePath monta rota /p/", () => {
    expect(buildProductSharePath("x7k2m9ab")).toBe("/p/x7k2m9ab");
  });

  it("resolveProductSharePath usa link curto quando shareCode existe", async () => {
    const { resolveProductSharePath } = await import("./share-code");
    expect(
      resolveProductSharePath({ shareCode: "abc12345", slug: "fone-bluetooth" }),
    ).toBe("/p/abc12345");
    expect(
      resolveProductSharePath({ shareCode: null, slug: "fone-bluetooth" }),
    ).toBe("/produtos/fone-bluetooth");
  });
});
