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

  const days = Number(request.nextUrl.searchParams.get("days") ?? "30");
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const [impressions, views, clicks] = await Promise.all([
    prisma.productImpressionEvent.findMany({
      where: { impressedAt: { gte: since } },
      include: {
        product: {
          select: { title: true, slug: true, store: { select: { name: true } } },
        },
      },
      orderBy: { impressedAt: "desc" },
      take: 5000,
    }),
    prisma.productViewEvent.findMany({
      where: { viewedAt: { gte: since } },
      include: {
        product: {
          select: { title: true, slug: true, store: { select: { name: true } } },
        },
      },
      orderBy: { viewedAt: "desc" },
      take: 5000,
    }),
    prisma.clickEvent.findMany({
      where: { clickedAt: { gte: since } },
      include: {
        product: {
          select: { title: true, slug: true, store: { select: { name: true } } },
        },
      },
      orderBy: { clickedAt: "desc" },
      take: 5000,
    }),
  ]);

  const headers = [
    "event_type",
    "occurred_at",
    "product_title",
    "product_slug",
    "store",
    "path",
  ];

  const rows: string[][] = [
    ...impressions.map((e) => [
      "impression",
      e.impressedAt.toISOString(),
      e.product.title,
      e.product.slug,
      e.product.store.name,
      e.listPath ?? "",
    ]),
    ...views.map((e) => [
      "product_view",
      e.viewedAt.toISOString(),
      e.product.title,
      e.product.slug,
      e.product.store.name,
      e.sourcePath ?? "",
    ]),
    ...clicks.map((e) => [
      "affiliate_click",
      e.clickedAt.toISOString(),
      e.product.title,
      e.product.slug,
      e.product.store.name,
      e.referrerPath ?? "",
    ]),
  ];

  rows.sort((a, b) => b[1].localeCompare(a[1]));

  return new NextResponse(toCsv(headers, rows), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="namira-metricas-${days}d.csv"`,
    },
  });
}
