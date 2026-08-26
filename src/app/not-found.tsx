import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <h1 className="font-display mb-2 text-4xl font-bold text-[var(--roxo-mais-escuro)]">
        404
      </h1>
      <p className="mb-6 text-[var(--texto-suave)]">
        Este achado não existe ou foi removido.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="rounded-full border border-[var(--borda)] bg-white px-6 py-2.5 text-sm font-medium text-[var(--roxo-escuro)] no-underline"
        >
          Ir para home
        </Link>
        <Link
          href="/produtos"
          className="rounded-full bg-[var(--roxo-escuro)] px-6 py-2.5 text-sm font-semibold text-white no-underline"
        >
          Ver catálogo
        </Link>
      </div>
    </main>
  );
}
