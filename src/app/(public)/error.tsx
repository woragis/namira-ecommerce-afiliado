"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function PublicError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-[50vh] flex-col items-center justify-center px-6 text-center">
      <h1 className="font-display mb-2 text-2xl font-bold text-[var(--roxo-mais-escuro)]">
        Algo deu errado
      </h1>
      <p className="mb-6 max-w-md text-sm text-[var(--texto-suave)]">
        Não foi possível carregar esta página. Verifique a conexão com o banco ou tente de novo.
      </p>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-full bg-[var(--roxo-escuro)] px-5 py-2 text-sm font-semibold text-white cursor-pointer"
        >
          Tentar novamente
        </button>
        <Link
          href="/"
          className="rounded-full border border-[var(--borda)] bg-white px-5 py-2 text-sm font-medium text-[var(--roxo-escuro)] no-underline"
        >
          Ir para home
        </Link>
      </div>
    </main>
  );
}
