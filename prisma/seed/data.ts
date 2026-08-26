import { BadgeStyle, CategoryKind, CollectionType } from "@prisma/client";

/** Slugs de produtos de demonstração — nunca conflitam com catálogo real se usar slugs próprios. */
export const DEMO_PRODUCT_SLUGS = [
  "purificador-ar-difusor-led",
  "massageador-pescoco-infravermelho",
  "mini-projetor-portatil-hd",
  "organizador-maquiagem-giratorio",
  "tapete-yoga-antiderrapante",
  "vela-perfumada-soja",
  "fone-bluetooth-tws",
  "vestido-linho-verao",
  "kit-skincare-vitamina-c",
  "smartwatch-esportivo",
  "jogo-lencol-algodao",
  "jaqueta-corta-vento",
  "elastico-resistencia-kit",
  "bolsa-crossbody-couro",
] as const;

export const STORE_DEFS = [
  {
    slug: "shopee",
    create: {
      slug: "shopee",
      name: "Shopee",
      shortLabel: "S",
      colorPrimary: "#EE4D2D",
      colorSecondary: "#FFF0ED",
      colorOnPrimary: "#ffffff",
      sortOrder: 1,
    },
    upgrade: {
      name: "Shopee",
      shortLabel: "S",
      colorPrimary: "#EE4D2D",
      colorSecondary: "#FFF0ED",
      colorOnPrimary: "#ffffff",
      sortOrder: 1,
    },
  },
  {
    slug: "mercado-livre",
    create: {
      slug: "mercado-livre",
      name: "Mercado Livre",
      shortLabel: "ML",
      colorPrimary: "#FFE600",
      colorSecondary: "#FFFBE6",
      colorOnPrimary: "#333333",
      sortOrder: 2,
    },
    upgrade: {
      name: "Mercado Livre",
      shortLabel: "ML",
      colorPrimary: "#FFE600",
      colorSecondary: "#FFFBE6",
      colorOnPrimary: "#333333",
      sortOrder: 2,
    },
  },
  {
    slug: "amazon",
    create: {
      slug: "amazon",
      name: "Amazon",
      shortLabel: "A",
      colorPrimary: "#FF9900",
      colorSecondary: "#FFF4E5",
      colorOnPrimary: "#ffffff",
      sortOrder: 3,
    },
    upgrade: {
      name: "Amazon",
      shortLabel: "A",
      colorPrimary: "#FF9900",
      colorSecondary: "#FFF4E5",
      colorOnPrimary: "#ffffff",
      sortOrder: 3,
    },
  },
] as const;

export const LEGACY_CATEGORY_SLUGS = [
  "viral-agora",
  "ofertas",
  "novidades",
] as const;

export const LEGACY_CATEGORY_TO_PROMO: Record<string, string> = {
  "viral-agora": "viral",
  ofertas: "oferta",
  novidades: "novo",
};

export const CATEGORY_DEFS = [
  {
    slug: "viral",
    name: "Viral",
    icon: "🔥",
    sortOrder: 1,
    kind: CategoryKind.PROMO,
    style: BadgeStyle.VIRAL,
    showInNav: true,
    isActive: true,
  },
  {
    slug: "oferta",
    name: "Oferta",
    icon: "⚡",
    sortOrder: 2,
    kind: CategoryKind.PROMO,
    style: BadgeStyle.OFF,
    showInNav: true,
    isActive: true,
  },
  {
    slug: "novo",
    name: "Novo",
    icon: "✨",
    sortOrder: 3,
    kind: CategoryKind.PROMO,
    style: BadgeStyle.NOVO,
    showInNav: true,
    isActive: true,
  },
  {
    slug: "casa",
    name: "Casa",
    icon: "🏠",
    sortOrder: 4,
    kind: CategoryKind.DEPARTMENT,
    style: null,
    showInNav: true,
    isActive: true,
  },
  {
    slug: "beleza",
    name: "Beleza",
    icon: "💄",
    sortOrder: 5,
    kind: CategoryKind.DEPARTMENT,
    style: null,
    showInNav: true,
    isActive: true,
  },
  {
    slug: "tech",
    name: "Tech",
    icon: "📱",
    sortOrder: 6,
    kind: CategoryKind.DEPARTMENT,
    style: null,
    showInNav: true,
    isActive: true,
  },
  {
    slug: "moda",
    name: "Moda",
    icon: "👗",
    sortOrder: 7,
    kind: CategoryKind.DEPARTMENT,
    style: null,
    showInNav: true,
    isActive: true,
  },
  {
    slug: "fitness",
    name: "Fitness",
    icon: "🏋️",
    sortOrder: 8,
    kind: CategoryKind.DEPARTMENT,
    style: null,
    showInNav: true,
    isActive: true,
  },
] as const;

