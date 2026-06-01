"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/slugify";

const storeSchema = z.object({
  name: z.string().min(2),
  slug: z.string().optional(),
  shortLabel: z.string().min(1).max(4),
  colorPrimary: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  colorSecondary: z.string().optional(),
  colorOnPrimary: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  logoUrl: z.string().url().optional().or(z.literal("")),
  sortOrder: z.coerce.number().int().default(0),
  showInNav: z.coerce.boolean().optional(),
  isActive: z.coerce.boolean().optional(),
});

export async function createStore(formData: FormData) {
  const parsed = storeSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug") || undefined,
    shortLabel: formData.get("shortLabel"),
    colorPrimary: formData.get("colorPrimary"),
    colorSecondary: formData.get("colorSecondary") || undefined,
    colorOnPrimary: formData.get("colorOnPrimary"),
    logoUrl: formData.get("logoUrl") || "",
    sortOrder: formData.get("sortOrder") || 0,
    showInNav: formData.get("showInNav") === "on",
    isActive: formData.get("isActive") !== "off",
  });

  if (!parsed.success) {
    throw new Error("Dados inválidos");
  }

  const data = parsed.data;
  const slug = data.slug?.trim() || slugify(data.name);

  await prisma.store.create({
    data: {
      name: data.name,
      slug,
      shortLabel: data.shortLabel,
      colorPrimary: data.colorPrimary,
      colorSecondary: data.colorSecondary || null,
      colorOnPrimary: data.colorOnPrimary,
      logoUrl: data.logoUrl || null,
      sortOrder: data.sortOrder,
      showInNav: data.showInNav ?? true,
      isActive: data.isActive ?? true,
    },
  });

  revalidatePath("/");
  revalidatePath("/lojas");
  revalidatePath("/admin/lojas");
  redirect("/admin/lojas");
}

export async function updateStore(id: string, formData: FormData) {
  const parsed = storeSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    shortLabel: formData.get("shortLabel"),
    colorPrimary: formData.get("colorPrimary"),
    colorSecondary: formData.get("colorSecondary") || undefined,
    colorOnPrimary: formData.get("colorOnPrimary"),
    logoUrl: formData.get("logoUrl") || "",
    sortOrder: formData.get("sortOrder") || 0,
    showInNav: formData.get("showInNav") === "on",
    isActive: formData.get("isActive") === "on",
  });

  if (!parsed.success) throw new Error("Dados inválidos");

  const data = parsed.data;

  await prisma.store.update({
    where: { id },
    data: {
      name: data.name,
      slug: data.slug || slugify(data.name),
      shortLabel: data.shortLabel,
      colorPrimary: data.colorPrimary,
      colorSecondary: data.colorSecondary || null,
      colorOnPrimary: data.colorOnPrimary,
      logoUrl: data.logoUrl || null,
      sortOrder: data.sortOrder,
      showInNav: data.showInNav ?? true,
      isActive: data.isActive ?? true,
    },
  });

  revalidatePath("/");
  revalidatePath("/admin/lojas");
  redirect("/admin/lojas");
}

export async function deleteStore(id: string) {
  await prisma.store.update({
    where: { id },
    data: { isActive: false },
  });
  revalidatePath("/admin/lojas");
}
