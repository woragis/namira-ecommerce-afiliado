import type { Category, Store } from "@prisma/client";

export type { ProductListItem, ProductWithRelations } from "@/lib/catalog";

export type StoreNavItem = Pick<
  Store,
  | "id"
  | "slug"
  | "name"
  | "shortLabel"
  | "logoUrl"
  | "colorPrimary"
  | "colorSecondary"
  | "colorOnPrimary"
  | "productCountCached"
>;

export type CategoryNavItem = Pick<
  Category,
  "id" | "slug" | "name" | "icon" | "kind"
>;
