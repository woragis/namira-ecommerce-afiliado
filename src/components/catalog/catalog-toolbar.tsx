import { NavLink } from "@/components/ui/nav-link";

type Props = {
  title: string;
  subtitle?: string;
  total: number;
  basePath: string;
  currentSort?: string;
  extraParams?: Record<string, string>;
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
}: Props) {
  function sortHref(sort: string) {
    const p = new URLSearchParams({ ...extraParams, ordenar: sort });
    return `${basePath}?${p.toString()}`;
  }

  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-display text-3xl font-bold text-[var(--roxo-mais-escuro)]">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-1 text-sm text-[var(--texto-suave)]">{subtitle}</p>
        ) : null}
        <p className="mt-1 text-sm text-[var(--texto-suave)]">
          {total} produto{total !== 1 ? "s" : ""}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {sorts.map((s) => (
          <NavLink
            key={s.value}
            href={sortHref(s.value)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium no-underline ${
              currentSort === s.value
                ? "bg-[var(--roxo-escuro)] text-white"
                : "bg-white text-[var(--texto-suave)] border border-[var(--borda)]"
            }`}
          >
            {s.label}
          </NavLink>
        ))}
      </div>
    </div>
  );
}
