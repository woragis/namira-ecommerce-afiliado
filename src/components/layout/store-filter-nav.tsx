"use client";

import Image from "next/image";
import { NavLink } from "@/components/ui/nav-link";
import { usePathname, useSearchParams } from "next/navigation";
import type { CategoryNavItem, StoreNavItem } from "@/types/catalog";

type Props = {
  stores: StoreNavItem[];
  categories: CategoryNavItem[];
};

function storeHref(slug: string | null, pathname: string) {
  if (pathname.startsWith("/lojas/") && slug) return `/lojas/${slug}`;
  const base = pathname.startsWith("/produtos") ? "/produtos" : "/produtos";
  if (!slug) return base;
  return `${base}?loja=${slug}`;
}

function categoryHref(slug: string, pathname: string, storeSlug: string | null) {
  const params = new URLSearchParams();
  if (storeSlug) params.set("loja", storeSlug);
  params.set("categoria", slug);
  const q = params.toString();
  if (pathname.startsWith("/categorias/")) return `/categorias/${slug}`;
  return q ? `/produtos?${q}` : `/produtos?categoria=${slug}`;
}

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
        alt={store.name}
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

export function StoreFilterNav({ stores, categories }: Props) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeStore =
    searchParams.get("loja") ??
    (pathname.startsWith("/lojas/")
      ? pathname.replace("/lojas/", "").split("/")[0]
      : null);
  const activeCategory =
    searchParams.get("categoria") ??
    (pathname.startsWith("/categorias/")
      ? pathname.replace("/categorias/", "").split("/")[0]
      : null);

  const todosActive =
    !activeStore && !pathname.startsWith("/lojas/");

  return (
    <nav className="overflow-x-auto border-b border-[var(--borda)] bg-white px-6 md:px-10 [&::-webkit-scrollbar]:hidden">
      <div className="flex min-w-max items-center">
        <NavLink
          href="/produtos"
          className="flex items-center gap-2 border-b-2 px-5 py-3.5 text-[13px] font-medium whitespace-nowrap no-underline transition-colors"
          style={{
            borderBottomColor: todosActive ? "var(--roxo-escuro)" : "transparent",
            color: todosActive ? "var(--roxo-escuro)" : "var(--texto-suave)",
            backgroundColor: todosActive ? "var(--roxo-claro)" : "transparent",
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
              href={storeHref(store.slug, pathname)}
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

        <div className="mx-1 h-5 w-px bg-[var(--borda)]" />

        {categories.map((cat) => {
          const active = activeCategory === cat.slug;
          return (
            <NavLink
              key={cat.id}
              href={categoryHref(cat.slug, pathname, activeStore)}
              className="px-3.5 py-3.5 text-[13px] whitespace-nowrap no-underline transition-colors"
              style={{
                color: active ? "var(--roxo-escuro)" : "var(--texto-suave)",
                fontWeight: active ? 500 : 400,
              }}
            >
              {cat.icon ? `${cat.icon} ` : ""}
              {cat.name}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
