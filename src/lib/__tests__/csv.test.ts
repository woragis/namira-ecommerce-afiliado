import { describe, expect, it } from "vitest";
import { parseCsv, rowsToObjects, toCsv } from "@/lib/csv";

describe("parseCsv", () => {
  it("parses simple rows", () => {
    expect(parseCsv("a,b,c\n1,2,3")).toEqual([
      ["a", "b", "c"],
      ["1", "2", "3"],
    ]);
  });

  it("handles quoted fields with commas", () => {
    expect(parseCsv('title,desc\n"Hello, world",plain')).toEqual([
      ["title", "desc"],
      ["Hello, world", "plain"],
    ]);
  });

  it("escapes doubled quotes inside quoted fields", () => {
    expect(parseCsv('x\n"a ""quoted"" word"')).toEqual([
      ["x"],
      ['a "quoted" word'],
    ]);
  });

  it("handles CRLF line endings", () => {
    expect(parseCsv("a,b\r\n1,2")).toEqual([
      ["a", "b"],
      ["1", "2"],
    ]);
  });

  it("ignores trailing empty lines", () => {
    expect(parseCsv("a\n1\n\n")).toEqual([["a"], ["1"]]);
  });
});

describe("rowsToObjects", () => {
  it("maps header row to object keys", () => {
    const rows = [
      ["Title", "Store Slug"],
      ["Produto A", "shopee"],
    ];
    expect(rowsToObjects(rows)).toEqual([
      { title: "Produto A", store_slug: "shopee" },
    ]);
  });

  it("returns empty array when only header exists", () => {
    expect(rowsToObjects([["a", "b"]])).toEqual([]);
  });
});

describe("toCsv", () => {
  it("escapes fields with commas and quotes", () => {
    const csv = toCsv(["title"], [['Say "hi", friend']]);
    expect(csv).toBe('title\n"Say ""hi"", friend"');
  });

  it("round-trips through parseCsv", () => {
    const headers = ["title", "price"];
    const data = [["Produto", "19,90"], ["Outro", "10"]];
    const parsed = parseCsv(toCsv(headers, data));
    expect(parsed).toEqual([headers, ...data]);
  });
});
