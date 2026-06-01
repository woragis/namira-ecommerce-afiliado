"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";

const KEYS = [
  "header_banner_text",
  "hero_eyebrow",
  "hero_title",
  "hero_subtitle",
  "stats_products",
  "stats_stores",
  "stats_update_label",
  "footer_disclaimer",
  "instagram_url",
] as const;

export async function updateSiteSettings(formData: FormData) {
  for (const key of KEYS) {
    const value = formData.get(key);
    if (typeof value === "string") {
      await prisma.siteSetting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      });
    }
  }

  revalidatePath("/");
  revalidatePath("/admin/configuracoes");
}
