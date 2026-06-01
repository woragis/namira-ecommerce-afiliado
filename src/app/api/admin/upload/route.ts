import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken, ADMIN_COOKIE } from "@/lib/admin-auth";
import { uploadImage, type UploadBucket } from "@/lib/storage";

export async function POST(request: NextRequest) {
  const secret = process.env.ADMIN_SECRET?.trim();
  if (secret) {
    const token = request.cookies.get(ADMIN_COOKIE)?.value;
    if (!verifyAdminToken(token)) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const bucket = formData.get("bucket") as UploadBucket | null;
  const folder = (formData.get("folder") as string) || "uploads";

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Arquivo obrigatório" }, { status: 400 });
  }

  if (bucket !== "storeLogos" && bucket !== "productImages") {
    return NextResponse.json({ error: "Bucket inválido" }, { status: 400 });
  }

  const result = await uploadImage(bucket, file, folder);

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json(result);
}
