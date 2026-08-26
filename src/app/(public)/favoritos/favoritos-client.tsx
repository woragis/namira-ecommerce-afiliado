"use client";

import { startTransition, useEffect, useState } from "react";
import { ProductGrid } from "@/components/catalog/product-grid";
import type { ProductListItem } from "@/lib/catalog";

const STORAGE_KEY = "namira_favorites";

export function FavoritosClient() {
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    const ids: string[] = raw ? JSON.parse(raw) : [];
    if (ids.length === 0) {
      startTransition(() => setLoading(false));
      return;
    }
    fetch("/api/favorites/resolve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
    })
      .then((r) => r.json())
      .then((data) => setProducts(data.products ?? []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="text-[var(--texto-suave)]">Carregando favoritos…</p>;
  }

  if (products.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-[var(--borda)] bg-white px-6 py-12 text-center text-[var(--texto-suave)]">
        Nenhum favorito ainda. Toque no coração nos cards para guardar achados aqui.
      </p>
    );
  }

  return <ProductGrid products={products} />;
}
