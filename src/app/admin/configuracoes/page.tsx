import { getSiteSettings } from "@/lib/catalog";
import { isDatabaseConfigured } from "@/lib/safe-db";

export default async function AdminConfiguracoesPage() {
  const settings = await getSiteSettings();

  if (!isDatabaseConfigured()) {
    return <p className="text-zinc-400">Banco não configurado.</p>;
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Configurações do site</h1>
      <p className="mb-4 text-sm text-zinc-400">
        Edição completa via formulário virá na Fase 9. Valores atuais:
      </p>
      <dl className="space-y-3 text-sm">
        {Object.entries(settings).map(([key, value]) => (
          <div key={key} className="rounded-lg border border-zinc-800 bg-zinc-900 p-3">
            <dt className="font-mono text-xs text-amber-400">{key}</dt>
            <dd className="mt-1 text-zinc-300">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
