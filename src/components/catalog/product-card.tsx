import { NavLink } from "@/components/ui/nav-link";
import { CatalogImage } from "@/components/catalog/catalog-image";
import { FavoriteButton } from "@/components/catalog/favorite-button";
import { ProductImpressionTracker } from "@/components/catalog/product-impression-tracker";
import { WhatsAppShareButton } from "@/components/catalog/whatsapp-share-button";
import { formatPrice, type ProductListItem } from "@/lib/catalog";
import type { BadgeStyle } from "@prisma/client";

const badgeClass: Record<BadgeStyle, string> = {
  VIRAL: "bg-[var(--dourado)] text-[var(--dourado-escuro)]",
  OFF: "bg-[var(--roxo-escuro)] text-white",
  NOVO: "bg-[var(--roxo-mais-escuro)] text-[var(--roxo-medio)]",
};

type Props = {
  product: ProductListItem;
};

export function ProductCard({ product }: Props) {
  const store = product.store;
  const priceCurrent = Number(product.priceCurrent);
  const priceOriginal = product.priceOriginal
    ? Number(product.priceOriginal)
    : null;
  const productHref = `/produtos/${product.slug}`;

  return (
    <ProductImpressionTracker productId={product.id}>
      <article className="group overflow-hidden rounded-2xl border border-[var(--borda)] bg-white transition hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(83,74,183,0.12)]">
        <div className="relative aspect-square overflow-hidden bg-[var(--roxo-claro)]">
          <NavLink
            href={productHref}
            className="absolute inset-0 z-[1] block no-underline text-inherit"
            aria-label={product.title}
          >
            {product.imageUrl ? (
              <CatalogImage
                src={product.imageUrl}
                alt={product.imageAlt ?? product.title}
                fill
                className="object-cover transition group-hover:scale-105"
                sizes="(max-width: 768px) 50vw, 220px"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-5xl">📦</div>
            )}
          </NavLink>
          <div className="pointer-events-none absolute inset-0 z-[2]">
            <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
              {product.isFeatured ? (
                <span className="inline-flex items-center rounded-md bg-[var(--dourado)] px-2 py-0.5 text-[10px] font-bold text-[var(--dourado-escuro)]">
                  ⭐ Destaque
                </span>
              ) : null}
              {product.badges.map(({ badge }) => (
                <span
                  key={badge.id}
                  className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold tracking-wide ${badgeClass[badge.style]}`}
                >
                  {badge.label}
                </span>
              ))}
            </div>
            <span
              className="absolute top-2.5 right-2.5 flex h-[26px] w-[26px] items-center justify-center rounded-lg text-[9px] font-extrabold shadow-md"
              style={{
                backgroundColor: store.colorPrimary,
                color: store.colorOnPrimary,
              }}
            >
              {store.shortLabel}
            </span>
            <div className="pointer-events-auto absolute bottom-2.5 left-2.5 flex gap-1.5">
              <FavoriteButton productId={product.id} />
              <WhatsAppShareButton
                title={product.title}
                productPath={productHref}
                variant="compact"
              />
            </div>
          </div>
        </div>
        <NavLink href={productHref} className="block no-underline text-inherit">
          <div className="p-4">
            <div
              className="mb-1 text-[10px] font-semibold tracking-wider uppercase"
              style={{ color: store.colorPrimary }}
            >
              {store.name}
            </div>
            <h3 className="mb-2 line-clamp-2 text-sm font-medium leading-snug">
              {product.title}
            </h3>
            <div className="mb-3 flex flex-wrap items-baseline gap-1.5">
              <span className="text-lg font-bold text-[var(--roxo-mais-escuro)]">
                {formatPrice(priceCurrent)}
              </span>
              {priceOriginal ? (
                <>
                  <span className="text-xs text-[var(--texto-suave)] line-through">
                    {formatPrice(priceOriginal)}
                  </span>
                  {product.discountPercent ? (
                    <span className="text-[11px] font-bold text-[var(--dourado-escuro)]">
                      −{product.discountPercent}%
                    </span>
                  ) : null}
                </>
              ) : null}
            </div>
          </div>
        </NavLink>
        <div className="px-4 pb-4">
          <a
            href={`/r/${product.id}`}
            className="flex w-full items-center justify-center gap-1.5 rounded-[10px] py-2.5 text-sm font-semibold text-white no-underline transition hover:opacity-90"
            style={{ backgroundColor: store.colorPrimary }}
          >
            Ver na {store.name}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="h-3.5 w-3.5">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </a>
        </div>
      </article>
    </ProductImpressionTracker>
  );
}
