"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "namira_favorites";

export function FavoriteButton({ productId }: { productId: string }) {
  const [active, setActive] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    const ids: string[] = raw ? JSON.parse(raw) : [];
    setActive(ids.includes(productId));
  }, [productId]);

  function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const raw = localStorage.getItem(STORAGE_KEY);
    let ids: string[] = raw ? JSON.parse(raw) : [];
    if (ids.includes(productId)) {
      ids = ids.filter((id) => id !== productId);
    } else {
      ids = [...ids, productId];
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    setActive(ids.includes(productId));
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={active ? "Remover dos favoritos" : "Adicionar aos favoritos"}
      className="absolute bottom-2.5 right-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-base shadow-md cursor-pointer transition hover:scale-110"
    >
      {active ? "❤️" : "🤍"}
    </button>
  );
}