export const BADGE_DEFS = [
  { slug: "viral", label: "🔥 Viral", style: BadgeStyle.VIRAL },
  { slug: "oferta", label: "⚡ Oferta", style: BadgeStyle.OFF },
  { slug: "novo", label: "✨ Novo", style: BadgeStyle.NOVO },
] as const;

export const COLLECTION_DEFS = [
  {
    slug: "viral-agora",
    create: {
      slug: "viral-agora",
      name: "🔥 Viral agora",
      description: "Produtos que explodiram nas redes",
      type: CollectionType.SECTION,
      showOnHome: true,
      homeSortOrder: 1,
      maxProducts: 12,
    },
    upgrade: {
      name: "🔥 Viral agora",
      description: "Produtos que explodiram nas redes",
      type: CollectionType.SECTION,
      showOnHome: true,
      homeSortOrder: 1,
      maxProducts: 12,
    },
    demoProductSlugs: [
      "purificador-ar-difusor-led",
      "organizador-maquiagem-giratorio",
      "smartwatch-esportivo",
      "jaqueta-corta-vento",
      "massageador-pescoco-infravermelho",
    ] as const,
  },
  {
    slug: "tendencia-semana",
    create: {
      slug: "tendencia-semana",
      name: "Tendência agora",
      description: "Produtos que explodiram no TikTok essa semana",
      type: CollectionType.BANNER,
      showOnHome: true,
      homeSortOrder: 0,
      maxProducts: 3,
    },
    upgrade: {
      name: "Tendência agora",
      description: "Produtos que explodiram no TikTok essa semana",
      type: CollectionType.BANNER,
      showOnHome: true,
      homeSortOrder: 0,
      maxProducts: 3,
    },
    demoProductSlugs: [
      "mini-projetor-portatil-hd",
      "kit-skincare-vitamina-c",
      "vestido-linho-verao",
    ] as const,
  },
] as const;

export const SETTING_DEFAULTS: Record<string, string> = {
  header_banner_text:
    "🔥 +3.200 achados com os melhores preços das maiores lojas do Brasil",
  hero_eyebrow: "🎯 Curadoria diária",
  hero_title: "Achados que viralizam de verdade",
  hero_subtitle:
    "A gente garimpou os produtos mais comentados do TikTok e Instagram, tudo numa loja só. Você escolhe, clica e compra direto na origem.",
  stats_products: "3.2k+",
  stats_stores: "3",
  stats_update_label: "diário",
  footer_disclaimer:
    "Este site contém links de afiliados. Ao clicar você será redirecionado à loja de origem. Não armazenamos dados de compra.",
  instagram_url: "https://instagram.com/",
  whatsapp_phone: "",
};

export const PAGE_DEFS = [
  {
    slug: "sobre",
    title: "Sobre o projeto",
    body: "NaMira Achados é uma curadoria de produtos virais das maiores lojas do Brasil.",
  },
  {
    slug: "como-funciona",
    title: "Como funciona",
    body: "Você navega pelo catálogo, escolhe um produto e é redirecionado à loja parceira para comprar.",
  },
  {
    slug: "contato",
    title: "Contato",
    body: "Entre em contato pelo Instagram ou e-mail informado no rodapé.",
  },
] as const;

export type DemoProductDef = {
  slug: (typeof DEMO_PRODUCT_SLUGS)[number];
  title: string;
  priceCurrent: number;
  priceOriginal: number | null;
  storeSlug: string;
  affiliateUrl: string;
  tagSlugs: string[];
};

