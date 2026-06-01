import { prisma } from "@/lib/db";

export const TEST_PREFIX = "int-test-";

export async function cleanupIntegrationProducts() {
  await prisma.product.deleteMany({
    where: { slug: { startsWith: TEST_PREFIX } },
  });
}

export async function cleanupIntegrationStores() {
  await prisma.product.deleteMany({
    where: { store: { slug: { startsWith: `${TEST_PREFIX}store-` } } },
  });
  await prisma.store.deleteMany({
    where: { slug: { startsWith: `${TEST_PREFIX}store-` } },
  });
}

export async function getSeedStore(slug = "shopee") {
  const store = await prisma.store.findUnique({ where: { slug } });
  if (!store) throw new Error(`Loja seed "${slug}" não encontrada — rode db:seed`);
  return store;
}

export async function getSeedCategory(slug = "tech") {
  const category = await prisma.category.findUnique({ where: { slug } });
  if (!category) throw new Error(`Categoria seed "${slug}" não encontrada`);
  return category;
}

export function productFormData(
  fields: Record<string, string | string[]>,
): FormData {
  const fd = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    if (Array.isArray(value)) {
      for (const v of value) fd.append(key, v);
    } else {
      fd.set(key, value);
    }
  }
  return fd;
}
