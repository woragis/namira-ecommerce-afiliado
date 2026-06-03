import { BadgeStyle, CollectionType } from "@prisma/client";

/** Slugs de produtos de demonstração — nunca conflitam com catálogo real se usar slugs próprios. */
export const DEMO_PRODUCT_SLUGS = [
  "purificador-ar-difusor-led",
  "massageador-pescoco-infravermelho",
  "mini-projetor-portatil-hd",
  "organizador-maquiagem-giratorio",
  "tapete-yoga-antiderrapante",
  "vela-perfumada-soja",
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

export const CATEGORY_DEFS = [
  { slug: "viral-agora", name: "Viral agora", icon: "🔥", sortOrder: 1 },
  { slug: "ofertas", name: "Ofertas", icon: "⚡", sortOrder: 2 },
  { slug: "novidades", name: "Novidades", icon: "✨", sortOrder: 3 },
  { slug: "casa", name: "Casa", icon: "🏠", sortOrder: 4 },
  { slug: "beleza", name: "Beleza", icon: "💄", sortOrder: 5 },
  { slug: "tech", name: "Tech", icon: "📱", sortOrder: 6 },
  { slug: "moda", name: "Moda", icon: "👗", sortOrder: 7 },
  { slug: "fitness", name: "Fitness", icon: "🏋️", sortOrder: 8 },
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
    /** Só em demo: pode repopular membros se vazia ou com ALLOW_DESTRUCTIVE_SEED */
    demoProductSlugs: DEMO_PRODUCT_SLUGS,
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
    demoProductSlugs: DEMO_PRODUCT_SLUGS.slice(0, 3),
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
  categorySlugs: string[];
  badgeSlugs: string[];
};

export const DEMO_PRODUCT_DEFS: DemoProductDef[] = [
  {
    slug: "purificador-ar-difusor-led",
    title: "Purificador de ar com difusor ultrassônico 3 em 1 LED",
    priceCurrent: 79.9,
    priceOriginal: 129,
    storeSlug: "shopee",
    affiliateUrl: "https://shopee.com.br/",
    categorySlugs: ["viral-agora"],
    badgeSlugs: ["viral"],
  },
  {
    slug: "massageador-pescoco-infravermelho",
    title: "Massageador elétrico de pescoço e ombros com calor infravermelho",
    priceCurrent: 149.9,
    priceOriginal: 219,
    storeSlug: "amazon",
    affiliateUrl: "https://amazon.com.br/",
    categorySlugs: ["viral-agora"],
    badgeSlugs: ["viral"],
  },
  {
    slug: "mini-projetor-portatil-hd",
    title: "Mini projetor portátil HD 1080p para teto e parede",
    priceCurrent: 239,
    priceOriginal: 299,
    storeSlug: "mercado-livre",
    affiliateUrl: "https://mercadolivre.com.br/",
    categorySlugs: ["novidades", "viral-agora"],
    badgeSlugs: ["novo"],
  },
  {
    slug: "organizador-maquiagem-giratorio",
    title: "Organizador de maquiagem giratório acrílico 360°",
    priceCurrent: 54.9,
    priceOriginal: 89,
    storeSlug: "shopee",
    affiliateUrl: "https://shopee.com.br/",
    categorySlugs: ["viral-agora"],
    badgeSlugs: ["viral"],
  },
  {
    slug: "tapete-yoga-antiderrapante",
    title: "Tapete de yoga antiderrapante ecológico 6mm com bolsa",
    priceCurrent: 89.9,
    priceOriginal: 140,
    storeSlug: "amazon",
    affiliateUrl: "https://amazon.com.br/",
    categorySlugs: ["ofertas"],
    badgeSlugs: ["oferta"],
  },
  {
    slug: "vela-perfumada-soja",
    title: "Vela perfumada artesanal de soja com cristais naturais",
    priceCurrent: 34.9,
    priceOriginal: null,
    storeSlug: "shopee",
    affiliateUrl: "https://shopee.com.br/",
    categorySlugs: ["novidades"],
    badgeSlugs: ["novo"],
  },
];
