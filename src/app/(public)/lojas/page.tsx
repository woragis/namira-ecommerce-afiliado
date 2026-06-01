import Link from "next/link";
import { getActiveStores } from "@/lib/catalog";

export const revalidate = 60;

export default async function LojasPage() {
  const stores = await getActiveStores();

  return (
    <main className="px-6 py-9 md:px-10">
      <h1 className="font-display mb-2 text-3xl font-bold text-[var(--roxo-mais-escuro)]">
        Lojas parceiras
      </h1>
      <p className="mb-8 text-[var(--texto-suave)]">
        Filtre achados por marketplace e compre direto na origem.
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stores.map((store) => (
          <Link
            key={store.id}
            href={`/lojas/${store.slug}`}
            className="flex items-center gap-4 rounded-2xl border border-[var(--borda)] bg-white p-5 no-underline transition hover:-translate-y-0.5 hover:shadow-md"
            style={{ borderColor: store.colorPrimary + "33" }}
          >
            <span
              className="flex h-12 w-12 items-center justify-center rounded-xl text-sm font-extrabold"
              style={{
                backgroundColor: store.colorPrimary,
                color: store.colorOnPrimary,
              }}
            >
              {store.shortLabel}
            </span>
            <div>
              <div className="font-semibold text-[var(--texto)]">{store.name}</div>
              <div className="text-sm text-[var(--texto-suave)]">
                {store.productCountCached} produtos
              </div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
