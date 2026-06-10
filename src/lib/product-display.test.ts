import { describe, expect, it } from "vitest";
import {
  displayProductDescription,
  displayProductTitle,
} from "./product-display";

describe("displayProductTitle", () => {
  it("deduplica frase repetida com espaço", () => {
    const unit = "Frigideira 3 Peças Inox Antiaderente";
    expect(displayProductTitle(`${unit} ${unit} ${unit}`)).toBe(unit);
  });

  it("deduplica frase colada sem espaço", () => {
    const unit = "Frigideira 3 Peças Inox";
    expect(displayProductTitle(`${unit}${unit}`)).toBe(unit);
  });

  it("remove sufixo de marketplace", () => {
    expect(displayProductTitle("Kit Panelas Novo | +5 vendidos")).toBe("Kit Panelas");
  });

  it("trunca títulos longos", () => {
    const long = "A".repeat(200);
    expect(displayProductTitle(long).length).toBeLessThanOrEqual(140);
    expect(displayProductTitle(long).endsWith("…")).toBe(true);
  });
});

describe("displayProductDescription", () => {
  it("retorna null se descrição igual ao título", () => {
    const t = "Produto X";
    expect(displayProductDescription(t, t)).toBeNull();
  });

  it("retorna descrição quando diferente", () => {
    expect(
      displayProductDescription("Detalhes do item.", "Produto X"),
    ).toBe("Detalhes do item.");
  });
});
