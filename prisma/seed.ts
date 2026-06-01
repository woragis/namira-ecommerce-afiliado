import {
  BadgeStyle,
  CollectionType,
  PrismaClient,
} from "@prisma/client";

const prisma = new PrismaClient();

function discountPercent(current: number, original?: number): number | null {
  if (!original || original <= current) return null;
  return Math.round(((original - current) / original) * 100);
}

async function main() {
  const stores = await Promise.all([
    prisma.store.upsert({
      where: { slug: "shopee" },
      update: {},
      create: {
        slug: "shopee",
        name: "Shopee",
        shortLabel: "S",
        colorPrimary: "#EE4D2D",
        colorSecondary: "#FFF0ED",
        colorOnPrimary: "#ffffff",
        sortOrder: 1,
      },
    }),
    prisma.store.upsert({
      where: { slug: "mercado-livre" },
      update: {},
      create: {
        slug: "mercado-livre",
        name: "Mercado Livre",
        shortLabel: "ML",
        colorPrimary: "#FFE600",
        colorSecondary: "#FFFBE6",
        colorOnPrimary: "#333333",
        sortOrder: 2,
      },
    }),
    prisma.store.upsert({
      where: { slug: "amazon" },
      update: {},
      create: {
        slug: "amazon",
        name: "Amazon",
        shortLabel: "A",
        colorPrimary: "#FF9900",
        colorSecondary: "#FFF4E5",
        colorOnPrimary: "#ffffff",
        sortOrder: 3,
      },
    }),
  ]);

  const [shopee, ml, amazon] = stores;

  const categories = await Promise.all(
    [
      { slug: "viral-agora", name: "Viral agora", icon: "🔥", sortOrder: 1 },
      { slug: "ofertas", name: "Ofertas", icon: "⚡", sortOrder: 2 },
      { slug: "novidades", name: "Novidades", icon: "✨", sortOrder: 3 },
      { slug: "casa", name: "Casa", icon: "🏠", sortOrder: 4 },
      { slug: "beleza", name: "Beleza", icon: "💄", sortOrder: 5 },
      { slug: "tech", name: "Tech", icon: "📱", sortOrder: 6 },
      { slug: "moda", name: "Moda", icon: "👗", sortOrder: 7 },
      { slug: "fitness", name: "Fitness", icon: "🏋️", sortOrder: 8 },
    ].map((c) =>
      prisma.category.upsert({
        where: { slug: c.slug },
        update: {},
        create: c,
      }),
    ),
  );

  const viralCat = categories.find((c) => c.slug === "viral-agora")!;
  const ofertasCat = categories.find((c) => c.slug === "ofertas")!;
  const novidadesCat = categories.find((c) => c.slug === "novidades")!;

  const badges = await Promise.all(
    [
      { slug: "viral", label: "🔥 Viral", style: BadgeStyle.VIRAL },
      { slug: "oferta", label: "⚡ Oferta", style: BadgeStyle.OFF },
      { slug: "novo", label: "✨ Novo", style: BadgeStyle.NOVO },
    ].map((b) =>
      prisma.badge.upsert({
        where: { slug: b.slug },
        update: {},
        create: b,
      }),
    ),
  );

  const [badgeViral, badgeOferta, badgeNovo] = badges;

  const productDefs = [
    {
      slug: "purificador-ar-difusor-led",
      title: "Purificador de ar com difusor ultrassônico 3 em 1 LED",
      priceCurrent: 79.9,
      priceOriginal: 129,
      storeId: shopee.id,
      affiliateUrl: "https://shopee.com.br/",
      categoryIds: [viralCat.id],
      badgeIds: [badgeViral.id],
      emoji: "🌿",
    },
    {
      slug: "massageador-pescoco-infravermelho",
      title:
        "Massageador elétrico de pescoço e ombros com calor infravermelho",
      priceCurrent: 149.9,
      priceOriginal: 219,
      storeId: amazon.id,
      affiliateUrl: "https://amazon.com.br/",
      categoryIds: [viralCat.id],
      badgeIds: [badgeViral.id],
      emoji: "💆",
    },
    {
      slug: "mini-projetor-portatil-hd",
      title: "Mini projetor portátil HD 1080p para teto e parede",
      priceCurrent: 239,
      priceOriginal: 299,
      storeId: ml.id,
      affiliateUrl: "https://mercadolivre.com.br/",
      categoryIds: [novidadesCat.id, viralCat.id],
      badgeIds: [badgeNovo.id],
      emoji: "🎮",
    },
    {
      slug: "organizador-maquiagem-giratorio",
      title: "Organizador de maquiagem giratório acrílico 360°",
      priceCurrent: 54.9,
      priceOriginal: 89,
      storeId: shopee.id,
      affiliateUrl: "https://shopee.com.br/",
      categoryIds: [viralCat.id],
      badgeIds: [badgeViral.id],
      emoji: "💄",
    },
    {
      slug: "tapete-yoga-antiderrapante",
      title: "Tapete de yoga antiderrapante ecológico 6mm com bolsa",
      priceCurrent: 89.9,
      priceOriginal: 140,
      storeId: amazon.id,
      affiliateUrl: "https://amazon.com.br/",
      categoryIds: [ofertasCat.id],
      badgeIds: [badgeOferta.id],
      emoji: "🏋️",
    },
    {
      slug: "vela-perfumada-soja",
      title: "Vela perfumada artesanal de soja com cristais naturais",
      priceCurrent: 34.9,
      priceOriginal: null,
      storeId: shopee.id,
      affiliateUrl: "https://shopee.com.br/",
      categoryIds: [novidadesCat.id],
      badgeIds: [badgeNovo.id],
      emoji: "🕯️",
    },
  ] as const;

  const products = [];
  for (const p of productDefs) {
    const discount = discountPercent(
      p.priceCurrent,
      p.priceOriginal ?? undefined,
    );
    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        slug: p.slug,
        title: p.title,
        imageAlt: p.title,
        priceCurrent: p.priceCurrent,
        priceOriginal: p.priceOriginal,
        discountPercent: discount,
        affiliateUrl: p.affiliateUrl,
        storeId: p.storeId,
        isPublished: true,
        isFeatured: true,
        publishedAt: new Date(),
        categories: {
          create: p.categoryIds.map((categoryId) => ({ categoryId })),
        },
        badges: {
          create: p.badgeIds.map((badgeId) => ({ badgeId })),
        },
      },
      include: { store: true },
    });
    products.push(product);
  }

  const viralCollection = await prisma.collection.upsert({
    where: { slug: "viral-agora" },
    update: {},
    create: {
      slug: "viral-agora",
      name: "🔥 Viral agora",
      description: "Produtos que explodiram nas redes",
      type: CollectionType.SECTION,
      showOnHome: true,
      homeSortOrder: 1,
      maxProducts: 12,
    },
  });

  await prisma.collectionProduct.deleteMany({
    where: { collectionId: viralCollection.id },
  });
  await prisma.collectionProduct.createMany({
    data: products.map((p, i) => ({
      collectionId: viralCollection.id,
      productId: p.id,
      sortOrder: i,
    })),
  });

  await prisma.collection.upsert({
    where: { slug: "tendencia-semana" },
    update: {},
    create: {
      slug: "tendencia-semana",
      name: "Tendência agora",
      description: "Produtos que explodiram no TikTok essa semana",
      type: CollectionType.BANNER,
      showOnHome: true,
      homeSortOrder: 0,
      maxProducts: 3,
      products: {
        create: products.slice(0, 3).map((p, i) => ({
          productId: p.id,
          sortOrder: i,
        })),
      },
    },
  });

  for (const store of stores) {
    const count = await prisma.product.count({
      where: { storeId: store.id, isPublished: true },
    });
    await prisma.store.update({
      where: { id: store.id },
      data: { productCountCached: count },
    });
  }

  const settings: Record<string, string> = {
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

  for (const [key, value] of Object.entries(settings)) {
    await prisma.siteSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }

  const pages = [
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
  ];

  for (const page of pages) {
    await prisma.page.upsert({
      where: { slug: page.slug },
      update: {},
      create: page,
    });
  }

  console.log("Seed concluído:", {
    stores: stores.length,
    products: products.length,
    categories: categories.length,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
