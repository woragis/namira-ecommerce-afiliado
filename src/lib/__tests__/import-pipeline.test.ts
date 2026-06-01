import { describe, expect, it } from "vitest";
import { parseCsv, rowsToObjects } from "@/lib/csv";
import { slugify } from "@/lib/slugify";

/** Validação da cadeia CSV usada na importação admin (sem banco). */
describe("CSV import pipeline", () => {
  it("normalizes headers and required fields from sample row", () => {
    const csv = [
      "title,affiliate_url,store_slug,price_current,categories",
      "Fone XYZ,https://aff.example/fone,shopee,49.90,eletronicos|beleza",
    ].join("\n");

    const rows = rowsToObjects(parseCsv(csv));
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      title: "Fone XYZ",
      affiliate_url: "https://aff.example/fone",
      store_slug: "shopee",
      price_current: "49.90",
      categories: "eletronicos|beleza",
    });
    expect(slugify(rows[0].title)).toBe("fone-xyz");
  });

  it("supports Portuguese column aliases", () => {
    const csv = "titulo,link,loja,preco\nItem,https://x,y,10";
    const [row] = rowsToObjects(parseCsv(csv));
    expect(row.titulo).toBe("Item");
    expect(row.link).toBe("https://x");
    expect(row.loja).toBe("y");
    expect(row.preco).toBe("10");
  });
});
