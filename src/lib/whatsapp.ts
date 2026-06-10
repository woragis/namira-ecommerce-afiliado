const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
  "http://localhost:3000";

export function getSiteBaseUrl(): string {
  return siteUrl;
}

export function buildWhatsAppUrl(message: string, phone?: string | null): string {
  const text = encodeURIComponent(message);
  if (phone?.trim()) {
    const digits = phone.replace(/\D/g, "");
    if (digits) return `https://wa.me/${digits}?text=${text}`;
  }
  return `https://wa.me/?text=${text}`;
}

export function buildProductShareMessage(
  title: string,
  productPath: string,
): string {
  const path = productPath.startsWith("/") ? productPath : `/${productPath}`;
  const url = `${siteUrl.replace(/\/$/, "")}${path}`;
  return `🔥 Achei isso na NaMira Achados:\n\n${title}\n\n${url}`;
}

/** @param productPath rota curta (/p/abc) ou legado (/produtos/slug) */
export function buildProductShareUrl(title: string, productPath: string): string {
  return buildWhatsAppUrl(buildProductShareMessage(title, productPath));
}
