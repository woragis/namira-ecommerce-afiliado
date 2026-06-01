"use server";

import { CollectionType } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/slugify";

export async function createCollection(formData: FormData) {
  const name = String(formData.get("name") ?? "");
  const slug =
    String(formData.get("slug") ?? "").trim() || slugify(name);
  const description = String(formData.get("description") ?? "") || null;
  const type = (formData.get("type") as CollectionType) || CollectionType.SECTION;
  const showOnHome = formData.get("showOnHome") === "on";
  const homeSortOrder = Number(formData.get("homeSortOrder") ?? 0);
  const maxProducts = Number(formData.get("maxProducts") ?? 12) || null;

  const col = await prisma.collection.create({
    data: {
      name,
      slug,
      description,
      type,
      showOnHome,
      homeSortOrder,
      maxProducts,
    },
  });

  redirect(`/admin/colecoes/${col.id}`);
}

export async function updateCollection(id: string, formData: FormData) {
  const name = String(formData.get("name") ?? "");
  const slug =
    String(formData.get("slug") ?? "").trim() || slugify(name);
  const description = String(formData.get("description") ?? "") || null;
  const type = (formData.get("type") as CollectionType) || CollectionType.SECTION;
  const showOnHome = formData.get("showOnHome") === "on";
  const homeSortOrder = Number(formData.get("homeSortOrder") ?? 0);
  const maxProducts = Number(formData.get("maxProducts") ?? 12) || null;
  const isActive = formData.get("isActive") === "on";

  await prisma.collection.update({
    where: { id },
    data: {
      name,
      slug,
      description,
      type,
      showOnHome,
      homeSortOrder,
      maxProducts,
      isActive,
    },
  });

  revalidatePath("/");
  revalidatePath(`/admin/colecoes/${id}`);
}

export async function addProductToCollection(
  collectionId: string,
  productId: string,
) {
  const max = await prisma.collectionProduct.aggregate({
    where: { collectionId },
    _max: { sortOrder: true },
  });
  const sortOrder = (max._max.sortOrder ?? -1) + 1;

  await prisma.collectionProduct.upsert({
    where: {
      collectionId_productId: { collectionId, productId },
    },
    update: {},
    create: { collectionId, productId, sortOrder },
  });

  revalidatePath(`/admin/colecoes/${collectionId}`);
  revalidatePath("/");
}

export async function removeProductFromCollection(
  collectionId: string,
  productId: string,
) {
  await prisma.collectionProduct.delete({
    where: {
      collectionId_productId: { collectionId, productId },
    },
  });
  revalidatePath(`/admin/colecoes/${collectionId}`);
}

export async function moveCollectionProduct(
  collectionId: string,
  productId: string,
  direction: "up" | "down",
) {
  const items = await prisma.collectionProduct.findMany({
    where: { collectionId },
    orderBy: { sortOrder: "asc" },
  });

  const index = items.findIndex((i) => i.productId === productId);
  if (index < 0) return;

  const targetIndex = direction === "up" ? index - 1 : index + 1;
  if (targetIndex < 0 || targetIndex >= items.length) return;

  const current = items[index];
  const target = items[targetIndex];

  await prisma.$transaction([
    prisma.collectionProduct.update({
      where: {
        collectionId_productId: {
          collectionId,
          productId: current.productId,
        },
      },
      data: { sortOrder: target.sortOrder },
    }),
    prisma.collectionProduct.update({
      where: {
        collectionId_productId: {
          collectionId,
          productId: target.productId,
        },
      },
      data: { sortOrder: current.sortOrder },
    }),
  ]);

  revalidatePath(`/admin/colecoes/${collectionId}`);
  revalidatePath("/");
}

export async function deactivateCollection(id: string) {
  await prisma.collection.update({
    where: { id },
    data: { isActive: false },
  });
  revalidatePath("/admin/colecoes");
}
