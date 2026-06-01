import { middleware } from "@/middleware";
import { NextRequest } from "next/server";
import { ADMIN_COOKIE, adminToken } from "@/lib/admin-auth";

export async function adminNextRequest(
  url: string,
  init?: {
    method?: string;
    body?: BodyInit | null;
    cookies?: string;
    headers?: HeadersInit;
  },
): Promise<NextRequest> {
  const headers = new Headers(init?.headers);
  if (init?.cookies) headers.set("cookie", init.cookies);

  const req = new NextRequest(url, {
    method: init?.method,
    body: init?.body,
    headers,
  });

  if (init?.cookies) {
    const token = init.cookies.split("=")[1];
    if (token) req.cookies.set(ADMIN_COOKIE, token);
  }

  return req;
}

export async function authedAdminRequest(
  url: string,
  init?: Omit<Parameters<typeof adminNextRequest>[1], "cookies">,
): Promise<NextRequest> {
  const token = await adminToken();
  return adminNextRequest(url, {
    ...init,
    cookies: token ? `${ADMIN_COOKIE}=${token}` : undefined,
  });
}
