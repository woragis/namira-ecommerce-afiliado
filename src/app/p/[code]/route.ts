import { NextRequest, NextResponse } from "next/server";
import { hashUserAgent, recordProductView } from "@/lib/analytics";
import { getPublishedProductByShareCode } from "@/lib/catalog";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ code: string }> },
) {
  const { code } = await context.params;
  const product = await getPublishedProductByShareCode(code);

  if (!product) {
    return NextResponse.redirect(new URL("/produtos", request.url));
  }

  const ua = request.headers.get("user-agent") ?? "";
  void recordProductView(product.id, `/p/${code}`, hashUserAgent(ua));

  const destination = new URL(`/produtos/${product.slug}`, request.url);
  return NextResponse.redirect(destination, { status: 302 });
}
