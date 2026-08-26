import { NavLink } from "@/components/ui/nav-link";
import { CatalogSortSelect } from "./catalog-sort-select";

export type CatalogFilterChip = {
  key: string;
  label: string;
  href: string;
};

type Props = {
  title: string;
  subtitle?: string;
  total: number;
  basePath: string;
  currentSort?: string;
  extraParams?: Record<string, string>;
  chips?: CatalogFilterChip[];
};

const sorts = [
  { value: "recentes", label: "Recentes" },
  { value: "preco-asc", label: "Menor preço" },
  { value: "preco-desc", label: "Maior preço" },
  { value: "desconto", label: "Maior desconto" },
] as const;

export function CatalogToolbar({
  title,
  subtitle,
  total,
  basePath,
  currentSort = "recentes",
  extraParams = {},
  chips = [],
}: Props) {
  function sortHref(sort: string) {
    const p = new URLSearchParams({ ...extraParams, ordenar: sort });
    if (sort === "recentes") p.delete("ordenar");
    const q = p.toString();
    return q ? `${basePath}?${q}` : basePath;
  }

  return (
    <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-display text-2xl font-bold text-[var(--roxo-mais-escuro)] md:text-3xl">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-1 text-sm text-[var(--texto-suave)]">{subtitle}</p>
        ) : null}
        <p className="mt-1 text-sm text-[var(--texto-suave)]">
          {total} produto{total !== 1 ? "s" : ""}
        </p>
        {chips.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {chips.map((chip) => (
              <NavLink
                key={chip.key}
                href={chip.href}
                className="inline-flex items-center gap-1 rounded-full border border-[var(--borda)] bg-white px-2.5 py-1 text-xs font-medium text-[var(--roxo-escuro)] no-underline hover:border-[var(--roxo)]"
              >
                {chip.label}
                <span aria-hidden className="text-[var(--texto-suave)]">
                  ×
                </span>
                <span className="sr-only">Remover filtro {chip.label}</span>
              </NavLink>
            ))}
          </div>
        ) : null}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <CatalogSortSelect
          basePath={basePath}
          currentSort={currentSort}
          extraParams={extraParams}
        />
        <div className="hidden flex-wrap gap-2 sm:flex">
          {sorts.map((s) => (
            <NavLink
              key={s.value}
              href={sortHref(s.value)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium no-underline ${
                currentSort === s.value
                  ? "bg-[var(--roxo-escuro)] text-white"
                  : "border border-[var(--borda)] bg-white text-[var(--texto-suave)]"
              }`}
            >
              {s.label}
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  );
}
