import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isDatabaseConfigured } from "@/lib/safe-db";
import { productListInclude } from "@/lib/catalog";

export async function POST(request: Request) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ products: [] });
  }

  const body = await request.json();
  const ids = Array.isArray(body.ids) ? (body.ids as string[]).slice(0, 50) : [];

  if (ids.length === 0) {
    return NextResponse.json({ products: [] });
  }

  const products = await prisma.product.findMany({
    where: { id: { in: ids }, isPublished: true },
    include: productListInclude,
  });

  return NextResponse.json({ products });
}
