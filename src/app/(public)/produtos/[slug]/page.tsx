import { CopyShareLinkButton } from "@/components/copy-share-link-button";
import { NavLink } from "@/components/ui/nav-link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { ProductGallery } from "@/components/catalog/product-gallery";
import { ProductGrid } from "@/components/catalog/product-grid";
import { WhatsAppShareButton } from "@/components/catalog/whatsapp-share-button";
import { hashUserAgent, recordProductView } from "@/lib/analytics";
import { formatPrice, getProductBySlug, getProducts } from "@/lib/catalog";
import { buildGalleryItems } from "@/lib/gallery-items";
import { displayProductDescription, displayProductTitle } from "@/lib/product-display";
import {
  buildProductShareUrl,
  ensureShareCode,
  resolveAffiliatePath,
  resolveProductSharePath,
} from "@/lib/share-code";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Produto não encontrado" };

  const title = displayProductTitle(product.metaTitle ?? product.title);
  const description =
    product.metaDescription ??
    displayProductDescription(product.description, product.title) ??
    title;
  const galleryItems = buildGalleryItems(
    product.media,
    product.imageUrl,
    product.imageAlt ?? title,
  );
  const ogImage =
    galleryItems.find((item) => item.type === "IMAGE")?.url ??
    product.imageUrl ??
    undefined;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      ...(ogImage ? { images: [{ url: ogImage }] } : {}),
    },
  };
}

export default async function ProdutoDetalhePage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const shareCode = await ensureShareCode(product.id, product.shareCode);
  const sharePath = resolveProductSharePath({ shareCode, slug: product.slug });
  const shareUrl = buildProductShareUrl(shareCode);
  const affiliatePath = resolveAffiliatePath({ shareCode, id: product.id });

  const hdrs = await headers();
  const ua = hdrs.get("user-agent") ?? "";
  void recordProductView(
    product.id,
    `/produtos/${slug}`,
    hashUserAgent(ua),
  );

  const store = product.store;
  const related = await getProducts({
    storeSlug: store.slug,
    limit: 4,
  });

  const priceCurrent = Number(product.priceCurrent);
  const priceOriginal = product.priceOriginal
    ? Number(product.priceOriginal)
    : null;

  const displayTitle = displayProductTitle(product.title);
  const displayDescription = displayProductDescription(
    product.description,
    product.title,
  );

  const galleryItems = buildGalleryItems(
    product.media,
    product.imageUrl,
    product.imageAlt ?? displayTitle,
  );

  return (
    <main className="px-6 py-9 md:px-10">
      <nav
        className="mb-6 text-sm text-[var(--texto-suave)]"
        aria-label="Breadcrumb"
      >
        <ol className="flex flex-wrap items-center gap-1">
          <li>
            <NavLink href="/" className="no-underline hover:text-[var(--roxo-escuro)]">
              Home
            </NavLink>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <NavLink href="/produtos" className="no-underline hover:text-[var(--roxo-escuro)]">
              Produtos
            </NavLink>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <span className="text-[var(--texto)]" aria-current="page">
              Produto
            </span>
          </li>
        </ol>
      </nav>

      <div className="mb-12 grid gap-10 md:grid-cols-2">
        <ProductGallery items={galleryItems} fallbackAlt={displayTitle} />
        <div>
          <div
            className="mb-2 text-xs font-semibold tracking-wider uppercase"
            style={{ color: store.colorPrimary }}
          >
            {store.name}
          </div>
          <h1 className="font-display mb-4 text-2xl font-bold leading-snug text-[var(--roxo-mais-escuro)] md:text-3xl">
            {displayTitle}
          </h1>
          {displayDescription ? (
            <p className="mb-6 text-[var(--texto-suave)]">{displayDescription}</p>
          ) : null}
          <div className="mb-6 flex flex-wrap items-baseline gap-2">
            <span className="text-3xl font-bold text-[var(--roxo-mais-escuro)]">
              {formatPrice(priceCurrent)}
            </span>
            {priceOriginal ? (
              <span className="text-lg text-[var(--texto-suave)] line-through">
                {formatPrice(priceOriginal)}
              </span>
            ) : null}
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <a
              href={affiliatePath}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl py-4 text-base font-semibold text-white no-underline sm:min-w-[200px]"
              style={{ backgroundColor: store.colorPrimary }}
            >
              Comprar na {store.name} →
            </a>
            <WhatsAppShareButton
              title={displayTitle}
              productPath={sharePath}
              className="flex-1 sm:min-w-[200px]"
            />
            <CopyShareLinkButton url={shareUrl} className="flex-1 sm:min-w-[200px]" />
          </div>
          <p className="mt-3 text-xs text-[var(--texto-suave)]">
            Link curto:{" "}
            <code className="rounded bg-[var(--roxo-claro)] px-1.5 py-0.5 text-[var(--roxo-escuro)]">
              {sharePath}
            </code>
          </p>
          <p className="mt-4 text-xs text-[var(--texto-suave)]">
            Link de afiliado — você será redirecionado para a loja oficial.
          </p>
        </div>
      </div>

      <h2 className="font-display mb-4 text-xl font-bold">Mais da {store.name}</h2>
      <ProductGrid
        products={related.items.filter((p) => p.id !== product.id).slice(0, 4)}
      />
    </main>
  );
}
