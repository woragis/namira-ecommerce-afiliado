import Link from "next/link";

type Props = {
  page: number;
  totalPages: number;
  basePath: string;
  extraParams?: Record<string, string>;
};

function buildHref(
  basePath: string,
  page: number,
  extra: Record<string, string>,
): string {
  const params = new URLSearchParams(extra);
  if (page > 1) params.set("page", String(page));
  const q = params.toString();
  return q ? `${basePath}?${q}` : basePath;
}

export function Pagination({ page, totalPages, basePath, extraParams = {} }: Props) {
  if (totalPages <= 1) return null;

  const pages = getPageNumbers(page, totalPages);

  return (
    <nav
      className="mt-10 flex flex-wrap items-center justify-center gap-2"
      aria-label="Paginação"
    >
      {page > 1 ? (
        <PageLink href={buildHref(basePath, page - 1, extraParams)} label="← Anterior" />
      ) : (
        <span className="rounded-full px-3 py-1.5 text-sm text-[var(--texto-suave)] opacity-40">
          ← Anterior
        </span>
      )}

      {pages.map((p, i) =>
        p === "…" ? (
          <span key={`ellipsis-${i}`} className="px-2 text-[var(--texto-suave)]">
            …
          </span>
        ) : (
          <PageLink
            key={p}
            href={buildHref(basePath, p, extraParams)}
            label={String(p)}
            active={p === page}
          />
        ),
      )}

      {page < totalPages ? (
        <PageLink href={buildHref(basePath, page + 1, extraParams)} label="Próxima →" />
      ) : (
        <span className="rounded-full px-3 py-1.5 text-sm text-[var(--texto-suave)] opacity-40">
          Próxima →
        </span>
      )}
    </nav>
  );
}

function PageLink({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`min-w-[2.25rem] rounded-full px-3 py-1.5 text-center text-sm font-medium no-underline ${
        active
          ? "bg-[var(--roxo-escuro)] text-white"
          : "border border-[var(--borda)] bg-white text-[var(--texto-suave)] hover:border-[var(--roxo)] hover:text-[var(--roxo-escuro)]"
      }`}
    >
      {label}
    </Link>
  );
}

function getPageNumbers(current: number, total: number): (number | "…")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const pages: (number | "…")[] = [1];
  if (current > 3) pages.push("…");
  for (let p = Math.max(2, current - 1); p <= Math.min(total - 1, current + 1); p++) {
    pages.push(p);
  }
  if (current < total - 2) pages.push("…");
  pages.push(total);
  return pages;
}
