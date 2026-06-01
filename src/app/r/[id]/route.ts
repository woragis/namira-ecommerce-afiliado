import { NextRequest, NextResponse } from "next/server";
import {
  getPublishedProductForRedirect,
  recordProductClick,
} from "@/lib/catalog";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const product = await getPublishedProductForRedirect(id);

  if (!product) {
    return NextResponse.redirect(new URL("/produtos", request.url));
  }

  const referrer = request.headers.get("referer") ?? undefined;
  const ua = request.headers.get("user-agent") ?? "";

  await recordProductClick(
    product.id,
    referrer,
    ua ? Buffer.from(ua).toString("base64").slice(0, 64) : undefined,
  );

  return NextResponse.redirect(product.affiliateUrl, { status: 302 });
}
