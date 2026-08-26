import type { Metadata } from "next";
import { DM_Sans, Playfair_Display } from "next/font/google";
import { Suspense } from "react";
import { NavigationPendingProvider } from "@/components/ui/navigation-pending";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["700", "900"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
  "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "NaMira Achados — Achados que viralizam",
    template: "%s | NaMira Achados",
  },
  description:
    "Curadoria de produtos virais da Shopee, Mercado Livre, Amazon e mais. Links de afiliado.",
  applicationName: "NaMira Achados",
  appleWebApp: {
    capable: true,
    title: "NaMira",
    statusBarStyle: "default",
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "NaMira Achados",
    title: "NaMira Achados — Achados que viralizam",
    description:
      "Curadoria de produtos virais da Shopee, Mercado Livre, Amazon e mais.",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "NaMira Achados",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "NaMira Achados — Achados que viralizam",
    description:
      "Curadoria de produtos virais da Shopee, Mercado Livre, Amazon e mais.",
    images: ["/og.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-48.png", sizes: "48x48", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${playfair.variable} ${dmSans.variable} h-full`}>
      <body className="flex min-h-full flex-col antialiased">
        <Suspense fallback={null}>
          <NavigationPendingProvider>{children}</NavigationPendingProvider>
        </Suspense>
      </body>
    </html>
  );
}
