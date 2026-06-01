import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken, ADMIN_COOKIE } from "@/lib/admin-auth";
import { toCsv } from "@/lib/csv";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const secret = process.env.ADMIN_SECRET?.trim();
  if (secret) {
    const token = request.cookies.get(ADMIN_COOKIE)?.value;
    if (!verifyAdminToken(token)) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
  }

  const days = Number(request.nextUrl.searchParams.get("days") ?? "30");
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const clicks = await prisma.clickEvent.findMany({
    where: { clickedAt: { gte: since } },
    include: {
      product: {
        select: { title: true, slug: true, store: { select: { name: true } } },
      },
    },
    orderBy: { clickedAt: "desc" },
    take: 5000,
  });

  const headers = ["clicked_at", "product_title", "product_slug", "store", "referrer_path"];
  const data = clicks.map((c) => [
    c.clickedAt.toISOString(),
    c.product.title,
    c.product.slug,
    c.product.store.name,
    c.referrerPath ?? "",
  ]);

  return new NextResponse(toCsv(headers, data), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="namira-cliques-${days}d.csv"`,
    },
  });
}
