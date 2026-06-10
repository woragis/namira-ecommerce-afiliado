import type { Badge, Category, ProductMedia, Store } from "@prisma/client";

export type ProductFormInput = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  affiliateUrl: string;
  storeId: string;
  imageUrl: string | null;
  imageStoragePath: string | null;
  isPublished: boolean;
  isFeatured: boolean;
  priceCurrent: string;
  priceOriginal: string | null;
  categories: { categoryId: string }[];
  badges: { badgeId: string }[];
  media?: ProductMedia[];
};

type ProductWithRelations = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  affiliateUrl: string;
  storeId: string;
  imageUrl: string | null;
  imageStoragePath: string | null;
  isPublished: boolean;
  isFeatured: boolean;
  priceCurrent: { toString(): string };
  priceOriginal: { toString(): string } | null;
  categories: { categoryId: string }[];
  badges: { badgeId: string }[];
  media?: ProductMedia[];
};

/** Serializa produto Prisma para props do ProductForm (client). */
export function toProductFormInput(product: ProductWithRelations): ProductFormInput {
  return {
    id: product.id,
    title: product.title,
    slug: product.slug,
    description: product.description,
    affiliateUrl: product.affiliateUrl,
    storeId: product.storeId,
    imageUrl: product.imageUrl,
    imageStoragePath: product.imageStoragePath,
    isPublished: product.isPublished,
    isFeatured: product.isFeatured,
    priceCurrent: product.priceCurrent.toString(),
    priceOriginal: product.priceOriginal?.toString() ?? null,
    categories: product.categories,
    badges: product.badges,
    media: product.media,
  };
}

export type ProductFormLookups = {
  stores: Store[];
  categories: Category[];
  badges: Badge[];
};
