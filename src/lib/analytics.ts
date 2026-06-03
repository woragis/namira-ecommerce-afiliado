import { prisma } from "@/lib/db";
import { safeDbQuery } from "@/lib/safe-db";

export function hashUserAgent(userAgent: string): string | undefined {
  if (!userAgent) return undefined;
  return Buffer.from(userAgent).toString("base64").slice(0, 64);
}

export async function recordProductClick(
  productId: string,
  referrerPath?: string,
  userAgentHash?: string,
) {
  return safeDbQuery(
    () =>
      prisma.clickEvent.create({
        data: { productId, referrerPath, userAgentHash },
      }),
    null,
  );
}

export async function recordProductView(
  productId: string,
  sourcePath?: string,
  userAgentHash?: string,
) {
  return safeDbQuery(
    () =>
      prisma.productViewEvent.create({
        data: { productId, sourcePath, userAgentHash },
      }),
    null,
  );
}

export async function recordProductImpression(
  productId: string,
  listPath?: string,
  userAgentHash?: string,
) {
  return safeDbQuery(
    () =>
      prisma.productImpressionEvent.create({
        data: { productId, listPath, userAgentHash },
      }),
    null,
  );
}

export async function isPublishedProduct(productId: string): Promise<boolean> {
  return safeDbQuery(
    async () => {
      const count = await prisma.product.count({
        where: { id: productId, isPublished: true },
      });
      return count > 0;
    },
    false,
  );
}