export const DEMO_PRODUCT_DEFS: DemoProductDef[] = [
  {
    slug: "purificador-ar-difusor-led",
    title: "Purificador de ar com difusor ultrassônico 3 em 1 LED",
    priceCurrent: 79.9,
    priceOriginal: 129,
    storeSlug: "shopee",
    affiliateUrl: "https://shopee.com.br/",
    tagSlugs: ["casa", "viral"],
  },
  {
    slug: "massageador-pescoco-infravermelho",
    title: "Massageador elétrico de pescoço e ombros com calor infravermelho",
    priceCurrent: 149.9,
    priceOriginal: 219,
    storeSlug: "amazon",
    affiliateUrl: "https://amazon.com.br/",
    tagSlugs: ["fitness", "viral"],
  },
  {
    slug: "mini-projetor-portatil-hd",
    title: "Mini projetor portátil HD 1080p para teto e parede",
    priceCurrent: 239,
    priceOriginal: 299,
    storeSlug: "mercado-livre",
    affiliateUrl: "https://mercadolivre.com.br/",
    tagSlugs: ["tech", "novo"],
  },
  {
    slug: "organizador-maquiagem-giratorio",
    title: "Organizador de maquiagem giratório acrílico 360°",
    priceCurrent: 54.9,
    priceOriginal: 89,
    storeSlug: "shopee",
    affiliateUrl: "https://shopee.com.br/",
    tagSlugs: ["beleza", "viral"],
  },
  {
    slug: "tapete-yoga-antiderrapante",
    title: "Tapete de yoga antiderrapante ecológico 6mm com bolsa",
    priceCurrent: 89.9,
    priceOriginal: 140,
    storeSlug: "amazon",
    affiliateUrl: "https://amazon.com.br/",
    tagSlugs: ["fitness", "oferta"],
  },
  {
    slug: "vela-perfumada-soja",
    title: "Vela perfumada artesanal de soja com cristais naturais",
    priceCurrent: 34.9,
    priceOriginal: null,
    storeSlug: "shopee",
    affiliateUrl: "https://shopee.com.br/",
    tagSlugs: ["casa", "novo"],
  },
  {
    slug: "fone-bluetooth-tws",
    title: "Fone bluetooth TWS com case carregador e cancelamento de ruído",
    priceCurrent: 69.9,
    priceOriginal: 119,
    storeSlug: "mercado-livre",
    affiliateUrl: "https://mercadolivre.com.br/",
    tagSlugs: ["tech", "oferta"],
  },
  {
    slug: "vestido-linho-verao",
    title: "Vestido de linho midi com alças finas para o verão",
    priceCurrent: 89.9,
    priceOriginal: 149,
    storeSlug: "shopee",
    affiliateUrl: "https://shopee.com.br/",
    tagSlugs: ["moda", "novo"],
  },
  {
    slug: "kit-skincare-vitamina-c",
    title: "Kit skincare vitamina C com sérum e hidratante facial",
    priceCurrent: 64.9,
    priceOriginal: 99.9,
    storeSlug: "mercado-livre",
    affiliateUrl: "https://mercadolivre.com.br/",
    tagSlugs: ["beleza", "oferta"],
  },
  {
    slug: "smartwatch-esportivo",
    title: "Smartwatch esportivo com GPS e monitor cardíaco",
    priceCurrent: 179.9,
    priceOriginal: 249,
    storeSlug: "amazon",
    affiliateUrl: "https://amazon.com.br/",
    tagSlugs: ["tech", "viral"],
  },
  {
    slug: "jogo-lencol-algodao",
    title: "Jogo de lençol 100% algodão 4 peças casal",
    priceCurrent: 119.9,
    priceOriginal: 189,
    storeSlug: "mercado-livre",
    affiliateUrl: "https://mercadolivre.com.br/",
    tagSlugs: ["casa", "oferta"],
  },
  {
    slug: "jaqueta-corta-vento",
    title: "Jaqueta corta-vento impermeável unissex",
    priceCurrent: 99.9,
    priceOriginal: 169,
    storeSlug: "amazon",
    affiliateUrl: "https://amazon.com.br/",
    tagSlugs: ["moda", "viral"],
  },
  {
    slug: "elastico-resistencia-kit",
    title: "Kit 5 elásticos de resistência para treino em casa",
    priceCurrent: 39.9,
    priceOriginal: 69.9,
    storeSlug: "shopee",
    affiliateUrl: "https://shopee.com.br/",
    tagSlugs: ["fitness", "novo"],
  },
  {
    slug: "bolsa-crossbody-couro",
    title: "Bolsa crossbody de couro sintético com alça ajustável",
    priceCurrent: 74.9,
    priceOriginal: 129,
    storeSlug: "mercado-livre",
    affiliateUrl: "https://mercadolivre.com.br/",
    tagSlugs: ["moda", "oferta"],
  },
];
