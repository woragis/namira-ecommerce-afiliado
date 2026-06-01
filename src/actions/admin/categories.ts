"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/slugify";

export async function createCategory(formData: FormData) {
  const name = String(formData.get("name") ?? "");
  const slug =
    String(formData.get("slug") ?? "").trim() || slugify(name);
  const icon = String(formData.get("icon") ?? "") || null;
  const sortOrder = Number(formData.get("sortOrder") ?? 0);
  const showInNav = formData.get("showInNav") === "on";

  await prisma.category.create({
    data: { name, slug, icon, sortOrder, showInNav },
  });

  revalidatePath("/");
  revalidatePath("/admin/categorias");
  redirect("/admin/categorias");
}

export async function updateCategory(id: string, formData: FormData) {
  const name = String(formData.get("name") ?? "");
  const slug =
    String(formData.get("slug") ?? "").trim() || slugify(name);
  const icon = String(formData.get("icon") ?? "") || null;
  const sortOrder = Number(formData.get("sortOrder") ?? 0);
  const showInNav = formData.get("showInNav") === "on";
  const isActive = formData.get("isActive") === "on";

  await prisma.category.update({
    where: { id },
    data: { name, slug, icon, sortOrder, showInNav, isActive },
  });

  revalidatePath("/");
  revalidatePath("/admin/categorias");
  redirect("/admin/categorias");
}

export async function deactivateCategory(id: string) {
  await prisma.category.update({
    where: { id },
    data: { isActive: false },
  });
  revalidatePath("/admin/categorias");
}
