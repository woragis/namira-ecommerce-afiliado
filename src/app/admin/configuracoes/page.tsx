import { updateSiteSettings } from "@/actions/admin/settings";
import { getSiteSettings } from "@/lib/catalog";
import { isDatabaseConfigured } from "@/lib/safe-db";

const FIELDS: {
  key: string;
  label: string;
  rows?: number;
  placeholder?: string;
}[] = [
  { key: "header_banner_text", label: "Banner do topo" },
  { key: "hero_eyebrow", label: "Hero — eyebrow" },
  { key: "hero_title", label: "Hero — título" },
  { key: "hero_subtitle", label: "Hero — subtítulo", rows: 3 },
  { key: "stats_products", label: "Stat produtos" },
  { key: "stats_stores", label: "Stat lojas" },
  { key: "stats_update_label", label: "Stat atualização" },
  { key: "footer_disclaimer", label: "Disclaimer rodapé", rows: 3 },
  { key: "instagram_url", label: "URL Instagram" },
  {
    key: "whatsapp_phone",
    label: "WhatsApp (DDI+DDD+número, só dígitos)",
    placeholder: "5511999999999",
  },
];

export default async function AdminConfiguracoesPage() {
  if (!isDatabaseConfigured()) {
    return <p className="text-zinc-400">Banco não configurado.</p>;
  }

  const settings = await getSiteSettings();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Configurações do site</h1>
      <form action={updateSiteSettings} className="max-w-xl space-y-4">
        {FIELDS.map((f) => (
          <label key={f.key} className="block text-sm">
            <span className="mb-1 block text-zinc-400">{f.label}</span>
            {f.rows ? (
              <textarea
                name={f.key}
                rows={f.rows}
                defaultValue={settings[f.key] ?? ""}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-white"
              />
            ) : (
              <input
                name={f.key}
                defaultValue={settings[f.key] ?? ""}
                placeholder={f.placeholder}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-white"
              />
            )}
          </label>
        ))}
        <button type="submit" className="rounded-lg bg-amber-500 px-4 py-2 font-semibold text-zinc-950">
          Salvar configurações
        </button>
      </form>
    </div>
  );
}
