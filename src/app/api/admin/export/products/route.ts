import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken, ADMIN_COOKIE } from "@/lib/admin-auth";
import { toCsv } from "@/lib/csv";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const secret = process.env.ADMIN_SECRET?.trim();
  if (secret) {
    const token = request.cookies.get(ADMIN_COOKIE)?.value;
    if (!(await verifyAdminToken(token))) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
  }

  const products = await prisma.product.findMany({
    include: {
      store: true,
      categories: { include: { category: true } },
      badges: { include: { badge: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  const headers = [
    "title",
    "slug",
    "affiliate_url",
    "store_slug",
    "price_current",
    "price_original",
    "image_url",
    "categories",
    "badges",
    "published",
    "is_featured",
  ];

  const data = products.map((p) => [
    p.title,
    p.slug,
    p.affiliateUrl,
    p.store.slug,
    String(p.priceCurrent),
    p.priceOriginal ? String(p.priceOriginal) : "",
    p.imageUrl ?? "",
    p.categories.map((c) => c.category.slug).join("|"),
    p.badges.map((b) => b.badge.slug).join("|"),
    p.isPublished ? "true" : "false",
    p.isFeatured ? "true" : "false",
  ]);

  const csv = toCsv(headers, data);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="namira-produtos.csv"',
    },
  });
}
