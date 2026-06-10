import { NavLink } from "@/components/ui/nav-link";
import { Logo } from "./logo";
import { SearchForm } from "./search-form";

type Props = {
  bannerText?: string;
};

export function Header({ bannerText }: Props) {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--borda)] bg-white">
      {bannerText ? (
        <div className="bg-[var(--roxo-mais-escuro)] px-4 py-1.5 text-center text-xs tracking-wide text-[var(--roxo-medio)]">
          {bannerText.includes("+") ? (
            <>
              🔥{" "}
              <span className="font-semibold text-[var(--dourado)]">
                {bannerText.replace(/^🔥\s*/, "").split(" ")[0]}
              </span>{" "}
              {bannerText.replace(/^🔥\s*[^\s]+\s*/, "")}
            </>
          ) : (
            bannerText
          )}
        </div>
      ) : null}
      <div className="flex h-[68px] items-center justify-between gap-6 px-6 md:px-10">
        <Logo />
        <SearchForm />
        <div className="hidden shrink-0 items-center gap-5 sm:flex">
          <NavLink
            href="/favoritos"
            showPendingIndicator
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[var(--texto-suave)] no-underline hover:text-[var(--roxo-escuro)]"
          >
            Favoritos
          </NavLink>
          <NavLink
            href="/lojas"
            showPendingIndicator
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[var(--texto-suave)] no-underline hover:text-[var(--roxo-escuro)]"
          >
            Ver lojas
          </NavLink>
        </div>
      </div>
    </header>
  );
}
