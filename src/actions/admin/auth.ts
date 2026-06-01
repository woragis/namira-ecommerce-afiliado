"use server";

import { timingSafeEqual } from "crypto";
import { redirect } from "next/navigation";
import {
  clearAdminSession,
  isAdminProtectionEnabled,
  setAdminSession,
} from "@/lib/admin-auth";

function verifySecretInput(input: string): boolean {
  const secret = process.env.ADMIN_SECRET?.trim();
  if (!secret) return true;
  try {
    const a = Buffer.from(input);
    const b = Buffer.from(secret);
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export async function loginAdmin(formData: FormData) {
  const secret = formData.get("secret");
  const next = (formData.get("next") as string) || "/admin";

  if (!isAdminProtectionEnabled()) {
    redirect(next.startsWith("/admin") ? next : "/admin");
  }

  if (typeof secret === "string" && verifySecretInput(secret)) {
    await setAdminSession();
    redirect(next.startsWith("/admin") ? next : "/admin");
  }

  redirect("/admin/login?error=1");
}

export async function logoutAdmin() {
  await clearAdminSession();
  redirect("/admin/login");
}
