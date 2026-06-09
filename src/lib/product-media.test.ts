import { describe, expect, it } from "vitest";
import {
  legacyMediaPayload,
  parseMediaPayload,
  payloadToCreateRows,
  primaryImageFromPayload,
} from "./product-media";

describe("product-media", () => {
  it("parseMediaPayload retorna vazio para JSON inválido", () => {
    expect(parseMediaPayload("")).toEqual({ images: [], video: null });
    expect(parseMediaPayload("{bad")).toEqual({ images: [], video: null });
  });

  it("parseMediaPayload separa imagens e vídeo", () => {
    const payload = parseMediaPayload(
      JSON.stringify({
        images: [
          { type: "IMAGE", url: "https://cdn/a.jpg", storagePath: "a.jpg" },
          { type: "IMAGE", url: "https://cdn/b.jpg" },
        ],
        video: { type: "VIDEO", url: "https://cdn/v.mp4" },
      }),
    );
    expect(payload.images).toHaveLength(2);
    expect(payload.video?.url).toBe("https://cdn/v.mp4");
  });

  it("primaryImageFromPayload usa primeira imagem", () => {
    const primary = primaryImageFromPayload(
      parseMediaPayload(
        JSON.stringify({
          images: [{ type: "IMAGE", url: "https://cdn/a.jpg", storagePath: "a.jpg" }],
          video: { type: "VIDEO", url: "https://cdn/v.mp4" },
        }),
      ),
    );
    expect(primary).toEqual({
      imageUrl: "https://cdn/a.jpg",
      imageStoragePath: "a.jpg",
    });
  });

  it("legacyMediaPayload migra imageUrl antigo", () => {
    expect(legacyMediaPayload("https://cdn/old.jpg", "old.jpg")).toEqual({
      images: [{ type: "IMAGE", url: "https://cdn/old.jpg", storagePath: "old.jpg" }],
      video: null,
    });
  });

  it("payloadToCreateRows ordena imagens antes do vídeo", () => {
    const rows = payloadToCreateRows({
      images: [
        { type: "IMAGE", url: "https://cdn/a.jpg" },
        { type: "IMAGE", url: "https://cdn/b.jpg" },
      ],
      video: { type: "VIDEO", url: "https://cdn/v.mp4" },
    });
    expect(rows.map((r) => r.type)).toEqual(["IMAGE", "IMAGE", "VIDEO"]);
    expect(rows[2].sortOrder).toBe(2);
  });
});
