import { Hero } from "@/components/home/hero";
import { HomeSection } from "@/components/home/home-section";
import { ViralBanner } from "@/components/home/viral-banner";
import {
  getActiveStores,
  getHomeCollections,
  getSiteSettings,
} from "@/lib/catalog";
import type { ProductWithRelations } from "@/lib/catalog";
import { CollectionType } from "@prisma/client";

export const revalidate = 60;

export default async function HomePage() {
  const [settings, stores, collections] = await Promise.all([
    getSiteSettings(),
    getActiveStores(),
    getHomeCollections(),
  ]);

  const banner = collections.find((c) => c.type === CollectionType.BANNER);
  const sections = collections.filter((c) => c.type === CollectionType.SECTION);

  const bannerProducts = (banner?.products ?? [])
    .map((cp) => cp.product)
    .filter((p) => p.isPublished) as ProductWithRelations[];

  return (
    <>
      <Hero
        eyebrow={settings.hero_eyebrow ?? "🎯 Curadoria diária"}
        title={settings.hero_title ?? ""}
        subtitle={settings.hero_subtitle ?? ""}
        stats={{
          products: settings.stats_products ?? "0",
          stores: settings.stats_stores ?? String(stores.length),
          update: settings.stats_update_label ?? "diário",
        }}
        stores={stores}
      />
      <main className="px-6 py-9 md:px-10">
        {banner ? (
          <ViralBanner
            title={banner.name}
            description={banner.description ?? ""}
            href={`/colecoes/${banner.slug}`}
            products={bannerProducts}
          />
        ) : null}
        {sections.map((col) => {
          const products = col.products
            .map((cp) => cp.product)
            .filter((p) => p.isPublished)
            .slice(0, col.maxProducts ?? 12) as ProductWithRelations[];
          return (
            <HomeSection
              key={col.id}
              title={col.name}
              count={products.length}
              href={`/colecoes/${col.slug}`}
              products={products}
            />
          );
        })}
        {sections.length === 0 ? (
          <HomeSection
            title="🔥 Viral agora"
            count={0}
            href="/produtos"
            products={[]}
          />
        ) : null}
      </main>
    </>
  );
}
