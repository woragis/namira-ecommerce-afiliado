"use client";

import { useEffect } from "react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[admin]", error);
  }, [error]);

  return (
    <div className="max-w-lg rounded-xl border border-red-900/50 bg-red-950/20 p-6">
      <h2 className="mb-2 text-lg font-bold text-red-400">Erro no painel admin</h2>
      <p className="mb-4 text-sm text-zinc-300">
        Provável causa: tabelas da NaMira não criadas no Supabase ou conexão
        incorreta. Rode <code className="text-amber-300">npx prisma db push</code>{" "}
        e <code className="text-amber-300">npm run db:seed</code> com o{" "}
        <code>DIRECT_URL</code> do Session pooler.
      </p>
      {error.digest ? (
        <p className="mb-4 font-mono text-xs text-zinc-500">Digest: {error.digest}</p>
      ) : null}
      <button
        type="button"
        onClick={reset}
        className="rounded-lg bg-zinc-800 px-4 py-2 text-sm text-white cursor-pointer hover:bg-zinc-700"
      >
        Tentar de novo
      </button>
    </div>
  );
}
