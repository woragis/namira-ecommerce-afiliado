"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/slugify";

const productSchema = z.object({
  title: z.string().min(3),
  slug: z.string().optional(),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  imageStoragePath: z.string().optional(),
  priceCurrent: z.coerce.number().positive(),
  priceOriginal: z.coerce.number().positive().optional().or(z.literal("")),
  affiliateUrl: z.string().url(),
  storeId: z.string().uuid(),
  isPublished: z.coerce.boolean().optional(),
  isFeatured: z.coerce.boolean().optional(),
});

function calcDiscount(current: number, original?: number | null) {
  if (!original || original <= current) return null;
  return Math.round(((original - current) / original) * 100);
}

function parseIds(formData: FormData, key: string): string[] {
  return formData.getAll(key).map(String).filter(Boolean);
}

async function syncProductRelations(
  productId: string,
  categoryIds: string[],
  badgeIds: string[],
) {
  await prisma.productCategory.deleteMany({ where: { productId } });
  await prisma.productBadge.deleteMany({ where: { productId } });

  if (categoryIds.length) {
    await prisma.productCategory.createMany({
      data: categoryIds.map((categoryId) => ({ productId, categoryId })),
    });
  }
  if (badgeIds.length) {
    await prisma.productBadge.createMany({
      data: badgeIds.map((badgeId) => ({ productId, badgeId })),
    });
  }
}

export async function createProduct(formData: FormData) {
  const priceOriginalRaw = formData.get("priceOriginal");
  const parsed = productSchema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug") || undefined,
    description: formData.get("description") || undefined,
    imageUrl: formData.get("imageUrl") || "",
    imageStoragePath: formData.get("imageStoragePath") || "",
    priceCurrent: formData.get("priceCurrent"),
    priceOriginal: priceOriginalRaw || undefined,
    affiliateUrl: formData.get("affiliateUrl"),
    storeId: formData.get("storeId"),
    isPublished: formData.get("isPublished") === "on",
    isFeatured: formData.get("isFeatured") === "on",
  });

  if (!parsed.success) throw new Error("Dados inválidos");

  const d = parsed.data;
  const slug = d.slug?.trim() || slugify(d.title);
  const priceOriginal =
    typeof d.priceOriginal === "number" ? d.priceOriginal : null;

  const product = await prisma.product.create({
    data: {
      title: d.title,
      slug,
      description: d.description || null,
      imageUrl: d.imageUrl || null,
      imageStoragePath: d.imageStoragePath || null,
      priceCurrent: d.priceCurrent,
      priceOriginal,
      discountPercent: calcDiscount(d.priceCurrent, priceOriginal),
      affiliateUrl: d.affiliateUrl,
      storeId: d.storeId,
      isPublished: d.isPublished ?? false,
      isFeatured: d.isFeatured ?? false,
      publishedAt: d.isPublished ? new Date() : null,
    },
  });

  await syncProductRelations(
    product.id,
    parseIds(formData, "categoryIds"),
    parseIds(formData, "badgeIds"),
  );

  revalidatePath("/");
  revalidatePath("/produtos");
  revalidatePath("/admin/produtos");
  redirect("/admin/produtos");
}

export async function updateProduct(id: string, formData: FormData) {
  const priceOriginalRaw = formData.get("priceOriginal");
  const parsed = productSchema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug") || undefined,
    description: formData.get("description") || undefined,
    imageUrl: formData.get("imageUrl") || "",
    imageStoragePath: formData.get("imageStoragePath") || "",
    priceCurrent: formData.get("priceCurrent"),
    priceOriginal: priceOriginalRaw || undefined,
    affiliateUrl: formData.get("affiliateUrl"),
    storeId: formData.get("storeId"),
    isPublished: formData.get("isPublished") === "on",
    isFeatured: formData.get("isFeatured") === "on",
  });

  if (!parsed.success) throw new Error("Dados inválidos");

  const d = parsed.data;
  const priceOriginal =
    typeof d.priceOriginal === "number" ? d.priceOriginal : null;

  await prisma.product.update({
    where: { id },
    data: {
      title: d.title,
      slug: d.slug?.trim() || slugify(d.title),
      description: d.description || null,
      imageUrl: d.imageUrl || null,
      imageStoragePath: d.imageStoragePath || null,
      priceCurrent: d.priceCurrent,
      priceOriginal,
      discountPercent: calcDiscount(d.priceCurrent, priceOriginal),
      affiliateUrl: d.affiliateUrl,
      storeId: d.storeId,
      isPublished: d.isPublished ?? false,
      isFeatured: d.isFeatured ?? false,
      publishedAt: d.isPublished ? new Date() : null,
    },
  });

  await syncProductRelations(
    id,
    parseIds(formData, "categoryIds"),
    parseIds(formData, "badgeIds"),
  );

  revalidatePath("/");
  revalidatePath("/produtos");
  revalidatePath(`/produtos/${d.slug}`);
  revalidatePath("/admin/produtos");
  redirect("/admin/produtos");
}

async function refreshStoreCounts() {
  const stores = await prisma.store.findMany({ select: { id: true } });
  for (const store of stores) {
    const count = await prisma.product.count({
      where: { storeId: store.id, isPublished: true },
    });
    await prisma.store.update({
      where: { id: store.id },
      data: { productCountCached: count },
    });
  }
}

export async function deleteProduct(id: string) {
  await prisma.product.delete({ where: { id } });
  await refreshStoreCounts();
  revalidatePath("/");
  revalidatePath("/produtos");
  revalidatePath("/admin/produtos");
  redirect("/admin/produtos");
}

export async function toggleProductPublished(id: string, published: boolean) {
  await prisma.product.update({
    where: { id },
    data: {
      isPublished: published,
      publishedAt: published ? new Date() : null,
    },
  });
  revalidatePath("/");
  revalidatePath("/admin/produtos");
  revalidatePath("/produtos");
}

export async function toggleProductFeatured(id: string, featured: boolean) {
  await prisma.product.update({
    where: { id },
    data: { isFeatured: featured },
  });
  revalidatePath("/");
  revalidatePath("/admin/produtos");
}
