"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { parseCsv, rowsToObjects } from "@/lib/csv";
import { slugify } from "@/lib/slugify";
import { ensureShareCode, generateUniqueShareCode } from "@/lib/share-code";

export type ImportResult = {
  created: number;
  updated: number;
  skipped: number;
  errors: string[];
};

function calcDiscount(current: number, original?: number | null) {
  if (!original || original <= current) return null;
  return Math.round(((original - current) / original) * 100);
}

function splitList(value: string): string[] {
  return value
    .split(/[|;]/)
    .map((s) => s.trim())
    .filter(Boolean);
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

export async function importProductsFromCsv(
  formData: FormData,
): Promise<ImportResult> {
  const csv = String(formData.get("csv") ?? "").trim();
  const updateExisting = formData.get("updateExisting") === "on";

  const result: ImportResult = {
    created: 0,
    updated: 0,
    skipped: 0,
    errors: [],
  };

  if (!csv) {
    result.errors.push("CSV vazio.");
    return result;
  }

  const rows = rowsToObjects(parseCsv(csv));
  if (rows.length === 0) {
    result.errors.push("Nenhuma linha de dados (verifique cabeçalho).");
    return result;
  }

  const [stores, categories, badges] = await Promise.all([
    prisma.store.findMany(),
    prisma.category.findMany(),
    prisma.badge.findMany(),
  ]);

  const storeBySlug = Object.fromEntries(stores.map((s) => [s.slug, s.id]));
  const catBySlug = Object.fromEntries(categories.map((c) => [c.slug, c.id]));
  const badgeBySlug = Object.fromEntries(badges.map((b) => [b.slug, b.id]));

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const line = i + 2;

    const title = row.title ?? row.titulo ?? "";
    const affiliateUrl = row.affiliate_url ?? row.link ?? row.url ?? "";
    const storeSlug = row.store_slug ?? row.loja ?? "";
    const priceRaw = row.price_current ?? row.preco ?? row.preco_atual ?? "";

    if (!title || !affiliateUrl || !storeSlug || !priceRaw) {
      result.skipped++;
      result.errors.push(`Linha ${line}: título, link, loja e preço são obrigatórios.`);
      continue;
    }

    const storeId = storeBySlug[storeSlug];
    if (!storeId) {
      result.skipped++;
      result.errors.push(`Linha ${line}: loja "${storeSlug}" não encontrada.`);
      continue;
    }

    const priceCurrent = parseFloat(priceRaw.replace(",", "."));
    if (Number.isNaN(priceCurrent) || priceCurrent <= 0) {
      result.skipped++;
      result.errors.push(`Linha ${line}: preço inválido.`);
      continue;
    }

    const priceOriginalRaw =
      row.price_original ?? row.preco_original ?? "";
    const priceOriginal = priceOriginalRaw
      ? parseFloat(priceOriginalRaw.replace(",", "."))
      : null;

    const slug =
      (row.slug ?? "").trim() || slugify(title);
    const imageUrl = row.image_url ?? row.imagem ?? "";
    const description = row.description ?? row.descricao ?? "";
    const published =
      (row.published ?? row.publicado ?? "true").toLowerCase() !== "false";
    const featured =
      (row.is_featured ?? row.featured ?? row.destaque ?? "false").toLowerCase() ===
      "true";

    const categorySlugs = splitList(row.categories ?? row.categorias ?? "");
    const badgeSlugs = splitList(row.badges ?? row.selos ?? "");

    try {
      const existing = await prisma.product.findUnique({
        where: { slug },
        select: { id: true, shareCode: true },
      });

      if (existing && !updateExisting) {
        result.skipped++;
        continue;
      }

      const productData = {
        title,
        slug,
        description: description || null,
        imageUrl: imageUrl || null,
        priceCurrent,
        priceOriginal: priceOriginal && !Number.isNaN(priceOriginal) ? priceOriginal : null,
        discountPercent: calcDiscount(
          priceCurrent,
          priceOriginal && !Number.isNaN(priceOriginal) ? priceOriginal : null,
        ),
        affiliateUrl,
        storeId,
        isPublished: published,
        isFeatured: featured,
        publishedAt: published ? new Date() : null,
      };

      let productId: string;

      if (existing) {
        await prisma.product.update({
          where: { id: existing.id },
          data: productData,
        });
        productId = existing.id;
        result.updated++;
        if (!existing.shareCode) {
          await ensureShareCode(existing.id);
        }
      } else {
        const shareCode = await generateUniqueShareCode();
        const created = await prisma.product.create({
          data: { ...productData, shareCode },
        });
        productId = created.id;
        result.created++;
      }

      await prisma.productCategory.deleteMany({ where: { productId } });
      await prisma.productBadge.deleteMany({ where: { productId } });

      const categoryIds = categorySlugs
        .map((s) => catBySlug[s])
        .filter(Boolean) as string[];
      const badgeIds = badgeSlugs
        .map((s) => badgeBySlug[s])
        .filter(Boolean) as string[];

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
    } catch (e) {
      result.skipped++;
      result.errors.push(
        `Linha ${line}: ${e instanceof Error ? e.message : "erro desconhecido"}`,
      );
    }
  }

  await refreshStoreCounts();

  revalidatePath("/produtos");
  revalidatePath("/admin/produtos");
  revalidatePath("/");

  return result;
}
