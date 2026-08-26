"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import { catalogHref } from "@/lib/filters";

export function SearchForm({ defaultQuery = "" }: { defaultQuery?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(
    () => defaultQuery || searchParams.get("q") || "",
  );

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = q.trim();
    const loja = searchParams.get("loja");
    const tag =
      searchParams.get("tag") ??
      searchParams.get("categoria") ??
      searchParams.get("badge");
    const precoMinRaw = searchParams.get("preco_min");
    const precoMaxRaw = searchParams.get("preco_max");
    const priceMin = precoMinRaw
      ? parseFloat(precoMinRaw.replace(",", "."))
      : undefined;
    const priceMax = precoMaxRaw
      ? parseFloat(precoMaxRaw.replace(",", "."))
      : undefined;
    router.push(
      catalogHref({
        storeSlug: loja,
        tagSlug: tag,
        search: trimmed || null,
        priceMin: priceMin != null && !Number.isNaN(priceMin) ? priceMin : null,
        priceMax: priceMax != null && !Number.isNaN(priceMax) ? priceMax : null,
      }),
    );
  }

  return (
    <form onSubmit={onSubmit} className="relative min-w-0 max-w-[480px] flex-1">
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Buscar achados..."
        className="h-10 w-full rounded-full border-[1.5px] border-[var(--borda)] bg-[var(--roxo-claro)] pr-11 pl-4 text-sm text-[var(--texto)] outline-none focus:border-[var(--roxo)]"
      />
      <button
        type="submit"
        className="absolute top-1/2 right-1.5 flex h-[30px] w-[30px] -translate-y-1/2 items-center justify-center rounded-full bg-[var(--roxo-escuro)] text-white"
        aria-label="Buscar"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="h-3.5 w-3.5">
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
      </button>
    </form>
  );
}
