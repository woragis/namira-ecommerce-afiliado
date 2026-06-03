import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  hashUserAgent,
  isPublishedProduct,
  recordProductImpression,
} from "@/lib/analytics";

const bodySchema = z.object({
  productId: z.string().uuid(),
  listPath: z.string().max(500).optional(),
});

export async function POST(request: NextRequest) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const { productId, listPath } = parsed.data;
  if (!(await isPublishedProduct(productId))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const ua = request.headers.get("user-agent") ?? "";
  await recordProductImpression(productId, listPath, hashUserAgent(ua));

  return NextResponse.json({ ok: true });
}
