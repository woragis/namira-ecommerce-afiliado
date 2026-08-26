import type { BadgeStyle, Category, CategoryKind } from "@prisma/client";

export const TAG_KIND_LABELS: Record<CategoryKind, string> = {
  DEPARTMENT: "Departamento",
  PROMO: "Promoção",
};

export const TAG_STYLE_LABELS: Record<BadgeStyle, string> = {
  VIRAL: "Viral (dourado)",
  OFF: "Oferta (roxo)",
  NOVO: "Novo (escuro)",
};

export const TAG_STYLE_CLASS: Record<BadgeStyle, string> = {
  VIRAL: "bg-[var(--dourado)] text-[var(--dourado-escuro)]",
  OFF: "bg-[var(--roxo-escuro)] text-white",
  NOVO: "bg-[var(--roxo-mais-escuro)] text-[var(--roxo-medio)]",
};

export const LEGACY_CATEGORY_TO_PROMO: Record<string, string> = {
  "viral-agora": "viral",
  ofertas: "oferta",
  novidades: "novo",
};

export function isPromoTag(
  tag: Pick<Category, "kind">,
): boolean {
  return tag.kind === "PROMO";
}

export function productPromoTags(
  product: {
    categories: { category: Pick<Category, "id" | "slug" | "name" | "kind" | "style" | "icon"> }[];
  },
) {
  return product.categories
    .map((row) => row.category)
    .filter(isPromoTag);
}

export function sortNavTags<T extends { kind: CategoryKind; sortOrder: number }>(
  tags: T[],
): T[] {
  return [...tags].sort((a, b) => {
    if (a.kind !== b.kind) return a.kind === "PROMO" ? -1 : 1;
    return a.sortOrder - b.sortOrder;
  });
}
