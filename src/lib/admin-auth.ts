import { createHash, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "namira_admin";

export function isAdminProtectionEnabled(): boolean {
  return Boolean(process.env.ADMIN_SECRET?.trim());
}

export function adminToken(): string | null {
  const secret = process.env.ADMIN_SECRET?.trim();
  if (!secret) return null;
  return createHash("sha256").update(secret).digest("hex");
}

export function verifyAdminToken(token: string | undefined): boolean {
  if (!isAdminProtectionEnabled()) return true;
  const expected = adminToken();
  if (!expected || !token) return false;
  try {
    const a = Buffer.from(token);
    const b = Buffer.from(expected);
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export async function isAdminAuthenticated(): Promise<boolean> {
  if (!isAdminProtectionEnabled()) return true;
  const jar = await cookies();
  return verifyAdminToken(jar.get(ADMIN_COOKIE)?.value);
}

export async function setAdminSession(): Promise<void> {
  const token = adminToken();
  if (!token) return;
  const jar = await cookies();
  jar.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearAdminSession(): Promise<void> {
  const jar = await cookies();
  jar.delete(ADMIN_COOKIE);
}
