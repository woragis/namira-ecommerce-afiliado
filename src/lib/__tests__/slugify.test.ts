import { describe, expect, it } from "vitest";
import { slugify } from "@/lib/slugify";

describe("slugify", () => {
  it("lowercases and replaces spaces", () => {
    expect(slugify("Produto Legal")).toBe("produto-legal");
  });

  it("removes accents", () => {
    expect(slugify("Creme Hidratante Açúcar")).toBe(
      "creme-hidratante-acucar",
    );
  });

  it("strips special characters", () => {
    expect(slugify("  Hello!!! World??  ")).toBe("hello-world");
  });

  it("handles empty result", () => {
    expect(slugify("---")).toBe("");
  });
});
