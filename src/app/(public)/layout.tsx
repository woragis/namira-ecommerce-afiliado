import { Suspense } from "react";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { StoreFilterNav } from "@/components/layout/store-filter-nav";
import { WhatsAppFloat } from "@/components/layout/whatsapp-float";
import {
  getActiveStores,
  getNavCategories,
  getSiteSettings,
} from "@/lib/catalog";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [settings, stores, categories] = await Promise.all([
    getSiteSettings(),
    getActiveStores(),
    getNavCategories(),
  ]);

  return (
    <>
      <Header bannerText={settings.header_banner_text} />
      <Suspense fallback={<nav className="h-12 border-b bg-white" />}>
        <StoreFilterNav stores={stores} categories={categories} />
      </Suspense>
      <div className="flex-1">{children}</div>
      <Footer
        stores={stores}
        categories={categories}
        disclaimer={settings.footer_disclaimer}
        instagramUrl={settings.instagram_url}
      />
      <WhatsAppFloat phone={settings.whatsapp_phone} />
    </>
  );
}
