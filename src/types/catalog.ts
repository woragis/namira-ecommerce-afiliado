import type { Badge, Category, Store } from "@prisma/client";

export type { ProductWithRelations } from "@/lib/catalog";

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
  "id" | "slug" | "name" | "icon"
>;

export type BadgeItem = Pick<Badge, "id" | "slug" | "label" | "style">;
