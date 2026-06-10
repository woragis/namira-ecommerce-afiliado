import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getSiteBaseUrl } from "@/lib/whatsapp";

const CODE_LENGTH = 8;
const ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789";

export function generateShareCode(): string {
  let code = "";
  for (let i = 0; i < CODE_LENGTH; i++) {
    code += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return code;
}

export function buildProductSharePath(shareCode: string): string {
  return `/p/${shareCode}`;
}

export function buildProductShareUrl(shareCode: string): string {
  return `${getSiteBaseUrl()}${buildProductSharePath(shareCode)}`;
}

export function buildAffiliateSharePath(shareCode: string): string {
  return `/r/${shareCode}`;
}

export function resolveProductSharePath(product: {
  shareCode: string | null;
  slug: string;
}): string {
  return product.shareCode
    ? buildProductSharePath(product.shareCode)
    : `/produtos/${product.slug}`;
}

export function resolveAffiliatePath(product: {
  shareCode: string | null;
  id: string;
}): string {
  return `/r/${product.shareCode ?? product.id}`;
}

/** Gera código único e persiste no produto. */
export async function assignShareCode(productId: string): Promise<string> {
  for (let attempt = 0; attempt < 12; attempt++) {
    const shareCode = generateShareCode();
    try {
      const updated = await prisma.product.update({
        where: { id: productId },
        data: { shareCode },
        select: { shareCode: true },
      });
      return updated.shareCode!;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        continue;
      }
      throw error;
    }
  }
  throw new Error("Não foi possível gerar link curto único");
}

export async function ensureShareCode(
  productId: string,
  existing?: string | null,
): Promise<string> {
  if (existing) return existing;
  return assignShareCode(productId);
}

export async function generateUniqueShareCode(): Promise<string> {
  for (let attempt = 0; attempt < 12; attempt++) {
    const shareCode = generateShareCode();
    const taken = await prisma.product.findUnique({
      where: { shareCode },
      select: { id: true },
    });
    if (!taken) return shareCode;
  }
  throw new Error("Não foi possível gerar link curto único");
}
