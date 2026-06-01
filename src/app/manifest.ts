import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "NaMira Achados",
    short_name: "NaMira",
    description:
      "Curadoria de produtos virais com links de afiliado — Shopee, Mercado Livre, Amazon.",
    start_url: "/",
    display: "standalone",
    background_color: "#fafaf8",
    theme_color: "#534ab7",
    lang: "pt-BR",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
