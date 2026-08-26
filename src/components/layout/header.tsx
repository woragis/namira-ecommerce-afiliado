import { Suspense } from "react";
import { NavLink } from "@/components/ui/nav-link";
import { Logo } from "./logo";
import { SearchForm } from "./search-form";

type Props = {
  bannerText?: string;
};

export function Header({ bannerText }: Props) {
  return (
    <header className="border-b border-[var(--borda)] bg-white">
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
      <div className="flex h-[68px] items-center justify-between gap-3 px-4 md:gap-6 md:px-10">
        <Logo />
        <Suspense fallback={<div className="h-10 min-w-0 max-w-[480px] flex-1 rounded-full bg-[var(--roxo-claro)]" />}>
          <SearchForm />
        </Suspense>
        <NavLink
          href="/favoritos"
          showPendingIndicator
          aria-label="Favoritos"
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[var(--texto-suave)] no-underline hover:bg-[var(--roxo-claro)] hover:text-[var(--roxo-escuro)]"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
            aria-hidden
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </NavLink>
        <NavLink
          href="/lojas"
          showPendingIndicator
          className="hidden shrink-0 items-center gap-1.5 text-[13px] font-medium text-[var(--texto-suave)] no-underline hover:text-[var(--roxo-escuro)] sm:inline-flex"
        >
          Ver lojas
        </NavLink>
      </div>
    </header>
  );
}
