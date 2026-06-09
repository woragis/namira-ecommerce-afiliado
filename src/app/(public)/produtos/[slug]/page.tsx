import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import {
  buildGalleryItems,
  ProductGallery,
} from "@/components/catalog/product-gallery";
import { ProductGrid } from "@/components/catalog/product-grid";
import { WhatsAppShareButton } from "@/components/catalog/whatsapp-share-button";
import { hashUserAgent, recordProductView } from "@/lib/analytics";
import { formatPrice, getProductBySlug, getProducts } from "@/lib/catalog";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Produto não encontrado" };

  const title = product.metaTitle ?? product.title;
  const description = product.metaDescription ?? product.title;
  const galleryItems = buildGalleryItems(
    product.media,
    product.imageUrl,
    product.imageAlt ?? product.title,
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

  const galleryItems = buildGalleryItems(
    product.media,
    product.imageUrl,
    product.imageAlt ?? product.title,
  );

  return (
    <main className="px-6 py-9 md:px-10">
      <nav className="mb-6 text-sm text-[var(--texto-suave)]">
        <Link href="/" className="no-underline hover:text-[var(--roxo-escuro)]">
          Home
        </Link>
        {" / "}
        <Link href="/produtos" className="no-underline hover:text-[var(--roxo-escuro)]">
          Produtos
        </Link>
        {" / "}
        <span className="text-[var(--texto)]">{product.title}</span>
      </nav>

      <div className="mb-12 grid gap-10 md:grid-cols-2">
        <ProductGallery items={galleryItems} fallbackAlt={product.title} />
        <div>
          <div
            className="mb-2 text-xs font-semibold tracking-wider uppercase"
            style={{ color: store.colorPrimary }}
          >
            {store.name}
          </div>
          <h1 className="font-display mb-4 text-3xl font-bold text-[var(--roxo-mais-escuro)]">
            {product.title}
          </h1>
          {product.description ? (
            <p className="mb-6 text-[var(--texto-suave)]">{product.description}</p>
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
              href={`/r/${product.id}`}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl py-4 text-base font-semibold text-white no-underline sm:min-w-[200px]"
              style={{ backgroundColor: store.colorPrimary }}
            >
              Comprar na {store.name} →
            </a>
            <WhatsAppShareButton
              title={product.title}
              productPath={`/produtos/${product.slug}`}
              className="flex-1 sm:min-w-[200px]"
            />
          </div>
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
