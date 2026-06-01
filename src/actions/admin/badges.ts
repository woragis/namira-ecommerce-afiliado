"use server";

import { BadgeStyle } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/slugify";

const STYLES: BadgeStyle[] = [BadgeStyle.VIRAL, BadgeStyle.OFF, BadgeStyle.NOVO];

export async function createBadge(formData: FormData) {
  const label = String(formData.get("label") ?? "");
  const slug =
    String(formData.get("slug") ?? "").trim() || slugify(label.replace(/[^\w\s]/g, ""));
  const style = (formData.get("style") as BadgeStyle) || BadgeStyle.VIRAL;

  if (!STYLES.includes(style)) {
    throw new Error("Estilo inválido");
  }

  await prisma.badge.create({ data: { label, slug, style } });

  revalidatePath("/admin/badges");
  revalidatePath("/produtos");
  redirect("/admin/badges");
}

export async function updateBadge(id: string, formData: FormData) {
  const label = String(formData.get("label") ?? "");
  const slug = String(formData.get("slug") ?? "").trim() || slugify(label);
  const style = (formData.get("style") as BadgeStyle) || BadgeStyle.VIRAL;

  if (!STYLES.includes(style)) throw new Error("Estilo inválido");

  await prisma.badge.update({
    where: { id },
    data: { label, slug, style },
  });

  revalidatePath("/admin/badges");
  revalidatePath("/produtos");
  redirect("/admin/badges");
}

export async function deleteBadge(id: string) {
  await prisma.badge.delete({ where: { id } });
  revalidatePath("/admin/badges");
  revalidatePath("/produtos");
}
