import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductGrid } from "@/components/catalog/product-grid";
import { formatPrice, getProductBySlug, getProducts } from "@/lib/catalog";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Produto não encontrado" };
  return {
    title: product.metaTitle ?? product.title,
    description: product.metaDescription ?? product.title,
  };
}

export default async function ProdutoDetalhePage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const store = product.store;
  const related = await getProducts({
    storeSlug: store.slug,
    limit: 4,
  });

  const priceCurrent = Number(product.priceCurrent);
  const priceOriginal = product.priceOriginal
    ? Number(product.priceOriginal)
    : null;

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
        <div className="relative aspect-square overflow-hidden rounded-2xl bg-[var(--roxo-claro)]">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.imageAlt ?? product.title}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-8xl">📦</div>
          )}
        </div>
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
          <a
            href={`/r/${product.id}`}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl py-4 text-base font-semibold text-white no-underline md:w-auto md:px-10"
            style={{ backgroundColor: store.colorPrimary }}
          >
            Comprar na {store.name} →
          </a>
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
