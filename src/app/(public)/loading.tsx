export default function PublicLoading() {
  return (
    <main className="flex min-h-[40vh] items-center justify-center px-6">
      <div className="flex flex-col items-center gap-3">
        <div
          className="h-10 w-10 animate-spin rounded-full border-2 border-[var(--roxo-claro)] border-t-[var(--roxo-escuro)]"
          aria-hidden
        />
        <p className="text-sm text-[var(--texto-suave)]">Carregando achados…</p>
      </div>
    </main>
  );
}
