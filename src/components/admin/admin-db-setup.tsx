export function AdminDbSetup() {
  return (
    <div className="max-w-xl rounded-xl border border-amber-900/50 bg-amber-950/30 p-6">
      <h2 className="mb-2 text-lg font-bold text-amber-400">
        Banco ainda não configurado para NaMira
      </h2>
      <p className="mb-4 text-sm text-zinc-300">
        O login funcionou, mas as tabelas do catálogo (<code>stores</code>,{" "}
        <code>products</code>, <code>product_media</code>, etc.) não existem neste
        Postgres — ou o <code>DATABASE_URL</code> aponta para outro projeto.
      </p>
      <ol className="list-decimal space-y-2 pl-5 text-sm text-zinc-400">
        <li>
          Use <strong>Session pooler</strong> no <code>DIRECT_URL</code> (porta
          5432 em <code>aws-…pooler.supabase.com</code>), não{" "}
          <code>db.….supabase.co</code>.
        </li>
        <li>
          No seu PC: <code>npx prisma db push</code> e{" "}
          <code>npm run db:seed</code>
        </li>
        <li>
          Confirme no Supabase → Table Editor se existem{" "}
          <code>stores</code> e <code>products</code>.
        </li>
      </ol>
    </div>
  );
}
