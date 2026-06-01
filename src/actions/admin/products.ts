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
  imageUrl: z.string().url().optional().or(z.literal("")),
  priceCurrent: z.coerce.number().positive(),
  priceOriginal: z.coerce.number().positive().optional().or(z.literal("")),
  affiliateUrl: z.string().url(),
  storeId: z.string().uuid(),
  isPublished: z.coerce.boolean().optional(),
});

function calcDiscount(current: number, original?: number | null) {
  if (!original || original <= current) return null;
  return Math.round(((original - current) / original) * 100);
}

export async function createProduct(formData: FormData) {
  const priceOriginalRaw = formData.get("priceOriginal");
  const parsed = productSchema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug") || undefined,
    description: formData.get("description") || undefined,
    imageUrl: formData.get("imageUrl") || "",
    priceCurrent: formData.get("priceCurrent"),
    priceOriginal: priceOriginalRaw || undefined,
    affiliateUrl: formData.get("affiliateUrl"),
    storeId: formData.get("storeId"),
    isPublished: formData.get("isPublished") === "on",
  });

  if (!parsed.success) throw new Error("Dados inválidos");

  const d = parsed.data;
  const slug = d.slug?.trim() || slugify(d.title);
  const priceOriginal =
    typeof d.priceOriginal === "number" ? d.priceOriginal : null;

  await prisma.product.create({
    data: {
      title: d.title,
      slug,
      description: d.description || null,
      imageUrl: d.imageUrl || null,
      priceCurrent: d.priceCurrent,
      priceOriginal,
      discountPercent: calcDiscount(d.priceCurrent, priceOriginal),
      affiliateUrl: d.affiliateUrl,
      storeId: d.storeId,
      isPublished: d.isPublished ?? false,
      publishedAt: d.isPublished ? new Date() : null,
    },
  });

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
  revalidatePath("/admin/produtos");
  revalidatePath("/produtos");
}
