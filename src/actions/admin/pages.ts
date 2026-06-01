"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";

export async function updatePage(slug: string, formData: FormData) {
  const title = String(formData.get("title") ?? "");
  const body = String(formData.get("body") ?? "");
  const isPublished = formData.get("isPublished") === "on";

  await prisma.page.update({
    where: { slug },
    data: { title, body, isPublished },
  });

  const paths: Record<string, string> = {
    sobre: "/sobre",
    "como-funciona": "/como-funciona",
    contato: "/contato",
  };
  revalidatePath(paths[slug] ?? `/${slug}`);
  revalidatePath("/admin/paginas");
  redirect("/admin/paginas");
}
