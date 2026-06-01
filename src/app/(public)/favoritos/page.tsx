import { FavoritosClient } from "./favoritos-client";

export const metadata = { title: "Favoritos" };

export default function FavoritosPage() {
  return (
    <main className="px-6 py-9 md:px-10">
      <h1 className="font-display mb-2 text-3xl font-bold text-[var(--roxo-mais-escuro)]">
        Favoritos
      </h1>
      <p className="mb-8 text-sm text-[var(--texto-suave)]">
        Salvos no seu navegador — sem precisar de conta.
      </p>
      <FavoritosClient />
    </main>
  );
}
