"use client";

import Image from "next/image";
import { NavLink } from "@/components/ui/nav-link";
import { usePathname, useSearchParams } from "next/navigation";
import { catalogHref } from "@/lib/filters";
import type { CategoryNavItem, StoreNavItem } from "@/types/catalog";

type Props = {
  stores: StoreNavItem[];
  tags: CategoryNavItem[];
};

function StoreLogo({
  store,
  size = 18,
}: {
  store: StoreNavItem;
  size?: number;
}) {
  if (store.logoUrl) {
    return (
      <Image
        src={store.logoUrl}
        alt=""
        width={size}
        height={size}
        className="rounded object-contain"
      />
    );
  }
  return (
    <span
      className="flex items-center justify-center rounded font-extrabold"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.5,
        backgroundColor: store.colorPrimary,
        color: store.colorOnPrimary,
      }}
    >
      {store.shortLabel}
    </span>
  );
}

export function StoreFilterNav({ stores, tags }: Props) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.get("q");
  const priceMinRaw = searchParams.get("preco_min");
  const priceMaxRaw = searchParams.get("preco_max");
  const priceMin = priceMinRaw ? parseFloat(priceMinRaw.replace(",", ".")) : undefined;
  const priceMax = priceMaxRaw ? parseFloat(priceMaxRaw.replace(",", ".")) : undefined;
  const priceMinValue =
    priceMin != null && !Number.isNaN(priceMin) ? priceMin : undefined;
  const priceMaxValue =
    priceMax != null && !Number.isNaN(priceMax) ? priceMax : undefined;
  const activeStore =
    searchParams.get("loja") ??
    (pathname.startsWith("/lojas/")
      ? pathname.replace("/lojas/", "").split("/")[0]
      : null);
  const activeTag =
    searchParams.get("tag") ??
    searchParams.get("categoria") ??
    searchParams.get("badge") ??
    (pathname.startsWith("/categorias/")
      ? pathname.replace("/categorias/", "").split("/")[0]
      : null);

  return (
    <nav className="border-b border-[var(--borda)] bg-white">
      <div className="overflow-x-auto px-6 md:px-10 [&::-webkit-scrollbar]:hidden">
        <div className="flex min-w-max items-center">
          <NavLink
            href={catalogHref({ storeSlug: null, tagSlug: activeTag, search, priceMin: priceMinValue, priceMax: priceMaxValue })}
            className="flex items-center gap-2 border-b-2 px-5 py-3.5 text-[13px] font-medium whitespace-nowrap no-underline transition-colors"
            style={{
              borderBottomColor: !activeStore ? "var(--roxo-escuro)" : "transparent",
              color: !activeStore ? "var(--roxo-escuro)" : "var(--texto-suave)",
              backgroundColor: !activeStore ? "var(--roxo-claro)" : "transparent",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            </svg>
            Todos
          </NavLink>

          <div className="mx-1 h-5 w-px bg-[var(--borda)]" />

          {stores.map((store) => {
            const active = activeStore === store.slug;
            return (
            <NavLink
              key={store.id}
              href={catalogHref({
                storeSlug: store.slug,
                tagSlug: activeTag,
                search,
                priceMin: priceMinValue,
                priceMax: priceMaxValue,
              })}
              aria-label={store.name}
              className="flex items-center gap-2 border-b-2 px-5 py-3.5 text-[13px] font-medium whitespace-nowrap no-underline transition-colors"
                style={{
                  borderBottomColor: active ? store.colorPrimary : "transparent",
                  color: active ? store.colorPrimary : "var(--texto-suave)",
                  backgroundColor: active
                    ? (store.colorSecondary ?? "var(--roxo-claro)")
                    : "transparent",
                }}
              >
                <StoreLogo store={store} />
                {store.name}
              </NavLink>
            );
          })}
        </div>
      </div>

      {tags.length > 0 ? (
        <div className="overflow-x-auto border-t border-[var(--borda)] px-6 md:px-10 [&::-webkit-scrollbar]:hidden">
          <div className="flex min-w-max items-center gap-1 py-2">
            <NavLink
              href={catalogHref({ storeSlug: activeStore, tagSlug: null, search, priceMin: priceMinValue, priceMax: priceMaxValue })}
              className={`rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap no-underline ${
                !activeTag
                  ? "bg-[var(--roxo-escuro)] text-white"
                  : "border border-[var(--borda)] bg-white text-[var(--texto-suave)]"
              }`}
            >
              Todas
            </NavLink>
            {tags.map((tag) => {
              const active = activeTag === tag.slug;
              const isPromo = tag.kind === "PROMO";
              const className = active
                ? "rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap no-underline bg-[var(--roxo-escuro)] text-white"
                : isPromo
                  ? "rounded-full px-3 py-1.5 text-xs whitespace-nowrap no-underline border border-[var(--borda)] bg-[var(--roxo-claro)] text-[var(--roxo-escuro)] hover:border-[var(--roxo)]"
                  : "rounded-full px-3 py-1.5 text-xs whitespace-nowrap no-underline border border-transparent text-[var(--texto-suave)] hover:text-[var(--roxo-escuro)]";
              return (
                <NavLink
                  key={tag.id}
                  href={catalogHref({
                    storeSlug: activeStore,
                    tagSlug: tag.slug,
                    search,
                    priceMin: priceMinValue,
                    priceMax: priceMaxValue,
                  })}
                  className={className}
                >
                  {tag.icon ? `${tag.icon} ` : ""}
                  {tag.name}
                </NavLink>
              );
            })}
          </div>
        </div>
      ) : null}
    </nav>
  );
}
