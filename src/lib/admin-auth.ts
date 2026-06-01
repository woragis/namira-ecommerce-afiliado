import { cookies } from "next/headers";

export const ADMIN_COOKIE = "namira_admin";

let cachedToken: string | null | undefined;

export function isAdminProtectionEnabled(): boolean {
  return Boolean(process.env.ADMIN_SECRET?.trim());
}

async function sha256Hex(value: string): Promise<string> {
  const hash = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value),
  );
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function timingSafeEqualStr(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) {
    out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return out === 0;
}

/** Token de sessão admin (SHA-256 do ADMIN_SECRET). Compatível com Edge Runtime. */
export async function adminToken(): Promise<string | null> {
  const secret = process.env.ADMIN_SECRET?.trim();
  if (!secret) return null;
  if (cachedToken === undefined) {
    cachedToken = await sha256Hex(secret);
  }
  return cachedToken;
}

export async function verifyAdminToken(
  token: string | undefined,
): Promise<boolean> {
  if (!isAdminProtectionEnabled()) return true;
  const expected = await adminToken();
  if (!expected || !token) return false;
  return timingSafeEqualStr(token, expected);
}

export async function isAdminAuthenticated(): Promise<boolean> {
  if (!isAdminProtectionEnabled()) return true;
  const jar = await cookies();
  return verifyAdminToken(jar.get(ADMIN_COOKIE)?.value);
}

export async function setAdminSession(): Promise<void> {
  const token = await adminToken();
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

/** Limpa cache do token (útil em testes quando ADMIN_SECRET muda). */
export function resetAdminTokenCache(): void {
  cachedToken = undefined;
}
