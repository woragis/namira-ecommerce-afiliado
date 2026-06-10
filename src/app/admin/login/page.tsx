import { loginAdmin } from "@/actions/admin/auth";
import { NavLink } from "@/components/ui/nav-link";
import { SubmitButton } from "@/components/ui/submit-button";
import { isAdminProtectionEnabled } from "@/lib/admin-auth";

type Props = {
  searchParams: Promise<{ error?: string; next?: string }>;
};

export default async function AdminLoginPage({ searchParams }: Props) {
  const { error, next } = await searchParams;
  const protected_ = isAdminProtectionEnabled();

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-900 p-8">
        <h1 className="mb-2 text-xl font-bold text-white">Admin NaMira</h1>
        <p className="mb-6 text-sm text-zinc-400">
          {protected_
            ? "Digite a senha de administrador."
            : "ADMIN_SECRET não configurado — acesso livre ao painel."}
        </p>
        {error ? (
          <p className="mb-4 text-sm text-red-400">Senha incorreta.</p>
        ) : null}
        <form action={loginAdmin} className="space-y-4">
          <input type="hidden" name="next" value={next ?? "/admin"} />
          <label className="block text-sm">
            <span className="mb-1 block text-zinc-400">Senha admin</span>
            <input
              name="secret"
              type="password"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-white"
              placeholder={protected_ ? "••••••••" : "opcional"}
            />
          </label>
          <SubmitButton
            pendingLabel="Entrando…"
            className="w-full rounded-lg bg-amber-500 py-2.5 font-semibold text-zinc-950 cursor-pointer"
          >
            Entrar
          </SubmitButton>
        </form>
        <NavLink
          href="/"
          showPendingIndicator
          className="mt-4 block text-center text-xs text-zinc-500 no-underline hover:text-zinc-300"
        >
          ← Voltar ao site
        </NavLink>
      </div>
    </div>
  );
}
