import { NextRequest, NextResponse } from "next/server";
import { hashUserAgent, recordProductClick } from "@/lib/analytics";
import { getPublishedProductForRedirect } from "@/lib/catalog";

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

  await recordProductClick(product.id, referrer, hashUserAgent(ua));

  return NextResponse.redirect(product.affiliateUrl, { status: 302 });
}
