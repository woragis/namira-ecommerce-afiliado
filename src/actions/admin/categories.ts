"use server";

import { BadgeStyle, CategoryKind } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { revalidateCatalog } from "@/lib/revalidate-catalog";
import { slugify } from "@/lib/slugify";

const KINDS: CategoryKind[] = [CategoryKind.DEPARTMENT, CategoryKind.PROMO];
const STYLES: BadgeStyle[] = [BadgeStyle.VIRAL, BadgeStyle.OFF, BadgeStyle.NOVO];

function parseKind(raw: FormDataEntryValue | null): CategoryKind {
  const value = String(raw ?? "");
  return KINDS.includes(value as CategoryKind)
    ? (value as CategoryKind)
    : CategoryKind.DEPARTMENT;
}

function parseStyle(
  kind: CategoryKind,
  raw: FormDataEntryValue | null,
): BadgeStyle | null {
  if (kind !== CategoryKind.PROMO) return null;
  const value = String(raw ?? "");
  return STYLES.includes(value as BadgeStyle) ? (value as BadgeStyle) : BadgeStyle.VIRAL;
}

export async function createCategory(formData: FormData) {
  const name = String(formData.get("name") ?? "");
  const slug = String(formData.get("slug") ?? "").trim() || slugify(name);
  const icon = String(formData.get("icon") ?? "") || null;
  const sortOrder = Number(formData.get("sortOrder") ?? 0);
  const showInNav = formData.get("showInNav") === "on";
  const kind = parseKind(formData.get("kind"));
  const style = parseStyle(kind, formData.get("style"));

  await prisma.category.create({
    data: { name, slug, icon, sortOrder, showInNav, kind, style },
  });

  revalidateCatalog();
  revalidatePath("/admin/categorias");
  redirect("/admin/categorias");
}

export async function updateCategory(id: string, formData: FormData) {
  const name = String(formData.get("name") ?? "");
  const slug = String(formData.get("slug") ?? "").trim() || slugify(name);
  const icon = String(formData.get("icon") ?? "") || null;
  const sortOrder = Number(formData.get("sortOrder") ?? 0);
  const showInNav = formData.get("showInNav") === "on";
  const isActive = formData.get("isActive") === "on";
  const kind = parseKind(formData.get("kind"));
  const style = parseStyle(kind, formData.get("style"));

  await prisma.category.update({
    where: { id },
    data: { name, slug, icon, sortOrder, showInNav, isActive, kind, style },
  });

  revalidateCatalog();
  revalidatePath("/admin/categorias");
  redirect("/admin/categorias");
}

export async function deactivateCategory(id: string) {
  await prisma.category.update({
    where: { id },
    data: { isActive: false },
  });
  revalidateCatalog();
  revalidatePath("/admin/categorias");
}
